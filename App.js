import React, { useState } from 'react';
import { StyleSheet, Text, View, ImageBackground, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Alert } from 'react-native';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  
  // प्रोडक्ट्स की लिस्ट (शुरुआती डिफ़ॉल्ट प्रोडक्ट्स)
  const [products, setProducts] = useState([
    { id: '1', title: '🎁 Special Mystery Box', price: '₹499', desc: 'Unlock amazing rewards and offers inside Arishop.' },
    { id: '2', title: '🌟 Featured Product', price: '₹999', desc: 'Top quality shopping items curated just for you.' }
  ]);

  // नया प्रोडक्ट जोड़ने के लिए स्टेट (Admin Control)
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // चेकआउट / आर्डर स्क्रीन के लिए स्टेट
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');

  // नया प्रोडक्ट जोड़ने का फंक्शन
  const handleAddProduct = () => {
    if (!newTitle || !newPrice) {
      Alert.alert('Error', 'कृपया प्रोडक्ट का नाम और प्राइस भरें!');
      return;
    }
    const newProd = {
      id: Date.now().toString(),
      title: newTitle,
      price: newPrice.includes('₹') ? newPrice : '₹' + newPrice,
      desc: newDesc || 'High quality item from Arishop store.'
    };
    setProducts([newProd, ...products]);
    setNewTitle('');
    setNewPrice('');
    setNewDesc('');
    setShowAddForm(false);
    Alert.alert('Success', 'नया प्रोडक्ट सफलतापूरी तरह से जुड़ गया है!');
  };

  // आर्डर कंफर्म करने का फंक्शन
  const handleCheckout = () => {
    if (!buyerName || !buyerPhone || !buyerAddress) {
      Alert.alert('अधूरा विवरण', 'कृपया अपना नाम, फोन नंबर और डिलीवरी एड्रेस भरें!');
      return;
    }
    Alert.alert(
      'आर्डर सफल! 🎉',
      `धन्यवाद ${buyerName}! आपका आर्डर (${selectedProduct.title}) सफलतापूरी तरह से ले लिया गया है। भुगतान का तरीका: ${paymentMethod}`
    );
    setSelectedProduct(null);
    setBuyerName('');
    setBuyerPhone('');
    setBuyerAddress('');
    setCurrentScreen('store');
  };

  // 1. वेलकम स्क्रीन
  if (currentScreen === 'welcome') {
    return (
      <ImageBackground 
        source={require('./splash.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.container}>
            <View style={styles.content}>
              <View style={{flex: 1}} />
              
              <View style={styles.card}>
                <Text style={styles.welcomeHeading}>Welcome to Arishop</Text>
                <Text style={styles.welcomeText}>
                  Shop More • Get More • Be Happy. Your magical shopping experience is ready!
                </Text>

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

  // 3. चेकआउट / आर्डर फॉर्म स्क्रीन
  if (selectedProduct) {
    return (
      <SafeAreaView style={styles.containerStore}>
        <ScrollView contentContainerStyle={styles.storeScroll}>
          <Text style={styles.storeHeader}>Checkout 🛒</Text>
          <Text style={styles.storeSubText}>Complete your order details below</Text>

          <View style={styles.productCard}>
            <Text style={styles.productTitle}>{selectedProduct.title}</Text>
            <Text style={styles.productDesc}>{selectedProduct.desc}</Text>
            <Text style={styles.priceText}>Price: {selectedProduct.price}</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter your name" 
              placeholderTextColor="#888"
              value={buyerName}
              onChangeText={setBuyerName}
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter 10-digit mobile number" 
              placeholderTextColor="#888"
              keyboardType="phone-pad"
              value={buyerPhone}
              onChangeText={setBuyerPhone}
            />

            <Text style={styles.label}>Delivery Address</Text>
            <TextInput 
              style={[styles.input, { height: 80 }]} 
              placeholder="House No, Street, City, Pincode" 
              placeholderTextColor="#888"
              multiline
              value={buyerAddress}
              onChangeText={setBuyerAddress}
            />

            <Text style={styles.label}>Payment Method</Text>
            <View style={styles.paymentRow}>
              <TouchableOpacity 
                style={[styles.payBtn, paymentMethod === 'COD' && styles.payBtnActive]}
                onPress={() => setPaymentMethod('COD')}
              >
                <Text style={styles.payBtnText}>Cash on Delivery</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.payBtn, paymentMethod === 'UPI/QR' && styles.payBtnActive]}
                onPress={() => setPaymentMethod('UPI/QR')}
              >
                <Text style={styles.payBtnText}>UPI / QR Code</Text>
              </TouchableOpacity>
            </View>

            {paymentMethod === 'UPI/QR' && (
              <View style={styles.qrBox}>
                <Text style={styles.qrText}>📱 Scan & Pay via UPI / QR</Text>
                <Text style={styles.qrSubText}>UPI ID: sahil@upi (Or scan store QR code)</Text>
              </View>
            )}

            <TouchableOpacity style={styles.exploreButton} onPress={handleCheckout}>
              <Text style={styles.buttonText}>Confirm Order 🚀</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => setSelectedProduct(null)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 2. स्टोर / डैशबोर्ड स्क्रीन (Admin Panel के साथ)
  return (
    <SafeAreaView style={styles.containerStore}>
      <ScrollView contentContainerStyle={styles.storeScroll}>
        <Text style={styles.storeHeader}>Arishop Store 🛒</Text>
        <Text style={styles.storeSubText}>Explore our exclusive collection and gifts!</Text>
        
        {/* सेलर / एडमिन पैनल बटन */}
        <TouchableOpacity 
          style={styles.adminToggleButton} 
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Text style={styles.adminToggleText}>
            {showAddForm ? '❌ Close Admin Panel' : '➕ Add New Product (Admin)'}
          </Text>
        </TouchableOpacity>

        {/* नया प्रोडक्ट जोड़ने का फॉर्म (सिर्फ आपके लिए) */}
        {showAddForm && (
          <View style={styles.formContainer}>
            <Text style={styles.formHeading}>Add Product to Store</Text>
            
            <Text style={styles.label}>Product Name</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. Smart Watch" 
              placeholderTextColor="#888"
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <Text style={styles.label}>Price</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. ₹799" 
              placeholderTextColor="#888"
              value={newPrice}
              onChangeText={setNewPrice}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Short description" 
              placeholderTextColor="#888"
              value={newDesc}
              onChangeText={setNewDesc}
            />

            <TouchableOpacity style={styles.exploreButton} onPress={handleAddProduct}>
              <Text style={styles.buttonText}>Save & Publish Product</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* प्रोडक्ट्स की लिस्ट जो स्क्रीन पर दिखेगी */}
        {products.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.productCard}
            onPress={() => setSelectedProduct(item)}
          >
            <Text style={styles.productTitle}>{item.title}</Text>
            <Text style={styles.productDesc}>{item.desc}</Text>
            <View style={styles.rowBetween}>
              <Text style={styles.priceText}>{item.price}</Text>
              <Text style={styles.buyText}>Buy Now ➔</Text>
            </View>
          </TouchableOpacity>
        ))}

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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
    marginTop: 10,
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
    marginBottom: 20,
  },
  adminToggleButton: {
    width: '100%',
    backgroundColor: '#0ea5e9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  adminToggleText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  formContainer: {
    width: '100%',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  formHeading: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    color: '#cbd5e0',
    fontSize: 13,
    marginBottom: 5,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
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
    marginBottom: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#38bdf8',
  },
  buyText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffcc00',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  payBtn: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    marginRight: 5,
  },
  payBtnActive: {
    borderColor: '#ffcc00',
    backgroundColor: '#1e293b',
  },
  payBtnText: {
    color: '#ffffff',
    fontSize: 13,
  },
  qrBox: {
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ffcc00',
  },
  qrText: {
    color: '#ffcc00',
    fontWeight: 'bold',
    fontSize: 14,
  },
  qrSubText: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 3,
  },
  backButton: {
    marginTop: 15,
    backgroundColor: '#334155',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  }
});
