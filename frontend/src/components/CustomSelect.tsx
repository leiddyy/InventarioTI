import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface CustomSelectOption {
  value: string;
  label: string;
  colorDot?: string;
  count?: number;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  icon?: React.ReactNode;
  placeholder?: string;
  align?: 'left' | 'right';
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  icon,
  placeholder = 'Selecione',
  align = 'left',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const isFiltered = value !== 'ALL' && value !== '';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border shadow-sm ${
          isFiltered
            ? 'bg-amber-50/80 border-amber-300 text-amber-950 ring-2 ring-amber-500/10'
            : isOpen
            ? 'bg-white border-dia-navy text-dia-navy ring-2 ring-dia-navy/10'
            : 'bg-slate-50 hover:bg-white border-slate-200 text-slate-700 hover:border-slate-300'
        }`}
      >
        {icon && <span className={isFiltered ? 'text-amber-600' : 'text-slate-400'}>{icon}</span>}
        
        {selectedOption?.colorDot && (
          <span className={`w-2 h-2 rounded-full ${selectedOption.colorDot} shrink-0`} />
        )}

        <span className="truncate max-w-[150px]">
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 ml-0.5 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-dia-navy' : isFiltered ? 'text-amber-600' : 'text-slate-400'
          }`}
        />
      </button>

      {/* Floating Menu */}
      {isOpen && (
        <div
          className={`absolute z-40 mt-1.5 min-w-[200px] w-full max-h-72 overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs rounded-xl flex items-center justify-between transition ${
                  isSelected
                    ? 'bg-dia-navy text-white font-bold shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-dia-navy font-medium'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {opt.colorDot && (
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${opt.colorDot} ${
                        isSelected ? 'ring-2 ring-white/50' : ''
                      }`}
                    />
                  )}
                  <span className="truncate">{opt.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {opt.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {opt.count}
                    </span>
                  )}
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
