import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, FileCode, ShieldCheck, Smartphone, Cpu } from 'lucide-react';
import { ANDROID_FILES } from '../data/androidFiles';

interface AndroidCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidCodeModal: React.FC<AndroidCodeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeFile = ANDROID_FILES[selectedFileIndex] || ANDROID_FILES[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignorer si le presse-papier est restreint
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm" id="android-code-modal">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative flex flex-col w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                    Projet Android Natif (Kotlin & Manifest)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Code source prêt pour Android Studio avec gestion CAMERA & FLASH
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="btn-close-code-modal"
                onClick={onClose}
                aria-label="Fermer la fenêtre"
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sélecteur de fichiers */}
            <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-950/40 border-b border-slate-800 overflow-x-auto text-xs">
              {ANDROID_FILES.map((file, idx) => (
                <button
                  key={file.name}
                  type="button"
                  id={`btn-tab-file-${idx}`}
                  onClick={() => {
                    setSelectedFileIndex(idx);
                    setCopied(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedFileIndex === idx
                      ? 'bg-slate-800 text-amber-400 border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>{file.name}</span>
                </button>
              ))}
            </div>

            {/* Description du fichier actif & Bouton copier */}
            <div className="flex items-center justify-between px-5 py-2 bg-slate-900/90 border-b border-slate-800/80 text-xs">
              <div className="flex items-center gap-2 text-slate-400 truncate pr-3">
                <span className="font-mono text-slate-300">{activeFile.path}</span>
                <span className="hidden sm:inline text-slate-500">— {activeFile.description}</span>
              </div>
              <button
                type="button"
                id="btn-copy-code"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier le code</span>
                  </>
                )}
              </button>
            </div>

            {/* Contenu du code source */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-950 font-mono text-xs sm:text-sm text-slate-200 leading-relaxed select-text">
              <pre className="whitespace-pre overflow-x-auto">
                <code>{activeFile.content}</code>
              </pre>
            </div>

            {/* Guide & explications d'implémentation */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200 block">Permissions (AndroidManifest.xml)</strong>
                  <span>
                    Déclaration de <code className="text-amber-300">android.permission.CAMERA</code> et de la fonctionnalité matérielle <code className="text-amber-300">android.hardware.camera.flash</code> avec <code className="text-slate-300">required="true"</code>.
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Cpu className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200 block">Logique Flash (Kotlin)</strong>
                  <span>
                    Utilise <code className="text-amber-300">CameraManager.setTorchMode(cameraId, true/false)</code> avec un <code className="text-slate-300">TorchCallback</code> et demande la permission caméra dynamiquement via <code className="text-slate-300">ActivityResultContracts</code>.
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
