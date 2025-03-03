import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const chatURL = 'https://mobilechatappbackend.onrender.com/api';

const useLogout = () => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await axios.post(
        `${chatURL}/logout`, // ✅ Correct API URL
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");

        alert("Logout successful!");

        navigation.replace("Login"); // ✅ Ensure 'Login' is a valid screen
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return handleLogout;
};

export default useLogout; // ✅ Correct default export
