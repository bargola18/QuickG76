import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [machineMode, setMachineMode] = useState('ABSOLUT');
  const [odOrId, setOdOrId] = useState('OD');
  const [selectedThread, setSelectedThread] = useState(null);
  const [manualDiameter, setManualDiameter] = useState('');
  const [manualPitch, setManualPitch] = useState('');
  const [odConstant, setOdConstant] = useState(0.6134);
  const [zLength, setZLength] = useState('');
  const [docFirstPass, setDocFirstPass] = useState('');
  const [lastResult, setLastResult] = useState(null);

  return (
    <AppContext.Provider value={{
      machineMode, setMachineMode,
      odOrId, setOdOrId,
      selectedThread, setSelectedThread,
      manualDiameter, setManualDiameter,
      manualPitch, setManualPitch,
      odConstant, setOdConstant,
      zLength, setZLength,
      docFirstPass, setDocFirstPass,
      lastResult, setLastResult,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
