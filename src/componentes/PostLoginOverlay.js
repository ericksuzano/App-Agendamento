// /src/componentes/PostLoginOverlay.js

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  AccessibilityInfo,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Para o checkmark

export default function PostLoginOverlay({ seconds = 5, onTimeout }) {
  const [remaining, setRemaining] = useState(seconds);
  const timerRef = useRef(null);

  // Efeito para iniciar e limpar o timer
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(`Login realizado com sucesso. Redirecionando em ${seconds} segundos.`);
    setRemaining(seconds); // Garante início correto

    timerRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) { // Quando chegar a 1, no próximo segundo será 0
          clearInterval(timerRef.current); // Limpa o timer
          timerRef.current = null;
          if (onTimeout) onTimeout(); // Chama a função de timeout
          return 0;
        }
        return prev - 1; // Decrementa
      });
    }, 1000);

    // Limpeza ao desmontar
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [seconds, onTimeout]); // Depende de seconds e onTimeout

  return (
    <SafeAreaView style={styles.overlayContainer}>
      <View style={styles.overlayCard}>
        <View style={styles.overlayIconCircle}>
          {/* Usando Ionicons para o checkmark */}
          <Ionicons name="checkmark-sharp" size={40} color="white" />
        </View>
        <Text style={styles.overlayTitle}>Login Realizado com Sucesso!</Text>
        <Text style={styles.overlayDesc}>
          Você será redirecionado automaticamente em{' '}
          <Text style={styles.overlayCount}>{remaining}</Text> segundos...
        </Text>
        <ActivityIndicator size="large" color="#28a745" style={{ marginVertical: 12 }} />
        <Text style={styles.overlayHint}>Aguarde o redirecionamento automático.</Text>
      </View>
    </SafeAreaView>
  );
}

// Estilos adaptados para uma tela cheia
const styles = StyleSheet.create({
  overlayContainer: { // Ocupa a tela inteira
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)', // Fundo escurecido
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  overlayCard: { width: '90%', maxWidth: 520, backgroundColor: '#fff', borderRadius: 14, padding: 24, alignItems: 'center' },
  overlayIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#28a745', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  // overlayIconCheck: { fontSize: 32, color: '#fff' }, // Removido, usamos Ionicons
  overlayTitle: { fontSize: 18, fontWeight: '700', color: '#0a0a0a', marginBottom: 6, textAlign: 'center' },
  overlayDesc: { color: '#334155', textAlign: 'center', marginBottom: 10 },
  overlayCount: { fontWeight: '800', color: '#0a0a0a' },
  overlayHint: { marginTop: 10, color: '#475569', fontSize: 12, textAlign: 'center' },
});