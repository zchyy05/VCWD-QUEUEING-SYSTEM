import { Request, Response } from "express";
import { Division } from "../entity/Division";
import { Terminal } from "../entity/Terminal";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Brackets, Not } from "typeorm";

export const createTerminals = async (req: Request, res: Response) => {
  const { division_id, terminalCount } = req.body;

  const terminalRepo = AppDataSource.getRepository(Terminal);
  const divisionRepo = AppDataSource.getRepository(Division);
  try {
    const division = await divisionRepo.findOne({
      where: { division_id: division_id },
    });

    if (!division) {
      return res.status(404).json({ message: "Division not found" });
    }

    const terminalNumberExist = await terminalRepo.findOne({
      where: {
        terminalNumber: terminalCount,
        division: { division_id: division_id },
      },
    });

    if (terminalNumberExist) {
      return res
        .status(409)
        .json({ message: "Terminal already exists in this division" });
    }
    const terminals = terminalRepo.create({
      division: division,
      terminalNumber: terminalCount,
    });
    await terminalRepo.save(terminals);
    return res
      .status(200)
      .json({ message: "Terminals created successfully", terminals });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const logTerminalActivity = async (
  terminal: Terminal,
  user: User,
  action: string
) => {
  console.log(
    `[${new Date().toISOString()}] Terminal ${
      terminal.terminalNumber
    } - ${action} - User: ${user.first_name} ${user.last_name} (ID: ${
      user.user_id
    })`
  );
};

export const getTerminals = async (req: Request, res: Response) => {
  const terminalRepo = AppDataSource.getRepository(Terminal);
  const user = req.user;

  try {
    if (user.role === "admin") {
      return res.status(200).json({
        terminals: null,
        message: "Admin user does not need terminals",
      });
    }

    const availableTerminals = await terminalRepo
      .createQueryBuilder("terminal")
      .leftJoinAndSelect("terminal.division", "division")
      .leftJoinAndSelect("terminal.occupiedBy", "user")
      .where("division.division_id = :divisionId", {
        divisionId: user.division.division_id,
      })
      .andWhere("terminal.isOccupied = :isOccupied", { isOccupied: false })
      .orderBy("terminal.terminalNumber", "ASC")
      .getMany();

    console.log(
      `[${new Date().toISOString()}] Available terminals for division ${
        user.division.division_id
      }:`,
      availableTerminals.map((t) => t.terminalNumber)
    );

    const cleanTerminals = availableTerminals.map((terminal) => ({
      terminal_id: terminal.terminal_id,
      terminalNumber: terminal.terminalNumber,
      isOccupied: terminal.isOccupied,
      division: {
        division_id: terminal.division.division_id,
        name: terminal.division.division_name,
      },
    }));

    return res.status(200).json({
      terminals: cleanTerminals,
      message: "terminals found",
    });
  } catch (error) {
    console.error("Error in getTerminals:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const occupyterminal = async (req: Request, res: Response) => {
  const { terminalNumber, user_id } = req.body;
  let queryRunner = null;

  try {
    const userRepo = AppDataSource.getRepository(User);
    const terminalRepo = AppDataSource.getRepository(Terminal);

    const user = await userRepo.findOne({
      where: { user_id },
      relations: ["terminal", "division"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.terminal) {
      return res.status(400).json({
        message: "User already has an occupied terminal",
        currentTerminal: user.terminal,
      });
    }

    const terminal = await terminalRepo.findOne({
      where: {
        terminalNumber,
        division: { division_id: user.division.division_id },
      },
      relations: ["occupiedBy", "division"],
    });

    if (!terminal) {
      return res
        .status(404)
        .json({ message: "Terminal not found in user's division" });
    }

    if (terminal.isOccupied || terminal.occupiedBy) {
      return res.status(400).json({
        message: `Terminal ${terminalNumber} is already occupied by ${
          terminal.occupiedBy?.first_name ?? "another user"
        }`,
      });
    }

    queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      terminal.isOccupied = true;
      terminal.occupiedBy = user;
      await queryRunner.manager.save(terminal);

      user.terminal = terminal;
      await queryRunner.manager.save(user);

      await logTerminalActivity(terminal, user, "OCCUPIED");

      await queryRunner.commitTransaction();

      const response = {
        message: "Terminal occupied successfully",
        terminal: {
          terminal_id: terminal.terminal_id,
          terminalNumber: terminal.terminalNumber,
          isOccupied: terminal.isOccupied,
          occupiedById: terminal.occupiedById,
          division: {
            division_id: terminal.division.division_id,
            name: terminal.division.division_name,
          },
        },
        user: {
          user_id: user.user_id,
          first_name: user.first_name,
          last_name: user.last_name,
          terminal_id: terminal.terminal_id,
        },
      };

      return res.status(200).json(response);
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    }
  } catch (error) {
    console.error("Error in occupyterminal:", error);
    return res
      .status(400)
      .json({ message: error.message || "Failed to occupy terminal" });
  } finally {
    if (queryRunner) {
      await queryRunner.release();
    }
  }
};

export const releaseTerminal = async (req: Request, res: Response) => {
  const { terminalNumber } = req.body;
  let queryRunner = null;

  try {
    const terminalRepo = AppDataSource.getRepository(Terminal);
    const userRepo = AppDataSource.getRepository(User);

    const terminal = await terminalRepo.findOne({
      where: { terminalNumber },
      relations: ["occupiedBy", "division"],
    });

    if (!terminal) {
      return res.status(404).json({ message: "Terminal not found" });
    }

    if (!terminal.isOccupied) {
      return res.status(400).json({ message: "Terminal is not occupied" });
    }

    const occupyingUser = terminal.occupiedBy;
    if (!occupyingUser) {
      return res.status(400).json({
        message: "Terminal is marked as occupied but no user is assigned",
      });
    }

    queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      terminal.isOccupied = false;
      terminal.occupiedBy = null;
      await queryRunner.manager.save(terminal);

      occupyingUser.terminal = null;
      await queryRunner.manager.save(occupyingUser);

      await logTerminalActivity(terminal, occupyingUser, "RELEASED");

      await queryRunner.commitTransaction();

      return res.status(200).json({
        message: "Terminal released successfully",
        terminal: {
          terminal_id: terminal.terminal_id,
          terminalNumber: terminal.terminalNumber,
          isOccupied: false,
          division: {
            division_id: terminal.division.division_id,
            name: terminal.division.division_name,
          },
        },
      });
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    }
  } catch (error) {
    console.error("Error in releaseTerminal:", error);
    return res.status(500).json({
      message: "Failed to release terminal",
      error: error.message,
    });
  } finally {
    if (queryRunner) {
      await queryRunner.release();
    }
  }
};

export const getAllTerminals = async (req: Request, res: Response) => {
  const terminalRepo = AppDataSource.getRepository(Terminal);

  try {
    const terminals = await terminalRepo
      .createQueryBuilder("terminal")
      .leftJoinAndSelect("terminal.division", "division")
      .leftJoinAndSelect("terminal.occupiedBy", "user")
      .orderBy("terminal.terminalNumber", "ASC")
      .getMany();

    const cleanTerminals = terminals.map((terminal) => ({
      terminal_id: terminal.terminal_id,
      terminalNumber: terminal.terminalNumber,
      isOccupied: terminal.isOccupied,
      division: {
        division_id: terminal.division.division_id,
        name: terminal.division.division_name,
      },
      occupiedBy: terminal.occupiedBy
        ? {
            user_id: terminal.occupiedBy.user_id,
            first_name: terminal.occupiedBy.first_name,
            last_name: terminal.occupiedBy.last_name,
          }
        : null,
    }));

    return res.status(200).json({
      terminals: cleanTerminals,
      message: "Terminals retrieved successfully",
    });
  } catch (error) {
    console.error("Error in getAllTerminals:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateTerminal = async (req: Request, res: Response) => {
  const { terminal_id } = req.params;
  const { terminalNumber, division_id } = req.body;

  const terminalRepo = AppDataSource.getRepository(Terminal);
  const divisionRepo = AppDataSource.getRepository(Division);

  try {
    const terminal = await terminalRepo.findOne({
      where: { terminal_id: parseInt(terminal_id) },
      relations: ["division"],
    });

    if (!terminal) {
      return res.status(404).json({ message: "Terminal not found" });
    }

    if (division_id) {
      const newDivision = await divisionRepo.findOne({
        where: { division_id: division_id },
      });

      if (!newDivision) {
        return res.status(404).json({ message: "New division not found" });
      }

      // Check if terminal number already exists in new division
      const terminalNumberExist = await terminalRepo.findOne({
        where: {
          terminalNumber: terminalNumber || terminal.terminalNumber,
          division: { division_id: division_id },
          terminal_id: Not(parseInt(terminal_id)),
        },
      });

      if (terminalNumberExist) {
        return res.status(409).json({
          message: "Terminal number already exists in the target division",
        });
      }

      terminal.division = newDivision;
    }

    if (terminalNumber) {
      terminal.terminalNumber = terminalNumber;
    }

    await terminalRepo.save(terminal);

    return res.status(200).json({
      message: "Terminal updated successfully",
      terminal: {
        terminal_id: terminal.terminal_id,
        terminalNumber: terminal.terminalNumber,
        isOccupied: terminal.isOccupied,
        division: {
          division_id: terminal.division.division_id,
          name: terminal.division.division_name,
        },
      },
    });
  } catch (error) {
    console.error("Error in updateTerminal:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const deleteTerminal = async (req: Request, res: Response) => {
  const { terminal_id } = req.params;
  const terminalRepo = AppDataSource.getRepository(Terminal);

  try {
    const terminal = await terminalRepo.findOne({
      where: { terminal_id: parseInt(terminal_id) },
      relations: ["occupiedBy"],
    });

    if (!terminal) {
      return res.status(404).json({ message: "Terminal not found" });
    }

    if (terminal.isOccupied || terminal.occupiedBy) {
      return res.status(400).json({
        message: "Cannot delete terminal while it is occupied",
      });
    }

    await terminalRepo.remove(terminal);

    return res.status(200).json({
      message: "Terminal deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteTerminal:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
