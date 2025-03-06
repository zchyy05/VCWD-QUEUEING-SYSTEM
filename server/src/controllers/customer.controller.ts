import { Request, Response } from "express";
import { Customer } from "../entity/Customer";
import { AppDataSource } from "../data-source";
import { Like, ILike } from "typeorm";

const customerRepo = AppDataSource.getRepository(Customer);

/**
 * Get all customers with pagination and optional search parameters
 */
export const getCustomers = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      searchTerm = "",
      priorityType,
      sortBy = "created_at",
      sortOrder = "DESC",
    } = req.query;

    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    // Build the search conditions
    const whereConditions: any = {};

    if (searchTerm) {
      whereConditions.where = [
        { customer_name: ILike(`%${searchTerm}%`) },
        { account_number: ILike(`%${searchTerm}%`) },
      ];
    }

    if (priorityType) {
      if (whereConditions.where) {
        // If we already have search conditions, filter those results
        whereConditions.where = whereConditions.where.map((condition: any) => ({
          ...condition,
          priority_type: priorityType,
        }));
      } else {
        whereConditions.where = { priority_type: priorityType };
      }
    }

    // Get total count for pagination
    const totalCount = await customerRepo.count(whereConditions);

    // Execute main query with relations
    const customers = await customerRepo.find({
      ...whereConditions,
      relations: ["queues", "transactions", "handle_by"],
      take: limitNumber,
      skip: skip,
      order: { [sortBy as string]: sortOrder },
    });

    // Return with pagination data
    return res.status(200).json({
      success: true,
      data: customers,
      pagination: {
        total: totalCount,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(totalCount / limitNumber),
      },
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
      error: error.message,
    });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Make sure we have a valid numeric ID
    const customerId = parseInt(id);
    if (isNaN(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID format",
      });
    }

    const customer = await customerRepo.findOne({
      where: { customer_id: customerId },
      relations: [
        "queues",
        "queues.division",
        "transactions",
        "transactions.queue",
        "handle_by",
      ],
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error(`Error fetching customer with ID ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
      error: error.message,
    });
  }
};

/**
 * Get customer queue history (all queue entries for a customer)
 */
export const getCustomerQueueHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Make sure we have a valid numeric ID
    const customerId = parseInt(id);
    if (isNaN(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID format",
      });
    }

    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    // Get all queues for this customer with pagination
    const [queues, totalCount] = await AppDataSource.getRepository("Queue")
      .createQueryBuilder("queue")
      .leftJoinAndSelect("queue.division", "division")
      .leftJoinAndSelect("queue.transactions", "transaction")
      .where("queue.customer_id = :customerId", { customerId })
      .orderBy("queue.created_at", "DESC")
      .take(limitNumber)
      .skip(skip)
      .getManyAndCount();

    return res.status(200).json({
      success: true,
      data: queues,
      pagination: {
        total: totalCount,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(totalCount / limitNumber),
      },
    });
  } catch (error) {
    console.error(
      `Error fetching queue history for customer ${req.params.id}:`,
      error
    );
    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer queue history",
      error: error.message,
    });
  }
};

/**
 * Search customers with advanced filters
 */
export const searchCustomers = async (req: Request, res: Response) => {
  try {
    const { name, accountNumber, priorityType, dateFrom, dateTo, divisionId } =
      req.body;

    const queryBuilder = customerRepo
      .createQueryBuilder("customer")
      .leftJoinAndSelect("customer.queues", "queue")
      .leftJoinAndSelect("queue.division", "division")
      .leftJoinAndSelect("customer.transactions", "transaction")
      .leftJoinAndSelect("customer.handle_by", "user");

    // Apply filters if provided
    if (name) {
      queryBuilder.andWhere("customer.customer_name ILIKE :name", {
        name: `%${name}%`,
      });
    }

    if (accountNumber) {
      queryBuilder.andWhere("customer.account_number ILIKE :accountNumber", {
        accountNumber: `%${accountNumber}%`,
      });
    }

    if (priorityType) {
      queryBuilder.andWhere("customer.priority_type = :priorityType", {
        priorityType,
      });
    }

    if (dateFrom && dateTo) {
      queryBuilder.andWhere(
        "customer.created_at BETWEEN :dateFrom AND :dateTo",
        {
          dateFrom: new Date(dateFrom),
          dateTo: new Date(dateTo),
        }
      );
    } else if (dateFrom) {
      queryBuilder.andWhere("customer.created_at >= :dateFrom", {
        dateFrom: new Date(dateFrom),
      });
    } else if (dateTo) {
      queryBuilder.andWhere("customer.created_at <= :dateTo", {
        dateTo: new Date(dateTo),
      });
    }

    if (divisionId && !isNaN(Number(divisionId))) {
      queryBuilder.andWhere("division.division_id = :divisionId", {
        divisionId: parseInt(divisionId.toString()),
      });
    }

    // Execute the query
    const customers = await queryBuilder.getMany();

    return res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    console.error("Error searching customers:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search customers",
      error: error.message,
    });
  }
};
