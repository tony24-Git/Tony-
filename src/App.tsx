import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Code,
  Shield,
  Sun,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Wifi,
  BatteryMedium,
  Smartphone,
  Phone
} from 'lucide-react';
import { TorchButton } from './components/TorchButton';
import { AndroidCodeModal } from './components/AndroidCodeModal';
import { ApkDownloadModal } from './components/ApkDownloadModal';
import { torchController } from './utils/torchController';
import { TorchState } from './types';
import { Download } from 'lucide-react';

export default function App() {
  const [torchState, setTorchState] = useState<TorchState>({
    isOn: false,
    hasHardwareTorch: null,
    permissionGranted: false,
    errorMessage: null,
    isBusy: false,
  });

  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('12:00');
  const [showScreenLight, setShowScreenLight] = useState<boolean>(false);

  // Mettre à jour l'horloge système Android simulée
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Nettoyer les flux caméra au démontage
  useEffect(() => {
    return () => {
      torchController.stopStream();
    };
  }, []);

  // Gestion du basculement On / Off du flash
  const handleToggleTorch = async () => {
    if (torchState.isBusy) return;

    const nextState = !torchState.isOn;
    torchController.playClickSound(nextState);
    torchController.triggerHaptic(nextState ? 45 : 30);

    setTorchState(prev => ({ ...prev, isBusy: true, errorMessage: null }));

    try {
      const result = await torchController.setHardwareTorch(nextState);

      if (result.success) {
        setTorchState(prev => ({
          ...prev,
          isOn: nextState,
          hasHardwareTorch: result.hardwareUsed,
          permissionGranted: true,
          errorMessage: result.error || null,
          isBusy: false,
        }));
      } else {
        // En cas d'erreur de permission ou matériel, on bascule en mode lumière d'écran
        setTorchState(prev => ({
          ...prev,
          isOn: nextState,
          hasHardwareTorch: false,
          errorMessage: result.error || "Flash physique inaccessible. Mode torche écran actif.",
          isBusy: false,
        }));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTorchState(prev => ({
        ...prev,
        isOn: nextState,
        hasHardwareTorch: false,
        errorMessage: msg,
        isBusy: false,
      }));
    }
  };

  return (
    <main
      className={`relative min-h-screen w-full flex flex-col items-center justify-between transition-colors duration-500 overflow-hidden select-none ${
        torchState.isOn && showScreenLight
          ? 'bg-white text-slate-900'
          : torchState.isOn
          ? 'bg-slate-950 text-slate-100'
          : 'bg-[#0b0f19] text-slate-200'
      }`}
      id="main-torch-app"
    >
      {/* Simulation d'éclairage ambiant en arrière-plan lorsque la torche est active */}
      {torchState.isOn && !showScreenLight && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Faisceau lumineux conique */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-gradient-to-b from-amber-200/20 via-amber-400/10 to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-t from-amber-300/15 via-amber-500/5 to-transparent blur-3xl" />
        </div>
      )}

      {/* Barre supérieure Android simulée */}
      <header className="relative z-20 w-full max-w-md px-6 pt-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium tracking-wide">
          <span className="font-mono">{currentTime}</span>
          <div className="flex items-center gap-2">
            {torchState.isOn && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 animate-pulse">
                <Sparkles className="w-3 h-3" />
                FLASH ON
              </span>
            )}
            <Wifi className="w-3.5 h-3.5" />
            <BatteryMedium className="w-4 h-4" />
          </div>
        </div>

        {/* Bouton d'accès au code source Android natif */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Lampe Torche Android
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-open-apk-modal"
              onClick={() => setIsApkModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Installer / APK</span>
            </button>

            <button
              type="button"
              id="btn-open-code-modal"
              onClick={() => setIsCodeModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-amber-300 border border-slate-700/70 shadow-sm transition-all cursor-pointer"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Code Android</span>
            </button>
          </div>
        </div>
      </header>

      {/* Centre exact de l'écran avec le bouton unique */}
      <section
        className="relative z-20 flex-1 flex flex-col items-center justify-center w-full max-w-md px-6 py-8"
        id="section-center-torch"
      >
        <TorchButton
          isOn={torchState.isOn}
          onToggle={handleToggleTorch}
          disabled={torchState.isBusy}
        />

        {/* Message d'information sur le matériel / permission */}
        <AnimatePresence>
          {torchState.errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/90 border border-amber-500/30 text-amber-300 text-xs shadow-lg max-w-xs text-center"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{torchState.errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Pied de page et contrôles d'accessibilité */}
      <footer className="relative z-20 w-full max-w-md px-6 pb-6 flex flex-col items-center gap-3">
        {/* Option : Basculer entre torche LED physique et mode lampe plein écran */}
        <div className="flex items-center justify-between w-full px-4 py-2.5 rounded-2xl bg-slate-900/60 border border-slate-800/70 backdrop-blur text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Mode lumière plein écran</span>
          </div>
          <button
            type="button"
            id="toggle-screen-light"
            onClick={() => setShowScreenLight(!showScreenLight)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
              showScreenLight ? 'bg-amber-500' : 'bg-slate-700'
            }`}
            aria-label="Activer le mode torche plein écran"
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                showScreenLight ? 'translate-x-4.5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Indicateur d'état des permissions */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" />
            Permission CAMERA gérée
          </span>
          <span className="flex items-center gap-1">
            <Smartphone className="w-3 h-3 text-amber-400" />
            CameraManager.setTorchMode
          </span>
        </div>

        {/* Mention et contact */}
        <div className="text-center pt-1" id="author-credits">
          <p className="text-xs text-slate-300 font-medium tracking-wide">
            Application créée par <span className="text-amber-400 font-semibold">Isaac le boss</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Pour plus de contact :{' '}
            <a
              href="tel:+243898835803"
              className="text-amber-300 hover:text-amber-200 underline font-mono inline-flex items-center gap-1"
            >
              <Phone className="w-3 h-3 inline" />
              +243 898 835 803
            </a>
          </p>
        </div>
      </footer>

      {/* Modal du code source natif Android (Kotlin & XML) */}
      <AndroidCodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />

      {/* Modal d'installation téléphone et génération APK */}
      <ApkDownloadModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />
    </main>
  );
}
