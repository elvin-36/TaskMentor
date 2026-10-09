import React, { useState } from 'react';
import { X, Clock, CheckCircle2, Loader2 } from 'lucide-react';

interface ExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  progressPercent: number;
  queriesCount: number;
  onGrantExtension: () => void;
}

export const ExtensionModal: React.FC<ExtensionModalProps> = ({
  isOpen,
  onClose,
  progressPercent,
  queriesCount,
  onGrantExtension,
}) => {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isGranted, setIsGranted] = useState(false);

  if (!isOpen) return null;

  const handleEvaluate = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      setIsGranted(true);
      onGrantExtension();
    }, 800);
  };

  const handleClose = () => {
    setIsGranted(false);
    setIsEvaluating(false);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xs p-4 shadow-2xl relative">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-md transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
          <Clock className="w-5 h-5" />
        </div>

        <h3 className="font-bold text-white text-sm">Request AI Time Extension</h3>
        <p className="text-xs text-slate-400 mt-1">
          Current Progress Checkpoint: <b className="text-indigo-400">{progressPercent}%</b>
        </p>

        {/* Evaluation Metrics Box */}
        <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-300 text-[11px]">
            <span>Activity Tracking:</span>
            <span className="text-emerald-400 font-mono font-medium">Active Interaction</span>
          </div>
          <div className="flex items-center justify-between text-slate-300 text-[11px]">
            <span>Mentorship Queries:</span>
            <span className="text-indigo-400 font-mono font-bold">+{queriesCount} questions asked</span>
          </div>
          <div className="flex items-center justify-between text-slate-300 text-[11px]">
            <span>Anti-Hoarding Check:</span>
            <span className="text-emerald-400 font-mono">Passed (No Idle)</span>
          </div>
        </div>

        {/* Granted Box */}
        {isGranted && (
          <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-emerald-300 text-[11px]">
                <b>AI Evaluation: High learning activity detected!</b>
                <p className="mt-0.5 text-slate-300">
                  Extension granted: <span className="text-emerald-400 font-bold font-mono">+30 mins</span> added to your countdown timer.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          {!isGranted ? (
            <button
              onClick={handleEvaluate}
              disabled={isEvaluating}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating with AI...</span>
                </>
              ) : (
                'Evaluate with AI'
              )}
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/30 transition cursor-pointer"
            >
              Close &amp; Resume Task
            </button>
          )}

          {!isGranted && (
            <button
              onClick={handleClose}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
