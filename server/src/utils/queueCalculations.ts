import { LessThanOrEqual } from "typeorm";
import { AppDataSource } from "../data-source";
import { Queue } from "../entity/Queue";

export const calculateEstimatedWaitTime = async (
  division_id: number,
  priority_level: number
): Promise<number> => {
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
