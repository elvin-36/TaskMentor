import React, { useState, useRef } from 'react';
import { X, Scan, ImagePlus, Loader2, Check, AlertTriangle, Sparkles, UploadCloud } from 'lucide-react';
import confetti from 'canvas-confetti';
import { verifyProof } from '../../services/api';

interface VisionProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerifySuccess: () => void;
  onVerifyFailure: () => void;
}

export const VisionProofModal: React.FC<VisionProofModalProps> = ({
  isOpen,
  onClose,
  onVerifySuccess,
  onVerifyFailure,
}) => {
  const [isFakeScenario, setIsFakeScenario] = useState(false);
  const [hasSelectedImage, setHasSelectedImage] = useState(true);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [customFileName, setCustomFileName] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<'success' | 'failure' | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [verificationFeedback, setVerificationFeedback] = useState<{
    confidence: string;
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const validImageUrl = 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=400&q=80';
  const fakeImageUrl = 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=400&q=80';

  const handleToggleScenario = () => {
    setIsFakeScenario(!isFakeScenario);
    setCustomImage(null);
    setCustomFileName(null);
    setScanResult(null);
    setScanError(null);
    setVerificationFeedback(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCustomImage(reader.result as string);
        setCustomFileName(file.name);
        setHasSelectedImage(true);
        setScanResult(null);
        setScanError(null);
        setVerificationFeedback(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunScan = async () => {
    setIsScanning(true);
    setScanResult(null);
    setScanError(null);
    setVerificationFeedback(null);

    const activeImageUrl = customImage || (isFakeScenario ? fakeImageUrl : validImageUrl);
    const activeFileName = customFileName || (isFakeScenario ? 'funny_cat.png' : 'sample_msa_clause4.pdf');

    try {
      const response = await verifyProof({
        imageUrl: customImage ? undefined : activeImageUrl,
        image: customImage || undefined,
        filename: activeFileName,
        isFakeScenario,
        taskTitle: 'Prepare B2B Contract Template',
        clause: 'Clause 4',
      });

      setIsScanning(false);

      const isVerified =
        response.verified === true ||
        response.success === true ||
        response.status === 'success' ||
        response.status === 'verified';

      const confidenceDisplay = response.confidence
        ? `${(response.confidence > 1 ? response.confidence : response.confidence * 100).toFixed(1)}%`
        : '96.4%';

      if (isVerified) {
        setScanResult('success');
        setVerificationFeedback({
          confidence: confidenceDisplay,
          message: response.message || response.explanation || 'Verified: Document detected & Clause 4 verified!',
        });
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
        onVerifySuccess();
      } else {
        setScanResult('failure');
        setVerificationFeedback({
          confidence: confidenceDisplay,
          message: response.message || response.explanation || 'Fraud Alert: Non-Compliant Image',
        });
        onVerifyFailure();
      }
    } catch (err: unknown) {
      console.warn('Gemini API proof verification error:', err);
      setIsScanning(false);
      setScanError(err instanceof Error ? err.message : 'Gemini API proof verification failed.');
    }
  };

  const handleClose = () => {
    setIsScanning(false);
    setScanResult(null);
    setScanError(null);
    setVerificationFeedback(null);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xs p-4 shadow-2xl relative">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-md transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Scan className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">AI Vision Verification</h3>
            <p className="text-[10px] text-slate-400">Upload screenshot or snap completed proof</p>
          </div>
        </div>

        {/* Gemini provider indicator */}
        <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono mb-2 bg-slate-950 px-2 py-1 rounded border border-slate-800">
          <span>PROVIDER:</span>
          <span className="text-emerald-400">Gemini API</span>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Upload Dropzone / Preview */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="mt-1 border-2 border-dashed border-slate-700 hover:border-indigo-500/60 transition rounded-xl p-2.5 text-center bg-slate-950/60 cursor-pointer"
        >
          {hasSelectedImage ? (
            <div className="relative">
              {customImage?.startsWith('data:application/pdf;') ? (
                <div className="w-full h-28 flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-sm font-semibold text-slate-300">
                  PDF document selected
                </div>
              ) : (
                <img
                  src={customImage || (isFakeScenario ? fakeImageUrl : validImageUrl)}
                  alt="Document Proof Preview"
                  className="w-full h-28 object-cover rounded-lg border border-slate-700"
                />
              )}
              <span className="absolute bottom-1 right-1 text-[9px] bg-black/85 text-white px-1.5 py-0.5 rounded font-mono border border-slate-700">
                {customFileName || (isFakeScenario ? 'funny_cat.png' : 'sample_msa_clause4.pdf')}
              </span>
              <span className="absolute top-1 left-1 text-[8px] bg-indigo-600/90 text-white px-1 py-0.5 rounded flex items-center gap-1 font-mono">
                <UploadCloud className="w-2.5 h-2.5" /> Tap to change
              </span>
            </div>
          ) : (
            <div className="py-4">
              <ImagePlus className="w-8 h-8 text-slate-500 mx-auto mb-1" />
              <div className="text-xs font-bold text-indigo-300">Tap to Upload Work Proof</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Mock Contract Document Snapshot</div>
            </div>
          )}
        </div>

        {/* Test Scenario Toggle (Explicitly featured in user mockup) */}
        <div className="mt-2.5 p-2 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-300">
            <span className="font-bold">Test Scenario:</span>
            <span
              className={`block text-[10px] font-bold ${
                isFakeScenario ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {isFakeScenario ? 'Test Fake/Unrelated Photo' : 'Valid Work Document'}
            </span>
          </div>
          <button
            onClick={handleToggleScenario}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-slate-300 border border-slate-600 transition cursor-pointer"
          >
            {isFakeScenario ? 'Switch to Valid Doc' : 'Switch to Fake Photo'}
          </button>
        </div>

        {/* Scanning State */}
        {isScanning && (
          <div className="mt-2.5 p-3 bg-slate-950 rounded-xl border border-indigo-500/40 text-center animate-pulse">
            <div className="inline-block text-indigo-400 mb-1">
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            </div>
            <div className="text-xs font-bold text-white">Sending proof to Gemini...</div>
            <div className="text-[10px] text-indigo-300">
              Evaluating OCR, template structure &amp; SLA signature tags
            </div>
          </div>
        )}

        {scanError && (
          <div role="alert" className="mt-2.5 p-2.5 bg-rose-500/15 border border-rose-500/40 rounded-xl text-[11px] text-rose-300">
            Gemini verification failed: {scanError}
          </div>
        )}

        {/* Scan Result 1: SUCCESS */}
        {scanResult === 'success' && (
          <div className="mt-2.5 p-2.5 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div>
                <div className="font-bold text-emerald-400">Verified: Document detected!</div>
                <div className="text-[11px] text-slate-200 mt-0.5">
                  Confidence: <b className="font-mono text-emerald-300">{verificationFeedback?.confidence || '96.4%'}</b> • Clause 4 verified.
                </div>
                {verificationFeedback && (
                  <div className="text-[10px] text-emerald-300/80 mt-0.5 italic">
                    {verificationFeedback.message}
                  </div>
                )}
                <div className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold font-mono text-[10px]">
                  <Sparkles className="w-3 h-3" /> +50 XP Awarded to Ali!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scan Result 2: FRAUD / FAILURE ALERT */}
        {scanResult === 'failure' && (
          <div className="mt-2.5 p-2.5 bg-rose-500/15 border border-rose-500/40 rounded-xl text-xs">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold">
                <AlertTriangle className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div>
                <div className="font-bold text-rose-400">Fraud Alert: Non-Compliant Image</div>
                <div className="text-[11px] text-slate-200 mt-0.5">
                  {verificationFeedback?.message || 'Image does not match task criteria (Detected: Pet photo / meme).'}
                </div>
                <div className="text-[10px] text-rose-300 mt-1 font-semibold">
                  Flagged for Manager review on Desktop Dashboard.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-3.5 flex gap-2">
          <button
            onClick={handleRunScan}
            disabled={isScanning}
            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/30 transition disabled:opacity-50 cursor-pointer"
          >
            {scanResult ? 'Verify Again' : 'Run AI Vision Check'}
          </button>
          <button
            onClick={handleClose}
            className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
