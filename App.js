import React, { useState } from 'react';
import { StyleSheet, Text, View, ImageBackground, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');

  if (currentScreen === 'welcome') {
    return (
      // ImageBackground से पूरी स्क्रीन पर वही वाला शानदार वेलकम बैनर बैकग्राउंड में फैल जाएगा
      <ImageBackground 
        source={require('./assets/welcome-banner.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.container}>
            <View style={styles.content}>
              
              {/* ऐप का नाम Arishop */}
              <Text style={styles.headerTitle}>Arishop 🛍️</Text>
              <Text style={styles.subTitle}>Discover & Win Rewards</Text>

              <View style={styles.card}>
                <Text style={styles.welcomeHeading}>Welcome to Arishop</Text>
                <Text style={styles.welcomeText}>
                  Your magical shopping experience is ready. Enjoy shopping and unlock exciting gifts!
                </Text>

                {/* Explore Shop बटन - बिना किसी एरर के सीधा आगे ले जाएगा */}
                <TouchableOpacity 
                  style={styles.exploreButton} 
                  onPress={() => setCurrentScreen('store')}
                >
                  <Text style={styles.buttonText}>Explore Shop</Text>
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
        
        {/* यहाँ आपके प्रोडक्ट्स और कैटेगरीज दिखेंगी */}
        <View style={styles.productCard}>
          <Text style={styles.productTitle}>🎁 Special Mystery Box</Text>
          <Text style={styles.productDesc}>Unlock amazing rewards and offers inside Arishop.</Text>
        </View>

        <View style={styles.productCard}>
          <Text style={styles.productTitle}>🌟 Featured Product</Text>
          <Text style={styles.productDesc}>Top quality shopping items curated just for you.</Text>
        </View>

        {/* वापस वेलकम स्क्रीन पर जाने के लिए */}
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
    backgroundColor: 'rgba(5, 10, 25, 0.75)', // इमेज के ऊपर हल्का डार्क शेड ताकि टेक्स्ट साफ दिखे
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingVertical: 40,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#00ffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  subTitle: {
    fontSize: 14,
    color: '#e2e8f0',
    marginBottom: 10,
    fontWeight: '600',
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  welcomeHeading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#cbd5e0',
    textAlign: 'center',
    marginBottom: 22,
    lineHeight: 20,
  },
  exploreButton: {
    width: '100%',
    backgroundColor: '#ff2a85',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#ff2a85',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerText: {
    color: '#a0aec0',
    fontSize: 12,
    fontWeight: '500',
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
