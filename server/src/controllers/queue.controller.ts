import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Queue } from "../entity/Queue";
import { Customer } from "../entity/Customer";
import { Division } from "../entity/Division";
import {
  Between,
  LessThanOrEqual,
  MoreThanOrEqual,
  IsNull,
  Repository,
  MoreThan,
} from "typeorm";
import { calculateEstimatedWaitTime } from "../utils/queueCalculations";
import { QueueTransaction } from "../entity/QueueTransaction";
import { User } from "../entity/User";
import { History } from "../entity/History";
import generateQueueNumber from "../helpers/generateQueueNumber";
import handleStaleQueues from "../helpers/handleStalesQueue";
import getActiveWaitingQueues from "../helpers/activeQueue";
import updatePositions from "../helpers/updatePositions";
import { printQueueTicket } from "../utils/printerUtils";
import { Terminal } from "../entity/Terminal";
export const createQueue = async (req: Request, res: Response) => {
  const queueRepo = AppDataSource.getRepository(Queue);
  const customerRepo = AppDataSource.getRepository(Customer);
  const divisionRepo = AppDataSource.getRepository(Division);

  const { customer_name, account_number, division_id, priority_type } =
    req.body;

  console.log(
    "Incomming DATA:",
    customer_name,
    account_number,
    division_id,
    priority_type
  );
  ``;

  const REGULAR_COUNT_BEFORE_PRIORITY = 3;

  try {
    const division = await divisionRepo.findOne({
      where: { division_id },
    });

    if (!division) {
      return res.status(404).json({ message: "Division not found" });
    }

    await handleStaleQueues(queueRepo, division_id);

    const activeWaitingQueues = await getActiveWaitingQueues(
      queueRepo,
      division_id
    );

    let customer = null;
    if (account_number) {
      customer = await customerRepo.findOne({
        where: { account_number },
      });
    }

    if (!customer) {
      customer = customerRepo.create({
        customer_name: customer_name || null,
        account_number: account_number || null,
        priority_type,
      });
      await customerRepo.save(customer);
    }

    const queueNumber = await generateQueueNumber(division, queueRepo);

    let position = activeWaitingQueues.length + 1;
    let priority_level = priority_type === "regular" ? 1 : 2;

    if (priority_type === "priority") {
      let regularCount = 0;
      let priorityInsertIndex = -1;

      for (let i = 0; i < activeWaitingQueues.length; i++) {
        if (activeWaitingQueues[i].customer.priority_type === "regular") {
          regularCount++;
          if (regularCount === REGULAR_COUNT_BEFORE_PRIORITY) {
            const nextIndex = i + 1;
            if (
              nextIndex >= activeWaitingQueues.length ||
              activeWaitingQueues[nextIndex].customer.priority_type ===
                "regular"
            ) {
              priorityInsertIndex = nextIndex;
              break;
            }
          }
        } else {
          regularCount = 0;
        }
      }

      if (priorityInsertIndex !== -1) {
        position = priorityInsertIndex + 1;
        await updatePositions(queueRepo, position, division_id);
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const lastQueue = await queueRepo.find({
      where: {
        division: { division_id },
        created_at: Between(today, tomorrow),
      },
      order: {
        regular_count: "DESC",
      },
      take: 1,
    });

    const nextRegularCount =
      lastQueue.length > 0 ? lastQueue[0].regular_count + 1 : 1;

    const newQueue = queueRepo.create({
      queue_number: queueNumber,
      priority_level,
      status: "Waiting",
      position,
      is_skipped: false,
      customer: customer,
      division: division,
      regular_count: nextRegularCount,
    });

    await queueRepo.save(newQueue);

    const updatedQueues = await queueRepo.find({
      where: {
        division: { division_id },
        status: "Waiting",
        is_skipped: false,
        created_at: Between(today, tomorrow),
      },
      relations: ["customer"],
      order: {
        position: "ASC",
      },
    });

    if (req.app.get("wss")) {
      const wss = req.app.get("wss");
      wss.clients.forEach((client) => {
        if (client.divisionId === division_id) {
          client.send(
            JSON.stringify({
              type: "QUEUE_UPDATE",
              data: {
                queues: updatedQueues,
                timestamp: new Date(),
              },
            })
          );
        }
      });
    }

    return res.status(201).json({
      message: "Queue ticket created successfully",
      queue: {
        ...newQueue,
        estimated_wait_time: await calculateEstimatedWaitTime(
          division_id,
          priority_level
        ),
      },
    });
  } catch (error) {
    console.error("Error creating queue:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getQueue = async (req: Request, res: Response) => {
  const { queue_number, account_number } = req.query;
  const queueRepo = AppDataSource.getRepository(Queue);

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const queryBuilder = queueRepo
      .createQueryBuilder("queue")
      .leftJoinAndSelect("queue.customer", "customer")
      .leftJoinAndSelect("queue.division", "division")
      .where("queue.created_at >= :today", { today });

    if (queue_number) {
      queryBuilder.andWhere("queue.queue_number = :queue_number", {
        queue_number,
      });
    }

    if (account_number) {
      queryBuilder.andWhere("customer.account_number = :account_number", {
        account_number,
      });
    }

    const queue = await queryBuilder.getOne();

    if (!queue) {
      return res.status(404).json({ message: "Queue not found" });
    }

    const position = await queueRepo.count({
      where: {
        division: { division_id: queue.division.division_id },
        status: "Waiting",
        priority_level: MoreThanOrEqual(queue.priority_level),
        created_at: MoreThanOrEqual(today),
        queue_number: LessThanOrEqual(queue.queue_number),
      },
    });

    const estimatedWaitTime = await calculateEstimatedWaitTime(
      queue.division.division_id,
      queue.priority_level
    );

    const currentServing = await queueRepo.findOne({
      where: {
        division: { division_id: queue.division.division_id },
        status: "In Progress",
        created_at: MoreThanOrEqual(today),
      },
    });

    const queueStatus = {
      queue_details: {
        queue_number: queue.queue_number,
        status: queue.status,
        priority_type: queue.customer.priority_type,
        created_at: queue.created_at,
      },
      position_in_queue: position,
      estimated_wait_time: estimatedWaitTime,
      division: {
        name: queue.division.division_name,
        current_serving: currentServing?.queue_number || "None",
      },
      last_updated: new Date(),
    };

    return res.status(200).json(queueStatus);
  } catch (error) {
    console.error("Error retrieving queue:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllQueues = async (req: Request, res: Response) => {
  const queueRepo = AppDataSource.getRepository(Queue);

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { status, division_id } = req.query;

    const queryBuilder = queueRepo
      .createQueryBuilder("queue")
      .leftJoinAndSelect("queue.customer", "customer")
      .leftJoinAndSelect("queue.division", "division")
      .where("queue.created_at >= :today", { today });

    if (status) {
      queryBuilder.andWhere("queue.status = :status", { status });
    }

    if (division_id) {
      queryBuilder.andWhere("division.division_id = :division_id", {
        division_id,
      });
    }

    queryBuilder
      .orderBy("queue.priority_level", "DESC")
      .addOrderBy("queue.created_at", "ASC");

    const queues = await queryBuilder.getMany();

    const queueData = await Promise.all(
      queues.map(async (queue) => ({
        id: queue.queue_id,
        queue_number: queue.queue_number,
        status: queue.status,
        customer: {
          name: queue.customer.customer_name,
          account_number: queue.customer.account_number,
          priority_type: queue.customer.priority_type,
        },
        division: {
          id: queue.division.division_id,
          name: queue.division.division_name,
        },
        priority_level: queue.priority_level,
        created_at: queue.created_at,
        estimated_wait_time:
          queue.status === "Waiting"
            ? await calculateEstimatedWaitTime(
                queue.division.division_id,
                queue.priority_level
              )
            : 0,
      }))
    );

    return res.status(200).json({
      status: "success",
      data: {
        total: queueData.length,
        queues: queueData,
      },
    });
  } catch (error) {
    console.error("Error fetching queues:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export const getDivisionQueues = async (req: Request, res: Response) => {
  const queueRepo = AppDataSource.getRepository(Queue);
  const { division_id } = req.params;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const queues = await queueRepo
      .createQueryBuilder("queue")
      .leftJoinAndSelect("queue.customer", "customer")
      .leftJoinAndSelect("queue.division", "division")
      .where("division.division_id = :division_id", { division_id })
      .andWhere("queue.created_at >= :today", { today })
      .andWhere("queue.status = :status", { status: "Waiting" })
      .orderBy("queue.priority_level", "DESC")
      .addOrderBy("queue.created_at", "ASC")
      .getMany();

    const currentlyServing = await queueRepo.findOne({
      where: {
        division: { division_id },
        status: "In Progress",
        created_at: MoreThanOrEqual(today),
      },
      relations: ["customer", "division"],
    });

    const formattedQueues = queues.map((queue) => ({
      queue_id: queue.queue_id,
      queue_number: queue.queue_number,
      customer_name: queue.customer.customer_name,
      account_number: queue.customer.account_number,
      priority_type: queue.customer.priority_type,
      priority_level: queue.priority_level,
      created_at: queue.created_at,
    }));

    return res.status(200).json({
      status: "success",
      data: {
        currently_serving: currentlyServing
          ? {
              queue_number: currentlyServing.queue_number,
              customer_name: currentlyServing.customer.customer_name,
            }
          : null,
        waiting_count: queues.length,
        queues: formattedQueues,
      },
    });
  } catch (error) {
    console.error("Error fetching division queues:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
export const nextQueue = async (req: Request, res: Response) => {
  const { division_id } = req.params;
  const { terminal_id, terminal_number, user_id } = req.body;

  try {
    if (!division_id || !terminal_id || !terminal_number) {
      console.log("Missing required fields:", {
        division_id,
        terminal_id,
        terminal_number,
      });
      return res.status(400).json({
        message: "Missing required fields",
        fields: { division_id, terminal_id, terminal_number },
      });
    }

    await AppDataSource.manager.transaction(
      async (transactionalEntityManager) => {
        // Check for current in-progress queue
        const currentInProgress = await transactionalEntityManager.findOne(
          Queue,
          {
            where: {
              division: { division_id: parseInt(division_id) },
              status: "In Progress",
              terminal_id: parseInt(terminal_id),
              terminal_number: parseInt(terminal_number),
            },
          }
        );

        if (currentInProgress) {
          throw new Error("Terminal already has an in-progress queue");
        }

        // Get today's date at 00:00:00
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Only include queues created today using MoreThanOrEqual
        const waitingQueues = await transactionalEntityManager.find(Queue, {
          where: {
            division: { division_id: parseInt(division_id) },
            status: "Waiting",
            is_skipped: false,
            created_at: MoreThanOrEqual(today), // Only include queues created today
          },
          order: {
            position: "ASC", // Order by position
          },
          relations: ["customer", "division"],
        });

        if (!waitingQueues.length) {
          return res
            .status(404)
            .json({ message: "No waiting queues available for today" });
        }

        // Take the first queue in the position-based order
        const nextQueue = waitingQueues[0];

        // Update queue status
        nextQueue.status = "In Progress";
        nextQueue.terminal_id = parseInt(terminal_id);
        nextQueue.terminal_number = parseInt(terminal_number);

        const updatedQueue = await transactionalEntityManager.save(
          Queue,
          nextQueue
        );

        // Create transaction record
        const newTransaction = transactionalEntityManager.create(
          QueueTransaction,
          {
            status: "Started",
            started_at: new Date(),
            queue: updatedQueue,
            customer: nextQueue.customer,
            assigned_to: req.user,
            account_number:
              nextQueue.customer?.account_number || "No Account Number",
          }
        );

        await transactionalEntityManager.save(QueueTransaction, newTransaction);

        // Update positions for remaining queues
        const remainingQueues = waitingQueues.slice(1);
        for (let i = 0; i < remainingQueues.length; i++) {
          remainingQueues[i].position = i + 1;
          await transactionalEntityManager.save(Queue, remainingQueues[i]);
        }

        const formattedQueue = {
          queue_id: updatedQueue.queue_id,
          queue_number: updatedQueue.queue_number,
          customer_name: updatedQueue.customer?.customer_name || "N/A",
          account_number:
            updatedQueue.customer?.account_number || "No Account Number",
          priority_type: updatedQueue.customer?.priority_type || "regular",
          status: updatedQueue.status,
          terminal_id: updatedQueue.terminal_id,
          terminal_number: updatedQueue.terminal_number,
          created_at: updatedQueue.created_at,
        };

        return res.status(200).json({
          message: "Next queue assigned successfully",
          queue: formattedQueue,
        });
      }
    );
  } catch (error) {
    console.error("Error in nextQueue:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: error,
    });
  }
};
export const endTransaction = async (req: Request, res: Response) => {
  const transactionRepo = AppDataSource.getRepository(QueueTransaction);
  const queueRepo = AppDataSource.getRepository(Queue);
  const historyRepo = AppDataSource.getRepository(History);

  const { user_id, account_number } = req.body;

  console.log("Ending transaction:", {
    user_id,
    account_number,
    timestamp: new Date().toISOString(),
  });

  try {
    const currentTransaction = await transactionRepo.findOne({
      where: {
        assigned_to: { user_id },
        completed_at: IsNull(),
      },
      relations: ["queue", "customer", "assigned_to", "queue.division"],
    });

    console.log("Found current transaction:", {
      transaction_id: currentTransaction?.transaction_id,
      queue_number: currentTransaction?.queue?.queue_number,
      timestamp: new Date().toISOString(),
    });

    if (!currentTransaction) {
      return res.status(404).json({ message: "No active transaction found" });
    }

    const finalAccountNumber =
      !account_number || account_number.trim() === ""
        ? "NO ACCOUNT NUMBER"
        : account_number;

    // Update transaction
    currentTransaction.completed_at = new Date();
    currentTransaction.account_number = finalAccountNumber;
    currentTransaction.status = "Completed";
    await transactionRepo.save(currentTransaction);

    // Update queue
    const queue = currentTransaction.queue;
    queue.status = "Completed";
    await queueRepo.save(queue);

    console.log("Transaction completed:", {
      transaction_id: currentTransaction.transaction_id,
      queue_number: queue.queue_number,
      terminal_id: queue.terminal_id,
      terminal_number: queue.terminal_number,
      timestamp: new Date().toISOString(),
    });

    // Create history record
    const history = historyRepo.create({
      status: "Completed",
      priority_level: queue.priority_level,
      account_number: finalAccountNumber,
      started_at: currentTransaction.started_at,
      completed_at: currentTransaction.completed_at,
      transaction: currentTransaction,
      queue: queue,
      customer: currentTransaction.customer,
      division: queue.division,
      assignedTo: currentTransaction.assigned_to,
    });
    await historyRepo.save(history);

    // Notify WebSocket clients with enhanced data
    if (req.app.get("wss")) {
      const wss = req.app.get("wss");
      wss.clients.forEach((client) => {
        if (client.divisionId === queue.division.division_id) {
          client.send(
            JSON.stringify({
              type: "TRANSACTION_COMPLETED",
              data: {
                queue_number: queue.queue_number,
                terminal_id: queue.terminal_id,
                terminal_number: queue.terminal_number,
                timestamp: new Date(),
              },
            })
          );
        }
      });
    }

    return res.status(200).json({
      message: "Transaction completed successfully",
      transaction: {
        transaction_id: currentTransaction.transaction_id,
        queue_number: queue.queue_number,
        terminal_id: queue.terminal_id,
        terminal_number: queue.terminal_number,
        completed_at: currentTransaction.completed_at,
      },
    });
  } catch (error) {
    console.error("Error ending transaction:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteQueue = async (req: Request, res: Response) => {
  const queueRepo = AppDataSource.getRepository(Queue);
  const transactionRepo = AppDataSource.getRepository(QueueTransaction);
  const historyRepo = AppDataSource.getRepository(History);
  const { queue_id, division_id } = req.body;

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const queue = await queueRepo.findOne({
      where: { queue_id },
      relations: ["customer", "division"],
    });

    if (!queue) {
      return res.status(404).json({ message: "Queue not found" });
    }

    if (queue.status !== "Waiting") {
      return res.status(400).json({
        message: "Can only delete queues with 'Waiting' status",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const relatedTransactions = await transactionRepo
      .createQueryBuilder("transaction")
      .leftJoinAndSelect("transaction.queue", "queue")
      .leftJoinAndSelect("transaction.customer", "customer")
      .leftJoinAndSelect("transaction.assigned_to", "assigned_to")
      .where("queue.queue_id = :queueId", { queueId: queue_id })
      .getMany();

    // Delete all related records within the transaction
    try {
      // First delete history records
      for (const transaction of relatedTransactions) {
        await queryRunner.manager.getRepository(History).delete({
          transaction: { transaction_id: transaction.transaction_id },
        });
      }

      // Then delete transactions
      for (const transaction of relatedTransactions) {
        await queryRunner.manager
          .getRepository(QueueTransaction)
          .delete({ transaction_id: transaction.transaction_id });
      }

      // Update positions of remaining queues
      const laterQueues = await queueRepo.find({
        where: {
          division: { division_id },
          status: "Waiting",
          position: MoreThanOrEqual(queue.position),
          created_at: MoreThanOrEqual(today),
        },
        order: { position: "ASC" },
      });

      for (const laterQueue of laterQueues) {
        if (laterQueue.queue_id !== queue.queue_id) {
          laterQueue.position--;
          await queryRunner.manager.save(Queue, laterQueue);
        }
      }

      // Finally delete the queue
      await queryRunner.manager.remove(Queue, queue);

      // Commit the transaction
      await queryRunner.commitTransaction();

      // Get updated queue list
      const updatedQueues = await queueRepo.find({
        where: {
          division: { division_id },
          status: "Waiting",
          created_at: MoreThanOrEqual(today),
        },
        relations: ["customer"],
        order: { position: "ASC" },
      });

      // Notify WebSocket clients
      if (req.app.get("wss")) {
        const wss = req.app.get("wss");
        wss.clients.forEach((client) => {
          if (client.divisionId === division_id) {
            client.send(
              JSON.stringify({
                type: "QUEUE_UPDATE",
                data: {
                  queues: updatedQueues,
                  deleted_queue: queue.queue_number,
                  timestamp: new Date(),
                },
              })
            );
          }
        });
      }

      return res.status(200).json({
        message: "Queue deleted successfully",
        deleted_queue: queue.queue_number,
      });
    } catch (err) {
      // If anything fails, roll back the transaction
      await queryRunner.rollbackTransaction();
      throw err;
    }
  } catch (error) {
    console.error("Error deleting queue:", error);
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    return res.status(500).json({
      message: "Error deleting queue",
      error: error.message,
    });
  } finally {
    await queryRunner.release();
  }
};

export const skipQueue = async (req: Request, res: Response) => {
  const queueRepo = AppDataSource.getRepository(Queue);
  const transactionRepo = AppDataSource.getRepository(QueueTransaction);
  const { queue_id, division_id, user_id } = req.body;

  try {
    const queue = await queueRepo.findOne({
      where: { queue_id },
      relations: ["customer", "division"],
    });

    if (!queue) {
      return res.status(404).json({ message: "Queue not found" });
    }

    // Check if queue is either Waiting or In Progress
    if (queue.status !== "Waiting" && queue.status !== "In Progress") {
      return res.status(400).json({
        message: "Can only skip queues with 'Waiting' or 'In Progress' status",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If queue is In Progress, end the current transaction
    if (queue.status === "In Progress") {
      const currentTransaction = await transactionRepo.findOne({
        where: {
          queue: { queue_id },
          completed_at: IsNull(),
        },
      });

      if (currentTransaction) {
        currentTransaction.status = "Skipped";
        currentTransaction.completed_at = new Date();
        await transactionRepo.save(currentTransaction);
      }
    }

    // Store the original queue number and regular count
    const originalQueueNumber = queue.queue_number;
    const originalRegularCount = queue.regular_count;

    // Get all waiting queues to recalculate positions
    const waitingQueues = await queueRepo.find({
      where: {
        division: { division_id },
        status: "Waiting",
        created_at: MoreThanOrEqual(today),
      },
      order: { position: "ASC" },
    });

    // Move skipped queue to the end
    const currentPosition = queue.position;
    const lastPosition = waitingQueues.length;

    // Update positions of queues between the current position and last position
    for (const waitingQueue of waitingQueues) {
      if (
        waitingQueue.position > currentPosition &&
        waitingQueue.position <= lastPosition
      ) {
        waitingQueue.position--;
        await queueRepo.save(waitingQueue);
      }
    }

    queue.position = lastPosition;
    queue.is_skipped = true;
    queue.status = "Waiting";
    queue.queue_number = originalQueueNumber;
    queue.regular_count = originalRegularCount;
    await queueRepo.save(queue);

    const updatedQueues = await queueRepo.find({
      where: {
        division: { division_id },
        status: "Waiting",
        created_at: MoreThanOrEqual(today),
      },
      relations: ["customer"],
      order: { position: "ASC" },
    });

    if (req.app.get("wss")) {
      const wss = req.app.get("wss");
      wss.clients.forEach((client) => {
        if (client.divisionId === division_id) {
          client.send(
            JSON.stringify({
              type: "QUEUE_UPDATE",
              data: {
                queues: updatedQueues,
                current_queue: null,
                skipped_queue: originalQueueNumber,
                timestamp: new Date(),
              },
            })
          );
        }
      });
    }

    return res.status(200).json({
      message: "Queue skipped successfully",
      queue: {
        queue_number: originalQueueNumber,
        new_position: lastPosition,
      },
    });
  } catch (error) {
    console.error("Error skipping queue:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const callSkippedQueue = async (req: Request, res: Response) => {
  const queueRepo = AppDataSource.getRepository(Queue);
  const transactionRepo = AppDataSource.getRepository(QueueTransaction);
  const { queue_id, division_id, user_id, terminal_id, terminal_number } =
    req.body;

  try {
    const ongoingTransaction = await transactionRepo.findOne({
      where: {
        assigned_to: { user_id },
        completed_at: IsNull(),
      },
      relations: ["queue"],
    });

    if (ongoingTransaction) {
      return res.status(400).json({
        message:
          "Please end your current transaction before calling another queue",
      });
    }

    const queue = await queueRepo.findOne({
      where: { queue_id },
      relations: ["customer", "division"],
    });

    if (!queue) {
      return res.status(404).json({ message: "Queue not found" });
    }

    if (!queue.is_skipped) {
      return res.status(400).json({
        message: "Can only call back queues that were previously skipped",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update queue status and flags
    queue.status = "In Progress";
    queue.is_skipped = false;
    queue.terminal_id = terminal_id;
    queue.terminal_number = terminal_number;
    await queueRepo.save(queue);

    // Create new transaction
    const newTransaction = transactionRepo.create({
      status: "In Progress",
      account_number: "",
      started_at: new Date(),
      queue: queue,
      customer: queue.customer,
      assigned_to: { user_id } as User,
    });
    await transactionRepo.save(newTransaction);

    // Get updated queue list
    const updatedQueues = await queueRepo.find({
      where: {
        division: { division_id },
        status: "Waiting",
        created_at: MoreThanOrEqual(today),
      },
      relations: ["customer"],
      order: { position: "ASC" },
    });

    // Notify WebSocket clients
    if (req.app.get("wss")) {
      const wss = req.app.get("wss");
      wss.clients.forEach((client) => {
        if (client.divisionId === division_id) {
          client.send(
            JSON.stringify({
              type: "QUEUE_UPDATE",
              data: {
                current_queue: queue,
                queues: updatedQueues,
                terminal_id: req.body.terminal_id,
                terminal_number: req.body.terminal_number,
                timestamp: new Date(),
              },
            })
          );
        }
      });
    }

    return res.status(200).json({
      message: "Skipped queue called successfully",
      queue: {
        ...queue,
        priority_type: queue.customer.priority_type,
        customer_name: queue.customer.customer_name,
        queue_number: queue.queue_number,
        queue_id: queue.queue_id,
      },
    });
  } catch (error) {
    console.error("Error calling skipped queue:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getCurrentTransaction = async (req: Request, res: Response) => {
  const { division_id } = req.params;
  const { terminal_id, terminal_number } = req.query;
  const queueRepo = AppDataSource.getRepository(Queue);

  try {
    console.log("Fetching current transaction with params:", {
      division_id,
      terminal_id,
      terminal_number,
      timestamp: new Date().toISOString(),
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!terminal_id || !terminal_number) {
      console.log("Missing required parameters");
      return res.status(400).json({
        message: "Terminal ID and Terminal Number are required",
      });
    }

    // Query for any queue that's In Progress for this division today
    const allInProgressQueues = await queueRepo.find({
      where: {
        division: { division_id: parseInt(division_id) },
        status: "In Progress",
        created_at: MoreThanOrEqual(today),
      },
      relations: ["customer", "division"],
    });

    console.log("All In Progress queues:", allInProgressQueues);

    // Find the specific queue for this terminal
    const currentQueue = allInProgressQueues.find(
      (queue) =>
        queue.terminal_id === parseInt(terminal_id as string) &&
        queue.terminal_number === parseInt(terminal_number as string)
    );

    if (!currentQueue) {
      // Log all queues for debugging
      const allQueues = await queueRepo.find({
        where: {
          division: { division_id: parseInt(division_id) },
          created_at: MoreThanOrEqual(today),
        },
        relations: ["customer", "division"],
      });

      console.log("No current queue found. All queues for today:", {
        count: allQueues.length,
        queues: allQueues.map((q) => ({
          id: q.queue_id,
          number: q.queue_number,
          status: q.status,
          terminal_id: q.terminal_id,
          terminal_number: q.terminal_number,
        })),
      });

      return res.status(200).json({
        current_transaction: null,
        debug_info: {
          in_progress_count: allInProgressQueues.length,
          total_queues: allQueues.length,
          timestamp: new Date().toISOString(),
        },
      });
    }

    const formattedTransaction = {
      queue_id: currentQueue.queue_id,
      queue_number: currentQueue.queue_number,
      customer_name: currentQueue.customer?.customer_name || "N/A",
      account_number: currentQueue.customer?.account_number || "N/A",
      priority_type: currentQueue.customer?.priority_type || "regular",
      status: currentQueue.status,
      created_at: currentQueue.created_at,
      terminal_id: currentQueue.terminal_id,
      terminal_number: currentQueue.terminal_number,
    };

    console.log("Returning formatted transaction:", formattedTransaction);

    return res.status(200).json({
      current_transaction: formattedTransaction,
      debug_info: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in getCurrentTransaction:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllInProgressTransactions = async (
  req: Request,
  res: Response
) => {
  const queueRepo = AppDataSource.getRepository(Queue);

  try {
    // Get today's date at midnight (start of day)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Get end of today
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const queues = await queueRepo.find({
      where: {
        status: "In Progress",
        created_at: Between(startOfDay, endOfDay),
      },
      relations: {
        division: true,
        customer: true,
        transactions: {
          assigned_to: true,
        },
      },
      order: {
        created_at: "DESC",
      },
    });

    const formattedTransactions = queues.map((queue) => {
      // Get the latest transaction for this queue
      const latestTransaction =
        queue.transactions[queue.transactions.length - 1];

      return {
        queue_id: queue.queue_id,
        queue_number: queue.queue_number,
        division_name: queue.division.division_name,
        customer_name: queue.customer.customer_name,
        terminal_id: queue.terminal_id,
        terminal_number: queue.terminal_number,
        assigned_to: latestTransaction?.assigned_to
          ? {
              user_id: latestTransaction.assigned_to.user_id,
              username: latestTransaction.assigned_to.username,
            }
          : null,
        created_at: queue.created_at,
        started_at: latestTransaction?.started_at || null,
        status: queue.status,
      };
    });

    return res.status(200).json({
      status: "success",
      data: {
        total: formattedTransactions.length,
        transactions: formattedTransactions,
      },
    });
  } catch (error) {
    console.error("Error fetching queues:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export const getAllWaitingQueues = async (req: Request, res: Response) => {
  const queueRepo = AppDataSource.getRepository(Queue);
  const { division_id } = req.query;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const queryBuilder = queueRepo
      .createQueryBuilder("queue")
      .leftJoinAndSelect("queue.customer", "customer")
      .leftJoinAndSelect("queue.division", "division")
      .where("queue.status = :status", { status: "Waiting" })
      .andWhere("queue.created_at >= :today", { today });

    if (division_id) {
      queryBuilder.andWhere("division.division_id = :division_id", {
        division_id,
      });
    }

    queryBuilder
      .orderBy("queue.position", "ASC")
      .addOrderBy("queue.created_at", "ASC");

    const waitingQueues = await queryBuilder.getMany();

    const formattedQueues = await Promise.all(
      waitingQueues.map(async (queue) => ({
        queue_id: queue.queue_id,
        queue_number: queue.queue_number,
        position: queue.position,
        customer: {
          name: queue.customer.customer_name,
          account_number: queue.customer.account_number,
          priority_type: queue.customer.priority_type,
        },
        division: {
          id: queue.division.division_id,
          name: queue.division.division_name,
        },
        is_skipped: queue.is_skipped,
        created_at: queue.created_at,
        estimated_wait_time: await calculateEstimatedWaitTime(
          queue.division.division_id,
          queue.priority_level
        ),
      }))
    );

    return res.status(200).json({
      status: "success",
      data: {
        total: formattedQueues.length,
        queues: formattedQueues,
      },
    });
  } catch (error) {
    console.error("Error fetching waiting queues:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
