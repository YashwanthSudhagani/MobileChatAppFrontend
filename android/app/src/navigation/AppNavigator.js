// import React, { useEffect, useState } from "react";
// import { createStackNavigator } from "@react-navigation/stack";
// import { NavigationContainer } from "@react-navigation/native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { ActivityIndicator, View } from "react-native";
// import Login from "../screens/Login";
// import Register from "../screens/Register";
// import ChatApp from "../screens/ChatApp";
// import HomeScreen from "../screens/HomeScreen"; // First Screen

// // Stack Navigator
// const Stack = createStackNavigator();

// const AppNavigator = () => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [userToken, setUserToken] = useState(null);

//   useEffect(() => {
//     const checkToken = async () => {
//       const token = await AsyncStorage.getItem("token");
//       setUserToken(token);
//       setIsLoading(false);
//     };
//     checkToken();
//   }, []);

//   if (isLoading) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" color="#007AFF" />
//       </View>
//     );
//   }

//   return (
//     <NavigationContainer>
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         {userToken ? (
//           <Stack.Screen name="ChatApp" component={ChatApp} />
//         ) : (
//           <>
//             <Stack.Screen name="HomeScreen" component={HomeScreen} />
//             <Stack.Screen name="Login" component={Login} />
//             <Stack.Screen name="Register" component={Register} />
//           </>
//         )}
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// };

// export default AppNavigator;
