// src/utils/printerUtils.ts
import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

interface QueueTicketData {
  queue_number: string;
  customer_name?: string;
  division_name: string;
  created_at: Date;
  priority_type: string;
}
const centerText = (text: string, width: number = 37): string => {
  const padding = Math.max(0, width - text.length);
  const leftPad = Math.floor(padding / 2);
  return " ".repeat(leftPad) + text;
};

const formatDateTime = (date: Date): { dateStr: string; timeStr: string } => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };

  return {
    dateStr: date.toLocaleDateString("en-US", options),
    timeStr: date.toLocaleTimeString("en-US", timeOptions),
  };
};

const formatLargeNumber = (number: string): string[] => {
  return [
    "**********************",
    "*                    *",
    `*      ${number}      *`,
    "*                    *",
    "**********************",
  ];
};
// Printer name constant
const PRINTER_NAME = "EPSON L360 Series (Copy 1)";

// Format the ticket content
const formatTicketContent = (data: QueueTicketData): string => {
  const { dateStr, timeStr } = formatDateTime(new Date(data.created_at));
  const largeNumber = formatLargeNumber(data.queue_number);

  const lines = [
    "=======================================",
    centerText("VALENCIA CITY WATER DISTRICT"),
    centerText("Queue Management System"),
    "=======================================",
    "",
    ...largeNumber,
    "",
    centerText(data.division_name),
    "",
    data.priority_type === "priority"
      ? ["****************", "*   PRIORITY   *", "****************"].map(
          (line) => centerText(line)
        )
      : "",
    "",
    data.customer_name ? `Customer: ${data.customer_name}` : "",
    "",
    `Date: ${dateStr}`,
    `Time: ${timeStr}`,
    "",
    "=======================================",
    centerText("Please wait for your number"),
    centerText("to be called. Thank you!"),
    "=======================================",
    "\x0C",
  ]
    .flat()
    .filter(Boolean);

  return lines.join("\n");
};

const printWithNotepad = async (content: string): Promise<boolean> => {
  const tempFile = path.join(os.tmpdir(), `queue-ticket-${Date.now()}.txt`);

  try {
    await fs.promises.writeFile(tempFile, content, "utf8");

    const printCommand = `notepad /p "${tempFile}"`;

    return new Promise((resolve, reject) => {
      exec(printCommand, (error) => {
        fs.unlink(tempFile, (unlinkError) => {
          if (unlinkError) {
            console.error("Failed to delete temp file:", unlinkError);
          }
        });

        if (error) {
          reject(new Error(`Printing failed: ${error.message}`));
        } else {
          resolve(true);
        }
      });
    });
  } catch (error) {
    throw new Error(`Failed to print: ${error.message}`);
  }
};

const printWithPrintCommand = async (content: string): Promise<boolean> => {
  const tempFile = path.join(os.tmpdir(), `queue-ticket-${Date.now()}.txt`);

  try {
    await fs.promises.writeFile(tempFile, content, "utf8");

    return new Promise((resolve, reject) => {
      exec(`print /d:"${PRINTER_NAME}" "${tempFile}"`, (error) => {
        fs.unlink(tempFile, () => {}); // Clean up

        if (error) {
          reject(new Error(`Direct printing failed: ${error.message}`));
        } else {
          resolve(true);
        }
      });
    });
  } catch (error) {
    throw new Error(`Failed to print: ${error.message}`);
  }
};

export const printQueueTicket = async (
  ticketData: QueueTicketData
): Promise<boolean> => {
  const content = formatTicketContent(ticketData);

  try {
    await printWithNotepad(content);
    return true;
  } catch (notepadError) {
    console.warn(
      "Notepad printing failed, trying direct print command...",
      notepadError
    );

    try {
      await printWithPrintCommand(content);
      return true;
    } catch (printError) {
      console.error("All printing methods failed:", printError);
      throw new Error(
        "Failed to print ticket. Please check printer connection and status."
      );
    }
  }
};

// Check printer status
export const checkPrinterStatus = async (): Promise<{
  isConnected: boolean;
  status?: string;
  error?: string;
}> => {
  return new Promise((resolve) => {
    exec("wmic printer get name, status", (error, stdout) => {
      if (error) {
        resolve({
          isConnected: false,
          status: "error",
          error: error.message,
        });
        return;
      }

      const printerFound = stdout.includes(PRINTER_NAME);

      resolve({
        isConnected: printerFound,
        status: printerFound ? "ready" : "printer not found",
        error: printerFound ? undefined : "Printer not installed",
      });
    });
  });
};

export default {
  printQueueTicket,
  checkPrinterStatus,
};
