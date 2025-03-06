import React, { memo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDivisions } from "../context/divisionsContext";
import Loading from "../components/uiComponents/loading";
import CustomerModal from "../components/customerModal";
import { Building2, ChevronRight, QrCode } from "lucide-react";
import images from "../constants/images";
const DivisionButton = memo(({ division, onClick }) => (
  <button
    onClick={() => onClick(division)}
    className="w-full group bg-white border border-gray-200 rounded-lg p-4 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 flex items-center justify-between"
  >
    <span className="text-lg font-rubik text-gray-800 group-hover:text-blue-700">
      {division.division_name}
    </span>
    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
  </button>
));

const ErrorDisplay = ({ message }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="bg-red-50 p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-red-700 mb-2">Error</h2>
      <p className="text-red-600">{message}</p>
    </div>
  </div>
);

// QR Code component
const QrCodeDisplay = ({ url }) => {
  const [qrCodeSvg, setQrCodeSvg] = useState("");

  useEffect(() => {
    // Generate QR code using an async function
    const generateQRCode = async () => {
      try {
        // Import QRCode.js dynamically
        const QRCode = await import("qrcode");

        // Generate QR code as SVG
        QRCode.toString(
          url,
          {
            type: "svg",
            margin: 1,
            width: 200,
            color: {
              dark: "#3B82F6", // Blue color for the QR code
              light: "#ffffff", // White background
            },
          },
          (err, svg) => {
            if (err) throw err;
            setQrCodeSvg(svg);
          }
        );
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    };

    if (url) {
      generateQRCode();
    }
  }, [url]);

  if (!url)
    return <span className="text-gray-500">QR Code URL not provided</span>;

  return (
    <div className="flex flex-col items-center">
      {qrCodeSvg ? (
        <>
          <div
            dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
            className="p-4 bg-white rounded-lg"
          />
          <p className="mt-3 text-sm text-gray-600 text-center">
            Scan to access the quick service
          </p>
          <p className="mt-1 text-xs text-gray-500 break-all text-center">
            {url}
          </p>
        </>
      ) : (
        <div className="flex items-center justify-center h-64 w-64">
          <span className="text-gray-500">Loading QR code...</span>
        </div>
      )}
    </div>
  );
};

const Landing = () => {
  const { divisions, loading, error } = useDivisions();
  const [modalState, setModalState] = useState({
    isOpen: false,
    selectedDivision: null,
  });

  // Get the CORS link from environment variable
  const qrCodeUrl = import.meta.env.VITE_CORSLINK || "http://10.10.1.178:5173";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center w-full">
        <Loading />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  const handleDivisionClick = (division) => {
    setModalState({
      isOpen: true,
      selectedDivision: division,
    });
  };

  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      selectedDivision: null,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-end py-4">
            <Link
              to="/auth/signin"
              className="text-blue-100 hover:text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <span>Sign In </span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="container mx-auto px-4 pb-16 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-4">
            <img
              src={images.logo}
              alt="Valencia City Water District Logo"
              className="h-40 md:h-44 w-auto object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMzQjgyRjYiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSI+VkNXRDwvdGV4dD48L3N2Zz4=";
                console.warn("Logo image failed to load, using fallback");
              }}
            />

            <h1 className="text-4xl md:text-5xl font-bold text-white text-center font-rubik">
              Welcome to Valencia City Water District
            </h1>
          </div>
          <p className="text-blue-100 text-lg text-center mt-4 max-w-2xl mx-auto">
            "Providing Clean and Sustainable Water Services to our Community"
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-rubik font-semibold">
                  Our Services
                </h2>
              </div>

              {divisions?.length > 0 ? (
                <div className="grid gap-3">
                  {[...divisions]
                    .sort((a, b) =>
                      a.division_name.localeCompare(b.division_name)
                    )
                    .map((division) => (
                      <DivisionButton
                        key={division.division_id}
                        division={division}
                        onClick={handleDivisionClick}
                      />
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
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <QrCodeDisplay url={qrCodeUrl} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <CustomerModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        selectedDivision={modalState.selectedDivision}
      />
    </div>
  );
};

export default Landing;
