import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, Alert, BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { auth } from "../configuracaoFirebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useConexao } from "../contexto/ContextoConexao";
import InputPadrao from "../componentes/InputPadrao";
import BotaoPrincipal from "../componentes/BotaoPrincipal";
import AlertaCustomizado from "../componentes/AlertaCustomizado";

import { colors, loginStyles } from "../styles/globalStyles";

export default function TelaLogin({ navigation }) {
  const { estaConectado } = useConexao(); // verifica a conexaoda internet
  const [email, setEmail] = useState(""); // campos do formulario
  const [senha, setSenha] = useState(""); // campos do formulario

  const [configAlerta, setConfigAlerta] = useState({ visivel: false }); // alerta de erro customizado

  const [carregando, setCarregando] = useState(false); // indicador de loading no botao "Entrar"

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert("Sair do Aplicativo", "Você tem certeza que quer sair?", [
          { text: "Cancelar", onPress: () => null, style: "cancel" },
          { text: "Sair", onPress: () => BackHandler.exitApp() }, // fecha o app
        ]);
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => subscription.remove();
    }, [])
  );

  const handleLogin = async () => {
    // verifica conexao
    if (!estaConectado) {
      setConfigAlerta({
        visivel: true,
        titulo: "Sem Conexão",
        mensagem: "Você precisa de internet para fazer o login.",
        botoes: [
          { text: "OK", onPress: () => setConfigAlerta({ visivel: false }) },
        ],
      });
      return;
    }
    // vverifica campos vazios
    if (!email || !senha) {
      setConfigAlerta({
        visivel: true,
        titulo: "Atenção",
        mensagem: "Por favor, preencha e-mail e senha.",
        botoes: [
          { text: "OK", onPress: () => setConfigAlerta({ visivel: false }) },
        ],
      });
      return;
    }

    setCarregando(true); // ativa o indicador de carregando no botao
    try {
      // tenta logar com a auntenticacao do firebase
      await signInWithEmailAndPassword(auth, email, senha);
    } catch (error) {
      // se der erro...
      console.error("Erro no login: ", error);
      setConfigAlerta({
        visivel: true,
        titulo: "Erro",
        mensagem: "E-mail ou senha inválidos.",
        botoes: [
          { text: "OK", onPress: () => setConfigAlerta({ visivel: false }) },
        ],
      });
    } finally {
      // garante que o loading pare
      setCarregando(false);
    }
  };

  return (
    <SafeAreaView style={loginStyles.container}>
      {/* Offline */}
      {!estaConectado && (
        <Text style={loginStyles.offlineText}>Você está offline</Text>
      )}
      {/* Titulo */}
      <Text style={loginStyles.titulo}>Login</Text>

      {/* Campos de Input */}
      <InputPadrao
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <InputPadrao
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry // habilita o olho que esconde ou revela a senha
      />

      <BotaoPrincipal
        titulo="Entrar"
        onPress={handleLogin}
        disabled={!estaConectado}
        loading={carregando}
      />

      {/* Link para a tela de cadastro */}
      <TouchableOpacity onPress={() => navigation.navigate("TelaCadastro")}>
        <Text style={loginStyles.link}>
          Ainda não tem uma conta? Cadastre-se
        </Text>
      </TouchableOpacity>

      <AlertaCustomizado
        {...configAlerta}
        onClose={() => setConfigAlerta({ visivel: false })}
      />
    </SafeAreaView>
  );
}
