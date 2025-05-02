import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  fullWidth?: boolean;
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, options, error, fullWidth = true, className = "", ...props },
    ref
  ) => {
    const selectClasses = `
      block rounded-md border ${error ? "border-red-500" : "border-gray-300"} 
      px-3 py-2 text-gray-900
      focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500
      disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
      ${fullWidth ? "w-full" : ""}
      ${className}
    `;

    return (
      <div className={fullWidth ? "w-full" : ""}>
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <select ref={ref} className={selectClasses} {...props}>
          {props.placeholder && (
            <option value="" disabled>
              {props.placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
