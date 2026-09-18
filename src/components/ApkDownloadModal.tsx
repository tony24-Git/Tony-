import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  Share2,
  CheckCircle,
  HelpCircle,
  X,
  Smartphone,
  Sparkles,
  Terminal
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, isIOS, installPWA } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk'>('pwa');
  const [copiedCmd, setCopiedCmd] = useState(false);

  const gradleCommand = `./gradlew assembleRelease\n# L'APK sera généré dans : app/build/outputs/apk/release/app-release-unsigned.apk`;

  const handleCopyCmd = async () => {
    try {
      await navigator.clipboard.writeText(gradleCommand);
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2000);
    } catch {
      // Ignorer
    }
  };

  const handleDownloadProjectZip = () => {
    // Message clair orientant l'utilisateur vers le menu Export AI Studio
    alert(
      "Pour télécharger le code complet Android Studio :\n\nCliquez sur le menu en haut à droite d'AI Studio > 'Download ZIP' ou 'Export to GitHub'.\nEnsuite, ouvrez le dossier dans Android Studio et cliquez sur 'Build > Build APK' pour obtenir le fichier .apk !"
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm" id="install-modal">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative flex flex-col w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-100">
                    Installer sur votre téléphone
                  </h3>
                  <p className="text-xs text-slate-400">
                    Installation directe ou génération de fichier APK Android
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="btn-close-install-modal"
                onClick={onClose}
                aria-label="Fermer"
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Onglets choix de méthode */}
            <div className="flex items-center gap-2 px-5 pt-3 bg-slate-950/30 border-b border-slate-800 text-xs">
              <button
                type="button"
                id="tab-install-direct"
                onClick={() => setActiveTab('pwa')}
                className={`flex items-center gap-1.5 px-4 py-2 font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'pwa'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Installation Immédiate (Téléphone)</span>
              </button>
              <button
                type="button"
                id="tab-install-apk"
                onClick={() => setActiveTab('apk')}
                className={`flex items-center gap-1.5 px-4 py-2 font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'apk'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Générer le fichier .APK</span>
              </button>
            </div>

            {/* Contenu de l'onglet actif */}
            <div className="p-5 overflow-y-auto max-h-[70vh] space-y-4 text-xs sm:text-sm">
              {activeTab === 'pwa' ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-amber-300 font-semibold mb-0.5">
                        Méthode 1 : Sans ordinateur ni câble USB
                      </strong>
                      Cette application est configurée comme une application mobile native (PWA). Vous pouvez l'installer en 1 clic directement sur l'écran d'accueil de votre téléphone ou celui de votre ami.
                    </div>
                  </div>

                  {isInstalled ? (
                    <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>L'application est déjà installée sur cet appareil !</span>
                    </div>
                  ) : isInstallable ? (
                    <button
                      type="button"
                      id="btn-trigger-pwa-install"
                      onClick={() => installPWA()}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4 stroke-[2.5]" />
                      <span>Installer sur l'écran d'accueil</span>
                    </button>
                  ) : null}

                  {/* Instructions Chrome Android */}
                  <div className="space-y-2 border-t border-slate-800 pt-3">
                    <h4 className="font-semibold text-slate-200 text-xs flex items-center gap-2">
                      <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                      Comment l'installer sur Android (Chrome / Samsung Internet) :
                    </h4>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-400 text-xs leading-relaxed pl-1">
                      <li>
                        Ouvrez le lien de l'application sur le téléphone de votre ami.
                      </li>
                      <li>
                        Appuyez sur les <strong className="text-slate-200">trois petits points (⋮)</strong> en haut à droite du navigateur.
                      </li>
                      <li>
                        Sélectionnez <strong className="text-amber-300">« Installer l'application »</strong> ou <strong className="text-amber-300">« Ajouter à l'écran d'accueil »</strong>.
                      </li>
                      <li>
                        L'icône s'ajoute sur le bureau du téléphone et fonctionne comme une application native sans barre de recherche !
                      </li>
                    </ol>
                  </div>

                  {/* Instructions iPhone */}
                  {isIOS && (
                    <div className="space-y-2 border-t border-slate-800 pt-3">
                      <h4 className="font-semibold text-slate-200 text-xs flex items-center gap-2">
                        <Share2 className="w-3.5 h-3.5 text-sky-400" />
                        Sur iPhone (Safari) :
                      </h4>
                      <p className="text-slate-400 text-xs">
                        Appuyez sur le bouton de partage <Share2 className="w-3 h-3 inline text-sky-400" /> puis sur <strong className="text-slate-200">« Sur l'écran d'accueil »</strong>.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 text-xs space-y-2">
                    <p className="font-semibold text-slate-100 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      Méthode 2 : Compiler le fichier .apk avec Android Studio
                    </p>
                    <p className="text-slate-400">
                      Les fichiers sources natifs complets sont déjà prêts dans le dossier <code className="text-amber-300">/android</code> de ce projet :
                    </p>
                    <ul className="list-disc list-inside text-slate-400 space-y-1 pl-1">
                      <li><code className="text-slate-300">AndroidManifest.xml</code> avec permissions CAMERA et FLASH</li>
                      <li><code className="text-slate-300">MainActivity.kt</code> (gestion CameraManager & permissions)</li>
                      <li><code className="text-slate-300">build.gradle.kts</code> (SDK 34, Kotlin, AndroidX)</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-slate-200">Étapes pour compiler l'APK :</h5>
                    <ol className="list-decimal list-inside space-y-2 text-xs text-slate-400 pl-1 leading-relaxed">
                      <li>
                        Exportez le projet via le menu d'AI Studio :{' '}
                        <strong className="text-amber-300">Download ZIP</strong> ou <strong className="text-amber-300">Export to GitHub</strong>.
                      </li>
                      <li>
                        Ouvrez le dossier <code className="text-slate-300">android/</code> dans <strong className="text-slate-200">Android Studio</strong>.
                      </li>
                      <li>
                        Allez dans le menu <strong className="text-slate-200">Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>.
                      </li>
                      <li>
                        Android Studio génère instantanément le fichier <strong className="text-emerald-400">app-debug.apk</strong> prêt à être envoyé par WhatsApp ou Bluetooth sur n'importe quel téléphone !
                      </li>
                    </ol>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-slate-400">Commande Gradle CLI :</span>
                      <button
                        type="button"
                        id="btn-copy-gradle-cmd"
                        onClick={handleCopyCmd}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
                      >
                        {copiedCmd ? 'Copié !' : 'Copier'}
                      </button>
                    </div>
                    <pre className="font-mono text-[11px] text-amber-200 bg-black/40 p-2 rounded overflow-x-auto">
                      {gradleCommand}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
              <span>Isaac le boss — +243 898 835 803</span>
              <button
                type="button"
                id="btn-footer-close-modal"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
