import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { DarkModeContext } from '../components/DarkMode';
import useLogout from '../components/Logout';

const generateAvatar = async (username) => {
  if (!username) return { initial: "?", backgroundColor: "#cccccc" };

  try {
    const storedColor = await AsyncStorage.getItem(`avatarColor_${username}`);
    if (storedColor) {
      return { initial: username.charAt(0).toUpperCase(), backgroundColor: storedColor };
    }

    const colors = ["#FFD700", "#FFA07A", "#87CEEB", "#98FB98", "#DDA0DD", "#FFB6C1", "#20B2AA", "#FF6347", "#708090", "#9370DB"];
    const color = colors[Math.floor(Math.random() * colors.length)];

    await AsyncStorage.setItem(`avatarColor_${username}`, color);
    return { initial: username.charAt(0).toUpperCase(), backgroundColor: color };
  } catch (error) {
    console.error("Error generating avatar:", error);
    return { initial: "?", backgroundColor: "#cccccc" };
  }
};

const Settings = () => {
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);
  const [avatar, setAvatar] = useState({ initial: "?", backgroundColor: "#cccccc" });
  const [username, setUsername] = useState("");
  const handleLogout = useLogout();
 
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) {
          setUsername(storedUsername);
          const avatarData = await generateAvatar(storedUsername);
          setAvatar(avatarData);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, []);

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={styles.header}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: avatar.backgroundColor }]}>
          <Text style={styles.avatarText}>{avatar.initial}</Text>
        </View>

        {/* Display Logged-in Username */}
        <Text style={[styles.username, darkMode && styles.darkText]}>
          {username || "Guest"}
        </Text>
      </View>

      {/* Settings Options */}
      <View style={styles.settingsList}>
        <TouchableOpacity style={styles.option}>
          <Ionicons name="key-outline" size={24} color={darkMode ? "white" : "black"} />
          <Text style={[styles.optionText, darkMode && styles.darkText]}>Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option}>
          <Ionicons name="lock-closed-outline" size={24} color={darkMode ? "white" : "black"} />
          <Text style={[styles.optionText, darkMode && styles.darkText]}>Privacy</Text>
        </TouchableOpacity>

        <View style={styles.option}>
          <Ionicons name={darkMode ? "moon" : "sunny"} size={24} color={darkMode ? "white" : "black"} />
          <Text style={[styles.optionText, darkMode && styles.darkText]}>Dark Mode</Text>
          <Switch value={darkMode} onValueChange={toggleDarkMode} />
        </View>

        <TouchableOpacity style={styles.option}>
          <Ionicons name="help-circle-outline" size={24} color={darkMode ? "white" : "black"} />
          <Text style={[styles.optionText, darkMode && styles.darkText]}>Help</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option}>
          <Ionicons name="person-add-outline" size={24} color={darkMode ? "white" : "black"} />
          <Text style={[styles.optionText, darkMode && styles.darkText]}>Invite Friends</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option}>
          <Ionicons name="folder-outline" size={24} color={darkMode ? "white" : "black"} />
          <Text style={[styles.optionText, darkMode && styles.darkText]}>Storage</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteOption} >
          <Ionicons name="trash-outline" size={24} color="red" />
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>

         {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color={darkMode ? "skyblue" : "blue"} />
        <Text style={[styles.logoutText,darkMode && styles.darkLogoutText ]}>Logout</Text>
      </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  darkContainer: { backgroundColor: '#121212' },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  
  avatar: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 10 
  },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: 'white' },

  username: { fontSize: 22, fontWeight: 'bold', flex: 1 },
  darkText: { color: 'white' },

  settingsList: { marginTop: 10 },
  option: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#ddd' 
  },
  optionText: { fontSize: 18, marginLeft: 10, flex: 1 },

  deleteOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, marginTop: 20 },
  deleteText: { fontSize: 18, color: 'red', marginLeft: 10 },
  logoutButton: {
    position: 'absolute',
    right: 2,
    bottom:1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  logoutText: { fontSize: 18, color: 'blue', marginLeft: 10, fontWeight: 'bold' },
  darkLogoutText:{color:'skyblue'},
});

export default Settings;
