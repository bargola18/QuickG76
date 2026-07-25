import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [machineMode, setMachineMode] = useState('ABSOLUT');
  const [odOrId, setOdOrId] = useState('OD');
  const [inputMode, setInputMode] = useState('manual');
  const [selectedThread, setSelectedThread] = useState(null);
  const [manualD, setManualD] = useState('');
  const [manualP, setManualP] = useState('');
  const [konstanta, setKonstanta] = useState(0.6134);
  const [zLength, setZLength] = useState('');
  const [doc, setDoc] = useState('');
  const [taperEnabled, setTaperEnabled] = useState(false);
  const [taperR, setTaperR] = useState('');
  const [spindleRPM, setSpindleRPM] = useState('');

  return (
    <AppContext.Provider value={{
      machineMode, setMachineMode,
      odOrId, setOdOrId,
      inputMode, setInputMode,
      selectedThread, setSelectedThread,
      manualD, setManualD,
      manualP, setManualP,
      konstanta, setKonstanta,
      zLength, setZLength,
      doc, setDoc,
      taperEnabled, setTaperEnabled,
      taperR, setTaperR,
      spindleRPM, setSpindleRPM,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
