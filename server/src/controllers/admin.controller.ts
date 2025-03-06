import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Division } from "../entity/Division";
import { Terminal } from "../entity/Terminal";
import * as bcrypt from "bcrypt";
import { Not } from "typeorm";

export const getUsers = async (req: Request, res: Response) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  const userRepo = AppDataSource.getRepository(User);

  try {
    const users = await userRepo.find({
      relations: {
        division: true,
        terminal: true,
      },
      select: {
        user_id: true,
        role: true,
        first_name: true,
        middle_name: true,
        last_name: true,
        email: true,
        phone_number: true,
        username: true,
        isActive: true,
        last_activity: true,
        created_at: true,
        updated_at: true,
        division: {
          division_id: true,
          division_name: true,
        },
        terminal: {
          terminal_id: true,
          terminalNumber: true,
        },
      },
    });

    const usersWithFlag = users.map((user) => ({
      ...user,
      isCurrentUser: user.user_id === req.user.user_id,
    }));

    res.status(200).json({
      message: "Users retrieved successfully",
      users: usersWithFlag,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  const userRepo = AppDataSource.getRepository(User);
  const divisionRepo = AppDataSource.getRepository(Division);

  const {
    first_name,
    middle_name,
    last_name,
    email,
    phone_number,
    username,
    password,
    division_id,
    role = "user",
    isActive = false,
  } = req.body;

  console.log(req.body);

  try {
    if (
      !first_name ||
      !last_name ||
      !email ||
      !username ||
      !password ||
      !division_id
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await userRepo.findOne({
      where: [{ username }, { email }, { phone_number }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).json({ message: "Email already exists" });
      }
      if (existingUser.username === username) {
        return res.status(409).json({ message: "Username already exists" });
      }
      if (existingUser.phone_number === phone_number) {
        return res.status(409).json({ message: "Phone number already exists" });
      }
    }

    const division = await divisionRepo.findOne({
      where: { division_id },
    });

    if (!division) {
      return res.status(404).json({ message: "Division not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = userRepo.create({
      first_name,
      middle_name,
      last_name,
      email,
      phone_number,
      username,
      password: hashedPassword,
      division,
      role,
      isActive,
    });

    await userRepo.save(newUser);

    const { password: _, ...userResponse } = newUser;

    return res.status(201).json({
      message: "User created successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  const userRepo = AppDataSource.getRepository(User);
  const divisionRepo = AppDataSource.getRepository(Division);

  const { id } = req.params;
  const {
    first_name,
    middle_name,
    last_name,
    email,
    phone_number,
    username,
    password,
    division_id,
  } = req.body;

  try {
    const user = await userRepo.findOne({
      where: { user_id: parseInt(id) },
      relations: {
        division: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      (first_name === "" ||
        last_name === "" ||
        email === "" ||
        username === "") &&
      (first_name !== undefined ||
        last_name !== undefined ||
        email !== undefined ||
        username !== undefined)
    ) {
      return res
        .status(400)
        .json({ message: "Required fields cannot be empty" });
    }

    if (username || email) {
      const existingUser = await userRepo.findOne({
        where: [
          { username: username || "", user_id: Not(user.user_id) },
          { email: email || "", user_id: Not(user.user_id) },
        ],
      });

      if (existingUser) {
        return res.status(409).json({
          message: "Username or email already taken",
        });
      }
    }

    if (division_id) {
      const division = await divisionRepo.findOne({
        where: { division_id },
      });
      if (!division) {
        return res.status(404).json({ message: "Division not found" });
      }
      user.division = division;
    }

    if (first_name) user.first_name = first_name;
    if (middle_name !== undefined) user.middle_name = middle_name;
    if (last_name) user.last_name = last_name;
    if (email) user.email = email;
    if (phone_number !== undefined) user.phone_number = phone_number;
    if (username) user.username = username;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await userRepo.save(user);

    const { password: _, ...userResponse } = user;

    return res.status(200).json({
      message: "User updated successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  const userRepo = AppDataSource.getRepository(User);
  const { id } = req.params;

  try {
    const user = await userRepo.findOne({
      where: { user_id: parseInt(id) },
      relations: {
        transactions: true,
        handledCustomers: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await userRepo.remove(user);

    res.status(200).json({
      message: "User and all related records deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  const userRepo = AppDataSource.getRepository(User);
  const { id } = req.params;

  try {
    const user = await userRepo.findOne({
      where: { user_id: parseInt(id) },
      relations: {
        division: true,
        terminal: true,
      },
      select: {
        user_id: true,
        role: true,
        first_name: true,
        middle_name: true,
        last_name: true,
        email: true,
        phone_number: true,
        username: true,
        isActive: true,
        last_activity: true,
        created_at: true,
        updated_at: true,
        division: {
          division_id: true,
          division_name: true,
        },
        terminal: {
          terminal_id: true,
          terminalNumber: true,
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User retrieved successfully",
      user,
    });
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
