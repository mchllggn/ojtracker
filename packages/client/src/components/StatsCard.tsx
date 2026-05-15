import React from "react";

interface StatsCardProps {
  label: string;
  value: string | number;
  subtitle: string;
  variant?: "default" | "success" | "warning" | "error";
}

const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  subtitle,
  variant = "default",
}) => {
  const getColorClasses = () => {
    switch (variant) {
      case "success":
        return "text-green-600";
      case "warning":
        return "text-amber-600";
      case "error":
        return "text-red-600";
      default:
        return "text-blue-600";
    }
  };

  return (
    <div className="shadow-sm border rounded-lg p-6 hover:shadow-md transition-shadow">
      <p className="text-lg font-semibold text-gray-900">{label}</p>
      <p className={`text-3xl font-bold ${getColorClasses()}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
};

export default StatsCard;
