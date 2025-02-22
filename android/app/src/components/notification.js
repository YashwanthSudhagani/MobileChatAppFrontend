import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkModeContext } from './DarkMode'; // Ensure this path is correct

const chatURL = 'https://chat-app-backend-2ph1.onrender.com/api';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [userEmail, setUserEmail] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const { darkMode } = useContext(DarkModeContext);

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const email = await AsyncStorage.getItem('userEmail');
        if (email) {
          setUserEmail(email);
        }
      } catch (error) {
        console.error('Error retrieving user email:', error);
      }
    };

    fetchUserEmail();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userEmail) return;

      try {
        const response = await axios.get(`${chatURL}/notification/notifications/${userEmail}`);
        setNotifications(response.data.notifications);

        // Count unread notifications
        const unreadCount = response.data.notifications.filter(notif => !notif.read).length;
        setUnreadNotifications(unreadCount);
      } catch (error) {
        console.error('Error fetching notifications:', error.response?.data || error.message);
      }
    };

    fetchNotifications();
  }, [userEmail]);

  const markNotificationsAsRead = async () => {
    try {
      await axios.put(`${chatURL}/notification/notifications/read/${userEmail}`);

      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notif => ({ ...notif, read: true }))
      );

      setUnreadNotifications(0);
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  return (
    <View style={[styles.container, darkMode ? styles.darkContainer : styles.lightContainer]}>
      <TouchableOpacity
        style={[styles.markReadButton, darkMode ? styles.darkButton : styles.lightButton]}
        onPress={markNotificationsAsRead}
      >
        <Text style={[styles.markReadText, darkMode ? styles.darkText : styles.lightText]}>
          Mark All as Read ({unreadNotifications})
        </Text>
      </TouchableOpacity>

      {notifications.length === 0 ? (
        <Text style={[styles.noNotifications, darkMode ? styles.darkText : styles.lightText]}>
          No notifications available
        </Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item._id.toString()}
          renderItem={({ item }) => (
            <View
              style={[
                styles.notificationItem,
                darkMode ? styles.darkNotification : styles.lightNotification,
                item.read ? styles.readNotification : styles.unreadNotification
              ]}
            >
              <Text style={[styles.messageText, darkMode ? styles.darkText : styles.lightText]}>
                {item.message}
              </Text>
              <Text style={[styles.timestamp, darkMode ? styles.darkSubText : styles.lightSubText]}>
                {new Date(item.timestamp).toLocaleString()}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  lightContainer: { backgroundColor: '#f9f9f9' },
  darkContainer: { backgroundColor: '#121212' },

  markReadButton: {
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 5,
  },
  lightButton: { backgroundColor: '#007bff' },
  darkButton: { backgroundColor: '#1e1e1e' },

  markReadText: { fontWeight: 'bold' },
  lightText: { color: 'black' },
  darkText: { color: 'white' },
  darkSubText: { color: '#bbbbbb' },
  lightSubText: { color: 'gray' },

  notificationItem: {
    padding: 15,
    marginBottom: 8,
    borderRadius: 8,
  },
  lightNotification: { backgroundColor: '#ffffff' },
  darkNotification: { backgroundColor: '#222222' },

  unreadNotification: { backgroundColor: '#fffae5' },
  readNotification: { backgroundColor: '#e0e0e0' },

  messageText: { fontSize: 16 },
  timestamp: { fontSize: 12, marginTop: 5 },

  noNotifications: { textAlign: 'center', marginTop: 20, fontSize: 16 },
});

export default NotificationsScreen;
