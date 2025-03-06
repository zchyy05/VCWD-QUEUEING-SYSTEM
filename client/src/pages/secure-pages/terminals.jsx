import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/authContext";
import { TerminalList } from "../../components/terminalList";

const Terminals = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/admin");
      return;
    }

    if (user?.terminal_id && user?.terminal_number) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  if (user?.role === "admin") {
    return null;
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-8 text-center">
        Select Your Terminal
      </h1>
      <TerminalList />
    </div>
  );
};

export default Terminals;
