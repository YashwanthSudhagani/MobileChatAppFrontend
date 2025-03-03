import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from "@react-navigation/native";
import { DarkModeContext } from './DarkMode';

const chatURL = 'https://mobilechatappbackend.onrender.com/api';

const generateAvatar = (username) => {
  if (!username) return { initial: "?", backgroundColor: "#cccccc" };

  const colors = [
    "#FFD700", "#FFA07A", "#87CEEB", "#98FB98", "#DDA0DD",
    "#FFB6C1", "#FFC0CB", "#20B2AA", "#FF6347", "#708090",
    "#9370DB", "#90EE90", "#B0E0E6"
  ];

  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;

  return {
    initial: username.charAt(0).toUpperCase(),
    backgroundColor: colors[index],
  };
};

const FetchUsers = () => {
  const [channels, setChannels] = useState([]);
  const [search, setSearch] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();
  const { darkMode } = useContext(DarkModeContext);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        console.log('Retrieved userId:', userId);
        const response = await axios.get(`${chatURL}/auths/getAllUsers/${userId}`);
        setChannels(response.data);
      } catch (error) {
        console.error('Error fetching channels:', error);
      }
    };

    fetchChannels();
  }, []);

  const filteredChannels = channels.filter(channel =>
    channel.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
      <View style={[styles.container, darkMode && styles.darkContainer]}>
        {/* Header */}
        <View style={[styles.header, darkMode && styles.darkHeader]}>
          {/* Search Bar */}
          <View style={[styles.searchContainer, darkMode && styles.darkSearchContainer]}>
            <Ionicons 
              name="search" 
              size={20} 
              color={darkMode ? "white" : "gray"} 
              style={styles.searchIcon} 
            />
            <TextInput
              style={[styles.searchBar, darkMode && styles.darkSearchBar]}
              placeholder="Search..."
              placeholderTextColor={darkMode ? "#bbb" : "#666"}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* Three Dots Menu */}
          <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)} style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={24} color={darkMode ? "white" : "black"} />
          </TouchableOpacity>
        </View>

        {/* Dropdown Menu */}
        {menuVisible && (
          <View style={styles.overlay}>
            <View style={[styles.dropdownMenu, darkMode && styles.darkDropdownMenu]}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  console.log("Meet Clicked");
                  setMenuVisible(false);
                }}
              >
                <Ionicons name="videocam-outline" size={24} color={darkMode ? "white" : "black"} />
                <Text style={[styles.menuText, darkMode && styles.darkMenuText]}>Meet</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  console.log("New Group Clicked");
                  setMenuVisible(false);
                }}
              >
                <Ionicons name="people-outline" size={24} color={darkMode ? "white" : "black"} />
                <Text style={[styles.menuText, darkMode && styles.darkMenuText]}>New Group</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  navigation.navigate("Settings");
                  setMenuVisible(false);
                }}
              >
                <Ionicons name="settings-outline" size={24} color={darkMode ? "white" : "black"} />
                <Text style={[styles.menuText, darkMode && styles.darkMenuText]}>Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Chat List */}
        <FlatList
          data={filteredChannels}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const avatar = generateAvatar(item.username);
            return (
              <TouchableOpacity
                style={[styles.chatItem, darkMode && styles.darkChatItem]}
                onPress={() => {
                  if (!menuVisible) {
                    navigation.navigate('messages', { channel: item });
                  }
                }}
              >
                <View style={[styles.avatar, { backgroundColor: avatar.backgroundColor }]}>
                  <Text style={styles.avatarText}>{avatar.initial}</Text>
                </View>
                <Text style={[styles.chatName, darkMode && styles.darkChatName]}>{item.username}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
    elevation: 3,
  },
  darkHeader: {
    backgroundColor: '#1E1E1E',
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  darkSearchContainer: {
    backgroundColor: "#333",
  },

  searchBar: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  darkSearchBar: {
    color: "#fff",
  },

  menuButton: {
    marginLeft: 10,
    padding: 10,
  },

  overlay: {
    position: 'absolute',
    top: 55,
    right: 10,
    width: 180,
    zIndex: 100,
  },

  dropdownMenu: {
    backgroundColor: 'white',
    paddingVertical: 10,
    borderRadius: 8,
  },
  darkDropdownMenu: {
    backgroundColor: '#333',
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },

  menuText: {
    fontSize: 16,
    marginLeft: 10,
    color: 'black',
  },
  darkMenuText: {
    color: 'white',
  },

  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderBottomWidth: 2,
    borderTopColor: '#87CEEB',
    borderBottomColor: '#87CEEB',
    borderRadius: 15, // Added for curved edges
    marginHorizontal: 10, // Added spacing from screen edges
    marginVertical: 5, // Space between chats
    backgroundColor: 'white', // Ensures it stands out
    elevation: 3, // Adds shadow effect for better UI
  },
  darkChatItem: {
    backgroundColor: '#1E1E1E',
    borderBottomColor: '#444',
  },
  
  chatName: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  darkChatName: {
    color: 'white',
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default FetchUsers;
