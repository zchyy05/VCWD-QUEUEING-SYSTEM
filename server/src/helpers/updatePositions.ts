import { Queue } from "../entity/Queue";
import {
  Between,
  LessThanOrEqual,
  MoreThanOrEqual,
  IsNull,
  Repository,
  LessThan,
} from "typeorm";

const updatePositions = async (
  queueRepo: Repository<Queue>,
  startPosition: number,
  division_id: number
) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const subsequentQueues = await queueRepo.find({
    where: {
      division: { division_id },
      status: "Waiting",
      is_skipped: false,
      position: MoreThanOrEqual(startPosition),
      created_at: Between(today, tomorrow),
    },
    order: {
      position: "ASC",
    },
  });

  for (const queue of subsequentQueues) {
    queue.position++;
    await queueRepo.save(queue);
  }
};
export default updatePositions;
