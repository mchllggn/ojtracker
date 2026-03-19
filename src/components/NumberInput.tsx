import type { ChangeEvent } from "react";

interface NumberInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  min?: number;
  step?: number;
}

const NumberInput = ({
  id,
  value,
  onChange,
  placeholder,
  className,
  min = 0,
  step = 1,
}: NumberInputProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    if (nextValue === "") {
      onChange("");
      return;
    }

    const parsed = Number(nextValue);
    if (Number.isNaN(parsed)) {
      return;
    }

    const clamped = Math.max(min, parsed);
    onChange(String(clamped));
  };

  return (
    <input
      type="text"
      id={id}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      min={min}
      step={step}
      className={className}
      required
    />
  );
};

export default NumberInput;
