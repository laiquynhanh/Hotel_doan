import React, { useState, useEffect } from 'react';

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

/**
 * Format number string with thousand separators (dots for Vietnamese)
 * Example: "1990000" -> "1.990.000"
 */
const formatWithDots = (value: string): string => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  
  // Add dots every 3 digits from right to left
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Remove dots from formatted string to get raw number
 * Example: "1.990.000" -> "1990000"
 */
const removeFormatting = (value: string): string => {
  return value.replace(/\./g, '');
};

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  placeholder = '0',
  className = 'form-control',
  label
}) => {
  const [displayValue, setDisplayValue] = useState('');

  // Update display value when prop value changes
  useEffect(() => {
    if (value) {
      setDisplayValue(formatWithDots(value));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Remove all non-digit characters
    const rawValue = removeFormatting(input);
    
    // Update display with formatted value
    setDisplayValue(formatWithDots(rawValue));
    
    // Pass raw number string to parent
    onChange(rawValue);
  };

  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <input
        type="text"
        className={className}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        inputMode="numeric"
      />
      {displayValue && (
        <small className="form-text text-muted">
          {formatWithDots(removeFormatting(displayValue))} VNĐ
        </small>
      )}
    </div>
  );
};

export default CurrencyInput;
