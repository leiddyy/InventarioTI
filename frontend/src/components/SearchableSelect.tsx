import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';

export interface SearchableSelectOption {
  value: number | string;
  label: string;
  sublabel?: string;
  badge?: string;
  badgeColor?: string;
  icon?: React.ReactNode;
  searchTerms?: string;
}

interface SearchableSelectProps {
  label?: string;
  placeholder?: string;
  value: number | string | '';
  onChange: (value: any) => void;
  options: SearchableSelectOption[];
  emptyMessage?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  showBadgeInTrigger?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  placeholder = 'Selecione uma opção...',
  value,
  onChange,
  options,
  emptyMessage = 'Nenhuma opção encontrada.',
  disabled = false,
  required = false,
  className = '',
  showBadgeInTrigger = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto-foco na busca
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredOptions = options.filter((opt) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const matchesLabel = opt.label.toLowerCase().includes(term);
    const matchesSub = opt.sublabel?.toLowerCase().includes(term);
    const matchesBadge = opt.badge?.toLowerCase().includes(term);
    const matchesSearchTerms = opt.searchTerms?.toLowerCase().includes(term);
    return matchesLabel || matchesSub || matchesBadge || matchesSearchTerms;
  });

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
          <span>{label} {required && <span className="text-amber-600">*</span>}</span>
          {selectedOption && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-[11px] text-slate-400 hover:text-rose-600 font-semibold transition"
            >
              Limpar
            </button>
          )}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setSearchTerm('');
          }
        }}
        className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-all flex items-center justify-between gap-2 shadow-sm ${
          disabled
            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            : isOpen
            ? 'bg-white border-dia-navy ring-2 ring-dia-navy/15 text-slate-900'
            : selectedOption
            ? 'bg-amber-50/50 border-amber-300 text-slate-900 hover:border-amber-400'
            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white hover:border-slate-300'
        }`}
      >
        <div className="flex items-center gap-2 truncate min-w-0 flex-1">
          {selectedOption?.icon && (
            <span className="shrink-0 text-slate-600">{selectedOption.icon}</span>
          )}

          {selectedOption ? (
            <span className="font-extrabold text-dia-navy text-xs sm:text-sm truncate">
              {selectedOption.label}
            </span>
          ) : (
            <span className="text-slate-400 text-xs sm:text-sm truncate">{placeholder}</span>
          )}

          {showBadgeInTrigger && selectedOption?.badge && (
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
              selectedOption.badgeColor || 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}>
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-dia-navy' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Input Bar */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/80">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Digite para pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white text-slate-900 placeholder-slate-400 text-xs sm:text-sm pl-9 pr-8 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-dia-navy focus:ring-1 focus:ring-dia-navy"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 px-3 text-center text-xs text-slate-400 font-medium">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl text-left transition flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-dia-navy text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-dia-navy'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate min-w-0">
                      {opt.icon && (
                        <span className={`shrink-0 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`}>
                          {opt.icon}
                        </span>
                      )}
                      <div className="truncate min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs sm:text-sm font-bold truncate ${
                            isSelected ? 'text-white' : 'text-slate-900'
                          }`}>
                            {opt.label}
                          </span>
                          {opt.badge && (
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : opt.badgeColor || 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        {opt.sublabel && (
                          <p className={`text-[11px] truncate mt-0.5 ${
                            isSelected ? 'text-slate-200' : 'text-slate-500'
                          }`}>
                            {opt.sublabel}
                          </p>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-amber-400 shrink-0 stroke-[3]" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
