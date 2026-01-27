import React from 'react';

export type Period = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all';

interface DateRangeFilterProps {
  selectedPeriod: Period;
  onPeriodChange: (period: Period) => void;
  title: string;
  periods?: Period[];
  variant?: 'default' | 'outline';
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  selectedPeriod,
  onPeriodChange,
  title,
  periods = ['daily', 'weekly', 'monthly', 'yearly', 'all'],
  variant = 'default'
}) => {
  const getButtonStyles = (isSelected: boolean) => {
    if (variant === 'outline') {
      return `px-3 py-1 text-[#475467] text-xs cursor-pointer border ${
        isSelected ? 'bg-[#E5E9F0] border-[#E5E9F0] text-[#475467]' : 'border-[#E5E9F0]'
      }`;
    }
    
    return `px-3 py-1 text-xs cursor-pointer border border-[#F2F4F7] ${
      isSelected ? 'text-[#475467] bg-[#E5E9F0]' : 'text-[#475467]'
    }`;
  };

  const getPeriodLabel = (period: Period) => {
    switch (period) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      case 'yearly':
        return 'Yearly';
      case 'all':
        return 'All time';
      default:
        return period;
    }
  };

  return (
    <div className="py-2 px-4 bg-white rounded-md border-[#E5E9F0] flex justify-between items-center">
      <h1 className="text-md font-medium mb-0 text-[#344054]">{title}</h1>
      <div className="text-sm text-gray-500">
        {periods.map((period, index) => (
          <button
            key={period}
            onClick={() => onPeriodChange(period)}
            className={`${getButtonStyles(selectedPeriod === period)} ${
              index === 0 ? 'rounded-bl-md rounded-tl-md' : ''
            } ${
              index === periods.length - 1 ? 'rounded-br-md rounded-tr-md' : ''
            }`}
          >
            {getPeriodLabel(period)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DateRangeFilter; 