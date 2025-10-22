import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, firestore } from "../configuracaoFirebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useConexao } from "../contexto/ContextoConexao";
import InputPadrao from "../componentes/InputPadrao";
import BotaoPrincipal from "../componentes/BotaoPrincipal";
import AlertaCustomizado from "../componentes/AlertaCustomizado";

import globalStyles, { colors, cadastroStyles } from "../styles/globalStyles";

export default function TelaCadastro({ navigation }) {
  const { estaConectado } = useConexao();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const [configAlerta, setConfigAlerta] = useState({ visivel: false });

  const handleCadastro = async () => {
    if (!estaConectado) {
      /* alerta offline */ return;
    }
    if (!nome || !email || !senha || !telefone) {
      setConfigAlerta({
        visivel: true,
        titulo: "Atenção",
        mensagem: "Por favor, preencha todos os campos.",
        botoes: [
          { text: "OK", onPress: () => setConfigAlerta({ visivel: false }) },
        ],
      });
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        senha
      );
      const user = userCredential.user;
      await setDoc(doc(firestore, "usuarios", user.uid), {
        nome: nome,
        email: email,
        telefone: telefone,
        cargo: "cliente",
      });
      setConfigAlerta({
        visivel: true,
        titulo: "Sucesso!",
        mensagem: "Sua conta foi criada. Você já pode fazer o login.",
        botoes: [
          {
            text: "OK",
            onPress: () => {
              setConfigAlerta({ visivel: false });
              navigation.navigate("TelaLogin");
            },
          },
        ],
      });
    } catch (error) {
      console.error("Erro no cadastro: ", error);
      setConfigAlerta({
        visivel: true,
        titulo: "Erro",
        mensagem:
          "Não foi possível criar a conta. Verifique os dados e tente novamente.",
        botoes: [
          { text: "OK", onPress: () => setConfigAlerta({ visivel: false }) },
        ],
      });
    }
  };

  return (
    <SafeAreaView style={cadastroStyles.container}>
      {!estaConectado && (
        <Text style={cadastroStyles.offlineText}>Você está offline</Text>
      )}
      <Text style={cadastroStyles.titulo}>Crie sua Conta</Text>

      <InputPadrao
        placeholder="Nome Completo"
        value={nome}
        onChangeText={setNome}
        autoCapitalize="words"
      />
      <InputPadrao
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <InputPadrao
        placeholder="Telefone (com DDD)"
        value={telefone}
        onChangeText={setTelefone}
        keyboardType="phone-pad" // teclado numérico
      />

      <InputPadrao
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      <BotaoPrincipal
        titulo="Cadastrar"
        onPress={handleCadastro}
        disabled={!estaConectado}
      />

      <TouchableOpacity onPress={() => navigation.navigate("TelaLogin")}>
        <Text style={cadastroStyles.link}>Já tem uma conta? Faça Login</Text>
      </TouchableOpacity>

      <AlertaCustomizado
        {...configAlerta}
        onClose={() => setConfigAlerta({ visivel: false })}
      />
    </SafeAreaView>
  );
}
