import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";

dotenv.config();

const createInitialAdmin = async () => {
  try {
    await AppDataSource.initialize();
    const userRepo = AppDataSource.getRepository(User);

    // Check if admin already exists
    const adminExists = await userRepo.findOne({
      where: { role: "admin" },
    });

    if (adminExists) {
      console.log("Admin user already exists");
      return;
    }

    // Get admin credentials from environment variables
    const {
      ADMIN_FIRST_NAME,
      ADMIN_LAST_NAME,
      ADMIN_EMAIL,
      ADMIN_USERNAME,
      ADMIN_PASSWORD,
      ADMIN_PHONE,
    } = process.env;

    // Validate required environment variables
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error(
        "Missing required admin credentials in environment variables"
      );
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const adminUser = userRepo.create({
      first_name: ADMIN_FIRST_NAME || "Admin",
      last_name: ADMIN_LAST_NAME || "User",
      email: ADMIN_EMAIL,
      phone_number: ADMIN_PHONE || "",
      username: ADMIN_USERNAME || "admin",
      password: hashedPassword,
      role: "admin",
      isActive: false,
    });

    await userRepo.save(adminUser);
    console.log("Admin user created successfully");
  } catch (error) {
    console.error("Failed to create admin user:", error);
  } finally {
    await AppDataSource.destroy();
  }
};

// Run the initialization
createInitialAdmin();
