import React from "react";
import { View, Text, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import globalStyles, {
  colors,
  carregamentoStyles,
} from "../styles/globalStyles";

export default function TelaCarregamento() {
  return (
    <SafeAreaView style={carregamentoStyles.container}>
      {/* Quando tiver um logo, coloque em /assets e descomente */}
      {
        <Image
          source={require("../../assets/psychologist_logo.png")}
          style={carregamentoStyles.logo}
        />
      }
      <Text style={carregamentoStyles.appName}>App Agendamento</Text>
      <ActivityIndicator
        size="large"
        color={colors.primary}
        style={carregamentoStyles.spinner}
      />
    </SafeAreaView>
  );
}
