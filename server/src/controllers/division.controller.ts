import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Division } from "../entity/Division";
import { Department } from "../entity/Department";

export const createDivision = async (req: Request, res: Response) => {
  const departmentRepo = AppDataSource.getRepository(Department);

  const divisionRepo = AppDataSource.getRepository(Division);

  const { division_name, department_id } = req.body;

  try {
    const department = await departmentRepo.findOne({
      where: { department_id },
    });
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const existingDivision = await divisionRepo.findOne({
      where: { division_name },
    });
    if (existingDivision) {
      return res.status(409).json({ message: "Division already exist" });
    }

    const newDivision = divisionRepo.create({ division_name, department });
    await divisionRepo.save(newDivision);

    res
      .status(201)
      .json({
        message: "Division created successfully",
        division: newDivision,
      });
  } catch (error) {
    console.error("Error creating division:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
