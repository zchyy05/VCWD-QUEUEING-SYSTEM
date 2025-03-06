import React, { useState, useEffect } from "react";
import AdminLayout from "./adminLayout";
import {
  GitBranch,
  Building,
  Pencil,
  Trash2,
  Users,
  Clock,
} from "lucide-react";
import { useDivision } from "../../hooks/useDivision";
import { useDepartment } from "../../hooks/useDepartment";
import { useAnalytics } from "../../hooks/useAnalytics";
import { DivisionModal } from "../../components/divisionModal";

const AdminDivision = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDivision, setEditingDivision] = useState(null);
  const [queueStats, setQueueStats] = useState([]);

  const {
    divisions,
    loading,
    error,
    createDivision,
    updateDivision,
    deleteDivision,
  } = useDivision();

  const { departments } = useDepartment();
  const { fetchDivisionQueueStats } = useAnalytics();

  useEffect(() => {
    const getQueueStats = async () => {
      try {
        const stats = await fetchDivisionQueueStats();
        setQueueStats(stats);
      } catch (err) {
        console.error("Error fetching queue stats:", err);
      }
    };

    getQueueStats();
    const interval = setInterval(getQueueStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchDivisionQueueStats]);

  const stats = [
    {
      name: "Total Divisions",
      value: divisions.length.toString(),
      icon: GitBranch,
    },
    {
      name: "Departments",
      value: departments.length.toString(),
      icon: Building,
    },
    {
      name: "Active Queues",
      value: queueStats
        .reduce((acc, stat) => acc + stat.waitingQueues, 0)
        .toString(),
      icon: Clock,
    },
  ];

  const handleAddEdit = async (formData) => {
    try {
      if (editingDivision) {
        await updateDivision(editingDivision.division_id, formData);
      } else {
        await createDivision(formData);
      }
      setIsModalOpen(false);
      setEditingDivision(null);
    } catch (err) {
      console.error("Error saving division:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this division?")) {
      try {
        await deleteDivision(id);
      } catch (err) {
        console.error("Error deleting division:", err);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Division Management
          </h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Add Division
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
            Division List
          </h2>
          {loading ? (
            <p className="text-gray-600">Loading divisions...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : divisions.length === 0 ? (
            <p className="text-gray-600">No divisions to display</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Division Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Waiting Queues
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Queues Today
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {divisions.map((division) => {
                    const divisionStats = queueStats.find(
                      (stat) => stat.divisionName === division.division_name
                    ) || { waitingQueues: 0, totalQueues: 0 };

                    return (
                      <tr key={division.division_id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {division.division_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {division.department.department_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-primary">
                            {divisionStats.waitingQueues}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {divisionStats.totalQueues}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              setEditingDivision(division);
                              setIsModalOpen(true);
                            }}
                            className="text-primary hover:text-primary/80 mx-2"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(division.division_id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <DivisionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDivision(null);
        }}
        onSubmit={handleAddEdit}
        initialData={editingDivision}
        departments={departments}
      />
    </AdminLayout>
  );
};

export default AdminDivision;
