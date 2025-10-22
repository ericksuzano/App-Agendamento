import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, LocaleConfig } from "react-native-calendars";
import * as CalendarExpo from "expo-calendar";
import { auth, firestore } from "../configuracaoFirebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { agendarNotificacaoLembrete } from "../servicos/servicoNotificacao";
import { useConexao } from "../contexto/ContextoConexao";
import AlertaCustomizado from "../componentes/AlertaCustomizado";

import globalStyles, { colors } from "../styles/globalStyles";

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

export default function TelaAgendamento() {
  const { estaConectado } = useConexao();
  const [diaSelecionado, setDiaSelecionado] = useState("");
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [configAlerta, setConfigAlerta] = useState({ visivel: false });

  useEffect(() => {
    if (diaSelecionado && estaConectado) {
      buscarHorariosDisponiveis(diaSelecionado);
    } else {
      setHorariosDisponiveis([]);
    }
  }, [diaSelecionado, estaConectado]);

  const buscarHorariosDisponiveis = async (data) => {
    setCarregando(true);
    setHorariosDisponiveis([]);
    try {
      const qAgendamentos = query(
        collection(firestore, "agendamentos"),
        where("data", "==", data)
      );
      const qBloqueios = query(
        collection(firestore, "horarios_bloqueados"),
        where("data", "==", data)
      );
      const [agendamentosSnapshot, bloqueiosSnapshot] = await Promise.all([
        getDocs(qAgendamentos),
        getDocs(qBloqueios),
      ]);
      let diaInteiroBloqueado = false;
      const horariosBloqueados = [];
      bloqueiosSnapshot.forEach((doc) => {
        if (doc.data().tipo === "DIA_INTEIRO") {
          diaInteiroBloqueado = true;
        } else if (doc.data().tipo === "HORARIO_UNICO") {
          horariosBloqueados.push(doc.data().hora);
        }
      });
      if (diaInteiroBloqueado) {
        setHorariosDisponiveis([]);
        setCarregando(false);
        return;
      }

      const horariosAgendados = agendamentosSnapshot.docs
        .map((doc) => doc.data())
        .filter((agendamento) => agendamento.status !== "cancelado")
        .map((agendamento) => agendamento.hora);

      const horariosIndisponiveis = [
        ...new Set([...horariosAgendados, ...horariosBloqueados]),
      ];

      let disponiveis = HORARIOS_DO_DIA.filter(
        (horario) => !horariosIndisponiveis.includes(horario)
      );

      const hoje = new Date();
      const hojeString = hoje.toISOString().split("T")[0];

      if (data === hojeString) {
        const agoraString = hoje.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });

        disponiveis = disponiveis.filter((horario) => horario > agoraString);
      }

      setHorariosDisponiveis(disponiveis);
    } catch (error) {
      console.error("Erro ao buscar horários: ", error);
      setConfigAlerta({
        visivel: true,
        titulo: "Erro",
        mensagem: "Não foi possível carregar os horários.",
        botoes: [
          { text: "OK", onPress: () => setConfigAlerta({ visivel: false }) },
        ],
      });
    } finally {
      setCarregando(false);
    }
  };

  async function adicionarAoCalendario(data, hora) {
    if (Platform.OS === "web") return;
    const { status } = await CalendarExpo.requestCalendarPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Você precisa permitir o acesso ao calendário."
      );
      return;
    }
    const calendars = await CalendarExpo.getCalendarsAsync(
      CalendarExpo.EntityTypes.EVENT
    );
    const defaultCalendar =
      calendars.find((cal) => cal.isPrimary) || calendars[0];
    if (!defaultCalendar) {
      setConfigAlerta({
        visivel: true,
        titulo: "Erro",
        mensagem: "Nenhum calendário encontrado.",
        botoes: [
          { text: "OK", onPress: () => setConfigAlerta({ visivel: false }) },
        ],
      });
      return;
    }
    const dataInicio = new Date(`${data}T${hora}:00`);
    const dataFim = new Date(dataInicio);
    dataFim.setHours(dataInicio.getHours() + 1);
    const detalhesEvento = {
      title: "Sessão Psicólogo",
      startDate: dataInicio,
      endDate: dataFim,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      notes: "Sessão agendada pelo aplicativo.",
    };
    try {
      await CalendarExpo.createEventAsync(defaultCalendar.id, detalhesEvento);
      setConfigAlerta({
        visivel: true,
        titulo: "Sucesso!",
        mensagem: "Agendamento adicionado ao seu calendário.",
        botoes: [
          { text: "OK", onPress: () => setConfigAlerta({ visivel: false }) },
        ],
      });
    } catch (error) {
      console.error("Erro ao criar evento: ", error);
      setConfigAlerta({
        visivel: true,
        titulo: "Erro",
        mensagem: "Não foi possível salvar o evento no calendário.",
        botoes: [
          { text: "OK", onPress: () => setConfigAlerta({ visivel: false }) },
        ],
      });
    }
  }

  const handleAgendarHorario = (hora) => {
    if (!estaConectado) {
      setConfigAlerta({
        visivel: true,
        titulo: "Sem Conexão",
        mensagem: "Você precisa de internet para agendar.",
        botoes: [
          { text: "OK", onPress: () => setConfigAlerta({ visivel: false }) },
        ],
      });
      return;
    }
    const executarAgendamento = async () => {
      const usuario = auth.currentUser;
      if (!usuario) return;
      try {
        await addDoc(collection(firestore, "agendamentos"), {
          userId: usuario.uid,
          data: diaSelecionado,
          hora,
          criadoEm: serverTimestamp(),
          tipoAtendimento: "Presencial",
          motivoConsulta: "Não especificado",
          status: "pendente",
          atendido: false,
        });
        const botoesDeSucesso = [
          {
            text: "Fechar",
            style: "alerta",
            onPress: () => setConfigAlerta({ visivel: false }),
          },
        ];
        if (Platform.OS !== "web") {
          botoesDeSucesso.unshift({
            text: "Adicionar ao Calendário",
            onPress: () => {
              setConfigAlerta({ visivel: false });
              adicionarAoCalendario(diaSelecionado, hora);
            },
          });
        }
        setConfigAlerta({
          visivel: true,
          titulo: "Sucesso!",
          mensagem: "Seu horário foi agendado.",
          botoes: botoesDeSucesso,
        });
        await agendarNotificacaoLembrete(diaSelecionado, hora);
        buscarHorariosDisponiveis(diaSelecionado);
      } catch (error) {
        console.error("Erro ao agendar: ", error);
        setConfigAlerta({
          visivel: true,
          titulo: "Erro",
          mensagem: "Não foi possível completar o agendamento.",
          botoes: [
            { text: "OK", onPress: () => setConfigAlerta({ visivel: false }) },
          ],
        });
      }
    };

    setConfigAlerta({
      visivel: true,
      titulo: "Confirmar Agendamento",
      mensagem: `Você deseja agendar para ${diaSelecionado} às ${hora}?`,
      botoes: [
        {
          text: "Confirmar",
          onPress: () => {
            setConfigAlerta({ visivel: false });
            executarAgendamento();
          },
        },

        {
          text: "Cancelar",
          style: "alerta",
          onPress: () => setConfigAlerta({ visivel: false }),
        },
      ],
    });
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      {!estaConectado && (
        <Text style={globalStyles.offlineText}>Você está offline.</Text>
      )}
      <Text style={globalStyles.instrucaoCalendario}>Selecione uma data</Text>
      <Calendar
        onDayPress={(day) => setDiaSelecionado(day.dateString)}
        markedDates={{
          [diaSelecionado]: { selected: true, selectedColor: colors.primary },
        }}
        minDate={new Date().toISOString().split("T")[0]}
        theme={{ todayTextColor: colors.primary, arrowColor: colors.primary }}
      />
      <View style={globalStyles.containerHorarios}>
        {diaSelecionado ? (
          <Text style={globalStyles.tituloHorarios}>
            Horários para {formatarDataBR(diaSelecionado)}
          </Text>
        ) : null}
        {carregando ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <FlatList
            data={horariosDisponiveis}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  globalStyles.botaoHorario,
                  !estaConectado && globalStyles.botaoHorarioDesabilitado,
                ]}
                onPress={() => handleAgendarHorario(item)}
                disabled={!estaConectado}
              >
                <Text style={globalStyles.textoBotaoHorario}>{item}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              diaSelecionado ? (
                <Text style={globalStyles.textoVazio}>
                  {!estaConectado
                    ? "Conecte-se para ver os horários."
                    : "Nenhum horário disponível."}
                </Text>
              ) : null
            }
            numColumns={3}
          />
        )}
      </View>
      <AlertaCustomizado
        {...configAlerta}
        onClose={() => setConfigAlerta({ ...configAlerta, visivel: false })}
      />
    </SafeAreaView>
  );
}
