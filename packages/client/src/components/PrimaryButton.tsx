interface PrimaryButtonProps {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  type = "button",
  onClick,
  disabled = false,
  className = "",
  fullWidth = false,
}) => {
  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`active:shadow-md shadow-blue-300 w-full bg-blue-500 text-white font-medium py-2 px-4 rounded-md transition-shadow duration-200 hover:cursor-pointer hover:bg-blue-800"
        ${widthClass} ${className}`}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;
