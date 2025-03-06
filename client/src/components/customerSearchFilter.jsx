import React, { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import { useDivision } from "../hooks/useDivision";

const CustomerSearchFilter = ({ onSearch, onReset }) => {
  const [searchParams, setSearchParams] = useState({
    name: "",
    accountNumber: "",
    priorityType: "",
    dateFrom: "",
    dateTo: "",
    divisionId: "",
  });

  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const { divisions } = useDivision();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchParams);
  };

  const handleReset = () => {
    setSearchParams({
      name: "",
      accountNumber: "",
      priorityType: "",
      dateFrom: "",
      dateTo: "",
      divisionId: "",
    });
    onReset();
  };

  // Simple search without filters
  const handleSimpleSearch = () => {
    if (searchParams.name || searchParams.accountNumber) {
      onSearch({
        name: searchParams.name,
        accountNumber: searchParams.accountNumber,
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="flex">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={searchParams.name}
                  onChange={handleChange}
                  placeholder="Search by customer name"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
              <input
                type="text"
                name="accountNumber"
                value={searchParams.accountNumber}
                onChange={handleChange}
                placeholder="Account number"
                className="w-40 md:w-48 border-y border-r border-gray-300 px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-r-md"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSimpleSearch()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              className={`inline-flex items-center px-3 py-2 border ${
                filtersExpanded
                  ? "border-primary text-primary"
                  : "border-gray-300 text-gray-700"
              } bg-white text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
            >
              <Filter className="h-4 w-4 mr-1" />
              Filters
            </button>
          </div>
        </div>

        {filtersExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="priorityType"
                className="block text-sm font-medium text-gray-700"
              >
                Priority Type
              </label>
              <select
                id="priorityType"
                name="priorityType"
                value={searchParams.priorityType}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="">Any priority</option>
                <option value="regular">Regular</option>
                <option value="priority">Priority</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="divisionId"
                className="block text-sm font-medium text-gray-700"
              >
                Division
              </label>
              <select
                id="divisionId"
                name="divisionId"
                value={searchParams.divisionId}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="">All divisions</option>
                {divisions.map((division) => (
                  <option
                    key={division.division_id}
                    value={division.division_id}
                  >
                    {division.division_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="dateFrom"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date From
                </label>
                <input
                  type="date"
                  id="dateFrom"
                  name="dateFrom"
                  value={searchParams.dateFrom}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor="dateTo"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date To
                </label>
                <input
                  type="date"
                  id="dateTo"
                  name="dateTo"
                  value={searchParams.dateTo}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                />
              </div>
            </div>

            <div className="md:col-span-3 flex justify-end mt-2">
              <button
                type="button"
                onClick={handleReset}
                className="mr-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default CustomerSearchFilter;
