import { getTerminals, occupyTerminal } from "../services/termimalService";
import { useEffect, useState } from "react";
import { useAuthContext } from "../context/authContext";
import { useNavigate } from "react-router-dom";

export const TerminalList = () => {
  const { user, updateUser } = useAuthContext();
  const [terminals, setTerminals] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTerminals = async () => {
      try {
        const response = await getTerminals();
        setTerminals(response.terminals);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTerminals();
  }, []);

  const handleTerminalSelect = async (terminalId, terminalNumber) => {
    try {
      console.log("Starting terminal occupation...");
      const response = await occupyTerminal(terminalNumber, user.user_id);
      console.log("Occupation result:", response);

      if (response?.message === "Terminal occupied successfully") {
        // Update user context with new terminal information
        const updatedUser = {
          ...user,
          terminal_id: response.terminal.terminal_id,
          terminal_number: response.terminal.terminalNumber,
          terminal: response.terminal,
        };
        updateUser(updatedUser);

        console.log("Navigating to dashboard...");
        navigate("/dashboard", { replace: true });
      } else {
        setError("Unexpected response from server");
      }
    } catch (err) {
      console.error("Terminal occupation error:", err);
      setError("Failed to occupy terminal. Please try again.");
    }
  };

  if (loading)
    return (
      <div className="text-center text-[#3572ef]">Loading terminals...</div>
    );
  if (error)
    return <div className="text-center text-red-600">Error: {error}</div>;

  return (
    <div className="terminal-list font-[Rubik]">
      <h2 className="text-2xl font-bold mb-6 text-[#050c9c]">
        Terminals Available at{" "}
        {user?.division?.division_name.charAt(0).toUpperCase() +
          user?.division?.division_name.slice(1)}{" "}
        Division
      </h2>
      {terminals.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-[#3572ef]">No terminals available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...terminals]
            .sort((a, b) => a.terminalNumber - b.terminalNumber)
            .map((terminal) => (
              <div
                key={terminal.terminal_id}
                onClick={() =>
                  !terminal.isOccupied &&
                  handleTerminalSelect(
                    terminal.terminal_id,
                    terminal.terminalNumber
                  )
                }
                className={`bg-white rounded-lg shadow-md p-6 
                  ${
                    terminal.isOccupied
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  } border border-[#3abef9]/20`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-[Rubik] font-semibold text-[#050c9c]">
                    Terminal {terminal.terminalNumber}
                  </h3>
                  <span
                    className={`inline-block px-3 py-1 text-sm rounded-full
                    ${
                      terminal.isOccupied
                        ? "bg-red-100 text-red-800"
                        : "bg-[#3abef9]/10 text-[#3572ef]"
                    }`}
                  >
                    {terminal.isOccupied ? "Occupied" : "Available"}
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
