import { useEffect, useCallback } from "react";

export const usePublicAnnouncement = (wsConnection) => {
  const playAnnouncement = useCallback((message) => {
    console.log("Attempting to play announcement:", message);

    try {
      if (window.responsiveVoice && window.responsiveVoice.voiceSupport()) {
        console.log("Using ResponsiveVoice");
        window.responsiveVoice.cancel();
        window.responsiveVoice.speak(message, "UK English Female", {
          pitch: 1,
          rate: 0.9,
          volume: 1,
          onstart: () => console.log("Started playing announcement"),
          onend: () => console.log("Finished playing announcement"),
          onerror: (error) => console.error("ResponsiveVoice error:", error),
        });
      } else {
        console.log("Falling back to Web Speech API");
        window.speechSynthesis.cancel();
        const speech = new SpeechSynthesisUtterance(message);
        speech.rate = 0.9;
        speech.pitch = 1;
        speech.volume = 1;

        speech.onstart = () => console.log("Started playing announcement");
        speech.onend = () => console.log("Finished playing announcement");
        speech.onerror = (error) =>
          console.error("Speech synthesis error:", error);

        window.speechSynthesis.speak(speech);
      }
    } catch (error) {
      console.error("Error playing announcement:", error);
    }
  }, []);

  useEffect(() => {
    console.log("Setting up WebSocket announcement listener", {
      wsExists: !!wsConnection,
      readyState: wsConnection?.readyState,
    });

    if (!wsConnection) return;

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received WebSocket message:", data);

        if (data.type === "QUEUE_ANNOUNCEMENT") {
          const { queueNumber, terminalNumber, prefix } = data.payload;
          const message = `${prefix} ${queueNumber}, please proceed to counter ${terminalNumber}`;
          console.log("Processing announcement:", message);
          playAnnouncement(message);
        }
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
      }
    };

    wsConnection.onmessage = handleMessage;
    console.log("WebSocket message handler set up");

    return () => {
      console.log("Cleaning up announcement listener");
      if (wsConnection) {
        wsConnection.onmessage = null;
      }
      if (window.responsiveVoice) {
        window.responsiveVoice.cancel();
      } else {
        window.speechSynthesis.cancel();
      }
    };
  }, [wsConnection, playAnnouncement]);
};
