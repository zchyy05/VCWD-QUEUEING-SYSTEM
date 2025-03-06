import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { History } from "./entity/History";
import { Customer } from "./entity/Customer";
import { Department } from "./entity/Department";
import { Division } from "./entity/Division";
import { Priorities } from "./entity/Priorities";
import { Queue } from "./entity/Queue";
import { QueueTransaction } from "./entity/QueueTransaction";
import { Terminal } from "./entity/Terminal";
import { Video } from "./entity/Videos";
export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "123",
  database: "Queuing_System",
  synchronize: true,
  logging: false,
  entities: [
    User,
    Customer,
    History,
    Department,
    Division,
    Priorities,
    Queue,
    QueueTransaction,
    Terminal,
    Video,
  ],
  migrations: [],
  subscribers: [],
});
