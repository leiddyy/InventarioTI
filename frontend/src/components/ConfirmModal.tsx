import React from 'react';
import { AlertTriangle, Trash2, X, AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  itemName?: string;
  itemBadge?: string;
  itemSub?: string;
  warningNote?: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  itemBadge,
  itemSub,
  warningNote,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDanger = true,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-5 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isDanger ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
            }`}>
              {isDanger ? (
                <Trash2 className="w-6 h-6 stroke-[2.2]" />
              ) : (
                <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-dia-navy leading-tight">
                {title}
              </h3>
              {description && (
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {description}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlight Item Card if provided */}
        {(itemName || itemSub) && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold text-slate-900">
                {itemName}
              </span>
              {itemBadge && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-700">
                  {itemBadge}
                </span>
              )}
            </div>
            {itemSub && (
              <p className="text-xs text-slate-500 font-mono font-medium">
                {itemSub}
              </p>
            )}
          </div>
        )}

        {/* Warning Callout Box */}
        {warningNote && (
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 font-medium leading-relaxed">
              {warningNote}
            </p>
          </div>
        )}

        <p className="text-xs text-slate-400 font-medium text-center">
          Esta ação não poderá ser desfeita.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-md transition flex items-center gap-2 ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
            } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <span>Processando...</span>
            ) : (
              <>
                {isDanger && <Trash2 className="w-4 h-4" />}
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
