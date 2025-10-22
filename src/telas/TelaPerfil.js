import React, { useState, useEffect } from "react";
import { Text, View, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useConexao } from "../contexto/ContextoConexao";
import { auth, firestore } from "../configuracaoFirebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import BotaoAlerta from "../componentes/BotaoAlerta";

import { colors, perfilStyles as styles } from "../styles/globalStyles";

export default function TelaPerfil() {
  const { estaConectado } = useConexao();
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [emailUsuario, setEmailUsuario] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const buscarDadosUsuario = async () => {
      try {
        const usuario = auth.currentUser;
        if (usuario) {
          setEmailUsuario(usuario.email);
          const userDocRef = doc(firestore, "usuarios", usuario.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setNomeUsuario(userDocSnap.data().nome);
          } else {
            console.log("Documento do usuário não encontrado no Firestore!");
            setNomeUsuario("Nome não encontrado");
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        setNomeUsuario("Erro ao buscar nome");
        Alert.alert("Erro", "Não foi possível carregar os dados do perfil.");
      } finally {
        setCarregando(false);
      }
    };

    buscarDadosUsuario();
  }, []);

  const handleLogout = async () => {
    if (!estaConectado) {
      Alert.alert(
        "Sem Conexão",
        "Você precisa de internet para sair da sua conta."
      );
      return;
    }
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao fazer logout: ", error);
      Alert.alert("Erro", "Não foi possível sair.");
    }
  };

  if (carregando) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {!estaConectado && (
        <Text style={styles.offlineText}>Você está offline.</Text>
      )}
      <Text style={styles.titulo}>Meu Perfil</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Nome:</Text>
        <Text style={styles.valor}>{nomeUsuario}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>E-mail:</Text>
        <Text style={styles.valor}>{emailUsuario}</Text>
      </View>
      <BotaoAlerta
        titulo="Sair"
        onPress={handleLogout}
        disabled={!estaConectado}
      />
    </SafeAreaView>
  );
}
