import React, { useState } from "react";
import AdminLayout from "./adminLayout";
import { Users, Building, FileText, Pencil, Trash2 } from "lucide-react";
import { useDepartment } from "../../hooks/useDepartment";
import { DepartmentModal } from "../../components/departmentModal";

const AdminDepartment = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const {
    departments,
    departmentStats,
    loading,
    error,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  } = useDepartment();

  const stats = [
    {
      name: "Total Departments",
      value: departmentStats.departmentCount.toString(),
      icon: Building,
    },
    {
      name: "Total Staff",
      value: departmentStats.totalStaff.toString(),
      icon: Users,
    },
  ];

  const handleAddEdit = async (departmentName) => {
    try {
      if (editingDepartment) {
        await updateDepartment(editingDepartment.department_id, departmentName);
      } else {
        await createDepartment(departmentName);
      }
      setIsModalOpen(false);
      setEditingDepartment(null);
    } catch (err) {
      console.error("Error saving department:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        await deleteDepartment(id);
      } catch (err) {
        console.error("Error deleting department:", err);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Department Management
          </h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Add Department
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
                  <div
                    className={`text-sm ${
                      stat.changeType === "increase"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stat.change}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Department List
          </h2>
          {loading ? (
            <p className="text-gray-600">Loading departments...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : departments.length === 0 ? (
            <p className="text-gray-600">No departments to display</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department Name
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {departments.map((department) => (
                    <tr key={department.department_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {department.department_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setEditingDepartment(department);
                            setIsModalOpen(true);
                          }}
                          className="text-primary hover:text-primary/80 mx-2"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(department.department_id)}
                          className="text-red-600 hover:text-red-800"
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

      <DepartmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDepartment(null);
        }}
        onSubmit={handleAddEdit}
        initialData={editingDepartment}
      />
    </AdminLayout>
  );
};

export default AdminDepartment;
