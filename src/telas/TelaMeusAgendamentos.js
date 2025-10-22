import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  SectionList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useConexao } from "../contexto/ContextoConexao";
import { auth, firestore } from "../configuracaoFirebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  writeBatch,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import AlertaCustomizado from "../componentes/AlertaCustomizado";
import BotaoAlerta from "../componentes/BotaoAlerta";
import { Ionicons } from "@expo/vector-icons";

import {
  colors,
  meusAgendamentosStyles as styles,
} from "../styles/globalStyles";

export default function TelaMeusAgendamentos() {
  const { estaConectado } = useConexao();
  const [secoesDeAgendamentos, setSecoesDeAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [configAlerta, setConfigAlerta] = useState({ visivel: false });

  const temHistorico = secoesDeAgendamentos.some(
    (secao) => secao.title === "Histórico de Consultas"
  );

  const buscarAgendamentos = async () => {
    try {
      const usuario = auth.currentUser;
      if (usuario) {
        const q = query(
          collection(firestore, "agendamentos"),
          where("userId", "==", usuario.uid)
        );
        const querySnapshot = await getDocs(q);
        const listaAgendamentos = querySnapshot.docs.map((ag) => ({
          id: ag.id,
          ...ag.data(),
        }));

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const proximos = [];
        const historico = [];

        listaAgendamentos.forEach((agendamento) => {
          const [ano, mes, dia] = agendamento.data.split("-").map(Number);
          const dataAgendamento = new Date(ano, mes - 1, dia);

          if (
            dataAgendamento < hoje ||
            agendamento.status === "cancelado" ||
            agendamento.atendido === true
          ) {
            historico.push(agendamento);
          } else {
            proximos.push(agendamento);
          }
        });

        proximos.sort(
          (a, b) =>
            new Date(`${a.data}T${a.hora}`) - new Date(`${b.data}T${b.hora}`)
        );
        historico.sort(
          (a, b) =>
            new Date(`${b.data}T${b.hora}`) - new Date(`${a.data}T${a.hora}`)
        );

        const secoes = [];
        if (proximos.length > 0) {
          secoes.push({ title: "Próximos Agendamentos", data: proximos });
        }
        if (historico.length > 0) {
          secoes.push({ title: "Histórico de Consultas", data: historico });
        }

        setSecoesDeAgendamentos(secoes);
      }
    } catch (error) {
      console.error("Erro ao buscar agendamentos: ", error);
      setConfigAlerta({
        visivel: true,
        titulo: "Erro",
        mensagem: "Não foi possível carregar seus agendamentos.",
        botoes: [
          { text: "OK", onPress: () => setConfigAlerta({ visivel: false }) },
        ],
      });
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (estaConectado) {
        setCarregando(true);
        buscarAgendamentos();
      } else {
        setCarregando(false);
        setSecoesDeAgendamentos([]);
      }
    }, [estaConectado])
  );

  const onRefresh = () => {
    if (estaConectado) {
      setAtualizando(true);
      buscarAgendamentos();
    }
  };

  const handleCancelarAgendamento = (agendamentoId) => {
    if (!estaConectado) {
      setConfigAlerta({
        visivel: true,
        titulo: "Sem Conexão",
        mensagem: "Você precisa de internet para cancelar.",
        botoes: [
          { text: "OK", onPress: () => setConfigAlerta({ visivel: false }) },
        ],
      });
      return;
    }

    const executarCancelamento = async () => {
      setSecoesDeAgendamentos((prevSecoes) =>
        prevSecoes.map((secao) => ({
          ...secao,
          data: secao.data.map((ag) =>
            ag.id === agendamentoId
              ? { ...ag, status: "cancelado", canceladoPor: "cliente" }
              : ag
          ),
        }))
      );
      buscarAgendamentos();

      try {
        const agendamentoRef = doc(firestore, "agendamentos", agendamentoId);
        await updateDoc(agendamentoRef, {
          status: "cancelado",
          canceladoPor: "cliente",
          canceladoEm: serverTimestamp(),
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
        console.error("Erro ao cancelar: ", error);
        setConfigAlerta({
          visivel: true,
          titulo: "Erro",
          mensagem: "Não foi possível cancelar.",
          botoes: [
            { text: "OK", onPress: () => setConfigAlerta({ visivel: false }) },
          ],
        });
        buscarAgendamentos();
      }
    };

    setConfigAlerta({
      visivel: true,
      titulo: "Cancelar Agendamento",
      mensagem: "Você tem certeza que deseja cancelar este agendamento?",
      botoes: [
        {
          text: "Sim, cancelar",
          style: "alerta",
          onPress: () => {
            setConfigAlerta({ visivel: false });
            executarCancelamento();
          },
        },
        { text: "Não", onPress: () => setConfigAlerta({ visivel: false }) },
      ],
    });
  };

  const handleLimparHistorico = async () => {
    if (!estaConectado) {
      setConfigAlerta({
        visivel: true,
        titulo: "Sem Conexão",
        mensagem: "Você precisa de internet para limpar o histórico.",
        botoes: [
          { text: "OK", onPress: () => setConfigAlerta({ visivel: false }) },
        ],
      });
      return;
    }

    const executarLimpeza = async () => {
      setCarregando(true);
      try {
        const usuario = auth.currentUser;
        if (!usuario) {
          throw new Error("Usuário não encontrado");
        }
        const hoje = new Date().toISOString().split("T")[0];

        const qPassados = query(
          collection(firestore, "agendamentos"),
          where("userId", "==", usuario.uid),
          where("data", "<", hoje)
        );
        const qCancelados = query(
          collection(firestore, "agendamentos"),
          where("userId", "==", usuario.uid),
          where("status", "==", "cancelado")
        );
        const qAtendidos = query(
          collection(firestore, "agendamentos"),
          where("userId", "==", usuario.uid),
          where("atendido", "==", true)
        );

        const [passadosSnapshot, canceladosSnapshot, atendidosSnapshot] =
          await Promise.all([
            getDocs(qPassados),
            getDocs(qCancelados),
            getDocs(qAtendidos),
          ]);

        const idsParaDeletar = new Set();
        passadosSnapshot.forEach((doc) => idsParaDeletar.add(doc.id));
        canceladosSnapshot.forEach((doc) => idsParaDeletar.add(doc.id));
        atendidosSnapshot.forEach((doc) => idsParaDeletar.add(doc.id));

        if (idsParaDeletar.size === 0) {
          setConfigAlerta({
            visivel: true,
            titulo: "Informação",
            mensagem: "Nenhum histórico encontrado para limpar.",
            botoes: [
              {
                text: "OK",
                onPress: () => setConfigAlerta({ visivel: false }),
              },
            ],
          });
          setCarregando(false);
          return;
        }

        const batch = writeBatch(firestore);
        idsParaDeletar.forEach((id) => {
          batch.delete(doc(firestore, "agendamentos", id));
        });
        await batch.commit();

        setConfigAlerta({
          visivel: true,
          titulo: "Sucesso",
          mensagem: "Histórico de consultas limpo.",
          botoes: [
            { text: "OK", onPress: () => setConfigAlerta({ visivel: false }) },
          ],
        });
        buscarAgendamentos();
      } catch (error) {
        console.error("Erro ao limpar histórico: ", error);
        setConfigAlerta({
          visivel: true,
          titulo: "Erro",
          mensagem: "Não foi possível limpar o histórico.",
          botoes: [
            { text: "OK", onPress: () => setConfigAlerta({ visivel: false }) },
          ],
        });
      } finally {
        setCarregando(false);
      }
    };

    setConfigAlerta({
      visivel: true,
      titulo: "Limpar Histórico",
      mensagem:
        "Tem certeza que deseja apagar permanentemente todo o seu histórico de consultas?",
      botoes: [
        {
          text: "Sim, apagar",
          style: "alerta",
          onPress: () => {
            setConfigAlerta({ visivel: false });
            executarLimpeza();
          },
        },
        { text: "Não", onPress: () => setConfigAlerta({ visivel: false }) },
      ],
    });
  };

  const renderItem = ({ item }) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const [ano, mes, dia] = item.data.split("-").map(Number);
    const dataAgendamento = new Date(ano, mes - 1, dia);

    const dataFormatada = dataAgendamento.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });

    const dataFormatadaCapitalizada =
      dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);

    const isAtendido = item.atendido === true;
    const isCancelado = item.status === "cancelado";
    const podeCancelar = dataAgendamento >= hoje && !isCancelado && !isAtendido;

    let estiloTextoItem = null;
    if (isCancelado) {
      estiloTextoItem = styles.textoCancelado;
    } else if (isAtendido) {
      estiloTextoItem = styles.textoAtendido;
    }

    return (
      <View
        style={[
          styles.itemContainer,
          isCancelado && styles.itemCancelado,
          isAtendido && styles.itemAtendido,
        ]}
      >
        <View style={styles.dadosAgendamento}>
          <Text style={[styles.itemData, estiloTextoItem]}>
            {dataFormatadaCapitalizada}
          </Text>
          <Text style={[styles.itemHora, estiloTextoItem]}>
            Hora: {item.hora}
          </Text>
          {isCancelado &&
            item.canceladoPor === "psicologo" &&
            item.motivoCancelamento && (
              <Text style={styles.motivoCancelamento}>
                Motivo (Psicólogo): {item.motivoCancelamento}
              </Text>
            )}
          {isCancelado && item.canceladoPor === "cliente" && (
            <Text style={styles.motivoCancelamento}>Cancelado por você.</Text>
          )}
        </View>
        {podeCancelar ? (
          <TouchableOpacity
            style={[
              styles.botaoCancelar,
              !estaConectado && styles.botaoDesabilitado,
            ]}
            onPress={() => handleCancelarAgendamento(item.id)}
            disabled={!estaConectado}
          >
            <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
          </TouchableOpacity>
        ) : isCancelado ? (
          <Ionicons
            name="close-circle"
            size={30}
            color={colors.danger}
            style={styles.iconeStatus}
          />
        ) : isAtendido ? (
          <Ionicons
            name="checkmark-circle"
            size={30}
            color={colors.success}
            style={styles.iconeStatus}
          />
        ) : null}
      </View>
    );
  };

  // tela de carrgeamento inicial
  if (carregando && !atualizando) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  // carregamento principal da tela
  return (
    <SafeAreaView style={styles.container}>
      {!estaConectado && (
        <Text style={styles.offlineText}>Você está offline</Text>
      )}
      <SectionList
        sections={secoesDeAgendamentos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.header}>{title}</Text>
        )}
        ListEmptyComponent={
          <Text style={styles.textoVazio}>
            {!estaConectado
              ? "Conecte-se para ver seus agendamentos."
              : "Você não possui agendamentos marcados."}
          </Text>
        }
        refreshControl={
          <RefreshControl refreshing={atualizando} onRefresh={onRefresh} />
        }
        stickySectionHeadersEnabled={false}
        ListFooterComponent={
          temHistorico ? (
            <BotaoAlerta
              titulo="Limpar Histórico"
              onPress={handleLimparHistorico}
              disabled={!estaConectado || carregando}
              style={{ marginBottom: 20, marginTop: 10, width: "100%" }}
            />
          ) : null
        }
        contentContainerStyle={styles.listContentContainer}
      />
      <AlertaCustomizado
        {...configAlerta}
        onClose={() => setConfigAlerta({ visivel: false })}
      />
    </SafeAreaView>
  );
}
