import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { LessThan } from "typeorm";
export const cleanupInactiveSessions = async () => {
  const userRepo = AppDataSource.getRepository(User);

  try {
    const inactiveThreshold = new Date();
    inactiveThreshold.setHours(inactiveThreshold.getHours() - 12);

    await userRepo.update(
      {
        isActive: true,
        last_activity: LessThan(inactiveThreshold),
      },
      {
        isActive: false,
      }
    );

    console.log("Cleaned up inactive sessions");
  } catch (error) {
    console.error("Error cleaning up sessions:", error);
  }
};
