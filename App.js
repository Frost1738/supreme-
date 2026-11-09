import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { NavigationContainer } from "@react-navigation/native";
import AuthScreen from "./authentication/authScreen";

import { Home } from "./screens/home";
import Cart from "./screens/cart";
import Browser from "./screens/browser";
import Saved from "./screens/saved";
import GlobalProvider from "./Contexts/GlobalContext";
import Toast from "react-native-toast-message";
import FontLoader from "./hooks/fontsLoader";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const toastConfig = {
  success: ({ text1, text2 }) => (
    <View style={styles.toast}>
      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{text1}</Text>
        {text2 && <Text style={styles.message}>{text2}</Text>}
      </View>
    </View>
  ),

  error: ({ text1, text2 }) => (
    <View style={styles.toast}>
      <Ionicons name="alert-circle" size={24} color="#FF6B6B" />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{text1}</Text>
        {text2 && <Text style={styles.message}>{text2}</Text>}
      </View>
    </View>
  ),

  info: ({ text1, text2 }) => (
    <View style={styles.toast}>
      <Ionicons name="information-circle" size={24} color="#C5A059" />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{text1}</Text>
        {text2 && <Text style={styles.message}>{text2}</Text>}
      </View>
    </View>
  ),
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#333333", // Brownish with 85% opacity #5C3A21
        },
        tabBarActiveTintColor: "#e37521", // Active icon color
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.6)", // Inactive color
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="browse"
        component={Browser}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons
              name="view-grid"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="saved"
        component={Saved}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="cart"
        component={Cart}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons
              name="cart-check"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <FontLoader>
      <GlobalProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="MainTabs"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Authentication" component={AuthScreen} />
          </Stack.Navigator>
          <Toast
            position="bottom"
            bottomOffset={50}
            visibilityTime={3000}
            config={toastConfig}
          />
        </NavigationContainer>
      </GlobalProvider>
    </FontLoader>
  );
}

const styles = StyleSheet.create({
  toast: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  message: {
    fontSize: 13,
    color: "#CCCCCC",
    marginTop: 2,
  },
});
