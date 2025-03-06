import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Division } from "../entity/Division";
import { Department } from "../entity/Department";

export const getDivision = async (req: Request, res: Response) => {
  const divisionRepo = AppDataSource.getRepository(Division);
  try {
    const divisions = await divisionRepo.find({
      relations: {
        department: true,
      },
    });

    return res.status(200).json({
      message: "Divisions retrieved successfully",
      divisions,
    });
  } catch (error) {
    console.error("Error retrieving divisions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getDivisions = async (req: Request, res: Response) => {
  if (req.user?.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Unauthorized: Admin access required" });
  }

  const divisionRepo = AppDataSource.getRepository(Division);
  try {
    const divisions = await divisionRepo.find({
      relations: {
        department: true,
      },
    });

    return res.status(200).json({
      message: "Divisions retrieved successfully",
      divisions,
    });
  } catch (error) {
    console.error("Error retrieving divisions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createDivision = async (req: Request, res: Response) => {
  if (req.user?.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Unauthorized: Admin access required" });
  }

  const departmentRepo = AppDataSource.getRepository(Department);
  const divisionRepo = AppDataSource.getRepository(Division);
  const { division_name, department_id, queue_prefix } = req.body;

  try {
    const department = await departmentRepo.findOne({
      where: { department_id },
    });

    if (!division_name.trim()) {
      return res.status(400).json({ message: "Division name can't be empty" });
    }

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const existingDivision = await divisionRepo.findOne({
      where: { division_name },
    });

    if (existingDivision) {
      return res.status(409).json({ message: "Division already exists" });
    }

    const newDivision = divisionRepo.create({
      division_name,
      department,
      queue_prefix: queue_prefix || division_name.substring(0, 1).toUpperCase(),
    });

    await divisionRepo.save(newDivision);

    res.status(201).json({
      message: "Division created successfully",
      division: newDivision,
    });
  } catch (error) {
    console.error("Error creating division:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateDivision = async (req: Request, res: Response) => {
  if (req.user?.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Unauthorized: Admin access required" });
  }

  const divisionRepo = AppDataSource.getRepository(Division);
  const departmentRepo = AppDataSource.getRepository(Department);

  const { id } = req.params;
  const { division_name, department_id, queue_prefix } = req.body;

  try {
    const divisionId = Number(id);
    if (isNaN(divisionId)) {
      return res.status(400).json({ message: "Invalid division ID" });
    }

    const division = await divisionRepo.findOne({
      where: { division_id: divisionId },
      relations: { department: true },
    });

    if (!division) {
      return res.status(404).json({ message: "Division not found" });
    }

    if (!division_name.trim()) {
      return res.status(400).json({ message: "Division name can't be empty" });
    }

    if (department_id) {
      const department = await departmentRepo.findOne({
        where: { department_id },
      });

      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }

      division.department = department;
    }

    const existingDivision = await divisionRepo.findOne({
      where: { division_name },
    });

    if (existingDivision && existingDivision.division_id !== divisionId) {
      return res.status(409).json({ message: "Division name already exists" });
    }

    division.division_name = division_name;
    // Add the queue_prefix update
    if (queue_prefix !== undefined) {
      division.queue_prefix = queue_prefix;
    }

    await divisionRepo.save(division);

    res.status(200).json({
      message: "Division updated successfully",
      division,
    });
  } catch (error) {
    console.error("Error updating division:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteDivision = async (req: Request, res: Response) => {
  if (req.user?.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Unauthorized: Admin access required" });
  }

  const divisionRepo = AppDataSource.getRepository(Division);
  const { id } = req.params;

  try {
    const divisionId = Number(id);
    if (isNaN(divisionId)) {
      return res.status(400).json({ message: "Invalid division ID" });
    }

    const division = await divisionRepo.findOne({
      where: { division_id: divisionId },
      relations: { department: true },
    });

    if (!division) {
      return res.status(404).json({ message: "Division not found" });
    }

    await divisionRepo.remove(division);

    res.status(200).json({
      message: "Division deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting division:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
