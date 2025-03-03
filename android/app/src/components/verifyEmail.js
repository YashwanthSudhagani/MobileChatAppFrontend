import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

const chatURL = "https://mobilechatappbackend.onrender.com/api";

const VerifyEmail = () => {
  const { token } = useRoute().params; // Getting token from URL params
  const navigation = useNavigation();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // To handle loading state

  useEffect(() => {
    const verifyEmailToken = async () => {
      try {
        const response = await fetch(`${chatURL}/auths/verify-email/${token}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok) {
          setMessage("Email verified successfully!");
          setLoading(false);
          setTimeout(() => {
            navigation.navigate("Login"); // Redirect to login after 3 seconds
          }, 3000);
        } else {
          setError(data.message || "Failed to verify email.");
          setLoading(false);
        }
      } catch (err) {
        console.error("Error verifying email:", err);
        setError("Something went wrong. Please try again later.");
        setLoading(false);
      }
    };

    verifyEmailToken();
  }, [token, navigation]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <View style={styles.messageContainer}>
          <Text style={styles.header}>Verify Email</Text>
          {message && <Text style={styles.success}>{message}</Text>}
          {error && <Text style={styles.error}>{error}</Text>}
          {!message && !error && (
            <Text style={styles.info}>Redirecting to login page...</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    padding: 20,
  },
  messageContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "100%",
    maxWidth: 350,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  success: {
    color: "green",
    fontSize: 16,
    marginBottom: 10,
  },
  error: {
    color: "red",
    fontSize: 16,
    marginBottom: 10,
  },
  info: {
    color: "gray",
    fontSize: 16,
  },
});

export default VerifyEmail;
