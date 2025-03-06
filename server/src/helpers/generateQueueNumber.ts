import {
  Between,
  LessThanOrEqual,
  MoreThanOrEqual,
  IsNull,
  Repository,
} from "typeorm";
import { Queue } from "../entity/Queue";
import { Division } from "../entity/Division";
const generateQueueNumber = async (
  division: Division,
  queueRepo: Repository<Queue>
) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayQueues = await queueRepo.find({
    where: {
      division: { division_id: division.division_id },
      created_at: Between(today, tomorrow),
    },
    order: {
      regular_count: "DESC",
    },
    take: 1,
  });

  const lastCount = todayQueues.length > 0 ? todayQueues[0].regular_count : 0;
  const number = (lastCount + 1).toString().padStart(3, "0");

  const prefix =
    division.queue_prefix ||
    division.division_name.substring(0, 1).toUpperCase();
  return `${prefix}-${number}`;
};
export default generateQueueNumber;
