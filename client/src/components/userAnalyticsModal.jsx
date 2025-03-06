import React, { useState, useEffect } from "react";
import {
  Clock,
  Timer,
  BarChart,
  TrendingUp,
  Users,
  CheckCircle,
} from "lucide-react";
import { useAnalytics } from "../hooks/useAnalytics";

const UserAnalyticsModal = ({ isOpen, onClose, user }) => {
  const { fetchUserAverageTime, fetchUserPerformance, loading } =
    useAnalytics();
  const [analytics, setAnalytics] = useState(null);
  const [performance, setPerformance] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      Promise.all([
        fetchUserAverageTime(user.user_id),
        fetchUserPerformance(user.user_id),
      ])
        .then(([avgTime, perf]) => {
          setAnalytics(avgTime);
          setPerformance(perf);
        })
        .catch((err) => console.error("Error fetching user data:", err));
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Analytics for {user.first_name} {user.last_name}
              </h2>
              <p className="text-sm text-gray-500">
                Division: {user.division?.division_name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : analytics && performance ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Today's Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded">
                        <Timer className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Average Handle Time
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          {performance.averageHandleTime} seconds
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Customers Served
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          {performance.totalTransactions}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded">
                        <CheckCircle className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Completion Rate</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {performance.completionRate}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Overall Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded">
                        <BarChart className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Total Transactions
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          {analytics.totalTransactions}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Total Active Time
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          {Math.round(
                            (analytics.averageHandleTime *
                              analytics.totalTransactions) /
                              60
                          )}{" "}
                          minutes
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded">
                        <TrendingUp className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Average Wait Time
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          {performance.averageWaitTime} seconds
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Service Efficiency
                </h3>
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Handle Time Efficiency
                    </span>
                    <div className="w-2/3 bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-primary h-2.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            (performance.averageHandleTime /
                              (performance.averageWaitTime || 1)) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Completion Rate
                    </span>
                    <div className="w-2/3 bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-primary h-2.5 rounded-full"
                        style={{ width: `${performance.completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No analytics data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAnalyticsModal;
