import React, { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

// Backend API URL
const chatURL = "https://chat-app-backend-2ph1.onrender.com/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // For handling UI during submission
  const navigation = useNavigation();

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    // Basic Validation
    if (!email.trim() || !password.trim()) {
      setError("Email and Password are required.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${chatURL}/auths/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.msg || "Invalid credentials. Please try again.");
        setLoading(false);
        return;
      }

      // Store user data
      await AsyncStorage.setItem("userEmail", data.user.email);
      await AsyncStorage.setItem("userId", data.user._id);
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem('username', data.user.username)

      // Navigate to ChatApp and reset navigation stack
     // After successful login
     navigation.replace("ChatApp");

    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred while logging in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>

      <Text style={styles.registerText}>
        Don't have an account?{" "}
        <Text 
          style={styles.registerLink} 
          onPress={() => navigation.navigate("Registration")}
        >
          Register
        </Text>
      </Text>
    </View>
  );
};

export default Login;

// Updated styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    fontSize: 14,
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  button: {
    width: "100%",
    padding: 12,
    backgroundColor: "#007bff",
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#b0c4de",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  registerText: {
    marginTop: 15,
    fontSize: 14,
    color: "#555",
  },
  registerLink: {
    color: "#007bff",
    fontWeight: "bold",
  },
});
