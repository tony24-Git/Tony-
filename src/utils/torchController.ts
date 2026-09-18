/**
 * Contrôleur matériel pour le Flash / Lampe Torche Web et retours haptiques / sonores
 */

// Définitions des types étendus pour le Torch Web API
interface MediaTrackCapabilitiesWithTorch extends MediaTrackCapabilities {
  torch?: boolean;
}

interface MediaTrackConstraintSetWithTorch extends MediaTrackConstraintSet {
  torch?: boolean;
}

class TorchController {
  private mediaStream: MediaStream | null = null;
  private videoTrack: MediaStreamTrack | null = null;
  private audioCtx: AudioContext | null = null;

  /**
   * Joue un retour sonore de clic mécanique de commutateur
   */
  public playClickSound(isOn: boolean): void {
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }

      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      if (this.audioCtx) {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const now = this.audioCtx.currentTime;

        // Clic net et court
        osc.type = 'sine';
        osc.frequency.setValueAtTime(isOn ? 880 : 440, now);
        osc.frequency.exponentialRampToValueAtTime(isOn ? 1200 : 220, now + 0.04);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch {
      // Ignorer si l'audio est bloqué par le navigateur
    }
  }

  /**
   * Déclenche une vibration haptique si supportée
   */
  public triggerHaptic(duration = 40): void {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(duration);
      }
    } catch {
      // Vibration non supportée ou refusée
    }
  }

  /**
   * Active ou désactive le flash matériel via l'API Web MediaDevices
   */
  public async setHardwareTorch(turnOn: boolean): Promise<{ success: boolean; hardwareUsed: boolean; error?: string }> {
    // Si on veut éteindre et qu'on a déjà une piste active
    if (!turnOn) {
      if (this.videoTrack) {
        try {
          const constraints: MediaTrackConstraints = {
            advanced: [{ torch: false } as MediaTrackConstraintSetWithTorch]
          };
          await this.videoTrack.applyConstraints(constraints);
        } catch {
          // Continuer pour stopper la piste
        }
        this.stopStream();
      }
      return { success: true, hardwareUsed: true };
    }

    // Si on veut allumer
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return {
          success: false,
          hardwareUsed: false,
          error: "API Caméra non supportée dans ce navigateur."
        };
      }

      // Demander l'accès à la caméra arrière
      if (!this.videoTrack) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' }
          }
        });
        this.videoTrack = this.mediaStream.getVideoTracks()[0] || null;
      }

      if (!this.videoTrack) {
        return {
          success: false,
          hardwareUsed: false,
          error: "Aucun flux vidéo caméra arrière trouvé."
        };
      }

      // Vérifier si le matériel supporte la torche
      const capabilities = (this.videoTrack.getCapabilities ? this.videoTrack.getCapabilities() : {}) as MediaTrackCapabilitiesWithTorch;

      if (capabilities.torch) {
        const constraints: MediaTrackConstraints = {
          advanced: [{ torch: true } as MediaTrackConstraintSetWithTorch]
        };
        await this.videoTrack.applyConstraints(constraints);
        return { success: true, hardwareUsed: true };
      } else {
        // La caméra arrière est accessible mais n'a pas de flash LED contrôlable via le navigateur
        // On libère la caméra et on informe pour utiliser le mode écran
        this.stopStream();
        return {
          success: true,
          hardwareUsed: false,
          error: "Flash LED non contrôlable sur ce navigateur. Mode lampe écran activé."
        };
      }
    } catch (err: unknown) {
      this.stopStream();
      const errMessage = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        hardwareUsed: false,
        error: `Permission caméra refusée ou erreur : ${errMessage}`
      };
    }
  }

  /**
   * Arrête le flux vidéo pour couper la caméra
   */
  public stopStream(): void {
    if (this.videoTrack) {
      try {
        this.videoTrack.stop();
      } catch {
        // Ignorer
      }
      this.videoTrack = null;
    }
    if (this.mediaStream) {
      try {
        this.mediaStream.getTracks().forEach(t => t.stop());
      } catch {
        // Ignorer
      }
      this.mediaStream = null;
    }
  }
}

export const torchController = new TorchController();
