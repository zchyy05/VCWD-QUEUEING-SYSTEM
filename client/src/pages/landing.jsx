import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllDivisions } from "../services/divisionsApi";
import Loading from "../components/uiComponents/loading";
import CustomerModal from "../components/customerModal";
import { Building2, ChevronRight, QrCode } from "lucide-react";

const Landing = () => {
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState(null);

  useEffect(() => {
    fetchDivision();
  }, []);

  const fetchDivision = async () => {
    try {
      setLoading(true);
      const data = await getAllDivisions();
      setDivisions(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDivisionClick = (division) => {
    setSelectedDivision(division);
    setIsModalOpen(true);
  };

  const handleCustomerSubmit = (customerData) => {
    console.log("Customer data:", customerData);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center w-full">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-700 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-end py-4">
            <Link
              to="/auth/signin"
              className="text-blue-100 hover:text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <span>Sign In</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="container mx-auto px-4 pb-16 pt-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center font-rubik">
            Welcome to Valencia City Water District
          </h1>
          <p className="text-blue-100 text-center mt-4 max-w-2xl mx-auto">
            Providing clean and sustainable water services to our community
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-rubik font-semibold">
                  Our Services
                </h2>
              </div>

              {divisions && divisions.length > 0 ? (
                <div className="grid gap-3">
                  {divisions.map((division) => (
                    <button
                      key={division.division_id}
                      onClick={() => handleDivisionClick(division)}
                      className="w-full group bg-white border border-gray-200 rounded-lg p-4 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 flex items-center justify-between"
                    >
                      <span className="text-lg font-rubik text-gray-800 group-hover:text-blue-700">
                        {division.division_name}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-lg text-gray-500">No services available</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <QrCode className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-rubik font-semibold">
                  Quick Access
                </h2>
              </div>
              <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <span className="text-gray-500">QR Code coming soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDivision={selectedDivision}
        onSubmit={handleCustomerSubmit}
      />
    </div>
  );
};

export default Landing;
