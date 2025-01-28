import { AppDataSource } from "./data-source";
import * as express from "express";
import * as dotenv from "dotenv";
import * as bodyParser from "body-parser";
import * as cors from "cors";

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

    app.listen(PORT, () => {
      console.log(`Server running on port:${PORT}`);
    });
  })
  .catch((error) => console.log(error));
