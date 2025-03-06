import React from "react";
import { Building2, Monitor, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
const DashboardHeader = ({ user, signout }) => {
  const initials = `${user?.first_name?.charAt(0)}${user?.last_name?.charAt(
    0
  )}`;
  const divisionName = user?.division?.division_name || "Loading...";
  const terminalNumber = user?.terminal_number || "-";
  const navigate = useNavigate();

  return (
    <header className="relative bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />

      <div className="relative flex items-center justify-between h-24 px-8 py-4">
        <div className="flex items-center space-x-3">
          <Building2 className="w-8 h-8 text-white/80" />
          <div>
            <p className="text-sm font-medium text-white/70">Division</p>
            <h1 className="text-2xl font-bold tracking-tight">
              {divisionName}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3 px-6 py-3 bg-white/10 rounded-lg backdrop-blur-sm">
          <Monitor className="w-6 h-6 text-white/80" />
          <div>
            <p className="text-sm font-medium text-white/70">Terminal</p>
            <p className="text-2xl font-bold">Window {terminalNumber}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xl font-medium tracking-tight">
              {user?.username}
            </p>
            <p className="text-sm text-white/70">{user?.email}</p>
          </div>

          <div className="relative">
            <button onClick={() => navigate("/profile")}>
              <div className="absolute inset-0 bg-white/20 rounded-full blur-md" />
              <div className="relative flex items-center justify-center w-14 h-14 bg-white rounded-full ring-2 ring-white/20">
                <p className="text-primary font-bold text-xl">{initials}</p>
              </div>
            </button>
          </div>

          <button
            onClick={signout}
            className="flex items-center gap-2 px-4 py-2 ml-2 transition-colors rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-white/0 via-white/20 to-white/0" />
    </header>
  );
};

export default DashboardHeader;
