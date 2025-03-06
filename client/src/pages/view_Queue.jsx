import React, { useMemo, useRef, useEffect, useState } from "react";
import { usePublicTransaction } from "../hooks/usePublicTransaction";
import { useQueueAnnouncement } from "../hooks/useQueueAnnouncement";
import { websocketService } from "../services/websocketService";
import { announcementService } from "../services/announcementService";
import { useTheme } from "../context/themeContext";
import CustomLoading from "../components/uiComponents/customLoading";
import ErrorDisplay from "../components/uiComponents/errorDisplay";
import CurrentQueueBanner from "../components/currentQueueBanner";
import WaitingList from "../components/waitingList";
import EntertainmentSection from "../components/entertainmentSection";
import LastCalledSection from "../components/lastCalledSection";
import CurrentlyServingSection from "../components/currentlyServingSection";
import ReconnectingIndicator from "../components/uiComponents/reconnectingIndicator";
import ThemeSwitcher from "../components/themeSwitchComponent";

const ViewQueue = () => {
  const { theme } = useTheme();
  const { allTransactions, waitingQueues, isConnected, isInitialLoad, error } =
    usePublicTransaction();

  // For debugging
  const [lastAnnouncement, setLastAnnouncement] = useState(null);
  const previousTransactionRef = useRef(null);

  const mostRecentTransaction = useMemo(() => {
    if (!Array.isArray(allTransactions) || allTransactions.length === 0) {
      return null;
    }

    return allTransactions.reduce((latest, current) => {
      const currentDate = new Date(current.completed_at || current.started_at);
      const latestDate = new Date(latest.completed_at || latest.started_at);
      return currentDate > latestDate ? current : latest;
    });
  }, [allTransactions]);

  const { reannounceTransaction } = useQueueAnnouncement(
    mostRecentTransaction,
    previousTransactionRef.current
  );

  useEffect(() => {
    previousTransactionRef.current = mostRecentTransaction;
  }, [mostRecentTransaction]);

  useEffect(() => {
    const handleAnnouncementEvent = (data) => {
      console.log("⭐ Received announcement event:", data);
      setLastAnnouncement({
        time: new Date().toLocaleTimeString(),
        data: data,
      });

      // Use the service for announcements
      announcementService.processReceivedAnnouncement(
        data,
        reannounceTransaction,
        allTransactions
      );
    };

    // Subscribe to WebSocket events
    const subscriptionId = websocketService.subscribe((data) => {
      if (data && data.type === "TRANSACTION_ANNOUNCED") {
        handleAnnouncementEvent(data);
      }
    });

    // Cleanup
    return () => {
      if (subscriptionId) {
        websocketService.unsubscribe(subscriptionId);
      }
    };
  }, [allTransactions, reannounceTransaction]);

  const memoizedWaitingQueues = useMemo(() => waitingQueues, [waitingQueues]);

  const formatTime = (date) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      return "N/A";
    }
  };

  if (isInitialLoad) {
    return <CustomLoading />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  // Filter active transactions (not completed)
  const activeTransactions = allTransactions.filter((t) => !t.completed_at);

  return (
    <div className={`min-h-screen bg-${theme.background} flex flex-col`}>
      {/* Current Queue Banner at the top */}
      {mostRecentTransaction && (
        <CurrentQueueBanner
          transaction={mostRecentTransaction}
          formatTime={formatTime}
          theme={theme}
        />
      )}

      <div className="container mx-auto p-2 flex-grow flex flex-col">
        {/* Waiting List below the banner */}
        <div className="w-full p-1 mb-2">
          <WaitingList waitingQueues={memoizedWaitingQueues} theme={theme} />
        </div>

        {/* Currently Serving Section below Waiting List */}
        <div className="w-full p-1 mb-2">
          <CurrentlyServingSection
            transactions={allTransactions}
            formatTime={formatTime}
            theme={theme}
          />
        </div>

        {/* Entertainment and Most Recent in a flex layout */}
        <div className="flex flex-wrap">
          <div className="w-full md:w-1/2 p-1">
            <EntertainmentSection theme={theme} compact={true} />
          </div>

          <div className="w-full md:w-1/2 p-1">
            <LastCalledSection
              transaction={mostRecentTransaction}
              formatTime={formatTime}
              theme={theme}
            />
          </div>
        </div>
      </div>

      {!isConnected && <ReconnectingIndicator />}

      {lastAnnouncement && (
        <div
          className={`fixed bottom-4 right-4 ${theme.cardBackground} p-2 rounded-lg shadow-lg text-xs opacity-70 w-48`}
        >
          <div>Last: {lastAnnouncement.time}</div>
          <div>
            Queue: {lastAnnouncement.data?.data?.transaction?.queue_number}
          </div>
        </div>
      )}

      <ThemeSwitcher />
    </div>
  );
};

export default ViewQueue;
