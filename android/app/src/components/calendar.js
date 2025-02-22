import React, { useState, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { DarkModeContext } from './DarkMode'; // Ensure correct path

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const { darkMode } = useContext(DarkModeContext);

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      <Calendar
        onDayPress={day => setSelectedDate(day.dateString)}
        markedDates={{ [selectedDate]: { selected: true, marked: true } }}
        theme={{
          backgroundColor: darkMode ? '#121212' : '#ffffff',
          calendarBackground: darkMode ? '#121212' : '#ffffff',
          textSectionTitleColor: darkMode ? '#ffffff' : '#000000',
          selectedDayBackgroundColor: darkMode ? '#0db9f0' : '#007bff',
          selectedDayTextColor: '#ffffff',
          todayTextColor: darkMode ? '#0db9f0' : '#ff0000',
          dayTextColor: darkMode ? '#ffffff' : '#000000',
          textDisabledColor: darkMode ? '#666' : '#d9e1e8',
          dotColor: darkMode ? '#0db9f0' : '#007bff',
          arrowColor: darkMode ? '#0db9f0' : '#007bff',
          monthTextColor: darkMode ? '#ffffff' : '#000000',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#ffffff' },
  darkContainer: { backgroundColor: '#121212' },
});

export default CalendarScreen;
