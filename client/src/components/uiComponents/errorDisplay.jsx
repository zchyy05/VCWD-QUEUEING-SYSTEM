const ErrorDisplay = ({ error }) => (
  <div className="min-h-screen bg-gray-100 p-6">
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      <p>Error: {error}</p>
    </div>
  </div>
);
export default ErrorDisplay;
