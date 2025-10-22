import React, { useState, useEffect, useRef } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { auth, firestore } from "../configuracaoFirebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import TelaCarregamento from "../telas/TelaCarregamento";
import TelaLogin from "../telas/TelaLogin";
import TelaCadastro from "../telas/TelaCadastro";
import TelaAgendamento from "../telas/TelaAgendamento";
import TelaMeusAgendamentos from "../telas/TelaMeusAgendamentos";
import TelaPerfil from "../telas/TelaPerfil";
import TelaAgendaPsicologo from "../telas/TelaAgendaPsicologo";
import TelaBloqueioHorarios from "../telas/TelaBloqueioHorarios";
import PostLoginOverlay from "../componentes/PostLoginOverlay";

const Stack = createStackNavigator();
const Tab = createMaterialTopTabNavigator();

function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}
    >
      <Stack.Screen name="TelaLogin" component={TelaLogin} />
      <Stack.Screen name="TelaCadastro" component={TelaCadastro} />
    </Stack.Navigator>
  );
}

function ClienteTabNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: "#fff",
          height: 65 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarLabelStyle: { fontSize: 10, textTransform: "capitalize" },
        tabBarIndicatorStyle: { backgroundColor: "#007bff", height: 3 },
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === "Agendar") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "Minha Agenda") {
            iconName = focused ? "list-circle" : "list-circle-outline";
          } else if (route.name === "Perfil") {
            iconName = focused ? "person-circle" : "person-circle-outline";
          }
          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: "#007bff",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Agendar" component={TelaAgendamento} />
      <Tab.Screen name="Minha Agenda" component={TelaMeusAgendamentos} />
      <Tab.Screen name="Perfil" component={TelaPerfil} />
    </Tab.Navigator>
  );
}

function PsicologoTabNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: "#fff",
          height: 65 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarLabelStyle: { fontSize: 10, textTransform: "capitalize" },
        tabBarIndicatorStyle: { backgroundColor: "#28a745", height: 3 },
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === "Agenda do Dia") {
            iconName = focused ? "book" : "book-outline";
          } else if (route.name === "Bloquear") {
            iconName = focused ? "lock-closed" : "lock-closed-outline";
          } else if (route.name === "Perfil") {
            iconName = focused ? "person-circle" : "person-circle-outline";
          }
          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: "#28a745",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Agenda do Dia" component={TelaAgendaPsicologo} />
      <Tab.Screen name="Bloquear" component={TelaBloqueioHorarios} />
      <Tab.Screen name="Perfil" component={TelaPerfil} />
    </Tab.Navigator>
  );
}

export default function AppNavegacao() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [cargoUsuario, setCargoUsuario] = useState(null);
  const [carregandoApp, setCarregandoApp] = useState(true);
  const [mostrandoOverlay, setMostrandoOverlay] = useState(false);
  const overlayTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
      setMostrandoOverlay(false);

      if (user) {
        // --- USUÁRIO LOGADO ---
        // Busca o cargo do usuário no Firestore
        const userDocRef = doc(firestore, "usuarios", user.uid);
        const docSnap = await getDoc(userDocRef);
        setCargoUsuario(
          docSnap.exists() && docSnap.data().cargo === "psicologo"
            ? "psicologo"
            : "cliente"
        );

        setMostrandoOverlay(true);
        setCarregandoApp(false);

        const duracaoOverlay = 3000;
        const segundosOverlay = Math.ceil(duracaoOverlay / 1000);

        overlayTimerRef.current = setTimeout(() => {
          setMostrandoOverlay(false);
          setUsuarioLogado(true);
        }, duracaoOverlay);
      } else {
        // DESLOGADO ou NAO LOGADO
        setUsuarioLogado(false);
        setCargoUsuario(null);
        setCarregandoApp(false); // finaliza o carregamento
        setMostrandoOverlay(false); // garante que nao mostre overlay
      }
    });
    return () => unsubscribe();
  }, []);

  if (carregandoApp) {
    return <TelaCarregamento />;
  }

  if (mostrandoOverlay) {
    const segundosOverlay = 3;
    return <PostLoginOverlay seconds={segundosOverlay} onTimeout={() => {}} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        {usuarioLogado ? (
          cargoUsuario === "psicologo" ? (
            <PsicologoTabNavigator />
          ) : (
            <ClienteTabNavigator />
          )
        ) : (
          <AuthNavigator />
        )}
      </NavigationContainer>
    </View>
  );
}
