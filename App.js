import React, { useState } from 'react';
import { StyleSheet, Text, View, ImageBackground, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Alert, Image } from 'react-native';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  
  // मास्टर कंट्रोल टॉगल स्विच (ऐप के अंदर से कंट्रोल करने के लिए)
  const [enableLoyaltyTier, setEnableLoyaltyTier] = useState(true);
  const [enableTopSellers, setEnableTopSellers] = useState(true);

  // यूजर का कुल खर्च और कॉइन्स (वॉलेट सिस्टम)
  const [userSpent, setUserSpent] = useState(1200);
  const [userCoins, setUserCoins] = useState(450); // जब 10,000 कॉइन होंगे तो ₹200 बनेंगे

  // कैटेगरी स्टेट
  const [selectedCategory, setSelectedCategory] = useState('All');

  // प्रोडक्ट्स की लिस्ट (फोटो, प्राइस, डिस्क्रिप्शन और मिनिमम स्पेंड के साथ)
  const [products, setProducts] = useState([
    { id: '1', title: 'Men Stylish Jacket', category: 'Men', price: '₹1499', desc: 'Premium winter wear for men.', image: 'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=500', minSpend: 0, isRare: false },
    { id: '2', title: 'Women Ethnic Kurti', category: 'Women', price: '₹999', desc: 'Beautiful festive collection.', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500', minSpend: 0, isRare: false },
    { id: '3', title: 'Kids Play Toy Car', category: 'Kids', price: '₹499', desc: 'Safe and fun toy for kids.', image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500', minSpend: 0, isRare: false },
    { id: '4', title: 'VIP Rare Gold Watch', category: 'Gadgets', price: '₹5500', desc: 'Exclusive item! Unlocked at ₹5000+ spend.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', minSpend: 5000, isRare: true }
  ]);

  // वीकली टॉप सेलर्स / कस्टमर्स (इंस्टाग्राम आईडी और फोटो के साथ - इजाजत मिलने पर)
  const [topSellers, setTopSellers] = useState([
    { id: '1', name: 'Rahul Verma', sales: '₹3,500', insta: '@rahul_insta', photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' },
    { id: '2', name: 'Aman Khan', sales: '₹4,200', insta: '@aman_official', photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100' }
  ]);

  // एडमिन पैनल फॉर्म स्टेट
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newCategory, setNewCategory] = useState('Men');
  const [newMinSpend, setNewMinSpend] = useState('0');

  // चेकआउट और AI सपोर्ट स्टेट
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  
  const [supportMessage, setSupportMessage] = useState('');
  const [aiChatLog, setAiChatLog] = useState([
    { sender: 'ai', text: 'Hello! I am Arishop AI Support. How can I help you with your order, refund, or replacement today?' }
  ]);

  // नया प्रोडक्ट जोड़ने का फंक्शन
  const handleAddProduct = () => {
    if (!newTitle || !newPrice) {
      Alert.alert('Error', 'कृपया प्रोडक्ट का नाम और प्राइस भरें!');
      return;
    }
    const newProd = {
      id: Date.now().toString(),
      title: newTitle,
      category: newCategory,
      price: newPrice.includes('₹') ? newPrice : '₹' + newPrice,
      desc: newDesc || 'High quality item from Arishop.',
      image: newImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      minSpend: parseInt(newMinSpend) || 0,
      isRare: (parseInt(newMinSpend) || 0) >= 5000
    };
    setProducts([newProd, ...products]);
    setNewTitle('');
    setNewPrice('');
    setNewDesc('');
    setNewImage('');
    setNewMinSpend('0');
    setShowAdminPanel(false);
    Alert.alert('Success', 'नया प्रोडक्ट फोटो के साथ लाइव हो गया है!');
  };

  // आर्डर कंफर्मेशन और स्क्रैच कार्ड कॉइन रिवॉर्ड
  const handleCheckout = () => {
    if (!buyerName || !buyerPhone || !buyerAddress) {
      Alert.alert('अधूरा विवरण', 'कृपया अपना नाम, फोन नंबर और पता भरें!');
      return;
    }
    // रैंडम कॉइन्स मिलना (5 से 20 के बीच)
    const earnedCoins = Math.floor(Math.random() * 16) + 5;
    setUserCoins(prev => prev + earnedCoins);

    Alert.alert('आर्डर सफल! 🎉', `धन्यवाद ${buyerName}! आर्डर कंफर्म हो गया है। आपको स्क्रैच कार्ड से +${earnedCoins} कॉइन्स मिले हैं!`);
    setSelectedProduct(null);
    setBuyerName('');
    setBuyerPhone('');
    setBuyerAddress('');
  };

  // AI सपोर्ट चैट रिस्पॉन्स सिमुलेशन
  const handleSendSupport = () => {
    if (!supportMessage.trim()) return;
    const userMsg = supportMessage;
    setAiChatLog(prev => [...prev, { sender: 'user', text: userMsg }]);
    setSupportMessage('');

    setTimeout(() => {
      let aiReply = "I understand your concern. Let me check your replacement/refund eligibility.";
      if(userMsg.toLowerCase().includes('refund') || userMsg.toLowerCase().includes('replace')) {
        aiReply = "For replacements or refunds, please share your issue details. If unresolved, you can connect directly with Sahil Customer Care below!";
      }
      setAiChatLog(prev => [...prev, { sender: 'ai', text: aiReply }]);
    }, 1000);
  };

  // 1. वेलकम स्क्रीन
  if (currentScreen === 'welcome') {
    return (
      <ImageBackground source={require('./splash.png')} style={styles.backgroundImage} resizeMode="cover">
        <View style={styles.overlay}>
          <SafeAreaView style={styles.container}>
            <View style={styles.content}>
              <View style={{flex: 1}} />
              <View style={styles.card}>
                <Text style={styles.welcomeHeading}>Welcome to Arishop</Text>
                <Text style={styles.welcomeText}>India's Best Professional Marketplace. Shop, Scratch & Earn Rewards!</Text>
                <TouchableOpacity style={styles.exploreButton} onPress={() => setCurrentScreen('store')}>
                  <Text style={styles.buttonText}>Open Store ➔</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.footerText}>Powered by Sahil Raikwar</Text>
            </View>
          </SafeAreaView>
        </View>
      </ImageBackground>
    );
  }

  // 3. चेकआउट स्क्रीन
  if (selectedProduct) {
    return (
      <SafeAreaView style={styles.containerStore}>
        <ScrollView contentContainerStyle={styles.storeScroll}>
          <Text style={styles.storeHeader}>Secure Checkout 🛒</Text>
          <View style={styles.productCard}>
            <Image source={{ uri: selectedProduct.image }} style={styles.checkoutImage} />
            <Text style={styles.productTitle}>{selectedProduct.title}</Text>
            <Text style={styles.priceText}>{selectedProduct.price}</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} placeholder="Your name" placeholderTextColor="#888" value={buyerName} onChangeText={setBuyerName} />
            <Text style={styles.label}>Phone Number</Text>
            <TextInput style={styles.input} placeholder="10-digit mobile" placeholderTextColor="#888" keyboardType="phone-pad" value={buyerPhone} onChangeText={setBuyerPhone} />
            <Text style={styles.label}>Delivery Address</Text>
            <TextInput style={[styles.input, { height: 70 }]} placeholder="Full address" placeholderTextColor="#888" multiline value={buyerAddress} onChangeText={setBuyerAddress} />

            <TouchableOpacity style={styles.exploreButton} onPress={handleCheckout}>
              <Text style={styles.buttonText}>Confirm Order & Earn Coins 🚀</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton} onPress={() => setSelectedProduct(null)}>
              <Text style={styles.buttonText}>Back to Store</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 2. मुख्य स्टोर स्क्रीन (Amazon/Flipkart Style + Admin + AI Support)
  return (
    <SafeAreaView style={styles.containerStore}>
      <ScrollView contentContainerStyle={styles.storeScroll}>
        
        {/* टॉप हेडर और कॉइन वॉलेट */}
        <View style={styles.headerRow}>
          <Text style={styles.storeHeader}>Arishop 🛍️</Text>
          <View style={styles.coinBadge}>
            <Text style={styles.coinText}>🪙 {userCoins} Coins</Text>
          </View>
        </View>

        <TextInput style={styles.searchBar} placeholder="🔍 Search for clothes, gadgets, shoes..." placeholderTextColor="#888" />

        {/* कैटेगरी टैब्स (Amazon/Flipkart Style) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {['All', 'Men', 'Women', 'Kids', 'Gadgets'].map(cat => (
            <TouchableOpacity key={cat} style={[styles.catChip, selectedCategory === cat && styles.catChipActive]} onPress={() => setSelectedCategory(cat)}>
              <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* एडमिन मास्टर टॉगल पैनल बटन */}
        <TouchableOpacity style={styles.adminToggleButton} onPress={() => setShowAdminPanel(!showAdminPanel)}>
          <Text style={styles.adminToggleText}>{showAdminPanel ? '❌ Close Admin Panel' : '⚙️ Admin Panel & Master Controls'}</Text>
        </TouchableOpacity>

        {/* एडमिन पैनल: मास्टर सेटिंग्स और नया प्रोडक्ट जोड़ना */}
        {showAdminPanel && (
          <View style={styles.formContainer}>
            <Text style={styles.formHeading}>Master Settings & Add Product</Text>
            
            <View style={styles.toggleRow}>
              <Text style={styles.label}>Loyalty Tiers (₹5000 VIP):</Text>
              <TouchableOpacity onPress={() => setEnableLoyaltyTier(!enableLoyaltyTier)} style={[styles.switchBtn, enableLoyaltyTier ? styles.onBtn : styles.offBtn]}>
                <Text style={styles.switchText}>{enableLoyaltyTier ? 'ON' : 'OFF'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.label}>Weekly Top Sellers:</Text>
              <TouchableOpacity onPress={() => setEnableTopSellers(!enableTopSellers)} style={[styles.switchBtn, enableTopSellers ? styles.onBtn : styles.offBtn]}>
                <Text style={styles.switchText}>{enableTopSellers ? 'ON' : 'OFF'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.formHeading, {marginTop: 15, color: '#38bdf8'}]}>Add New Product</Text>
            <Text style={styles.label}>Product Name</Text>
            <TextInput style={styles.input} placeholder="e.g. Nike Shoes" placeholderTextColor="#888" value={newTitle} onChangeText={setNewTitle} />
            <Text style={styles.label}>Category (Men / Women / Kids / Gadgets)</Text>
            <TextInput style={styles.input} placeholder="Men" placeholderTextColor="#888" value={newCategory} onChangeText={setNewCategory} />
            <Text style={styles.label}>Price</Text>
            <TextInput style={styles.input} placeholder="e.g. ₹1299" placeholderTextColor="#888" value={newPrice} onChangeText={setNewPrice} />
            <Text style={styles.label}>Image URL (Photo Link)</Text>
            <TextInput style={styles.input} placeholder="Paste image link here" placeholderTextColor="#888" value={newImage} onChangeText={setNewImage} />
            <Text style={styles.label}>Description</Text>
            <TextInput style={styles.input} placeholder="Short details" placeholderTextColor="#888" value={newDesc} onChangeText={setNewDesc} />
            <Text style={styles.label}>Min Spend (0 for Normal, 5000 for VIP)</Text>
            <TextInput style={styles.input} placeholder="0 or 5000" placeholderTextColor="#888" keyboardType="numeric" value={newMinSpend} onChangeText={setNewMinSpend} />

            <TouchableOpacity style={styles.exploreButton} onPress={handleAddProduct}>
              <Text style={styles.buttonText}>Publish Product Now 🚀</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* वीकली टॉप सेलर सेक्शन (मास्टर टॉगल ऑन होने पर) */}
        {enableTopSellers && (
          <View style={styles.topSellerSection}>
            <Text style={styles.topSellerHeader}>🏆 Weekly Top Customers & Sellers</Text>
            <Text style={styles.topSellerSub}>Featured with explicit permission only!</Text>
            {topSellers.map(s => (
              <View key={s.id} style={styles.sellerRow}>
                <Image source={{ uri: s.photo }} style={styles.sellerAvatar} />
                <View style={{flex: 1, marginLeft: 10}}>
                  <Text style={styles.sellerName}>{s.name} ({s.sales})</Text>
                  <Text style={styles.sellerInsta}>📸 Insta: {s.insta}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* VIP लॉयल्टी स्टेटस कार्ड */}
        {enableLoyaltyTier && (
          <View style={styles.levelCard}>
            <Text style={styles.levelTitle}>👑 VIP & Rare Section Status</Text>
            <Text style={styles.levelText}>Your Total Spent: ₹{userSpent}</Text>
            <Text style={styles.levelSubText}>
              {userSpent >= 5000 ? 'Unlocked: Super Premium & Rare Items Available!' : '🔒 Spend ₹5000+ total to unlock Super Premium VIP items!'}
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Trending Products ({selectedCategory})</Text>

        {/* प्रोडक्ट्स ग्रिड लिस्ट */}
        {products.filter(p => selectedCategory === 'All' || p.category === selectedCategory).map(item => {
          const isLocked = enableLoyaltyTier && (userSpent < item.minSpend);
          return (
            <View key={item.id} style={[styles.productCard, isLocked && styles.lockedCard]}>
              <Image source={{ uri: item.image }} style={styles.productImage} />
              <View style={{padding: 12}}>
                <Text style={styles.productTitle}>{item.title}</Text>
                <Text style={styles.productDesc}>{item.desc}</Text>
                <View style={styles.rowBetween}>
                  <Text style={styles.priceText}>{item.price}</Text>
                  {isLocked ? (
                    <Text style={styles.lockText}>🔒 Unlocks at ₹{item.minSpend}</Text>
                  ) : (
                    <TouchableOpacity style={styles.buyNowSmallBtn} onPress={() => setSelectedProduct(item)}>
                      <Text style={styles.buyText}>Buy Now</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        })}

        {/* Google AI सपोर्ट + साहिल कस्टमर केयर */}
        <View style={styles.supportBox}>
          <Text style={styles.supportHeader}>🤖 Arishop AI Support</Text>
          <Text style={styles.supportSub}>Ask about refunds, replacements, or delivery status.</Text>
          
          <View style={styles.chatContainer}>
            {aiChatLog.map((chat, idx) => (
              <View key={idx} style={[styles.chatBubble, chat.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
                <Text style={styles.chatText}>{chat.text}</Text>
              </View>
            ))}
          </View>

          <View style={styles.chatInputRow}>
            <TextInput style={[styles.input, {flex: 1, marginRight: 8}]} placeholder="Type your issue..." placeholderTextColor="#888" value={supportMessage} onChangeText={setSupportMessage} />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSendSupport}>
              <Text style={styles.buttonText}>Send</Text>
            </TouchableOpacity>
          </View>

          {/* साहिल कस्टमर केयर मैन्युअल बटन */}
          <TouchableOpacity style={styles.sahilCareBtn} onPress={() => Alert.alert('Sahil Customer Care', 'Connecting to Sahil Raikwar (Customer Care Line)... Call: +91-9876543210')}>
            <Text style={styles.sahilCareText}>📞 Call Sahil Customer Care</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)' },
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 30 },
  card: { width: '100%', backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#38bdf8' },
  welcomeHeading: { fontSize: 22, fontWeight: 'bold', color: '#ffffff', marginBottom: 6 },
  welcomeText: { fontSize: 13, color: '#cbd5e0', textAlign: 'center', marginBottom: 16 },
  exploreButton: { width: '100%', backgroundColor: '#ffcc00', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#000000', fontSize: 15, fontWeight: 'bold' },
  footerText: { color: '#ffffff', fontSize: 11, marginTop: 10 },
  containerStore: { flex: 1, backgroundColor: '#0f172a' },
  storeScroll: { padding: 15, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 10 },
  storeHeader: { fontSize: 24, fontWeight: 'bold', color: '#38bdf8' },
  coinBadge: { backgroundColor: '#1e293b', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#ffcc00' },
  coinText: { color: '#ffcc00', fontSize: 12, fontWeight: 'bold' },
  searchBar: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 10, color: '#ffffff', paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 15 },
  categoryScroll: { marginBottom: 15 },
  catChip: { backgroundColor: '#1e293b', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#334155' },
  catChipActive: { backgroundColor: '#38bdf8', borderColor: '#38bdf8' },
  catText: { color: '#cbd5e0', fontSize: 13, fontWeight: 'bold' },
  catTextActive: { color: '#0f172a' },
  adminToggleButton: { width: '100%', backgroundColor: '#0ea5e9', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  adminToggleText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  formContainer: { width: '100%', backgroundColor: '#1e293b', borderRadius: 16, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#38bdf8' },
  formHeading: { color: '#38bdf8', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 6 },
  switchBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
  onBtn: { backgroundColor: '#22c55e' },
  offBtn: { backgroundColor: '#ef4444' },
  switchText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  label: { color: '#cbd5e0', fontSize: 12, marginBottom: 4, marginTop: 8 },
  input: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 8, color: '#ffffff', paddingHorizontal: 12, paddingVertical: 9, fontSize: 13 },
  topSellerSection: { width: '100%', backgroundColor: '#1e293b', borderRadius: 14, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#38bdf8' },
  topSellerHeader: { color: '#38bdf8', fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
  topSellerSub: { color: '#94a3b8', fontSize: 11, marginBottom: 8 },
  sellerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', padding: 8, borderRadius: 8, marginBottom: 6 },
  sellerAvatar: { width: 35, height: 35, borderRadius: 17.5 },
  sellerName: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  sellerInsta: { color: '#38bdf8', fontSize: 11 },
  levelCard: { width: '100%', backgroundColor: '#1e293b', borderRadius: 14, padding: 14, marginBottom: 15, borderWidth: 1, borderColor: '#ffcc00' },
  levelTitle: { color: '#ffcc00', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  levelText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold', marginBottom: 2 },
  levelSubText: { color: '#94a3b8', fontSize: 11 },
  sectionTitle: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  productCard: { width: '100%', backgroundColor: '#1e293b', borderRadius: 16, overflow: 'hidden', marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  lockedCard: { opacity: 0.75, borderColor: '#475569' },
  productImage: { width: '100%', height: 160 },
  checkoutImage: { width: '100%', height: 180, borderRadius: 10, marginBottom: 10 },
  productTitle: { fontSize: 16, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
  productDesc: { fontSize: 12, color: '#cbd5e0', marginBottom: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  priceText: { fontSize: 15, fontWeight: 'bold', color: '#38bdf8' },
  buyNowSmallBtn: { backgroundColor: '#ffcc00', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  buyText: { fontSize: 12, fontWeight: 'bold', color: '#000000' },
  lockText: { fontSize: 11, fontWeight: 'bold', color: '#ef4444' },
  supportBox: { width: '100%', backgroundColor: '#1e293b', borderRadius: 16, padding: 15, marginTop: 10, borderWidth: 1, borderColor: '#38bdf8' },
  supportHeader: { color: '#38bdf8', fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
  supportSub: { color: '#94a3b8', fontSize: 11, marginBottom: 10 },
  chatContainer: { maxHeight: 150, backgroundColor: '#0f172a', padding: 10, borderRadius: 8, marginBottom: 10 },
  chatBubble: { padding: 8, borderRadius: 8, marginBottom: 6, maxWidth: '80%' },
  userBubble: { backgroundColor: '#38bdf8', alignSelf: 'flex-end' },
  aiBubble: { backgroundColor: '#334155', alignSelf: 'flex-start' },
  chatText: { color: '#ffffff', fontSize: 11 },
  chatInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sendBtn: { backgroundColor: '#ffcc00', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, justifyContent: 'center' },
  sahilCareBtn: { backgroundColor: '#22c55e', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 5 },
  sahilCareText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  backButton: { marginTop: 10, backgroundColor: '#334155', paddingVertical: 12, borderRadius: 10, alignItems: 'center', width: '100%' }
});
