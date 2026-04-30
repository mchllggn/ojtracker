import React from "react";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  label?: string;
  srOnly?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({
  id,
  name,
  type,
  placeholder,
  value,
  onChange,
  required = false,
  autoComplete,
  className = "",
  label,
  srOnly = true,
  ...rest
}) => {
  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className={
            srOnly ? "sr-only" : "block text-sm font-medium text-gray-700 mb-1"
          }
        >
          {label}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className={`appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 transition duration-200 text-gray-900 focus:outline-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...rest}
      />
    </div>
  );
};

export default TextInput;
