import React, { useState } from "react";
import AdminLayout from "./adminLayout";
import { Computer, GitBranch, Pencil, Trash2 } from "lucide-react";
import { useTerminal } from "../../hooks/useTerminals";
import { useDivision } from "../../hooks/useDivision";
import { TerminalModal } from "../../components/terminalModal";

const AdminTerminals = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTerminal, setEditingTerminal] = useState(null);

  const {
    terminals,
    loading,
    error,
    createTerminal,
    updateTerminal,
    deleteTerminal,
  } = useTerminal();

  const { divisions } = useDivision();

  const stats = [
    {
      name: "Total Terminals",
      value: terminals.length.toString(),
      icon: Computer,
    },
    {
      name: "Divisions",
      value: divisions.length.toString(),
      icon: GitBranch,
    },
  ];

  const handleAddEdit = async (formData) => {
    try {
      if (editingTerminal) {
        await updateTerminal(editingTerminal.terminal_id, formData);
      } else {
        await createTerminal(formData);
      }
      setIsModalOpen(false);
      setEditingTerminal(null);
    } catch (err) {
      console.error("Error saving terminal:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this terminal?")) {
      try {
        await deleteTerminal(id);
      } catch (err) {
        console.error("Error deleting terminal:", err);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Terminal Management
          </h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Add Terminal
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{stat.name}</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Terminal List
          </h2>
          {loading ? (
            <p className="text-gray-600">Loading terminals...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : terminals.length === 0 ? (
            <p className="text-gray-600">No terminals to display</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Terminal Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Division
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {terminals.map((terminal) => (
                    <tr key={terminal.terminal_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {terminal.terminalNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {terminal.division.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            terminal.isOccupied
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {terminal.isOccupied ? "Occupied" : "Available"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setEditingTerminal(terminal);
                            setIsModalOpen(true);
                          }}
                          className="text-primary hover:text-primary/80 mx-2"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(terminal.terminal_id)}
                          className="text-red-600 hover:text-red-800"
                          disabled={terminal.isOccupied}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <TerminalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTerminal(null);
        }}
        onSubmit={handleAddEdit}
        initialData={editingTerminal}
        divisions={divisions}
      />
    </AdminLayout>
  );
};

export default AdminTerminals;
