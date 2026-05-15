import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
      <h1 className="text-5xl font-bold text-gray-900">404</h1>
      <p className="text-lg text-gray-700">Page not found.</p>
      <Link
        to="/"
        className="px-5 py-2.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default NotFound;
