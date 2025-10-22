import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function agendarNotificacaoLembrete(data, hora) {
  // se a plataforma for web, avisa no console e para a função
  if (Platform.OS === "web") {
    console.log(
      "Agendamento de notificação não é suportado na web. Ignorando."
    );
    return;
  }

  // O resto do código só será executado se não for web

  // pedir permissão
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    alert("Você precisa habilitar as notificações para receber lembretes!");
    return;
  }

  // calculaa a data do lembrete (um dia antes do agendamento às 9h da manhã)
  const [ano, mes, dia] = data.split("-").map(Number);
  const dataAgendamento = new Date(ano, mes - 1, dia);
  dataAgendamento.setDate(dataAgendamento.getDate() - 1);
  dataAgendamento.setHours(9, 0, 0, 0);

  const trigger = dataAgendamento;

  // 3. agendar a notificacao
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Lembrete de Agendamento 👣",
        body: `Não se esqueça da sua consulta amanhã às ${hora}!`,
      },
      trigger,
    });
    console.log("Notificação de lembrete agendada para:", trigger);
  } catch (error) {
    console.error("Erro ao agendar notificação: ", error);
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
}
