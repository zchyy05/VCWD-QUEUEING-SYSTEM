import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Division } from "../entity/Division";
import * as bcrypt from "bcrypt";
import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";

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
  const { username, password } = req.body;

  try {
    const user = await userRepo.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: "Username doesn't exist" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(409)
        .json({ message: "Username or password is incorrect" });
    }

    const generateToken = (user: User) => {
      return jwt.sign(
        {
          userId: user.user_id,
          username: user.username,
          email: user.email,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "24h" }
      );
    };
    const token = generateToken(user);

    return res.status(200).json({
      message: "Login Successfully",
      token,
      user: { id: user.user_id, email: user.email, username: user.username },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};
