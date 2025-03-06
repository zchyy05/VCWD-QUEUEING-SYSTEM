import { useCallback } from "react";
import QRCode from "qrcode";
import images from "../constants/images";
export const useQueuePrinting = () => {
  const printQueue = useCallback(async (queue) => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    console.log("QUEUE", queue);
    const now = new Date(queue.created_at);
    const dateString = now.toLocaleDateString();
    const timeString = now.toLocaleTimeString();

    let qrCodeDataUrl = "";
    if (
      queue.account_number &&
      queue.account_number.trim() !== "" &&
      queue.account_number !== "N/A"
    ) {
      try {
        qrCodeDataUrl = await QRCode.toDataURL(queue.account_number, {
          width: 100,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        });
      } catch (err) {
        console.error("QR Code generation failed:", err);
      }
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Queue Ticket</title>
          <style>
            @page {
              margin: 0;
              size: 58mm 102mm; /* Approximately 2x4 inches */
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 8px;
              width: 58mm;
              box-sizing: border-box;
            }
            .container {
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .header {
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: center;
              width: 100%;
              margin-bottom: 5px;
            }
            .logo {
              width: 20mm;
              height: auto;
            }
            .header-text {
              margin-left: 5px;
              text-align: left;
            }
            .title {
              font-size: 12px;
              font-weight: bold;
            }
            .division {
              font-size: 14px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .queue-number {
              font-size: 30px;
              font-weight: bold;
              margin: 8px 0;
            }
            .info {
              font-size: 10px;
              margin: 3px 0;
              text-align: center;
              width: 100%;
            }
            .footer {
              margin-top: 8px;
              font-size: 10px;
              text-align: center;
              width: 100%;
            }
            .priority-label {
              font-size: 12px;
              font-weight: bold;
              color: #dc2626;
              margin: 3px 0;
            }
            .wait-time {
              font-size: 11px;
              margin: 6px 0;
              font-style: italic;
            }
            .qr-code {
              width: 80px;
              height: 80px;
              margin: 5px auto;
            }
            .qr-label {
              font-size: 9px;
              color: #666;
              margin-top: 3px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${images.logo}" alt="Company Logo" class="logo" />
              <div class="header-text">
                <div class="title">Queue Ticket</div>
                <div class="queue-number">${queue.queue_number}</div>
                ${
                  queue.priority_type === "priority"
                    ? '<div class="priority-label">PRIORITY</div>'
                    : ""
                }
              </div>
            </div>
            
            <div class="info">Date: ${dateString}</div>
            <div class="info">Time: ${timeString}</div>
            <div class="info">Name: ${queue.customer_name || ""}</div>
            ${
              queue.account_number &&
              queue.account_number.trim() !== "" &&
              qrCodeDataUrl
                ? `
                  <div class="qr-code">
                    <img src="${qrCodeDataUrl}" alt="Account QR Code" />
                  </div>
                  <div class="qr-label">Account: ${queue.account_number}</div>
                `
                : ""
            }
            ${
              queue.estimated_wait_time
                ? `<div class="wait-time">Estimated wait time: ${queue.estimated_wait_time} minutes</div>`
                : ""
            }
         
          </div>
          <script>
            document.body.onload = () => {
              window.focus();
              window.print();
              setTimeout(() => {
                window.parent.postMessage('printed', '*');
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(printContent);
    iframe.contentWindow.document.close();

    window.addEventListener("message", function handler(event) {
      if (event.data === "printed") {
        document.body.removeChild(iframe);
        window.removeEventListener("message", handler);
      }
    });
  }, []);

  return { printQueue };
};

export default useQueuePrinting;
