import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import * as bcrypt from "bcrypt";

const userRepo = AppDataSource.getRepository(User);

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await userRepo.findOne({
      where: { user_id: req.user.user_id }, // Use req.user from JWT token
      relations: ["division", "terminal"], // Include related entities
      select: {
        user_id: true,
        email: true,
        first_name: true,
        middle_name: true,
        last_name: true,
        phone_number: true,
        username: true,
        role: true,
        isActive: true,
        created_at: true,
        updated_at: true,
        terminal_id: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = {
      user_id: user.user_id,
      email: user.email,
      first_name: user.first_name,
      middle_name: user.middle_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      username: user.username,
      role: user.role,
      isActive: user.isActive,
      division: user.division,
      terminal: user.terminal,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    res.status(200).json({
      message: "User data retrieved successfully",
      user: userData,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user.user_id;
    const {
      first_name,
      middle_name,
      last_name,
      email,
      phone_number,
      username,
      currentPassword,
      newPassword,
    } = req.body;

    const user = await userRepo.findOne({
      where: { user_id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check for email uniqueness if email is being updated
    if (email && email !== user.email) {
      const emailExists = await userRepo.findOne({ where: { email } });
      if (emailExists) {
        return res.status(409).json({ message: "Email already exists" });
      }
    }

    // Check for phone number uniqueness if phone number is being updated
    if (phone_number && phone_number !== user.phone_number) {
      const phoneExists = await userRepo.findOne({ where: { phone_number } });
      if (phoneExists) {
        return res.status(409).json({ message: "Phone number already exists" });
      }
    }

    // Check for username uniqueness if username is being updated
    if (username && username !== user.username) {
      const usernameExists = await userRepo.findOne({ where: { username } });
      if (usernameExists) {
        return res.status(409).json({ message: "Username already exists" });
      }
    }

    // Handle password update if provided
    if (newPassword && currentPassword) {
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    // Update user fields if provided
    user.first_name = first_name || user.first_name;
    user.middle_name = middle_name || user.middle_name;
    user.last_name = last_name || user.last_name;
    user.email = email || user.email;
    user.phone_number = phone_number || user.phone_number;
    user.username = username || user.username;

    await userRepo.save(user);

    const updatedUser = await userRepo.findOne({
      where: { user_id: userId },
      relations: ["division", "terminal"],
      select: {
        user_id: true,
        email: true,
        first_name: true,
        middle_name: true,
        last_name: true,
        phone_number: true,
        username: true,
        role: true,
        isActive: true,
        created_at: true,
        updated_at: true,
        terminal_id: true,
      },
    });

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
