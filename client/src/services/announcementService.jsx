// src/services/announcementService.js
import { websocketService } from "./websocketService";

/**
 * Handles sending transaction announcements in a reliable way
 * across network boundaries.
 */
export const announcementService = {
  /**
   * Send an announcement for a transaction
   * @param {Object} transaction - The transaction to announce
   * @returns {boolean} - Success status
   */
  sendAnnouncement: (transaction) => {
    if (!transaction || !transaction.queue_id) {
      console.error("Invalid transaction for announcement", transaction);
      return false;
    }

    try {
      // Construct the announcement message with all required fields
      const message = {
        type: "TRANSACTION_ANNOUNCED",
        data: {
          queue_id: transaction.queue_id,
          transaction: {
            queue_id: transaction.queue_id,
            queue_number: transaction.queue_number,
            terminal_number: transaction.terminal_number,
            priority_type: transaction.priority_type || "regular",
            status: transaction.status || "In Progress",
          },
          announced_at: new Date().toISOString(),
          // Add a unique ID to prevent duplicate processing
          announcement_id: `announce_${transaction.queue_id}_${Date.now()}`,
        },
      };

      console.log("Sending announcement via service:", message);

      // Use the websocketService.send method
      if (typeof websocketService.send === "function") {
        const sent = websocketService.send(message);
        return sent;
      }

      console.error(
        "Failed to send announcement - websocketService.send not available"
      );
      return false;
    } catch (error) {
      console.error("Error sending announcement:", error);
      return false;
    }
  },

  /**
   * Process a received announcement
   * @param {Object} data - The announcement data received
   * @param {Function} announceFunction - The function to call to announce it locally
   * @param {Array} transactions - Current transactions for lookup if needed
   */
  processReceivedAnnouncement: (data, announceFunction, transactions = []) => {
    try {
      // Set of already processed announcement IDs to prevent duplicates
      if (!window._processedAnnouncements) {
        window._processedAnnouncements = new Set();
      }

      // Check for duplicates
      const announcementId = data.data?.announcement_id;
      if (
        announcementId &&
        window._processedAnnouncements.has(announcementId)
      ) {
        console.log("Ignoring duplicate announcement:", announcementId);
        return;
      }

      // Add to processed set
      if (announcementId) {
        window._processedAnnouncements.add(announcementId);

        // Cleanup old announcements (keep last 50)
        if (window._processedAnnouncements.size > 50) {
          const toRemove = Array.from(window._processedAnnouncements)[0];
          window._processedAnnouncements.delete(toRemove);
        }
      }

      // Find the transaction to announce
      let transactionToAnnounce = null;

      // First try from the message
      if (data.data && data.data.transaction) {
        transactionToAnnounce = data.data.transaction;
      }
      // Then try to find in provided transactions
      else if (data.data && data.data.queue_id && transactions.length > 0) {
        transactionToAnnounce = transactions.find(
          (t) => t.queue_id === data.data.queue_id
        );
      }

      if (transactionToAnnounce) {
        // Use timeout to ensure audio context has time to initialize
        setTimeout(() => {
          announceFunction(transactionToAnnounce);
        }, 100);
        return true;
      } else {
        console.warn("Could not find transaction to announce");
        return false;
      }
    } catch (error) {
      console.error("Error processing announcement:", error);
      return false;
    }
  },
};

export default announcementService;
