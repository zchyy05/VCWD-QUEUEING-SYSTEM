import { Queue } from "../entity/Queue";
import {
  Between,
  LessThanOrEqual,
  MoreThanOrEqual,
  IsNull,
  Repository,
  LessThan,
} from "typeorm";
const handleStaleQueues = async (
  queueRepo: Repository<Queue>,
  division_id: number
) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const staleQueues = await queueRepo.find({
    where: {
      division: { division_id },
      status: "Waiting",
      created_at: LessThan(today),
    },
  });

  for (const queue of staleQueues) {
    queue.status = "Expired";
    await queueRepo.save(queue);
  }

  return staleQueues.length;
};

export default handleStaleQueues;
