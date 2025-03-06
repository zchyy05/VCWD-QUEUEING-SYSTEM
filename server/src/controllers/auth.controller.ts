import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Division } from "../entity/Division";
import * as bcrypt from "bcrypt";
import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { Terminal } from "../entity/Terminal";
import { logTerminalActivity } from "../helpers/logTerminalActivity";
export const sign_up = async (req: Request, res: Response) => {
  const userRepo = AppDataSource.getRepository(User);
  const divisionRepo = AppDataSource.getRepository(Division);
  const {
    firstName,
    middleName,
    lastName,
    email,
    phone_number,
    division_id,
    username,
    password,
  } = req.body;
  try {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone_number ||
      !username ||
      !password
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const emailExist = await userRepo.findOne({ where: { email } });
    const phoneNumberExist = await userRepo.findOne({
      where: { phone_number },
    });

    const division = await divisionRepo.findOne({ where: { division_id } });
    if (!division) {
      return res
        .status(404)
        .json({ message: "Invalid division ID. Division does not exist." });
    }

    if (emailExist || phoneNumberExist) {
      return res
        .status(409)
        .json({ message: "Email or phone number already exist" });
    }

    const usernameExist = await userRepo.findOne({ where: { username } });
    if (usernameExist) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = userRepo.create({
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      email: email,
      phone_number: phone_number,
      division: division,
      username: username,
      password: hashedPassword,
    });

    await userRepo.save(newUser);

    return res
      .status(201)
      .json({ message: "Account created successfully", newUser });
  } catch (error) {
    console.error("Sign up error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const sign_in = async (req: Request, res: Response) => {
  const userRepo = AppDataSource.getRepository(User);
  const { email, password } = req.body;

  try {
    const rawUser = await AppDataSource.manager.query(
      `SELECT u.*, t.terminal_id as t_id, t."terminalNumber" 
       FROM "user" u 
       LEFT JOIN terminal t ON u.terminal_id = t.terminal_id 
       WHERE u.email = $1`,
      [email]
    );
    console.log("Raw user data:", rawUser[0]);

    const user = await userRepo
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.division", "division")
      .leftJoinAndSelect("user.terminal", "terminal")
      .where("user.email = :email", { email })
      .getOne();

    console.log("User entity:", {
      id: user?.user_id,
      terminal_id: user?.terminal_id,
      terminal: user?.terminal,
    });

    if (!user) {
      return res.status(404).json({ message: "Email doesn't exist" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    user.isActive = true;
    user.last_activity = new Date();
    await userRepo.save(user);

    const basePayload = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
    };

    const payload =
      user.role === "admin"
        ? {
            ...basePayload,
            allDivisions: true,
            allTerminals: true,
          }
        : {
            ...basePayload,
            division: user.division,

            terminal_id: user.terminal_id || rawUser[0]?.t_id || null,
            terminal_number:
              user.terminal?.terminalNumber ||
              rawUser[0]?.terminalNumber ||
              null,
          };

    console.log("Pre-token payload:", payload);

    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "24h",
      algorithm: "HS256",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        ...payload,
        isActive: true,
        last_activity: user.last_activity,
      },
    });
  } catch (error) {
    console.error("Sign in error:", error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};
export const me = async (req: Request, res: Response) => {
  try {
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.division", "division")
      .leftJoinAndSelect("user.terminal", "terminal")
      .where("user.user_id = :userId", { userId: req.user.user_id })
      .getOne();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User data in me endpoint:", {
      user_id: user.user_id,
      terminal: user.terminal,
      terminal_id: user.terminal_id,
    });

    const basePayload = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      isActive: user.isActive,
    };

    const responseUser =
      user.role === "admin"
        ? {
            ...basePayload,
            allDivisions: true,
            allTerminals: true,
          }
        : {
            ...basePayload,
            division: user.division,
            terminal_id: user.terminal_id,
            terminal_number: user.terminal?.terminalNumber,

            terminal: user.terminal
              ? {
                  terminal_id: user.terminal.terminal_id,
                  terminalNumber: user.terminal.terminalNumber,
                  isOccupied: user.terminal.isOccupied,
                }
              : null,
          };

    console.log("Response payload in me endpoint:", responseUser);

    return res.status(200).json({
      user: responseUser,
    });
  } catch (error) {
    console.error("Me endpoint error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export const sign_out = async (req: Request, res: Response) => {
  let queryRunner = null;
  const userId = req.user.user_id;
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { user_id: userId },
      relations: ["terminal"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Handle terminal release if user has an assigned terminal
      if (user.terminal) {
        const terminal = user.terminal;
        terminal.isOccupied = false;
        terminal.occupiedBy = null;
        await queryRunner.manager.save(terminal);

        user.terminal = null;
        await logTerminalActivity(terminal, user, "RELEASED");
      }

      // Update user's active status
      user.isActive = false;
      await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Successfully signed out" });
  } catch (error) {
    console.error("Sign out error:", error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    if (queryRunner) {
      await queryRunner.release();
    }
  }
};
