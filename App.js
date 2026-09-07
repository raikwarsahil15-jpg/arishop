import React, { useState } from 'react';
import { StyleSheet, Text, View, ImageBackground, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');

  if (currentScreen === 'welcome') {
    return (
      <ImageBackground 
        source={require('./assets/welcome-banner.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.container}>
            <View style={styles.content}>
              <View style={{flex: 1}} />
              
              {/* वेलकम स्क्रीन कार्ड और बटन */}
              <View style={styles.card}>
                <Text style={styles.welcomeHeading}>Welcome to Arishop</Text>
                <Text style={styles.welcomeText}>
                  Shop More • Get More • Be Happy. Your magical shopping experience is ready!
                </Text>

                {/* Get Started बटन - क्लिक करते ही सीधे स्टोर खुलेगा */}
                <TouchableOpacity 
                  style={styles.exploreButton} 
                  onPress={() => setCurrentScreen('store')}
                >
                  <Text style={styles.buttonText}>Get Started ➔</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.footerText}>Powered by Sahil Raikwar</Text>
            </View>
          </SafeAreaView>
        </View>
      </ImageBackground>
    );
  }

  // स्टोर या शॉपिंग डैशबोर्ड स्क्रीन
  return (
    <SafeAreaView style={styles.containerStore}>
      <ScrollView contentContainerStyle={styles.storeScroll}>
        <Text style={styles.storeHeader}>Arishop Store 🛒</Text>
        <Text style={styles.storeSubText}>Explore our exclusive collection and gifts!</Text>
        
        <View style={styles.productCard}>
          <Text style={styles.productTitle}>🎁 Special Mystery Box</Text>
          <Text style={styles.productDesc}>Unlock amazing rewards and offers inside Arishop.</Text>
        </View>

        <View style={styles.productCard}>
          <Text style={styles.productTitle}>🌟 Featured Product</Text>
          <Text style={styles.productDesc}>Top quality shopping items curated just for you.</Text>
        </View>

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => setCurrentScreen('welcome')}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // बैनर साफ दिखने के लिए हल्का शेड
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 30,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.4)',
  },
  welcomeHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  welcomeText: {
    fontSize: 13,
    color: '#cbd5e0',
    textAlign: 'center',
    marginBottom: 16,
  },
  exploreButton: {
    width: '100%',
    backgroundColor: '#ffcc00',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerText: {
    color: '#ffffff',
    fontSize: 11,
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  containerStore: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  storeScroll: {
    padding: 20,
    alignItems: 'center',
  },
  storeHeader: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#00ffff',
    marginTop: 20,
    marginBottom: 5,
  },
  storeSubText: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 25,
  },
  productCard: {
    width: '100%',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  productDesc: {
    fontSize: 13,
    color: '#cbd5e0',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#334155',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  }
});
