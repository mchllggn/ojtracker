import { type ReactNode } from "react";
import PrimaryButton from "./PrimaryButton";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface LayoutProps {
  className?: string;
  children: ReactNode;
  onLoginClick?: () => void;
  title?: string;
}

const Layout = ({ className, children, onLoginClick, title }: LayoutProps) => {
  const { user, logout } = useAuth();
  const handleLogout = () => {
    logout();
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
                {user ? "OJTracker" : <Link to="/">OJTracker</Link>}
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" aria-label="Open user menu">
                      <div className="w-12 h-12 border hover:cursor-pointer shadow rounded-full flex bg-blue-500 items-center justify-center">
                        <span className="font-medium text-lg text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault();
                        handleLogout();
                      }}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div>
                <PrimaryButton onClick={onLoginClick}>Login</PrimaryButton>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-12">{children}</main>
    </div>
  );
};

export default Layout;
