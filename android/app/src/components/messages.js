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
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {DarkModeContext} from './DarkMode';
import {PermissionsAndroid} from 'react-native';
import {Platform} from 'react-native';
import RNFS from 'react-native-fs';

const audioRecorderPlayer = new AudioRecorderPlayer();

const socket = io('https://mobilechatappbackend.onrender.com');
const chatURL = 'https://mobilechatappbackend.onrender.com/api';

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
  const [voiceMessages, setVoiceMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const messagesRef = useRef(null);
  const [userId, setUserId] = useState(null);
  const [attachmentVisible, setAttachmentVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const {darkMode} = useContext(DarkModeContext);
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState('0:00');

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

    const fetchVoiceMessages = async () => {
      try {
        const response = await axios.get(
          `${chatURL}/messages/${userId}/${channel._id}`,
        );
        setVoiceMessages(response.data);
      } catch (error) {
        console.error(
          'Error fetching voice messages:',
          error.response?.data || error.message,
        );
      }
    };

    fetchMessages();
    fetchVoiceMessages();
    const intervalId = setInterval(() => {
      fetchMessages();
      fetchVoiceMessages();
    }, 1000);
    return () => clearInterval(intervalId);
  }, [userId, channel]);

  useEffect(() => {
    socket.emit('join-chat', {userId});

    socket.on('msg-receive', ({msg}) => {
      setMessages(prev => [...prev, {fromSelf: false, message: msg}]);
    });

    socket.on('receive-voice-msg', ({audioUrl}) => {
      setVoiceMessages(prev => [...prev, {fromSelf: false, audioUrl}]);
    });

    return () => {
      socket.off('msg-receive');
      socket.off('receive-voice-msg');
    };
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

  const getAudioPath = () => {
    return Platform.OS === 'android'
      ? `${RNFS.ExternalCachesDirectoryPath}/recording_${Date.now()}.mp3`
      : `${RNFS.DocumentDirectoryPath}/recording_${Date.now()}.mp3`;
  };

  const requestPermissions = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);

      return (
        granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] ===
          PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const startRecording = async () => {
    setRecording(true);
    setRecordTime('0:00');

    try {
      const path = getAudioPath();
      const audioUri = await audioRecorderPlayer.startRecorder(path);

      console.log('Recording started at:', audioUri);

      audioRecorderPlayer.addRecordBackListener(e => {
        let sec = Math.floor(e.currentPosition / 1000);
        let min = Math.floor(sec / 60);
        sec = sec % 60;
        setRecordTime(`${min}:${sec < 10 ? '0' : ''}${sec}`);
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      setRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      const audioPath = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener(); // Stop listening to timer updates
      setRecording(false);

      console.log('Recording stopped, file path:', audioPath);

      if (audioPath) {
        uploadAudio(audioPath);
      } else {
        console.error('Audio path is undefined, recording might have failed.');
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      setRecording(false);
    }
  };

  const uploadAudio = async audioPath => {
    if (!audioPath) {
      console.error('No audio file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', {
      uri: audioPath,
      type: 'audio/mp3',
      name: 'voice_note.mp3',
    });
    formData.append('from', userId);
    formData.append('to', channel._id);

    try {
      console.log('Uploading audio:', audioPath);

      const response = await axios.post(
        `${chatURL}/messages/addvoice`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
          },
        },
      );

      console.log('Audio uploaded successfully:', response.data);

      socket.emit('send-voice-msg', {
        to: channel._id,
        audioUrl: response.data.audioUrl,
      });
      setVoiceMessages(prev => [
        ...prev,
        {fromSelf: true, audioUrl: response.data.audioUrl},
      ]);
    } catch (error) {
      console.error(
        'Error uploading audio:',
        error.response?.data || error.message,
      );
    }
  };

  const playAudio = async url => {
    await audioRecorderPlayer.startPlayer(url);
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
  data={[...messages, ...voiceMessages]}
  keyExtractor={(item, index) => index.toString()}
  renderItem={({ item }) => (
    <View
      style={
        item.fromSelf ? styles.sentMessage : styles.receivedMessage
      }>
      {item.message ? (
        <Text>{item.message}</Text>
      ) : (
        <TouchableOpacity onPress={() => playAudio(item.audioUrl)}>
          <Ionicons name="play" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  )}
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
          {recording && <Text>{recordTime}</Text>}
          <TouchableOpacity
            onPress={recording ? stopRecording : startRecording}>
            <Ionicons
              name={recording ? 'stop' : 'mic-outline'}
              size={24}
              color="grey"
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
  audioMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
});

export default Messages;
