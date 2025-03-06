import { useEffect, useCallback, useRef, useState } from "react";
import { useAnnouncement } from "../context/announcementContext";

export const useQueueAnnouncement = (
  currentTransaction,
  previousTransaction,
  isDashboard = false
) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const announcementQueue = useRef([]);
  const announcedNumbers = useRef(new Set());
  const { setIsAnnouncing } = useAnnouncement();

  const formatNumberForSpeech = (number) => {
    return number.toString().split("").join(" ");
  };

  const playNextAnnouncement = useCallback(() => {
    // Don't play audio on dashboard if isDashboard is true
    if (
      announcementQueue.current.length === 0 ||
      isPlaying ||
      (isDashboard && !window.FORCE_DASHBOARD_AUDIO)
    ) {
      return;
    }

    const nextAnnouncement = announcementQueue.current[0];
    setIsPlaying(true);
    setIsAnnouncing(true);

    console.log(`Playing announcement: ${nextAnnouncement.message}`);

    if (window.responsiveVoice && window.responsiveVoice.voiceSupport()) {
      window.responsiveVoice.speak(
        nextAnnouncement.message,
        "UK English Female",
        {
          pitch: 1,
          rate: 1,
          volume: 1,
          onend: () => {
            announcedNumbers.current.add(nextAnnouncement.queueNumber);
            announcementQueue.current.shift();
            setIsPlaying(false);
            setIsAnnouncing(false);
            playNextAnnouncement();
          },
        }
      );
    } else {
      const speech = new SpeechSynthesisUtterance(nextAnnouncement.message);
      speech.rate = 0.6;
      speech.pitch = 1;
      speech.volume = 1;
      speech.onend = () => {
        announcedNumbers.current.add(nextAnnouncement.queueNumber);
        announcementQueue.current.shift();
        setIsPlaying(false);
        setIsAnnouncing(false);
        playNextAnnouncement();
      };
      window.speechSynthesis.speak(speech);
    }
  }, [isPlaying, setIsAnnouncing, isDashboard]);

  const playAnnouncement = useCallback(
    (queueNumber, terminalNumber, isPriority = false) => {
      try {
        // Skip if we're on dashboard and forcing silence
        if (isDashboard && !window.FORCE_DASHBOARD_AUDIO) {
          console.log(
            `Dashboard mode: Skipping announcement for queue ${queueNumber}`
          );
          return;
        }

        const prefix = isPriority ? "Priority queue number" : "Queue number";
        const formattedQueueNumber = formatNumberForSpeech(queueNumber);
        const formattedTerminalNumber = formatNumberForSpeech(terminalNumber);
        const message = `${prefix} ... ${formattedQueueNumber} ... please proceed to window .. ${formattedTerminalNumber}`;

        console.log(`Adding announcement to queue: ${message}`);
        announcementQueue.current.push({
          message,
          queueNumber,
        });

        if (!isPlaying) {
          playNextAnnouncement();
        }
      } catch (error) {
        console.error("Error queueing announcement:", error);
      }
    },
    [isPlaying, playNextAnnouncement, isDashboard]
  );

  // Function for re-announcing a transaction
  const reannounceTransaction = useCallback(
    (transaction) => {
      if (!transaction) {
        console.error(
          "Invalid transaction for reannouncement: transaction is null"
        );
        return;
      }

      if (!transaction.queue_number) {
        console.error(
          "Invalid transaction for reannouncement: missing queue_number",
          transaction
        );
        return;
      }

      if (!transaction.terminal_number) {
        console.error(
          "Invalid transaction for reannouncement: missing terminal_number",
          transaction
        );
        return;
      }

      console.log("Re-announcing transaction:", transaction);

      // Cancel any ongoing announcements
      if (window.responsiveVoice && window.responsiveVoice.voiceSupport()) {
        window.responsiveVoice.cancel();
      } else {
        window.speechSynthesis.cancel();
      }

      // Clear any queued announcements to prioritize this one
      if (isPlaying) {
        announcementQueue.current = [];
        setIsPlaying(false);
        setIsAnnouncing(false);
      }

      // Now play the announcement
      playAnnouncement(
        transaction.queue_number,
        transaction.terminal_number,
        transaction.priority_type === "priority"
      );
    },
    [playAnnouncement, isPlaying, setIsAnnouncing]
  );

  useEffect(() => {
    return () => {
      if (window.responsiveVoice) {
        window.responsiveVoice.cancel();
      }
      window.speechSynthesis.cancel();
      announcementQueue.current = [];
      announcedNumbers.current.clear();
      setIsPlaying(false);
      setIsAnnouncing(false);
    };
  }, [setIsAnnouncing]);

  useEffect(() => {
    // Don't monitor transactions if we're on dashboard
    if (isDashboard) {
      return;
    }

    if (
      !currentTransaction ||
      !currentTransaction.queue_number ||
      !currentTransaction.terminal_number
    ) {
      return;
    }

    const shouldAnnounce =
      !previousTransaction ||
      previousTransaction.queue_id !== currentTransaction.queue_id ||
      previousTransaction.status !== currentTransaction.status;

    if (shouldAnnounce) {
      console.log("Transaction change detected:", {
        current: currentTransaction,
        previous: previousTransaction,
        isNewQueue:
          !previousTransaction ||
          previousTransaction.queue_id !== currentTransaction.queue_id,
        isStatusChange:
          previousTransaction?.status !== currentTransaction.status,
      });

      if (currentTransaction.status === "In Progress") {
        playAnnouncement(
          currentTransaction.queue_number,
          currentTransaction.terminal_number,
          currentTransaction.priority_type === "priority"
        );
      }
    }
  }, [currentTransaction, previousTransaction, playAnnouncement, isDashboard]);

  return {
    isAnnouncing: isPlaying,
    announcedNumbers: Array.from(announcedNumbers.current),
    reannounceTransaction,
  };
};

export default useQueueAnnouncement;
