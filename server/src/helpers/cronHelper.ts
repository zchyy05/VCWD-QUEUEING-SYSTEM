import { Division } from "../entity/Division";
import { Queue } from "../entity/Queue";
import { AppDataSource } from "../data-source";
import handleStaleQueues from "./handleStalesQueue";
import * as cron from "node-cron";
export const createQueueCleanupCronJob = () => {
  const cleanup = async () => {
    const queueRepo = AppDataSource.getRepository(Queue);
    const divisions = await AppDataSource.getRepository(Division).find();

    for (const division of divisions) {
      await handleStaleQueues(queueRepo, division.division_id);
    }
  };

  // Run at midnight every day
  cron.schedule("0 0 * * *", cleanup);
};
