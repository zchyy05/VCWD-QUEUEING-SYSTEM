import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Queue } from "../entity/Queue";
import { QueueTransaction } from "../entity/QueueTransaction";
import { Between, IsNull, Not } from "typeorm";

export const getAnalyticsOverview = async (req: Request, res: Response) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const queueRepo = AppDataSource.getRepository(Queue);
    const transactionRepo = AppDataSource.getRepository(QueueTransaction);

    const activeUsers = await userRepo.count({
      where: {
        isActive: true,
        last_activity: Not(IsNull()),
      },
    });

    const activeQueues = await queueRepo.count({
      where: {
        status: "Waiting",
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalTransactions = await transactionRepo.count({
      where: {
        started_at: Between(today, new Date()),
      },
    });

    const completedTransactions = await transactionRepo.count({
      where: {
        started_at: Between(today, new Date()),
        status: "Completed",
        completed_at: Not(IsNull()),
      },
    });

    const serviceRate =
      totalTransactions > 0
        ? (completedTransactions / totalTransactions) * 100
        : 0;

    return res.json({
      activeUsers,
      activeQueues,
      serviceRate: serviceRate.toFixed(1),
      timestamp: new Date(),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserAverageTime = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const transactionRepo = AppDataSource.getRepository(QueueTransaction);

    const transactions = await transactionRepo.find({
      where: {
        assigned_to: { user_id: parseInt(userId) },
        status: "Completed",
        completed_at: Not(IsNull()),
      },
    });

    let totalTime = 0;
    transactions.forEach((transaction) => {
      const handleTime =
        transaction.completed_at.getTime() - transaction.started_at.getTime();
      totalTime += handleTime;
    });

    const averageTime =
      transactions.length > 0 ? totalTime / transactions.length : 0;

    return res.json({
      userId,
      averageHandleTime: Math.round(averageTime / 1000),
      totalTransactions: transactions.length,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getServiceTrends = async (req: Request, res: Response) => {
  try {
    const transactionRepo = AppDataSource.getRepository(QueueTransaction);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const transactions = await transactionRepo.find({
      where: {
        started_at: Between(today, new Date()),
      },
      order: {
        started_at: "ASC",
      },
    });

    const hourlyStats = new Map();
    transactions.forEach((transaction) => {
      const hour = transaction.started_at.getHours();
      if (!hourlyStats.has(hour)) {
        hourlyStats.set(hour, { total: 0, completed: 0 });
      }

      const stats = hourlyStats.get(hour);
      stats.total++;
      if (transaction.status === "Completed") {
        stats.completed++;
      }
    });

    const trends = Array.from(hourlyStats.entries()).map(([hour, stats]) => ({
      hour,
      completionRate: ((stats.completed / stats.total) * 100).toFixed(1),
      totalTransactions: stats.total,
    }));

    return res.json(trends);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserPerformanceStats = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const transactionRepo = AppDataSource.getRepository(QueueTransaction);

    // Get today's transactions
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userTransactions = await transactionRepo.find({
      where: {
        assigned_to: { user_id: parseInt(userId) },
        started_at: Between(today, new Date()),
      },
      relations: ["queue"],
    });

    // Calculate metrics
    const totalTransactions = userTransactions.length;
    const completedTransactions = userTransactions.filter(
      (t) => t.status === "Completed"
    ).length;
    const averageWaitTime =
      userTransactions.reduce((acc, t) => {
        return acc + (t.started_at.getTime() - t.queue.created_at.getTime());
      }, 0) / (totalTransactions || 1);

    return res.json({
      totalTransactions,
      completedTransactions,
      completionRate: totalTransactions
        ? ((completedTransactions / totalTransactions) * 100).toFixed(1)
        : 0,
      averageWaitTime: Math.round(averageWaitTime / 1000), // in seconds
      averageHandleTime: Math.round(
        averageWaitTime / 1000 / (totalTransactions || 1)
      ),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getDivisionQueueStats = async (req: Request, res: Response) => {
  try {
    const queueRepo = AppDataSource.getRepository(Queue);
    const transactionRepo = AppDataSource.getRepository(QueueTransaction);

    const queues = await queueRepo.find({
      relations: ["division"],
      where: {
        created_at: Between(
          new Date(new Date().setHours(0, 0, 0, 0)),
          new Date()
        ),
      },
    });

    const stats = {};
    queues.forEach((queue) => {
      const divisionId = queue.division.division_id;
      if (!stats[divisionId]) {
        stats[divisionId] = {
          divisionName: queue.division.division_name,
          totalQueues: 0,
          waitingQueues: 0,
          averageWaitTime: 0,
          completedQueues: 0,
        };
      }

      stats[divisionId].totalQueues++;
      if (queue.status === "Waiting") {
        stats[divisionId].waitingQueues++;
      }
    });

    return res.json(Object.values(stats));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getPeakHoursAnalysis = async (req: Request, res: Response) => {
  try {
    const queueRepo = AppDataSource.getRepository(Queue);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const queues = await queueRepo.find({
      where: {
        created_at: Between(today, new Date()),
      },
    });

    const hourlyData = new Array(24).fill(0);
    queues.forEach((queue) => {
      const hour = new Date(queue.created_at).getHours();
      hourlyData[hour]++;
    });

    const peakHours = hourlyData
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return res.json({
      hourlyDistribution: hourlyData,
      peakHours,
      totalQueues: queues.length,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getWaitTimeAnalytics = async (req: Request, res: Response) => {
  try {
    const transactionRepo = AppDataSource.getRepository(QueueTransaction);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const transactions = await transactionRepo.find({
      where: {
        started_at: Between(today, new Date()),
        completed_at: Not(IsNull()),
      },
      relations: ["queue"],
    });

    const waitTimes = transactions.map((t) => ({
      queueTime: t.started_at.getTime() - t.queue.created_at.getTime(),
      serviceTime: t.completed_at.getTime() - t.started_at.getTime(),
    }));

    const averageWaitTime =
      waitTimes.reduce((acc, curr) => acc + curr.queueTime, 0) /
      waitTimes.length;
    const averageServiceTime =
      waitTimes.reduce((acc, curr) => acc + curr.serviceTime, 0) /
      waitTimes.length;

    return res.json({
      averageWaitTime: Math.round(averageWaitTime / 1000),
      averageServiceTime: Math.round(averageServiceTime / 1000),
      totalTransactions: transactions.length,
      waitTimeDistribution: {
        lessThan5Min: waitTimes.filter((w) => w.queueTime < 300000).length,
        fiveToTenMin: waitTimes.filter(
          (w) => w.queueTime >= 300000 && w.queueTime < 600000
        ).length,
        moreThanTenMin: waitTimes.filter((w) => w.queueTime >= 600000).length,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
