import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, BarChart3, Calendar } from "lucide-react";
import AuthModal from "../components/AuthModal";
import Layout from "../components/Layout";
import { useAuth } from "../hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login: loginUser } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (user && isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate, user]);

  return (
    <Layout onLoginClick={() => setShowAuthModal(true)}>
      <div className="space-y-12">
        <div className="sm:pt-12 pt-24 animate-in space-y-4 text-center duration-500 fade-in">
          <h1 className="text-7xl font-bold text-gray-900">OJTracker</h1>
          <p className="text-lg text-gray-700">
            Track your OJT hours and progress.
          </p>
          <button
            className="px-6 py-3 hover:cursor-pointer text-lg font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-400 transition-all"
            onClick={() => navigate("/demo")}
          >
            Try Demo
          </button>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center sm:items-start bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Time Logging
            </h3>
            <p className="text-gray-600">
              Log your daily time in and time out with just a few clicks.
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-start bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Track Progress
            </h3>
            <p className="text-gray-600">
              Monitor your total hours throughout your training period.
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-start bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Calculate Duration
            </h3>
            <p className="text-gray-600">
              Calculate how many days you need to complete your OJT.
            </p>
          </div>
        </div>
      </div>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={(loggedUser, token) => {
          loginUser(loggedUser, token);
          navigate("/home");
        }}
        onVerificationRequired={(email) => {
          setShowAuthModal(false);
          navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        }}
      />
    </Layout>
  );
};

export default Index;
