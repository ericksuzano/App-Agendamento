import React, { useState } from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity } from "react-native";
import InputPadrao from "./InputPadrao";
import BotaoPrincipal from "./BotaoPrincipal";
import BotaoAlerta from "./BotaoAlerta";
import { useConexao } from "../contexto/ContextoConexao";

export default function ModalMotivoCancelamento({
  visivel,
  onClose,
  onConfirmar,
}) {
  const { estaConectado } = useConexao();
  const [motivo, setMotivo] = useState("");

  const handleConfirmar = () => {
    if (!motivo.trim()) {
      alert("Por favor, insira um motivo para o cancelamento.");
      return;
    }
    onConfirmar(motivo);
    setMotivo("");
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visivel}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.containerModal}>
          <Text style={styles.titulo}>Motivo do Cancelamento</Text>
          <InputPadrao
            placeholder="Digite o motivo aqui..."
            value={motivo}
            onChangeText={setMotivo}
            multiline
            numberOfLines={4}
            style={{ height: 100, textAlignVertical: "top", width: "100%" }}
          />
          <View style={[styles.containerBotoes, { gap: 10 }]}>
            <BotaoAlerta
              titulo="Confirmar Cancelamento"
              onPress={handleConfirmar}
              disabled={!estaConectado}
              style={{ flex: 1 }}
            />
            <BotaoPrincipal
              titulo="Voltar"
              onPress={onClose}
              style={{ flex: 1, backgroundColor: "#6c757d" }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  containerModal: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  containerBotoes: {
    flexDirection: "row",
    width: "100%",
    marginTop: 15,
  },
});
