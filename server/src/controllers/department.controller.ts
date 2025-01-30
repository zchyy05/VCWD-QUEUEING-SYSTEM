import { AppDataSource } from "../data-source";
import { Request, Response } from "express";
import { Department } from "../entity/Department";

export const createDepartment = async (req: Request, res: Response) => {
  const departmentRepo = AppDataSource.getRepository(Department);

  const { department_name } = req.body;

  try {
    const existingDepartment = await departmentRepo.findOne({
      where: { department_name },
    });
    if (existingDepartment) {
      return res.status(409).json({ message: "Department already exists" });
    }

    const newDepartment = departmentRepo.create({ department_name });
    await departmentRepo.save(newDepartment);
    res.status(201).json({
      message: "Department created successfully",
      department: newDepartment,
    });
  } catch (error) {
    console.error("Error creating department:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
