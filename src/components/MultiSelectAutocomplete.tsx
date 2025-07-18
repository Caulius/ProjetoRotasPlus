import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface Option {
  id: string;
  label: string;
  value: string;
}

interface MultiSelectAutocompleteProps {
  selectedValues: string[];
  onChange: (values: string[]) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const MultiSelectAutocomplete: React.FC<MultiSelectAutocompleteProps> = ({
  selectedValues,
  onChange,
  options,
  placeholder = '',
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<Option[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Filter out already selected options and sort alphabetically
    const availableOptions = options.filter(option => 
      !selectedValues.includes(option.value)
    ).sort((a, b) => a.label.localeCompare(b.label));
    
    if (inputValue.trim() === '') {
      setFilteredOptions(availableOptions);
    } else {
      const filtered = availableOptions.filter(option =>
        option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
        option.value.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [inputValue, options, selectedValues]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setInputValue('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
  };

  const handleOptionSelect = (option: Option) => {
    const newValues = [...selectedValues, option.value];
    onChange(newValues);
    setInputValue('');
    setIsOpen(false);
  };

  const handleRemoveValue = (valueToRemove: string) => {
    const newValues = selectedValues.filter(value => value !== valueToRemove);
    onChange(newValues);
  };

  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const getSelectedLabels = () => {
    return selectedValues.map(value => {
      const option = options.find(opt => opt.value === value);
      return option ? option.label : value;
    });
  };

  return (
    <div className="relative">
      {/* Selected Values Display */}
      {selectedValues.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {getSelectedLabels().map((label, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 bg-orange-600 text-white text-xs rounded-full"
            >
              {label}
              <button
                onClick={() => handleRemoveValue(selectedValues[index])}
                className="ml-1 hover:bg-orange-700 rounded-full p-0.5"
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs focus:border-orange-500 pr-8 ${className}`}
        />
        <ChevronDown 
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>
      
      {isOpen && filteredOptions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto"
        >
          {filteredOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => handleOptionSelect(option)}
              className="px-3 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
      
      {isOpen && filteredOptions.length === 0 && inputValue && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg"
        >
          <div className="px-3 py-2 text-sm text-gray-400">
            Nenhuma opção disponível
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectAutocomplete;