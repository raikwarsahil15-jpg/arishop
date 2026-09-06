// Located in /src/screens/profile/WeeklyRequest.js
import React from 'react';
import { View, Text, Button, Alert } from 'react-native';

const WeeklyRequestScreen = ({ user }) => {
  
  const handleRequest = async () => {
    // Calling the API logic you provided
    const response = await fetch('/requestWeeklyProfile', {
      method: 'POST',
      body: JSON.stringify({ userId: user.uid })
    });
    const data = await response.json();
    
    if (data.success) {
      Alert.alert("Success", "Request submitted to Admin.");
    } else {
      Alert.alert("Not Eligible", data.message); // Handles the ₹2500 check and Replacement Lock
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Weekly Top Customer Program</Text>
      <Text>Requirement: Minimum ₹2,500 shopping.</Text>
      <Text>Note: Replacement/Cancellation must not have been used.</Text>
      <TouchableOpacity onPress={handleRequest} style={styles.btn}>
        <Text>Apply for Profile Showcase</Text>
      </TouchableOpacity>
    </View>
  );
};