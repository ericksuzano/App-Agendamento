import { StyleSheet } from "react-native";

export const colors = {
  // cores base
  primary: "#007bff",
  background: "#ffffff",
  white: "#ffffff",

  // texto
  text: "#333333",
  textDark: "#333333",
  muted: "#666666",

  // estados e feedback
  warning: "#ffc107",
  danger: "#dc3545",
  success: "#28a745",
  info: "#17a2b8",

  // bordas e superficies
  pageBg: "#f5f5f5",
  borderLight: "#eeeeee",
  primaryBorder: "#007bff",

  // itens e estados especificos
  disabled: "#a9a9a9",
  successMuted: "#6c757d",
  cancelText: "#721c24",
  cancelBg: "#f8d7da",
  attendedBg: "#e9ecef",
  itemBg: "#f8f9fa",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
};

export const typography = {
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
};

/* Estilos globais reutilizáveis */
export const globalStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Mensagem offline padrão
  offlineText: {
    backgroundColor: colors.warning,
    color: colors.text,
    textAlign: "center",
    padding: 10,
    fontWeight: "bold",
  },

  // TelaAgendamento (comuns)
  instrucaoCalendario: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    borderColor: colors.primaryBorder,
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  containerHorarios: { flex: 1, padding: 20, alignItems: "center" },
  tituloHorarios: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  botaoHorario: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    margin: 5,
    minWidth: 100,
    alignItems: "center",
  },
  textoBotaoHorario: { color: colors.white, fontWeight: "bold", fontSize: 16 },
  botaoHorarioDesabilitado: { backgroundColor: colors.disabled, opacity: 0.7 },
  textoVazio: { marginTop: 20, fontSize: 16, color: colors.muted },
});

export const screenStyles = {
  agendamento: {
    container: {
      flex: 1,
      backgroundColor: colors.primary + "10",
    },
    dateSelector: {
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: spacing.lg,
      marginVertical: spacing.md,
    },
  },
};

// Agenda do Psicólogo
export const agendaPsicologoStyles = StyleSheet.create({
  listaContainer: { flex: 1, padding: 20 },
  tituloLista: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  itemContainer: {
    backgroundColor: colors.itemBg,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: colors.success,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dadosAgendamento: { flex: 1, marginRight: 10 },
  itemHora: { fontSize: 18, fontWeight: "bold" },
  itemNomeCliente: { fontSize: 16 },
  itemAtendido: {
    backgroundColor: colors.attendedBg,
    borderLeftColor: colors.successMuted,
  },
  itemCancelado: {
    backgroundColor: colors.cancelBg,
    borderLeftColor: colors.danger,
  },
  textoCancelado: {
    textDecorationLine: "line-through",
    color: colors.cancelText,
  },
  motivoCancelamento: {
    fontSize: 12,
    color: colors.cancelText,
    fontStyle: "italic",
    marginTop: 5,
  },
  iconeStatus: { marginLeft: 10 },
  textoAcaoPendente: {
    color: colors.warning,
    fontWeight: "bold",
    marginLeft: 10,
  },
  textoVazio: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: colors.muted,
  },
  itemDesabilitado: { opacity: 0.6 },
});

// Bloqueio de Horários
export const bloqueioStyles = StyleSheet.create({
  gerenciamentoContainer: { flex: 1, padding: 20, alignItems: "center" },
  botaoDiaInteiroBloquear: {
    backgroundColor: colors.danger,
    padding: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  botaoDiaInteiroDesbloquear: {
    backgroundColor: colors.success,
    padding: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  itemHorario: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  textoHorario: { fontSize: 18 },
  textoBloqueado: { textDecorationLine: "line-through", color: "#999" },
  botaoBloquear: {
    backgroundColor: colors.warning,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  botaoDesbloquear: {
    backgroundColor: colors.info,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  textoBotao: { color: colors.white, fontWeight: "bold" },
  lista: { width: "100%", marginTop: 20 },
});

// Cadastro
export const cadastroStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.pageBg,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: colors.textDark,
  },
  link: { marginTop: 20, color: "#007bff", fontSize: 16 },
  offlineText: {
    backgroundColor: colors.warning,
    color: colors.textDark,
    textAlign: "center",
    padding: 10,
    fontWeight: "bold",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
});

// Carregamento
export const carregamentoStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.pageBg,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.textDark,
  },
  spinner: { marginTop: 30 },
});

// Login
export const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.pageBg,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: colors.textDark,
  },
  link: { marginTop: 20, color: "#007bff", fontSize: 16 },
  offlineText: {
    backgroundColor: colors.warning,
    color: colors.textDark,
    textAlign: "center",
    padding: 10,
    fontWeight: "bold",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
});

// Meus Agendamentos
export const meusAgendamentosStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pageBg,
    paddingHorizontal: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.pageBg,
  },
  offlineText: {
    backgroundColor: colors.warning,
    color: colors.textDark,
    textAlign: "center",
    paddingVertical: 10,
    fontWeight: "bold",
    marginHorizontal: -20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.textDark,
    backgroundColor: colors.pageBg,
    paddingTop: 20,
    paddingBottom: 10,
  },
  itemContainer: {
    backgroundColor: colors.white,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dadosAgendamento: { flex: 1, marginRight: 10 },
  itemData: { fontSize: 18, fontWeight: "bold", color: colors.textDark },
  itemHora: { fontSize: 16, marginTop: 5, color: "#555" },
  itemCancelado: { backgroundColor: colors.cancelBg, opacity: 0.7 },
  itemAtendido: {
    backgroundColor: "#e9ecef",
    opacity: 0.8,
  },
  textoHistorico: {
    textDecorationLine: "line-through",
    color: colors.muted,
  },
  textoCancelado: {
    textDecorationLine: "line-through",
    color: colors.cancelText,
  },
  textoAtendido: {
    textDecorationLine: "line-through",
    color: colors.success,
  },

  motivoCancelamento: {
    fontSize: 14,
    color: colors.cancelText,
    fontStyle: "italic",
    marginTop: 5,
  },
  botaoCancelar: {
    backgroundColor: colors.danger,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  textoBotaoCancelar: { color: colors.white, fontWeight: "bold" },
  botaoDesabilitado: { backgroundColor: colors.disabled },
  iconeStatus: { marginLeft: 10 },
  textoVazio: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: colors.muted,
  },
  listContentContainer: { paddingBottom: 10 },
});

// Perfil
export const perfilStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pageBg,
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: colors.textDark,
  },
  infoContainer: {
    width: "100%",
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#dddddd",
  },
  label: { fontSize: 16, color: "#666" },
  valor: {
    fontSize: 18,
    fontWeight: "500",
    marginTop: 5,
    color: colors.textDark,
  },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  offlineText: {
    backgroundColor: colors.warning,
    color: colors.textDark,
    textAlign: "center",
    padding: 10,
    fontWeight: "bold",
    width: "100%",
  },
});

export default globalStyles;
