import * as jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";

export const tokenExpirationCheck = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;

    if (decoded?.user_id) {
      try {
        const userRepo = AppDataSource.getRepository(User);
        await userRepo.update(
          { user_id: decoded.user_id },
          { last_activity: new Date() }
        );
      } catch (dbError) {
        console.error("Error updating last activity:", dbError);
      }
    }

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      const decoded = jwt.decode(token) as any;
      console.log(decoded);
      if (decoded?.user_id) {
        try {
          const userRepo = AppDataSource.getRepository(User);
          await userRepo.update(
            { user_id: decoded.user_id },
            {
              isActive: false,
              last_activity: new Date(),
            }
          );
        } catch (dbError) {
          console.error("Error updating user active status:", dbError);
        }
      }
      return res.status(401).json({
        message: "Token expired",
        code: "TOKEN_EXPIRED",
      });
    }
    return res.status(401).json({
      message: "Invalid token",
      code: "INVALID_TOKEN",
    });
  }
};
