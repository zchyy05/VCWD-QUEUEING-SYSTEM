import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col justify-center items-center px-4">
      <div className="text-center max-w-xl mx-auto">
        <svg
          className="w-32 h-32 mx-auto mb-8 text-blue-500"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 5 C50 5 20 45 20 70 C20 85 35 95 50 95 C65 95 80 85 80 70 C80 45 50 5 50 5Z"
            fill="currentColor"
            opacity="0.2"
          />
          <path
            d="M50 15 C50 15 25 50 25 70 C25 82.5 37.5 90 50 90 C62.5 90 75 82.5 75 70 C75 50 50 15 50 15Z"
            fill="currentColor"
          />
        </svg>

        <h1 className="font-rubik font-bold text-6xl mb-4 text-gray-900">
          404
        </h1>
        <h2 className="font-rubik font-semibold text-2xl mb-4 text-gray-800">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          Oops! The page you're looking for seems to have evaporated. Let's get
          you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Home className="w-5 h-5" />
            <span>Go Home</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go Back</span>
          </button>
        </div>
      </div>

      <div className="fixed top-1/4 left-1/4 w-4 h-4 bg-blue-200 rounded-full opacity-50" />
      <div className="fixed top-1/3 right-1/4 w-6 h-6 bg-blue-300 rounded-full opacity-50" />
      <div className="fixed bottom-1/4 left-1/3 w-8 h-8 bg-blue-100 rounded-full opacity-50" />
    </div>
  );
};

export default NotFound;
