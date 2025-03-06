import { AppDataSource } from "./data-source";
import * as express from "express";
import * as dotenv from "dotenv";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as cookieParser from "cookie-parser";
import * as path from "path";
import { cleanupInactiveSessions } from "./utils/cleanUpActiveSession";
import { tokenExpirationCheck } from "./middlewares/tokenExpirationCheck";
import { createQueueCleanupCronJob } from "./helpers/cronHelper";
import authRoute from "./routes/auth.route";
import departmentRoute from "./routes/department.route";
import divisionRoute from "./routes/division.route";
import queueRoute from "./routes/queue.route";
import { setupQueueWebSocket } from "./services/webSocketService";
import terminalRoute from "./routes/terminal.route";
import userRoute from "./routes/user.route";
import adminRoute from "./routes/admin.route";
import analyticsRoute from "./routes/analytics.route";
import entertainmentRoute from "./routes/entertainment.route";
import customerRoute from "./routes/customer.route";
dotenv.config();

const PORT = process.env.PORT || 5050;
const CORS_ORIGIN = process.env.CORSLINK;

const corsOptions = {
  origin: CORS_ORIGIN.split(",").map((origin) => origin.trim()),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cookie",
    "access-control-allow-headers",
    "access-control-allow-origin",
    "access-control-allow-credentials",
  ],
  exposedHeaders: ["Set-Cookie"],
};
const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database Connected");

    const app = express();

    app.use(cors(corsOptions));
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
    app.get("/health", (_, res) => res.status(200).json({ status: "ok" }));

    await cleanupInactiveSessions();
    setInterval(cleanupInactiveSessions, 12 * 60 * 60 * 1000);

    app.use("/auth", authRoute);
    app.use("/department", departmentRoute);
    app.use("/division", divisionRoute);
    app.use("/queue", queueRoute);
    app.use("/terminal", terminalRoute);
    app.use("/user", userRoute);
    app.use("/admin", adminRoute);
    app.use("/analytics", analyticsRoute);
    app.use("/entertainment", entertainmentRoute);
    app.use("/customer", customerRoute);
    createQueueCleanupCronJob();
    app.use(
      (
        err: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        console.error(err.stack);
        res.status(500).json({ message: "Something went wrong!" });
      }
    );

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port: ${PORT}`);
      console.log(`CORS enabled for: ${CORS_ORIGIN}`);
    });

    setupQueueWebSocket(server);

    process.on("SIGTERM", () => {
      console.log("SIGTERM signal received: closing HTTP server");
      server.close(() => {
        console.log("HTTP Server closed");
        AppDataSource.destroy();
      });
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();
