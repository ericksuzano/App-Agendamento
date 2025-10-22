import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNetInfo } from '@react-native-community/netinfo';

const ConexaoContext = createContext();

export function ConexaoProvider({ children }) {
  const netInfo = useNetInfo();
  const [estaConectado, setEstaConectado] = useState(true);

  useEffect(() => {
    if (netInfo.isConnected !== null) {
      setEstaConectado(netInfo.isConnected);
    }
  }, [netInfo.isConnected]);

  return (
    <ConexaoContext.Provider value={{ estaConectado }}>
      {children}
    </ConexaoContext.Provider>
  );
}

export function useConexao() {
  return useContext(ConexaoContext);
}