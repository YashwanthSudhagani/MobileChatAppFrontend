import React, { useState, useEffect, useContext } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkModeProvider, DarkModeContext } from "./android/app/src/components/DarkMode";
import HomeScreen from "./android/app/src/screens/HomeScreen";
import LoginScreen from "./android/app/src/screens/Login";
import RegistrationScreen from "./android/app/src/screens/Register";
import ChatApp from "./android/app/src/screens/ChatApp";
import 'react-native-gesture-handler';


export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Registration: undefined;
  ChatApp: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { darkMode } = useContext(DarkModeContext);

  return (
    <NavigationContainer theme={darkMode ? DarkTheme : DefaultTheme}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: darkMode ? '#121212' : 'white' },
          headerTintColor: darkMode ? 'white' : 'black',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Registration" component={RegistrationScreen} />
        <Stack.Screen name="ChatApp" component={ChatApp} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  const [isDarkModeLoaded, setIsDarkModeLoaded] = useState(false);

  useEffect(() => {
    const loadDarkMode = async () => {
      const storedDarkMode = await AsyncStorage.getItem('darkMode');
      if (storedDarkMode !== null) {
        setIsDarkModeLoaded(true);
      } else {
        setIsDarkModeLoaded(true);
      }
    };
    loadDarkMode();
  }, []);

  return isDarkModeLoaded ? (
    <DarkModeProvider>
      <AppNavigator />
    </DarkModeProvider>
  ) : null;  // Prevents flickering while loading dark mode preference
};

export default App;
