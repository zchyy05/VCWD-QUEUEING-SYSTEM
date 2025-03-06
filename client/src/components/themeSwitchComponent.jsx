import React, { useState } from "react";
import { Palette } from "lucide-react";
import { useTheme, themes } from "../context/themeContext";

const ThemeSwitcher = () => {
  const { changeTheme, currentThemeName } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  const handleThemeChange = (themeName) => {
    changeTheme(themeName);
    closeDropdown();
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2">
        <button
          onClick={toggleDropdown}
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
          title="Theme Options"
        >
          <Palette className="h-5 w-5 text-gray-700" />
        </button>

        {isOpen && (
          <>
            {/* Overlay to capture clicks outside the dropdown */}
            <div className="fixed inset-0 z-40" onClick={closeDropdown} />

            <div className="absolute bottom-14 left-0 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 z-50">
              <div className="flex flex-col space-y-1 min-w-40">
                {Object.keys(themes).map((themeName) => (
                  <button
                    key={themeName}
                    onClick={() => handleThemeChange(themeName)}
                    className={`px-3 py-2 text-sm rounded-md transition-colors text-left ${
                      currentThemeName === themeName
                        ? "bg-blue-100 text-blue-700"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {themes[themeName].name}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ThemeSwitcher;
