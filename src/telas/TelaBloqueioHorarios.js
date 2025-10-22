import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { firestore } from "../configuracaoFirebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import globalStyles, { colors, bloqueioStyles } from "../styles/globalStyles";
import { useConexao } from "../contexto/ContextoConexao";
import AlertaCustomizado from "../componentes/AlertaCustomizado";

LocaleConfig.locales["pt-br"] = {
  monthNames: [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ],
  dayNames: [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ],
  dayNamesShort: ["Dom.", "Seg.", "Ter.", "Qua.", "Qui.", "Sex.", "Sáb."],
  today: "Hoje",
};
LocaleConfig.defaultLocale = "pt-br";

const HORARIOS_DO_DIA = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

export default function TelaBloqueioHorarios() {
  const { estaConectado } = useConexao(); // Hook de conexão
  const [diaSelecionado, setDiaSelecionado] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [bloqueiosDoDia, setBloqueiosDoDia] = useState({
    diaInteiro: false,
    horarios: [],
    docs: {},
  });
  const [carregando, setCarregando] = useState(false);
  const [configAlerta, setConfigAlerta] = useState({ visivel: false });

  useEffect(() => {
    if (estaConectado) {
      buscarBloqueios(diaSelecionado);
    } else {
      setBloqueiosDoDia({ diaInteiro: false, horarios: [], docs: {} });
      setCarregando(false);
    }
  }, [diaSelecionado, estaConectado]);

  const buscarBloqueios = async (data) => {
    setCarregando(true);
    try {
      const bloqueiosRef = collection(firestore, "horarios_bloqueados");
      const q = query(bloqueiosRef, where("data", "==", data));
      const querySnapshot = await getDocs(q);
      let diaInteiroBloqueado = false;
      const horariosBloqueados = [];
      const docRefs = {};
      querySnapshot.forEach((documento) => {
        const dados = documento.data();
        if (dados.tipo === "DIA_INTEIRO") {
          diaInteiroBloqueado = true;
          docRefs.diaInteiro = documento.id;
        } else if (dados.tipo === "HORARIO_UNICO") {
          horariosBloqueados.push(dados.hora);
          docRefs[dados.hora] = documento.id;
        }
      });
      setBloqueiosDoDia({
        diaInteiro: diaInteiroBloqueado,
        horarios: horariosBloqueados,
        docs: docRefs,
      });
    } catch (error) {
      console.error("Erro ao buscar bloqueios: ", error);
      setConfigAlerta({
        visivel: true,
        titulo: "Erro",
        mensagem: "Não foi possível carregar os dados de bloqueio.",
        botoes: [
          { text: "OK", onPress: () => setConfigAlerta({ visivel: false }) },
        ],
      });
    } finally {
      setCarregando(false);
    }
  };

  const handleBloqueio = async (tipo, hora = null) => {
    if (!estaConectado) {
      setConfigAlerta({
        visivel: true,
        titulo: "Sem Conexão",
        mensagem: "Você precisa de internet para bloquear horários.",
        botoes: [
          { text: "OK", onPress: () => setConfigAlerta({ visivel: false }) },
        ],
      });
      return;
    }
    try {
      await addDoc(collection(firestore, "horarios_bloqueados"), {
        data: diaSelecionado,
        tipo,
        hora,
      });
      setConfigAlerta({
        visivel: true,
        titulo: "Sucesso",
        mensagem: `O ${
          tipo === "DIA_INTEIRO" ? "dia" : "horário"
        } foi bloqueado.`,
        botoes: [
          { text: "OK", onPress: () => setConfigAlerta({ visivel: false }) },
        ],
      });
      buscarBloqueios(diaSelecionado);
    } catch (error) {
      console.error("Erro ao bloquear: ", error);
      setConfigAlerta({
        visivel: true,
        titulo: "Erro",
        mensagem: "Não foi possível realizar o bloqueio.",
        botoes: [
          { text: "OK", onPress: () => setConfigAlerta({ visivel: false }) },
        ],
      });
    }
  };

  const handleDesbloqueio = async (tipo, hora = null) => {
    if (!estaConectado) {
      setConfigAlerta({
        visivel: true,
        titulo: "Sem Conexão",
        mensagem: "Você precisa de internet para desbloquear.",
        botoes: [
          { text: "OK", onPress: () => setConfigAlerta({ visivel: false }) },
        ],
      });
      return;
    }
    const docId =
      tipo === "DIA_INTEIRO"
        ? bloqueiosDoDia.docs.diaInteiro
        : bloqueiosDoDia.docs[hora];
    if (!docId) return;
    try {
      await deleteDoc(doc(firestore, "horarios_bloqueados", docId));
      setConfigAlerta({
        visivel: true,
        titulo: "Sucesso",
        mensagem: `O ${
          tipo === "DIA_INTEIRO" ? "dia" : "horário"
        } foi desbloqueado.`,
        botoes: [
          { text: "OK", onPress: () => setConfigAlerta({ visivel: false }) },
        ],
      });
      buscarBloqueios(diaSelecionado);
    } catch (error) {
      console.error("Erro ao desbloquear: ", error);
      setConfigAlerta({
        visivel: true,
        titulo: "Erro",
        mensagem: "Não foi possível remover o bloqueio.",
        botoes: [
          { text: "OK", onPress: () => setConfigAlerta({ visivel: false }) },
        ],
      });
    }
  };

  const renderHorario = ({ item: hora }) => {
    const isBloqueado =
      bloqueiosDoDia.horarios.includes(hora) || bloqueiosDoDia.diaInteiro;
    const isUnicoBloqueado = bloqueiosDoDia.horarios.includes(hora);
    return (
      <View style={bloqueioStyles.itemHorario}>
        <Text
          style={[
            bloqueioStyles.textoHorario,
            isBloqueado && bloqueioStyles.textoBloqueado,
          ]}
        >
          {hora}
        </Text>
        {isBloqueado ? (
          !bloqueiosDoDia.diaInteiro &&
          isUnicoBloqueado && (
            <TouchableOpacity
              style={[
                bloqueioStyles.botaoDesbloquear,
                !estaConectado && bloqueioStyles.botaoDesabilitado,
              ]}
              onPress={() => handleDesbloqueio("HORARIO_UNICO", hora)}
              disabled={!estaConectado}
            >
              <Text style={bloqueioStyles.textoBotao}>Desbloquear</Text>
            </TouchableOpacity>
          )
        ) : (
          <TouchableOpacity
            style={[
              bloqueioStyles.botaoBloquear,
              !estaConectado && bloqueioStyles.botaoDesabilitado,
            ]}
            onPress={() => handleBloqueio("HORARIO_UNICO", hora)}
            disabled={!estaConectado}
          >
            <Text style={bloqueioStyles.textoBotao}>Bloquear</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    // --- 2. SUBSTITUÍDO O <View> POR <SafeAreaView> ---
    // Usamos 'edges' para aplicar a área segura apenas nas laterais e embaixo,
    // pois o header do Stack/Drawer já cuida do topo.
    <SafeAreaView
      style={globalStyles.container}
      edges={["bottom", "left", "right"]}
    >
      {!estaConectado && (
        <Text style={globalStyles.offlineText}>Você está offline</Text>
      )}
      <Calendar
        current={diaSelecionado}
        onDayPress={(day) => setDiaSelecionado(day.dateString)}
        markedDates={{
          [diaSelecionado]: { selected: true, selectedColor: colors.danger },
        }}
        theme={{
          arrowColor: colors.success,
          todayTextColor: colors.success,
          monthTextColor: colors.textDark,
        }}
      />
      <View style={bloqueioStyles.gerenciamentoContainer}>
        {bloqueiosDoDia.diaInteiro ? (
          <TouchableOpacity
            style={[
              bloqueioStyles.botaoDiaInteiroDesbloquear,
              !estaConectado && bloqueioStyles.botaoDesabilitado,
            ]}
            onPress={() => handleDesbloqueio("DIA_INTEIRO")}
            disabled={!estaConectado}
          >
            <Text style={bloqueioStyles.textoBotao}>
              Desbloquear Dia Inteiro
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              bloqueioStyles.botaoDiaInteiroBloquear,
              !estaConectado && bloqueioStyles.botaoDesabilitado,
            ]}
            onPress={() => handleBloqueio("DIA_INTEIRO")}
            disabled={!estaConectado}
          >
            <Text style={bloqueioStyles.textoBotao}>Bloquear Dia Inteiro</Text>
          </TouchableOpacity>
        )}
        {carregando ? (
          <ActivityIndicator size="large" color={colors.text} />
        ) : (
          <FlatList
            data={HORARIOS_DO_DIA}
            renderItem={renderHorario}
            keyExtractor={(item) => item}
            style={bloqueioStyles.lista}
          />
        )}
      </View>
      <AlertaCustomizado
        {...configAlerta}
        onClose={() => setConfigAlerta({ visivel: false })}
      />
    </SafeAreaView>
  );
}
