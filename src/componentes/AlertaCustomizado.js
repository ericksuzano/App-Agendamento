import React, { useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, BackHandler } from "react-native";
import { colors } from "../styles/globalStyles";

// Mapeia a cor do botão pelo rótulo
const mapCorPorRotulo = (texto = "") => {
  const t = (texto || "").trim().toLowerCase();
  const azuis = ["sim", "ok", "confirmar", "prosseguir", "entendi"];
  const vermelhos = ["não", "nao", "cancelar", "fechar", "voltar"];
  if (azuis.includes(t)) return colors.primary; // azul
  if (vermelhos.includes(t)) return colors.danger; // vermelho
  return colors.primary;
};

export default function AlertaCustomizado({
  visivel = false,
  titulo,
  mensagem,
  botoes = [],
  onClose,
}) {
  // botao "voltar" (Android)
  useEffect(() => {
    if (!visivel) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose?.();
      return true;
    });
    return () => sub.remove();
  }, [visivel, onClose]);

  return (
    <Modal
      transparent
      visible={visivel}
      animationType="fade"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      statusBarTranslucent
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
        accessible
        accessibilityRole="alert"
        accessibilityLabel={titulo || "Alerta"}
        accessibilityHint="Janela de confirmação"
      >
        {/* Card */}
        <View
          style={{
            width: "100%",
            maxWidth: 420,
            borderRadius: 12,
            backgroundColor: colors.white,
            padding: 20,
          }}
        >
          {/* linha do título + botão X */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            {titulo ? (
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: colors.textDark,
                  flex: 1,
                  paddingRight: 8,
                }}
                accessibilityRole="header"
              >
                {titulo}
              </Text>
            ) : (
              <View style={{ flex: 1 }} />
            )}

            {/* botao X (fechar) */}
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "transparent",
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={{ color: colors.muted, fontSize: 20 }}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Mensagem */}
          {mensagem ? (
            <Text
              style={{
                fontSize: 16,
                color: colors.textDark,
                marginBottom: 12,
              }}
            >
              {mensagem}
            </Text>
          ) : null}

          {/* Ações centralizadas */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
              marginTop: 4,
            }}
          >
            {botoes.map((b, idx) => {
              const cor = mapCorPorRotulo(b.text);
              const outline = b.style === "outline";
              return (
                <TouchableOpacity
                  key={`${b.text}-${idx}`}
                  onPress={b.onPress}
                  accessibilityRole="button"
                  accessibilityLabel={b.text}
                  style={[
                    {
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      backgroundColor: outline ? "transparent" : cor,
                      borderWidth: outline ? 1 : 0,
                      borderColor: outline ? cor : "transparent",
                      minWidth: 120,
                      alignItems: "center",
                      marginHorizontal: 6,
                      marginTop: 8,
                    },
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    style={{
                      color: outline ? cor : colors.white,
                      fontWeight: "700",
                    }}
                  >
                    {b.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}
