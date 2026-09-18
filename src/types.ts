export type TorchMode = 'off' | 'on';

export type FlashHardwareType = 'hardware' | 'screen' | 'checking';

export interface TorchState {
  isOn: boolean;
  hasHardwareTorch: boolean | null;
  permissionGranted: boolean;
  errorMessage: string | null;
  isBusy: boolean;
}

export interface AndroidCodeFile {
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
}
