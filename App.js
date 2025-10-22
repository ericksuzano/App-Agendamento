import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SystemUI from "expo-system-ui";
import AppNavegacao from "./src/navegacao";
import { ConexaoProvider } from "./src/contexto/ContextoConexao";

export default function App() {
  useEffect(() => {
    SystemUI.setBackgroundColorAsync("#000000");
  }, []);

  return (
    <SafeAreaProvider>
      <ConexaoProvider>
        <StatusBar style="dark" />
        <AppNavegacao />
      </ConexaoProvider>
    </SafeAreaProvider>
  );
}
