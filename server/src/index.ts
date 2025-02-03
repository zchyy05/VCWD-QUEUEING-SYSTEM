import { AppDataSource } from "./data-source";
import * as express from "express";
import * as dotenv from "dotenv";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import authRoute from "./routes/auth.route";
import departmentRoute from "./routes/department.route";
import divisionRoute from "./routes/division.route";
import queueRoute from "./routes/queue.route";
const PORT = process.env.PORT || 5050;

dotenv.config();
const corsOptions = {
  origin: [process.env.CORSLINK],
  credentials: true,
};

AppDataSource.initialize()
  .then(async () => {
    const app = express();

    app.use(cors(corsOptions));
    app.use(bodyParser.json());

    /*Index Routes*/
    app.use("/auth", authRoute);
    app.use("/department", departmentRoute);
    app.use("/division", divisionRoute);
    app.use("/queue", queueRoute);
    app.listen(PORT, () => {
      console.log(`Server running on port:${PORT}`);
    });
  })
  .catch((error) => console.log(error));
