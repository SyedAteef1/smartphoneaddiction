import { useState } from 'react';

interface PopupConfig {
  title: string;
  message: string;
  icon?: string;
  type?: 'success' | 'warning' | 'info' | 'error';
  autoClose?: number;
  speakMessage?: boolean;
}

export const useVoicePopup = () => {
  const [popup, setPopup] = useState<PopupConfig & { visible: boolean }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    autoClose: 3000,
    speakMessage: true,
  });

  const showPopup = (config: PopupConfig) => {
    setPopup({ ...config, visible: true });
  };

  const hidePopup = () => {
    setPopup(prev => ({ ...prev, visible: false }));
  };

  const showSuccess = (title: string, message: string) => {
    showPopup({ title, message, type: 'success' });
  };

  const showWarning = (title: string, message: string) => {
    showPopup({ title, message, type: 'warning' });
  };

  const showError = (title: string, message: string) => {
    showPopup({ title, message, type: 'error' });
  };

  const showInfo = (title: string, message: string) => {
    showPopup({ title, message, type: 'info' });
  };

  return {
    popup,
    showPopup,
    hidePopup,
    showSuccess,
    showWarning,
    showError,
    showInfo,
  };
};
