export const playNotificationSound = () => {
  const audio = new Audio();

  // Use a short "ding" sound
  audio.src =
    "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YWoGAACBhYqFbF1FOTgzLisoIyAcGBQQDAkGBAI";

  // Optional: Preload the sound
  audio.load();

  // Configure sound
  audio.volume = 0.5; // 50% volume

  // Play the sound
  audio.play().catch((error) => {
    console.warn("Error playing notification sound:", error);
  });
};
