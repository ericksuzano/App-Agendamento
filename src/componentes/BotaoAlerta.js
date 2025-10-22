// /src/componentes/BotaoAlerta.js (Fonte Ajustada)

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function BotaoAlerta({ onPress, titulo, disabled, style }) {
  return (
    <TouchableOpacity style={[styles.botao, disabled && styles.botaoDesabilitado, style]} onPress={onPress} disabled={disabled}>
      <Text style={styles.textoBotao}>{titulo}</Text>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  botao: { width: '100%', height: 50, backgroundColor: '#dc3545', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  textoBotao: {
    color: '#fff',
    // --- MUDANÇA AQUI: Diminuímos a fonte ---
    fontSize: 16, 
    fontWeight: 'bold',
    textAlignVertical: 'center',
    textAlign: 'center', // Garante centralização horizontal
  },
  botaoDesabilitado: { backgroundColor: '#a9a9a9' },
});