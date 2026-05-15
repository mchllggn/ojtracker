interface SecondaryButtonProps {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
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
      className={`active:shadow-md shadow-gray-300 w-full bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md transition-shadow duration-200 hover:cursor-pointer hover:bg-gray-300"
        ${widthClass} ${className}`}
    >
      {children}
    </button>
  );
};

export default SecondaryButton;
