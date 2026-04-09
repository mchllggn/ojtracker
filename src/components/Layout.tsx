import { type ReactNode, useState } from "react";
import PrimaryButton from "./PrimaryButton";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface LayoutProps {
  className?: string;
  children: ReactNode;
  onLoginClick?: () => void;
  title?: string;
}

const Layout = ({ className, children, onLoginClick, title }: LayoutProps) => {
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const navLinks = [
    { label: "Home", href: "/home" },
    { label: "Calendar", href: "/calendar" },
    { label: "Duty Logs", href: "/duty-logs" },
  ];

  return (
    <div className={`min-h-screen ${className ?? ""}`}>
      <title>{title || "OJTracker"}</title>
      <header className={`${!user && "container"} mx-auto bg-white`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900 hover:cursor-pointer">
                <Link to="/">OJTracker</Link>
              </span>
            </div>
            {/* Header Right Content */}
            {user ? (
              <div className="flex items-center space-x-6">
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
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen((previous) => !previous)}
                  >
                    <div className="w-12 h-12 border hover:cursor-pointer shadow rounded-full flex bg-blue-500 items-center justify-center">
                      <span className="font-medium text-lg text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-md border border-gray-200 bg-white p-2 shadow-lg z-10">
                      <button
                        onClick={handleLogout}
                        className="w-full rounded-md hover:cursor-pointer bg-red-500 px-4 py-2 text-left text-sm font-medium text-white hover:bg-red-600"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <PrimaryButton onClick={onLoginClick}>Login</PrimaryButton>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
};

export default Layout;
