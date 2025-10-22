import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { firestore } from "../configuracaoFirebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  documentId,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import ModalMotivoCancelamento from "../componentes/ModalMotivoCancelamento";
import { useConexao } from "../contexto/ContextoConexao";
import AlertaCustomizado from "../componentes/AlertaCustomizado";
import { Ionicons } from "@expo/vector-icons";

import globalStyles, {
  colors,
  agendaPsicologoStyles,
} from "../styles/globalStyles";

import { formatarDataBR } from "../utilitarios/data";

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

export default function TelaAgendaPsicologo() {
  const { estaConectado } = useConexao();
  const [diaSelecionado, setDiaSelecionado] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [agendamentosDoDia, setAgendamentosDoDia] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const [configAlerta, setConfigAlerta] = useState({ visivel: false });
  const [modalCancelamentoVisivel, setModalCancelamentoVisivel] =
    useState(false);
  const [idParaCancelar, setIdParaCancelar] = useState(null);

  // efeito para buscar agendamentos quando o dia ou conexão mudam
  useEffect(() => {
    if (estaConectado) {
      buscarAgendamentosDoDia(diaSelecionado);
    } else {
      // limpa a lista se estiver offline
      setAgendamentosDoDia([]);
      setCarregando(false); // garante que o loading pare se ficar offline
    }
  }, [diaSelecionado, estaConectado]);

  // funcao para buscar agendamentos e dados dos clientes
  const buscarAgendamentosDoDia = async (data) => {
    setCarregando(true);
    setAgendamentosDoDia([]);
    try {
      const qAgendamentos = query(
        collection(firestore, "agendamentos"),
        where("data", "==", data),
        orderBy("hora", "asc")
      );
      const agendamentosSnapshot = await getDocs(qAgendamentos);
      const agendamentos = agendamentosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (agendamentos.length === 0) {
        setCarregando(false);
        return; // sai se não houver agendamentos
      }

      // busca os dados dos usuarios associados aos agendamentos
      const userIds = [...new Set(agendamentos.map((ag) => ag.userId))];
      const qUsuarios = query(
        collection(firestore, "usuarios"),
        where(documentId(), "in", userIds)
      );
      const usuariosSnapshot = await getDocs(qUsuarios);

      const dadosUsuarios = {};
      usuariosSnapshot.forEach((doc) => {
        dadosUsuarios[doc.id] = {
          nome: doc.data().nome,
          email: doc.data().email,
          telefone: doc.data().telefone || "Não informado", // pega o telefone
        };
      });

      // combina os dados dos agendamentos com os dados dos usuários
      const agendamentosCompletos = agendamentos.map((ag) => ({
        ...ag,
        nomeCliente: dadosUsuarios[ag.userId]?.nome || "Cliente?",
        emailCliente: dadosUsuarios[ag.userId]?.email || "?",
        telefoneCliente: dadosUsuarios[ag.userId]?.telefone || "?", // add o tel
      }));

      setAgendamentosDoDia(agendamentosCompletos);
    } catch (error) {
      console.error("Erro ao buscar agendamentos: ", error);
      setConfigAlerta({
        visivel: true,
        titulo: "Erro",
        mensagem: "Não foi possível carregar a agenda.",
        botoes: [
          { text: "OK", onPress: () => setConfigAlerta({ visivel: false }) },
        ],
      });
    } finally {
      setCarregando(false);
    }
  };

  // funcao que marca um agendamento como atendido
  const handleConfirmarAtendimento = async (agendamentoId) => {
    if (!estaConectado) {
      setConfigAlerta({
        visivel: true,
        titulo: "Sem Conexão",
        mensagem: "Você precisa de internet para confirmar.",
        botoes: [
          { text: "OK", onPress: () => setConfigAlerta({ visivel: false }) },
        ],
      });
      return;
    }

    setAgendamentosDoDia((prevAgendamentos) =>
      prevAgendamentos.map((ag) =>
        ag.id === agendamentoId ? { ...ag, atendido: true } : ag
      )
    );

    try {
      const agendamentoRef = doc(firestore, "agendamentos", agendamentoId);
      await updateDoc(agendamentoRef, { atendido: true });
    } catch (error) {
      console.error("Erro ao confirmar atendimento: ", error);
      setConfigAlerta({
        visivel: true,
        titulo: "Erro",
        mensagem: "Não foi possível confirmar o atendimento.",
        botoes: [
          { text: "OK", onPress: () => setConfigAlerta({ visivel: false }) },
        ],
      });
      setAgendamentosDoDia((prevAgendamentos) =>
        prevAgendamentos.map((ag) =>
          ag.id === agendamentoId ? { ...ag, atendido: false } : ag
        )
      );
    }
  };

  // funcao para abrir o modal de motivo de cancelamento
  const handleAbrirModalCancelamento = (agendamentoId) => {
    setIdParaCancelar(agendamentoId);
    setModalCancelamentoVisivel(true);
  };

  // funcao chamada pelo modal de motivo para confirmar o cancelamento no Firestore
  const handleConfirmarCancelamento = async (motivo) => {
    if (!estaConectado || !idParaCancelar) {
      return;
    }

    setAgendamentosDoDia((prev) =>
      prev.map((ag) =>
        ag.id === idParaCancelar
          ? { ...ag, status: "cancelado", atendido: false }
          : ag
      )
    );
    setModalCancelamentoVisivel(false);

    try {
      const agendamentoRef = doc(firestore, "agendamentos", idParaCancelar);
      await updateDoc(agendamentoRef, {
        status: "cancelado",
        motivoCancelamento: motivo,
        canceladoPor: "profissional",
        canceladoEm: serverTimestamp(),
        atendido: false,
      });
      setConfigAlerta({
        visivel: true,
        titulo: "Sucesso",
        mensagem: "Agendamento cancelado.",
        botoes: [
          { text: "OK", onPress: () => setConfigAlerta({ visivel: false }) },
        ],
      });
    } catch (error) {
      console.error("Erro ao cancelar agendamento: ", error);
      setConfigAlerta({
        visivel: true,
        titulo: "Erro",
        mensagem: "Não foi possível cancelar o agendamento.",
        botoes: [
          { text: "OK", onPress: () => setConfigAlerta({ visivel: false }) },
        ],
      });
      // Reverte UI otimista
      setAgendamentosDoDia((prev) =>
        prev.map((ag) =>
          ag.id === idParaCancelar ? { ...ag, status: undefined } : ag
        )
      );
    } finally {
      setIdParaCancelar(null);
    }
  };

  // funcao chamada pelo onLongPress para mostrar detalhes do cliente
  const handleVerDetalhes = (item) => {
    setConfigAlerta({
      visivel: true,
      titulo: "Detalhes do Cliente",
      mensagem: `Nome: ${item.nomeCliente}\nE-mail: ${item.emailCliente}\nTelefone: ${item.telefoneCliente}`,
      botoes: [
        { text: "OK", onPress: () => setConfigAlerta({ visivel: false }) },
      ],
    });
  };

  // funcao chamada pelo onPress (toque curto) em um item pendente
  const handleAcoesAgendamento = (item) => {
    if (item.atendido || item.status === "cancelado" || !estaConectado) {
      return; // nao faz nada se ja foi finalizado ou offline
    }
    setConfigAlerta({
      visivel: true,
      titulo: `Agendamento ${item.hora}`,
      mensagem: `Cliente: ${item.nomeCliente}\n\nO que deseja fazer?`,
      botoes: [
        {
          text: "Confirmar Atendimento",
          onPress: () => {
            setConfigAlerta({ visivel: false });
            handleConfirmarAtendimento(item.id);
          },
        },
        {
          text: "Cancelar",
          style: "alerta",
          onPress: () => {
            setConfigAlerta({ visivel: false });
            handleAbrirModalCancelamento(item.id);
          },
        },
      ],
    });
  };

  // renderiza cada item da lista de agendamentos
  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleAcoesAgendamento(item)} // toque curto -> abre o menu de ações
      onLongPress={() => handleVerDetalhes(item)} // toque longo -> mostra detalhes
      delayLongPress={500}
      disabled={!estaConectado} // desabilita o toque se offline!!!
      style={[
        agendaPsicologoStyles.itemContainer,
        item.atendido && agendaPsicologoStyles.itemAtendido,
        item.status === "cancelado" && agendaPsicologoStyles.itemCancelado,
        (!estaConectado || item.status === "cancelado" || item.atendido) &&
          agendaPsicologoStyles.itemDesabilitado,
      ]}
    >
      {/* Dados do Agendamento */}
      <View style={agendaPsicologoStyles.dadosAgendamento}>
        <Text
          style={[
            agendaPsicologoStyles.itemHora,
            item.status === "cancelado" && agendaPsicologoStyles.textoCancelado,
          ]}
        >
          {item.hora}
        </Text>
        <Text
          style={[
            agendaPsicologoStyles.itemNomeCliente,
            item.status === "cancelado" && agendaPsicologoStyles.textoCancelado,
          ]}
        >
          {item.nomeCliente}
        </Text>
        {item.status === "cancelado" && item.motivoCancelamento && (
          <Text style={agendaPsicologoStyles.motivoCancelamento}>
            Motivo: {item.motivoCancelamento}
          </Text>
        )}
      </View>

      {/* Ícone de Status */}
      {item.status === "cancelado" ? (
        <Ionicons
          name="close-circle"
          size={30}
          color={colors.danger}
          style={agendaPsicologoStyles.iconeStatus}
        />
      ) : item.atendido ? (
        <Ionicons
          name="checkmark-circle"
          size={30}
          color={colors.success}
          style={agendaPsicologoStyles.iconeStatus}
        />
      ) : (
        <Text style={agendaPsicologoStyles.textoAcaoPendente}>Pendente</Text>
      )}
    </TouchableOpacity>
  );

  // ——— Renderização Principal ———
  return (
    <SafeAreaView style={globalStyles.container}>
      {!estaConectado && (
        <Text style={globalStyles.offlineText}>Você está offline</Text>
      )}
      {/* Calendário */}
      <Calendar
        onDayPress={(day) => setDiaSelecionado(day.dateString)}
        markedDates={{
          [diaSelecionado]: { selected: true, selectedColor: colors.success },
        }}
        theme={{ todayTextColor: colors.success, arrowColor: colors.success }}
      />
      {/* Lista de Agendamentos */}
      <View style={agendaPsicologoStyles.listaContainer}>
        <Text style={agendaPsicologoStyles.tituloLista}>
          Agenda para {formatarDataBR(diaSelecionado)}
        </Text>
        {carregando ? (
          <ActivityIndicator size="large" color={colors.success} />
        ) : (
          <FlatList
            data={agendamentosDoDia}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <Text style={agendaPsicologoStyles.textoVazio}>
                {!estaConectado
                  ? "Conecte-se para ver a agenda."
                  : "Nenhum horário agendado."}
              </Text>
            }
            extraData={agendamentosDoDia} // garante o carregamento de novo ao mudar status
          />
        )}
      </View>

      {/* modais (so sao carregados quando precisa) */}
      <ModalMotivoCancelamento
        visivel={modalCancelamentoVisivel}
        onClose={() => setModalCancelamentoVisivel(false)}
        onConfirmar={handleConfirmarCancelamento}
      />
      <AlertaCustomizado
        {...configAlerta}
        onClose={() => setConfigAlerta({ visivel: false })}
      />
    </SafeAreaView>
  );
}
