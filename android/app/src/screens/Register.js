import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// Backend URL for registration
const chatURL = "https://mobilechatappbackend.onrender.com/api";

const Registration = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // State for success message
  

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Update URL to match the backend route ("/api/auths/register")
      const response = await fetch(`${chatURL}/auths/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      
      // Log the raw response text
      const responseText = await response.text();
      console.log('Raw Response:', responseText); // Log the full response body
  
      let data;
      try {
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
          data = JSON.parse(responseText); // Only parse as JSON if it's JSON
        } else {
          data = { message: responseText }; // Handle non-JSON responses (like HTML error pages)
        }
      } catch (jsonError) {
        console.error('Failed to parse JSON:', jsonError);
        data = { message: 'An unexpected error occurred' }; // Fallback message
      }
  
      // Handle the response based on success or failure
      if (response.ok) {
        setSuccessMessage(data.message); // Show success message
        Alert.alert("Registration Successful", "Check Your Email For Verification.");
        navigation.navigate("Login"); // Navigate to the Login screen after successful registration
      } else {
        setError(data.message); // Show error message from API
      }
    } catch (error) {
      console.error('Error during registration:', error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Register</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      {successMessage && <Text style={styles.success}>{successMessage}</Text>}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button title="Register" onPress={handleRegister} />
      </View>
      <Text style={styles.loginText}>
        Already have an account?{" "}
        <Text
          onPress={() => navigation.navigate("Login")}
          style={styles.loginLink}
        >
          Login
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f7f7f7",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  form: {
    width: "100%",
    paddingHorizontal: 16,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  success: {
    color: "green",
    textAlign: "center",
    marginBottom: 10,
  },
  loginText: {
    textAlign: "center",
    marginTop: 20,
  },
  loginLink: {
    color: "#007AFF",
    textDecorationLine: "underline",
  },
});

export default Registration;

