import { type ReactNode } from "react";
import PrimaryButton from "./PrimaryButton";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface LayoutProps {
  className?: string;
  children: ReactNode;
  onLoginClick?: () => void;
}

const Layout = ({ className, children, onLoginClick }: LayoutProps) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const navLinks = [
    { label: "Home", href: "/home" },
    { label: "Calendar", href: "/calendar" },
  ];

  return (
    <div className={`min-h-screen ${className ?? ""}`}>
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <span className="text-xl font-bold text-gray-900">OJTracker</span>
              {user && (
                <nav className="flex space-x-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={`text-gray-700 hover:text-indigo-600 transition-colors ${window.location.pathname === link.href ? "font-semibold text-indigo-600" : ""}`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              )}
            </div>
            {/* Header Right Content */}
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-full">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-gray-700 font-medium">
                    Welcome, {user.name}!
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Logout
                </button>
              </div>
            ) : (
              <PrimaryButton
                className="hover:cursor-pointer"
                onClick={onLoginClick}
              >
                Login
              </PrimaryButton>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
};

export default Layout;
