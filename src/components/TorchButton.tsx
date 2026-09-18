import React from 'react';
import { motion } from 'motion/react';
import { Power, Zap, Lightbulb } from 'lucide-react';

interface TorchButtonProps {
  isOn: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export const TorchButton: React.FC<TorchButtonProps> = ({
  isOn,
  onToggle,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col items-center justify-center select-none" id="torch-button-container">
      {/* Halo lumineux dynamique lorsque la torche est allumée */}
      <div className="relative flex items-center justify-center">
        {isOn && (
          <>
            {/* Pulsation externe */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.35, 0.15, 0.35],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute w-72 h-72 rounded-full bg-amber-400/25 blur-2xl pointer-events-none"
            />
            {/* Halo proche intense */}
            <div className="absolute w-56 h-56 rounded-full bg-amber-300/40 blur-xl pointer-events-none" />
          </>
        )}

        {/* Bouton tactile circulaire central */}
        <motion.button
          id="btn-torch-toggle"
          type="button"
          onClick={onToggle}
          disabled={disabled}
          whileTap={{ scale: 0.93 }}
          whileHover={{ scale: 1.03 }}
          aria-label={isOn ? 'Éteindre la lampe torche' : 'Allumer la lampe torche'}
          aria-pressed={isOn}
          className={`relative z-10 flex flex-col items-center justify-center w-48 h-48 sm:w-56 sm:h-56 rounded-full transition-all duration-300 cursor-pointer shadow-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/50 ${
            isOn
              ? 'bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-slate-950 shadow-amber-400/40 border-4 border-amber-200'
              : 'bg-gradient-to-b from-slate-800 to-slate-900 text-slate-400 shadow-black/80 border-4 border-slate-700/60 hover:border-slate-600 hover:text-slate-200'
          }`}
        >
          {/* Anneau interne en relief */}
          <div
            className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center transition-colors duration-300 ${
              isOn
                ? 'bg-amber-400/90 shadow-inner'
                : 'bg-slate-900/90 shadow-inner'
            }`}
          >
            {isOn ? (
              <Zap className="w-16 h-16 sm:w-20 sm:h-20 text-slate-950 stroke-[2.2] animate-pulse" />
            ) : (
              <Power className="w-16 h-16 sm:w-20 sm:h-20 stroke-[2]" />
            )}
            <span
              className={`mt-2 text-xs uppercase tracking-widest font-bold ${
                isOn ? 'text-slate-950' : 'text-slate-500'
              }`}
            >
              {isOn ? 'ON' : 'OFF'}
            </span>
          </div>
        </motion.button>
      </div>

      {/* Libellé d'état sous le bouton */}
      <div className="mt-8 text-center" id="torch-status-badge">
        <motion.div
          key={isOn ? 'status-on' : 'status-off'}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center gap-2"
        >
          <span
            className={`inline-block w-2.5 h-2.5 rounded-full ${
              isOn ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-slate-600'
            }`}
          />
          <h2
            className={`text-2xl font-bold tracking-widest uppercase ${
              isOn ? 'text-amber-300 drop-shadow' : 'text-slate-400'
            }`}
          >
            {isOn ? 'ALLUMÉ' : 'ÉTEINT'}
          </h2>
        </motion.div>
        <p className="mt-2 text-sm text-slate-500 max-w-xs">
          {isOn
            ? 'La lampe torche est actuellement allumée.'
            : 'Appuyez pour allumer la lampe torche.'}
        </p>
      </div>
    </div>
  );
};
