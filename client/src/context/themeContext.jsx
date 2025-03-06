import React, { createContext, useState, useContext, useEffect } from "react";

export const themes = {
  default: {
    name: "Default",
    primary: "blue",
    secondary: "gray",
    accent: "white",
    background: "gray-100",
    banner: "bg-gradient-to-r from-blue-600 to-blue-700",
    cardBackground: "bg-white",
    textPrimary: "text-gray-800",
    waitingListBg: "bg-gradient-to-br from-blue-50 to-white",
    queueNumberBg: "bg-white border-blue-100",
    priorityColor: "text-red-600",
    priorityBg: "bg-red-100 text-red-500",
    normalColor: "text-blue-600",
    bannerBg: "bg-blue-600",
    bannerText: "text-white",
    terminalBg: "bg-blue-500",
  },
  lgbtq: {
    name: "Pride",
    primary: "purple",
    secondary: "pink",
    accent: "white",
    background: "gray-100",
    banner: "bg-gradient-to-r from-purple-600 to-pink-500",
    cardBackground: "bg-white",
    textPrimary: "text-gray-800",
    waitingListBg: "bg-gradient-to-br from-purple-50 to-pink-50",
    queueNumberBg:
      "bg-gradient-to-r from-red-100 via-yellow-100 to-blue-100 border-purple-100",
    priorityColor: "text-purple-600",
    priorityBg: "bg-purple-100 text-purple-600",
    normalColor: "text-pink-600",
    bannerBg:
      "bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500",
    bannerText: "text-white",
    terminalBg: "bg-pink-500",
  },
  christmas: {
    name: "Christmas",
    primary: "red",
    secondary: "green",
    accent: "white",
    background: "green-50",
    banner: "bg-gradient-to-r from-red-600 to-green-700",
    cardBackground: "bg-white",
    textPrimary: "text-gray-800",
    waitingListBg: "bg-gradient-to-br from-red-50 to-green-50",
    queueNumberBg: "bg-white border-red-100",
    priorityColor: "text-red-600",
    priorityBg: "bg-red-100 text-red-500",
    normalColor: "text-green-600",
    bannerBg: "bg-red-600",
    bannerText: "text-white",
    terminalBg: "bg-green-500",
  },
  halloween: {
    name: "Halloween",
    primary: "orange",
    secondary: "purple",
    accent: "black",
    background: "gray-900",
    banner: "bg-gradient-to-r from-orange-500 to-purple-700",
    cardBackground: "bg-gray-800",
    textPrimary: "text-gray-100",
    waitingListBg: "bg-gradient-to-br from-gray-800 to-gray-900",
    queueNumberBg: "bg-gray-800 border-orange-800",
    priorityColor: "text-orange-500",
    priorityBg: "bg-orange-900 text-orange-400",
    normalColor: "text-purple-400",
    bannerBg: "bg-orange-800",
    bannerText: "text-orange-100",
    terminalBg: "bg-purple-800",
  },
};

// Create the context
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Try to get the saved theme from localStorage, or use default
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem("queueTheme");
    return savedTheme && themes[savedTheme] ? savedTheme : "default";
  });

  // Update localStorage when theme changes
  useEffect(() => {
    localStorage.setItem("queueTheme", currentTheme);
  }, [currentTheme]);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: themes[currentTheme],
        changeTheme,
        themeNames: Object.keys(themes),
        currentThemeName: currentTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
