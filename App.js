import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1b4332" />
      
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Arishop 🛍️</Text>
        <Text style={styles.headerSubtitle}>Discover & Win Rewards</Text>
      </View>

      {/* Main Content / Tree Theme Preview */}
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.welcomeEmoji}>🌳✨</Text>
          <Text style={styles.title}>Welcome to Arishop</Text>
          <Text style={styles.description}>
            Your magical shopping experience is getting ready. Shake the tree to unlock gifts and gold!
          </Text>

          <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={() => alert('Magic Tree is loading!')}>
            <Text style={styles.buttonText}>Explore Shop</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by Sahil Raikwar</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#081c15',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1b4332',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#52b788',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#b7e4c7',
    marginTop: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#1b4332',
    width: '100%',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  welcomeEmoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#d8f3dc',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#52b788',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#081c15',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    padding: 15,
    alignItems: 'center',
  },
  footerText: {
    color: '#40916c',
    fontSize: 12,
  },
});
