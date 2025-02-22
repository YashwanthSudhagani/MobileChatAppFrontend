import React, {useState, useEffect, useRef, useContext} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import io from 'socket.io-client';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {DarkModeContext} from './DarkMode';

const socket = io('https://chat-app-backend-2ph1.onrender.com');
const chatURL = 'https://chat-app-backend-2ph1.onrender.com/api';

const generateAvatar = username => {
  if (!username) return {initial: '?', backgroundColor: '#cccccc'};

  const colors = [
    '#FFD700',
    '#FFA07A',
    '#87CEEB',
    '#98FB98',
    '#DDA0DD',
    '#FFB6C1',
    '#FFC0CB',
    '#20B2AA',
    '#FF6347',
    '#708090',
    '#9370DB',
    '#90EE90',
    '#B0E0E6',
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

const Messages = ({route, navigation}) => {
  const {channel} = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const messagesRef = useRef(null);
  const [userId, setUserId] = useState(null);
  const [attachmentVisible, setAttachmentVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const {darkMode} = useContext(DarkModeContext);

  const avatar = generateAvatar(channel.username);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (!userId || !channel) return;

    const fetchMessages = async () => {
      try {
        const response = await axios.post(`${chatURL}/messages/getmsg`, {
          from: userId,
          to: channel._id,
        });
        setMessages(response.data);
      } catch (error) {
        console.error(
          'Error fetching messages:',
          error.response?.data || error.message,
        );
      }
    };

    fetchMessages();
    const intervalId = setInterval(fetchMessages, 1000);
    return () => clearInterval(intervalId);
  }, [userId, channel]);

  useEffect(() => {
    socket.emit('join-chat', {userId});
    socket.on('msg-receive', ({msg}) => {
      setMessages(prevMessages => [
        ...prevMessages,
        {fromSelf: false, message: msg},
      ]);
    });

    return () => socket.off('msg-receive');
  }, [userId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId) return;

    socket.emit('send-msg', {to: channel._id, msg: newMessage, from: userId});
    setMessages(prev => [...prev, {fromSelf: true, message: newMessage}]);
    setNewMessage('');

    try {
      await axios.post(`${chatURL}/messages/addmsg`, {
        from: userId,
        to: channel._id,
        message: newMessage,
      });
    } catch (error) {
      console.error(
        'Error sending message:',
        error.response?.data || error.message,
      );
    }
  };

  const toggleAttachmentMenu = () => {
    setAttachmentVisible(prev => !prev);
    Animated.timing(slideAnim, {
      toValue: attachmentVisible ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
      <View style={[styles.container, darkMode && styles.darkContainer]}>
        {/* Header */}
        <View style={[styles.header, darkMode && styles.darkHeader]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={darkMode ? 'white' : 'black'}
            />
          </TouchableOpacity>

          {/* User Avatar */}
          <View
            style={[styles.avatar, {backgroundColor: avatar.backgroundColor}]}>
            <Text style={styles.avatarText}>{avatar.initial}</Text>
          </View>
          <Text style={[styles.chatName, darkMode && styles.darkChatName]}>
            {channel.username}
          </Text>

          {/* Icons: Video Call, Audio Call, Add Users, Menu */}
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons
                name="videocam-outline"
                size={24}
                color={darkMode ? 'white' : 'black'}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons
                name="call-outline"
                size={24}
                color={darkMode ? 'white' : 'black'}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons
                name="person-add-outline"
                size={24}
                color={darkMode ? 'white' : 'black'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMenuVisible(!menuVisible)}
              style={styles.iconButton}>
              <Ionicons
                name="ellipsis-vertical"
                size={24}
                color={darkMode ? 'white' : 'black'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {menuVisible && (
          <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
            <View style={styles.overlay}>
              <View
                style={[
                  styles.dropdownMenu,
                  darkMode && styles.darkDropdownMenu,
                ]}>
                <TouchableOpacity style={styles.menuItem}>
                  <Text
                    style={[styles.menuText, darkMode && styles.darkMenuText]}>
                    Chat Settings
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                  <Text
                    style={[styles.menuText, darkMode && styles.darkMenuText]}>
                    Clear Chat
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                  <Text
                    style={[styles.menuText, darkMode && styles.darkMenuText]}>
                    Block
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                  <Text
                    style={[styles.menuText, darkMode && styles.darkMenuText]}>
                    Mute
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                  <Text
                    style={[styles.menuText, darkMode && styles.darkMenuText]}>
                    Report
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        )}

        {/* Messages List */}
        <FlatList
          ref={messagesRef}
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => (
            <Text
              style={
                item.fromSelf ? styles.sentMessage : styles.receivedMessage
              }>
              {item.message}
            </Text>
          )}
          onContentSizeChange={() =>
            messagesRef.current?.scrollToEnd({animated: true})
          }
          onLayout={() => messagesRef.current?.scrollToEnd({animated: true})}
        />

        {/* Attachment Menu (Floating Popup) */}
        {attachmentVisible && (
          <Animated.View
            style={[styles.attachmentMenu, {transform: [{scale: slideAnim}]}]}>
            <TouchableOpacity style={styles.attachmentItem}>
              <Ionicons
                name="image-outline"
                size={30}
                color={darkMode ? 'black' : 'green'}
              />
              <Text>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachmentItem}>
              <Ionicons
                name="location-outline"
                size={30}
                color={darkMode ? 'black' : 'red'}
              />
              <Text>Location</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachmentItem}>
              <Ionicons
                name="person-outline"
                size={30}
                color={darkMode ? 'black' : 'blue'}
              />
              <Text>Contacts</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachmentItem}>
              <Ionicons
                name="document-outline"
                size={30}
                color={darkMode ? 'black' : 'purple'}
              />
              <Text>Documents</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachmentItem}>
              <Ionicons
                name="bar-chart-outline"
                size={30}
                color={darkMode ? 'black' : 'skyblue'}
              />
              <Text>Poll</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Input Bar */}
        <View
          style={[
            styles.inputContainer,
            darkMode && styles.darkInputContainer,
          ]}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={toggleAttachmentMenu}>
            <Ionicons
              name="add"
              size={24}
              color={darkMode ? 'white' : 'grey'}
            />
          </TouchableOpacity>
          <TextInput
            style={[styles.input, darkMode && styles.darkInput]}
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline={true} // Allows text to expand vertically
            numberOfLines={1} // Starts with a single line
            textAlignVertical="top" // Ensures text starts from the top
          />

          <TouchableOpacity style={styles.iconButton}>
            <Ionicons
              name="mic-outline"
              size={24}
              color={darkMode ? 'white' : 'grey'}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={sendMessage}>
            <Ionicons
              name="send"
              size={24}
              color={darkMode ? 'skyblue' : 'blue'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

/* Styles */
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  darkContainer: {backgroundColor: '#121212'},

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: 'white',
  },
  darkHeader: {
    backgroundColor: '#1E1E1E',
  },
  backButton: {marginRight: 10},
  chatName: {flex: 1, fontSize: 18, fontWeight: 'bold'},
  darkChatName: {
    color: 'white',
  },
  headerIcons: {flexDirection: 'row'},
  iconButton: {paddingHorizontal: 10},

  /* Avatar */
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    alignSelf: 'center',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  /* Dropdown Menu */
  dropdownMenu: {
    position: 'absolute',
    right: 10,
    top: 50, // Adjusted for better positioning
    backgroundColor: 'white',
    borderRadius: 5,
    paddingVertical: 5,
    elevation: 10, // Ensures it appears above other elements
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    width: 150,
    zIndex: 1000, // Ensures it's above everything else
  },
  darkDropdownMenu: {
    backgroundColor: 'black',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)', // Dim the background
    justifyContent: 'flex-start', // Ensures dropdown is at the top
    alignItems: 'flex-end', // Aligns dropdown to the right
    zIndex: 999, // Ensures overlay is above all elements
  },
  menuItem: {paddingVertical: 10, paddingHorizontal: 15},
  menuText: {fontSize: 16, color: 'black'},
  darkMenuText: {
    color: 'white',
  },
  darkText: {color: 'white'},

  /* Messages */
  sentMessage: {
    alignSelf: 'flex-end',
    padding: 8,
    backgroundColor: 'skyblue',
    color: 'white',
    margin: 5,
    borderRadius: 5,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    padding: 8,
    backgroundColor: 'purple',
    color: 'white',
    margin: 5,
    borderRadius: 5,
  },
  darkText: {color: 'white'},

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 25,
    margin: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
    width: '95%' /* Adjust width dynamically */,
    alignSelf: 'center' /* Centers the bar */,
  },
  darkInputContainer: {backgroundColor: '#1E1E1E'},
  input: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    minHeight: 40, // Default height
    maxHeight: 120, // Limit growth to avoid excessive expansion
    overflow: 'hidden', // Prevent unnecessary scrolling
  },
  darkInput: {backgroundColor: '#333', color: 'white'},
  attachmentMenu: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    flexWrap: 'wrap' /* Ensures wrapping */,
    justifyContent: 'center' /* Centers content */,
    alignSelf: 'center' /* Keeps it within screen bounds */,
    width: '90%' /* Ensures it doesn’t overflow */,
    maxWidth: 350 /* Limit max width */,
    elevation: 5,
  },
  attachmentItem: {
    alignItems: 'center',
    margin: 10 /* Adjusted margin for proper spacing */,
    width: '30%' /* Adjust width for responsiveness */,
  },
});

export default Messages;
