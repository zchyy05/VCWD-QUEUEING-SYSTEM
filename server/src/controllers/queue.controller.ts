import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Queue } from "../entity/Queue";
import { Customer } from "../entity/Customer";
import { Division } from "../entity/Division";
import { Between, LessThanOrEqual, MoreThanOrEqual } from "typeorm";

const generateQueueNumber = (divisionPrefix: string, count: number) => {
  const number = (count + 1).toString().padStart(3, "0");
  return `${divisionPrefix}-${number}`;
};

export const createQueue = async (req: Request, res: Response) => {
  const queueRepo = AppDataSource.getRepository(Queue);
  const customerRepo = AppDataSource.getRepository(Customer);
  const divisionRepo = AppDataSource.getRepository(Division);

  const {
    customer_name,
    phone_number,
    division_id,
    priority_type = "regular",
  } = req.body;

  try {
    const division = await divisionRepo.findOne({
      where: { division_id },
    });

    if (!division) {
      return res.status(404).json({ message: "Division not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayQueueCount = await queueRepo.count({
      where: {
        division: division_id,
        created_at: Between(today, tomorrow),
      },
    });

    let customer = await customerRepo.findOne({
      where: { phone_number },
    });

    if (!customer) {
      customer = customerRepo.create({
        customer_name,
        phone_number,
        priority_type,
      });
      await customerRepo.save(customer);
    }

    let priority_level = 0;
    switch (priority_type.toLowerCase()) {
      case "senior":
        priority_level = 2;
        break;
      case "pwd":
        priority_level = 2;
        break;
      default:
        priority_level = 1;
    }

    const queueNumber = generateQueueNumber(
      division.division_name.substring(0, 1).toUpperCase(),
      todayQueueCount
    );

    const newQueue = queueRepo.create({
      queue_number: queueNumber,
      priority_level,
      status: "Waiting",
      customer: customer,
      division: division,
    });

    await queueRepo.save(newQueue);

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

const calculateEstimatedWaitTime = async (
  division_id: number,
  priority_level: number
) => {
  const queueRepo = AppDataSource.getRepository(Queue);

  const waitingCount = await queueRepo.count({
    where: {
      division: { division_id },
      status: "Waiting",
      priority_level: LessThanOrEqual(priority_level),
    },
  });

  const averageServiceTime = 15;
  return waitingCount * averageServiceTime;
};

export const getDivisionQueueStatus = async (req: Request, res: Response) => {
  const { division_id } = req.params;
  const queueRepo = AppDataSource.getRepository(Queue);

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const queues = await queueRepo.find({
      where: {
        division: { division_id },
        created_at: MoreThanOrEqual(today),
      },
      relations: ["customer_id"],
      order: {
        priority_level: "DESC",
        created_at: "ASC",
      },
    });

    const queueStatus = {
      total_waiting: queues.filter((q) => q.status === "Waiting").length,
      current_queue: queues.find((q) => q.status === "In Progress"),
      next_queues: queues.filter((q) => q.status === "Waiting").slice(0, 5),
    };

    return res.status(200).json(queueStatus);
  } catch (error) {
    console.error("Error getting queue status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
