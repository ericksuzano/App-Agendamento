import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

export default function BotaoPrincipal({
  onPress,
  titulo,
  disabled,
  style,
  loading,
}) {
  return (
    <TouchableOpacity
      style={[styles.botao, disabled && styles.botaoDesabilitado, style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.textoBotao}>{titulo}</Text>
      )}
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  botao: {
    width: "100%",
    height: 50,
    backgroundColor: "#007bff",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  textoBotao: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlignVertical: "center",
    textAlign: "center",
  },
  botaoDesabilitado: { backgroundColor: "#a9a9a9" },
});
