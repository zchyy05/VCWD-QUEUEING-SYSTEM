import { Between, Repository } from "typeorm";
import { Queue } from "../entity/Queue";
const getActiveWaitingQueues = async (
  queueRepo: Repository<Queue>,
  division_id: number
) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get only active waiting queues (not skipped)
  return await queueRepo.find({
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
};

export default getActiveWaitingQueues;
