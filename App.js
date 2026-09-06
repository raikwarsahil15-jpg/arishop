import React, { useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence, 
  Easing 
} from 'react-native-reanimated';

const { width, HEIGHT } = Dimensions.get('window');

export default function App() {
  // Floating animation for gift boxes
  const translateY1 = useSharedValue(-50);
  const translateY2 = useSharedValue(-100);
  const translateY3 = useSharedValue(-30);

  useEffect(() => {
    translateY1.value = withRepeat(
      withTiming(800, { duration: 4000, easing: Easing.linear }),
      -1,
      false
    );
    translateY2.value = withRepeat(
      withTiming(800, { duration: 6000, easing: Easing.linear }),
      -1,
      false
    );
    translateY3.value = withRepeat(
      withTiming(800, { duration: 5000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animStyle1 = useAnimatedStyle(() => ({ transform: [{ translateY: translateY1.value }] }));
  const animStyle2 = useAnimatedStyle(() => ({ transform: [{ translateY: translateY2.value }] }));
  const animStyle3 = useAnimatedStyle(() => ({ transform: [{ translateY: translateY3.value }] }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Falling Background Elements (Gifts & Shopping Bags) */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Animated.Text style={[styles.fallingItem, { left: '15%' }, animStyle1]}>🎁</Animated.Text>
        <Animated.Text style={[styles.fallingItem, { left: '50%' }, animStyle2]}>🛍️</Animated.Text>
        <Animated.Text style={[styles.fallingItem, { left: '80%' }, animStyle3]}>🎁</Animated.Text>
      </View>

      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Arishop 🛍️</Text>
        <Text style={styles.headerSubtitle}>Discover & Win Rewards</Text>
      </View>

      {/* Main Content Card */}
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.welcomeEmoji}>✨🌳✨</Text>
          <Text style={styles.title}>Welcome to Arishop</Text>
          <Text style={styles.description}>
            Your magical shopping experience is ready. Enjoy shopping and unlock exciting gifts!
          </Text>

          <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={() => alert('Opening Arishop Store!')}>
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
    backgroundColor: '#0f172a', // Rich Modern Dark Blue Background
  },
  fallingItem: {
    position: 'absolute',
    fontSize: 28,
    opacity: 0.6,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#38bdf8', // Sky Blue Touch
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#bae6fd',
    marginTop: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.85)', // Glassmorphism style
    width: '100%',
    padding: 26,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  welcomeEmoji: {
    fontSize: 45,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#ec4899', // Stunning Pink Touch for contrast
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    padding: 15,
    alignItems: 'center',
  },
  footerText: {
    color: '#64748b',
    fontSize: 12,
  },
});
