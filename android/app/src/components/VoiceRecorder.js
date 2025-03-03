import React, { useState, useRef, useEffect } from "react";
import { 
  View, 
  TouchableOpacity, 
  Text, 
  PermissionsAndroid, 
  Alert, 
  StyleSheet 
} from "react-native";
import AudioRecorderPlayer from "react-native-audio-recorder-player";
import Ionicons from 'react-native-vector-icons/Ionicons';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

const VoiceRecorder = ({ onAudioRecorded }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [timer, setTimer] = useState(0);
  
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;
  let intervalRef = useRef(null);

  const requestPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: "Microphone Permission",
          message: "This app needs access to your microphone to record audio.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const handleRecordAudio = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) {
      Alert.alert("Permission Denied", "Microphone access is required to record audio.");
      return;
    }

    if (isRecording) {
      if (isPaused) {
        await audioRecorderPlayer.resumeRecorder();
        setIsPaused(false);
      } else {
        const result = await audioRecorderPlayer.stopRecorder();
        setIsRecording(false);
        setTimer(0);
        setAudioFile(result);
        onAudioRecorded(result);
        clearInterval(intervalRef.current);
      }
    } else {
      setIsRecording(true);
      setTimer(0);
      await audioRecorderPlayer.startRecorder();
      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
  };

  const handlePauseRecording = async () => {
    await audioRecorderPlayer.pauseRecorder();
    setIsPaused(true);
    clearInterval(intervalRef.current);
  };

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      audioRecorderPlayer.stopRecorder();
    };
  }, []);

  const handlePlayAudio = () => {
    if (audioFile) {
      const sound = new Sound(audioFile, '', (error) => {
        if (error) {
          console.log("Failed to load the sound", error);
          return;
        }
        sound.play();
      });
    }
  };

  const handleSaveRecording = async () => {
    if (!audioFile) return;
    const newPath = `${RNFS.DocumentDirectoryPath}/recorded_audio.mp3`;

    try {
      await RNFS.moveFile(audioFile, newPath);
      Alert.alert("Saved", `Audio saved at ${newPath}`);
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  const handleShareRecording = async () => {
    if (!audioFile) return;

    try {
      await Share.open({
        url: `file://${audioFile}`,
        type: "audio/mp3",
      });
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Timer Display */}
      {isRecording && (
        <Text style={styles.timer}>{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}</Text>
      )}

      {/* Record/Pause/Resume Button */}
      <TouchableOpacity onPress={handleRecordAudio} style={styles.button}>
        <Ionicons name={isRecording ? "stop-circle" : "mic"} size={50} color={isRecording ? "red" : "black"} />
      </TouchableOpacity>

      {isRecording && !isPaused && (
        <TouchableOpacity onPress={handlePauseRecording} style={styles.button}>
          <Ionicons name="pause-circle" size={50} color="orange" />
        </TouchableOpacity>
      )}

      {/* Play Audio Button */}
      {audioFile && (
        <TouchableOpacity onPress={handlePlayAudio} style={styles.button}>
          <Ionicons name="play-circle" size={50} color="green" />
        </TouchableOpacity>
      )}

      {/* Save & Share Buttons */}
      {audioFile && (
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleSaveRecording} style={styles.actionButton}>
            <Ionicons name="save" size={30} color="blue" />
            <Text>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShareRecording} style={styles.actionButton}>
            <Ionicons name="share-social" size={30} color="purple" />
            <Text>Share</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Placeholder for Waveform Visualization */}
      {isRecording && <View style={styles.waveform}><Text>🎵 Waveform Visualizer 🎵</Text></View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 10,
  },
  timer: {
    fontSize: 18,
    marginBottom: 10,
  },
  button: {
    marginVertical: 10,
  },
  actions: {
    flexDirection: "row",
    marginTop: 10,
  },
  actionButton: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  waveform: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 10,
  },
});

export default VoiceRecorder;
