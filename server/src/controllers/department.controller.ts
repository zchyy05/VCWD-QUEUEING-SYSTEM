import { AppDataSource } from "../data-source";
import { Request, Response } from "express";
import { Department } from "../entity/Department";

export const createDepartment = async (req: Request, res: Response) => {
  console.log("Is admin:", req.user?.role);
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

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

export const getAllDepartments = async (req: Request, res: Response) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  const departmentRepo = AppDataSource.getRepository(Department);

  try {
    const departments = await departmentRepo.find();
    res.status(200).json({
      message: "Departments retrieved successfully",
      departments: departments,
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  const departmentRepo = AppDataSource.getRepository(Department);

  const { id } = req.params;

  try {
    const departmentId = Number(id);
    if (isNaN(departmentId)) {
      return res.status(400).json({ message: "Invalid department ID" });
    }

    const department = await departmentRepo.findOne({
      where: { department_id: departmentId },
    });

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const { department_name } = req.body;

    department.department_name = department_name;
    await departmentRepo.save(department);

    res.status(200).json({
      message: "Department updated successfully",
      department: department,
    });
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  const departmentRepo = AppDataSource.getRepository(Department);

  const { id } = req.params;

  try {
    const departmentId = Number(id);
    if (isNaN(departmentId)) {
      return res.status(400).json({ message: "Invalid department ID" });
    }

    const department = await departmentRepo.findOne({
      where: { department_id: departmentId },
    });

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    await departmentRepo.remove(department);

    res.status(200).json({
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getDepartmentStats = async (req: Request, res: Response) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  const departmentRepo = AppDataSource.getRepository(Department);

  try {
    const departmentCount = await departmentRepo.count();

    const departments = await departmentRepo
      .createQueryBuilder("department")
      .leftJoinAndSelect("department.divisions", "division")
      .leftJoinAndSelect("division.users", "user")
      .where("user.role != :role OR user.role IS NULL", { role: "admin" })
      .getMany();

    const totalStaff = departments.reduce((total, department) => {
      return (
        total +
        department.divisions.reduce((divTotal, division) => {
          return divTotal + (division.users?.length || 0);
        }, 0)
      );
    }, 0);

    res.status(200).json({
      totalStaff,
      departmentCount,
    });
  } catch (error) {
    console.error("Error fetching department stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
