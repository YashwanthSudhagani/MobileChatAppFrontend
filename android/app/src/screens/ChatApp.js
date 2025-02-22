import React, { useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { DarkModeContext } from "../components/DarkMode";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons"; 

import FetchUsers from "../components/fetchusers";
import Messages from "../components/messages";
import NotificationsScreen from "../components/notification";
import CalendarScreen from "../components/calendar";
import Settings from "../components/Settings";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Custom header component with dark mode support
const CustomHeader = ({ title }) => {
  const { darkMode } = useContext(DarkModeContext);

  return (
    <View style={[styles.header, darkMode && styles.darkHeader]}>
      <Text style={[styles.headerText, darkMode && styles.darkHeaderText]}>{title}</Text>
    </View>
  );
};

// Stack Navigator for Chat (Users → Messages → Settings)
const ChatStack = () => {
  const { darkMode } = useContext(DarkModeContext);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: darkMode ? "#1e1e1e" : "white" },
        headerTintColor: darkMode ? "white" : "black",
      }}
    >
      <Stack.Screen 
        name="fetchusers" 
        component={FetchUsers}  
        options={{ headerTitle: () => <CustomHeader title="Chats" />, headerShown: true }}  
      />
      <Stack.Screen 
        name="messages" 
        component={Messages} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Settings" 
        component={Settings} 
        options={{ headerTitle: () => <CustomHeader title="Settings" />, headerShown: true }}  
      />
    </Stack.Navigator>
  );
};

// Main Bottom Tab Navigator
const ChatApp = () => {
  const { darkMode } = useContext(DarkModeContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: darkMode ? "#1e1e1e" : "white" },
        tabBarActiveTintColor: darkMode ? "#0db9f0" : "blue",
        tabBarInactiveTintColor: darkMode ? "#888" : "gray",
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Chats") {
            iconName = "chatbubbles-outline";
          } else if (route.name === "Notifications") {
            iconName = "notifications-outline";
          } else if (route.name === "Calendar") {
            iconName = "calendar-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Chats" component={ChatStack} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  header: { padding: 15, backgroundColor: "white", alignItems: "center" },
  darkHeader: { backgroundColor: "#1e1e1e" },
  headerText: { fontSize: 20, fontWeight: "bold", color: "black" },
  darkHeaderText: { color: "white" },
});

export default ChatApp;
