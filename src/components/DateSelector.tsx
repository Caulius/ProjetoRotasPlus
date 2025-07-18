import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from 'lucide-react';

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  className?: string;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onDateChange,
  className = ''
}) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value + 'T00:00:00');
    onDateChange(newDate);
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Calendar className="h-5 w-5 text-orange-500" />
      <label className="text-sm font-medium text-gray-300">Data:</label>
      <input
        type="date"
        value={format(selectedDate, 'yyyy-MM-dd')}
        onChange={handleDateChange}
        className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
      />
      <span className="text-sm text-gray-400">
        {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
      </span>
    </div>
  );
};

export default DateSelector;