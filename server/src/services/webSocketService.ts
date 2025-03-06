// SERVER SIDE (websocketServer.ts)
import { WebSocket, WebSocketServer } from "ws";
import { Repository } from "typeorm";
import { Queue } from "../entity/Queue";
import { AppDataSource } from "../data-source";
import { Server as HTTPServer } from "http";
import { Request, Response } from "express";
import { QueueTransaction } from "../entity/QueueTransaction";
import { calculateEstimatedWaitTime } from "../utils/queueCalculations";
import { LRUCache } from "lru-cache";

// Types
type QueueData = {
  queues: Queue[];
  current_queue: Queue | null;
  terminal_id?: string;
  timestamp: Date;
};

type WebSocketClient = WebSocket & {
  divisionId?: string;
  heartbeat?: NodeJS.Timeout;
  terminalId?: string;
  terminalNumber?: string;
};

// Constants
const CACHE_DURATION = 500;
const HEARTBEAT_INTERVAL = 30000;
const UPDATE_INTERVAL = 1000;
const MAX_RECONNECT_ATTEMPTS = 5;

// Initialize LRU Cache
const queueCache = new LRUCache({
  max: 500,
  ttl: CACHE_DURATION,
});

const createQueueDataFetcher = (queueRepo: Repository<Queue>) => {
  return async (division_id: string): Promise<QueueData> => {
    const cacheKey = `division_${division_id}`;
    const cachedData = queueCache.get(cacheKey);
    if (cachedData) return cachedData as QueueData;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Optimized single query
    const queuesAndCurrent = await queueRepo
      .createQueryBuilder("queue")
      .leftJoinAndSelect("queue.customer", "customer")
      .leftJoinAndSelect("queue.division", "division")
      .where("queue.division_id = :division_id", { division_id })
      .andWhere("queue.created_at >= :today", { today })
      .andWhere("queue.status IN (:...statuses)", {
        statuses: ["Waiting", "In Progress"],
      })
      .orderBy("queue.position", "ASC")
      .getMany();

    const data = {
      queues: queuesAndCurrent.filter((q) => q.status === "Waiting"),
      current_queue:
        queuesAndCurrent.find((q) => q.status === "In Progress") || null,
      timestamp: new Date(),
    };

    queueCache.set(cacheKey, data);
    return data;
  };
};

const getAllWaitingQueues = async (division_id?: string) => {
  const queueRepo = AppDataSource.getRepository(Queue);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const queryBuilder = queueRepo
    .createQueryBuilder("queue")
    .leftJoinAndSelect("queue.customer", "customer")
    .leftJoinAndSelect("queue.division", "division")
    .where("queue.status = :status", { status: "Waiting" })
    .andWhere("queue.created_at >= :today", { today });

  if (division_id) {
    queryBuilder.andWhere("division.division_id = :division_id", {
      division_id,
    });
  }

  const waitingQueues = await queryBuilder
    .orderBy("queue.position", "ASC")
    .addOrderBy("queue.created_at", "ASC")
    .getMany();

  const formattedQueues = await Promise.all(
    waitingQueues.map(async (queue) => ({
      queue_id: queue.queue_id,
      queue_number: queue.queue_number,
      position: queue.position,
      customer: {
        name: queue.customer.customer_name,
        account_number: queue.customer.account_number,
        priority_type: queue.customer.priority_type,
      },
      division: {
        id: queue.division.division_id,
        name: queue.division.division_name,
      },
      is_skipped: queue.is_skipped,
      created_at: queue.created_at,
      estimated_wait_time: await calculateEstimatedWaitTime(
        queue.division.division_id,
        queue.priority_level
      ),
    }))
  );

  return {
    total: formattedQueues.length,
    queues: formattedQueues,
  };
};

const MESSAGE_TYPES = {
  SUBSCRIBE_DIVISION: "SUBSCRIBE_DIVISION",
  GET_ALL_WAITING_QUEUES: "GET_ALL_WAITING_QUEUES",
} as const;

const createMessageHandler = (
  ws: WebSocketClient,
  fetchQueueData: (division_id: string) => Promise<QueueData>
) => {
  const handlers = {
    [MESSAGE_TYPES.SUBSCRIBE_DIVISION]: async (data: any) => {
      const { division_id, terminal_id, terminal_number } = data;
      ws.divisionId = division_id;
      ws.terminalId = terminal_id;
      ws.terminalNumber = terminal_number;

      const queueData = await fetchQueueData(division_id);
      if (ws.readyState === ws.OPEN) {
        ws.send(
          JSON.stringify({
            type: "QUEUE_UPDATE",
            data: {
              ...queueData,
              terminal_id,
              terminal_number,
            },
          })
        );
      }
    },

    [MESSAGE_TYPES.GET_ALL_WAITING_QUEUES]: async (data: any) => {
      const waitingQueues = await getAllWaitingQueues(data?.division_id);
      if (ws.readyState === ws.OPEN) {
        ws.send(
          JSON.stringify({
            type: "WAITING_QUEUES_UPDATE",
            data: waitingQueues,
          })
        );
      }
    },
  };

  return async (message: string) => {
    try {
      const { type, data } = JSON.parse(message);
      const handler = handlers[type];
      if (handler) await handler(data);
    } catch (error) {
      console.error("WebSocket message error:", error);
    }
  };
};

export const setupQueueWebSocket = (
  server: HTTPServer<typeof Request, typeof Response>
): WebSocketServer => {
  const queueRepo = AppDataSource.getRepository(Queue);
  const fetchQueueData = createQueueDataFetcher(queueRepo);

  const wss = new WebSocketServer({
    server,
    path: "/ws",
    verifyClient: (info, cb) => {
      const origin = info.origin || info.req.headers.origin;
      const allowedOrigins =
        process.env.CORSLINK?.split(",").map((o) => o.trim()) || [];
      cb(allowedOrigins.includes(origin));
    },
  });

  wss.on("connection", (ws: WebSocketClient) => {
    console.log("New client connected");

    ws.heartbeat = setInterval(() => {
      if (ws.readyState === ws.OPEN) ws.ping();
    }, HEARTBEAT_INTERVAL);

    ws.send(
      JSON.stringify({
        type: "CONNECTION_ACK",
        message: "Connected successfully",
      })
    );

    ws.on("message", createMessageHandler(ws, fetchQueueData));

    const updateInterval = setInterval(async () => {
      if (ws.divisionId && ws.readyState === ws.OPEN) {
        try {
          const data = await fetchQueueData(ws.divisionId);
          ws.send(JSON.stringify({ type: "QUEUE_UPDATE", data }));
        } catch (error) {
          console.error("Error fetching queue data:", error);
        }
      }
    }, UPDATE_INTERVAL);

    ws.on("close", () => {
      if (ws.heartbeat) clearInterval(ws.heartbeat);
      clearInterval(updateInterval);
      console.log("Client disconnected");
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  return wss;
};
