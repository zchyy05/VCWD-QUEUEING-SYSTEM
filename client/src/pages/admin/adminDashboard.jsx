import React, { useMemo } from "react";
import AdminLayout from "./adminLayout";
import { BarChart, Users, Clock } from "lucide-react";
import { useAnalytics } from "../../hooks/useAnalytics";
import { useUser } from "../../hooks/useUser";

const AdminDashboard = () => {
  const {
    analyticsData,
    loading: analyticsLoading,
    error: analyticsError,
  } = useAnalytics();
  const { users, loading: usersLoading, error: usersError } = useUser();

  const activeUsers = useMemo(() => {
    if (!users) return 0;
    return users.filter((user) => user.isActive).length;
  }, [users]);

  const calculateChange = (current, previous) => {
    if (!previous) return { value: "0%", type: "neutral" };
    const change = ((current - previous) / previous) * 100;
    return {
      value: `${change > 0 ? "+" : ""}${change.toFixed(1)}%`,
      type: change >= 0 ? "increase" : "decrease",
    };
  };

  const stats = [
    {
      name: "Total Users",
      value: users?.length || 0,
      icon: Users,
      change: calculateChange(users?.length, users?.length - 2).value,
      changeType: "increase",
    },
    {
      name: "Active Queues",
      value: analyticsData?.activeQueues || 0,
      icon: Clock,
      change: calculateChange(
        analyticsData?.activeQueues,
        analyticsData?.activeQueues - 3
      ).value,
      changeType: "increase",
    },
    {
      name: "Service Rate",
      value: `${analyticsData?.serviceRate || 0}%`,
      icon: BarChart,
      change: calculateChange(
        analyticsData?.serviceRate,
        analyticsData?.serviceRate - 1
      ).value,
      changeType: "increase",
    },
  ];

  const recentlyActiveUsers = useMemo(() => {
    if (!users) return [];
    return users
      .filter((user) => user.last_activity)
      .sort((a, b) => new Date(b.last_activity) - new Date(a.last_activity))
      .slice(0, 5);
  }, [users]);

  if (analyticsLoading || usersLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (analyticsError || usersError) {
    return (
      <AdminLayout>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {analyticsError || usersError}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-white text-gray-600 rounded-lg hover:bg-gray-50">
              Export
            </button>
            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
              Generate Report
            </button>
          </div>
        </div>

        {/* Stats Grid */}
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

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentlyActiveUsers.length > 0 ? (
              recentlyActiveUsers.map((user) => (
                <div
                  key={user.user_id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{user.role}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(user.last_activity).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No recent activity to display</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
