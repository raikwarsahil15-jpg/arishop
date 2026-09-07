import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, ImageBackground, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('auth');
  const [authInput, setAuthInput] = useState('');
  const [loggedInUser, setLoggedInUser] = useState('');

  // मास्टर कंट्रोल टॉगल
  const [enableBanners, setEnableBanners] = useState(true);
  const [enableCategoriesGrid, setEnableCategoriesGrid] = useState(true);
  const [enableLoyaltyTier, setEnableLoyaltyTier] = useState(true);
  const [enableTopSellers, setEnableTopSellers] = useState(true);
  const [enableMultiVendor, setEnableMultiVendor] = useState(true);

  // नैविगेशन और वॉलेट स्टेट्स
  const [bottomTab, setBottomTab] = useState('home');
  const [userSpent, setUserSpent] = useState(1200);
  const [userCoins, setUserCoins] = useState(450); 
  const [liveOrdersList, setLiveOrdersList] = useState([]); 

  // बैनर रोटेशन (मेमोरी लीक से बचाने के लिए क्लीनअप के साथ)
  const bannerList = useMemo(() => [
    { id: '1', title: '🔥 Launch Offer: First 100 Orders Get 20% OFF!', sub: 'Earn 1-50 random coins per order!' },
    { id: '2', title: '✨ New Festive Collection Live Now!', sub: 'Explore premium clothes & accessories.' },
    { id: '3', title: '🚀 Multi-Vendor Marketplace Open!', sub: 'Sell your products & earn with Arishop.' }
  ], []);

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % bannerList.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [bannerList]);

  const [selectedCategory, setSelectedCategory] = useState('All');

  const [products, setProducts] = useState([
    { 
      id: '1', 
      title: 'Men Stylish Jacket', 
      category: 'Men', 
      price: '₹1499', 
      discountPercent: 10, 
      desc: 'Premium winter wear for men.', 
      image: 'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=500', 
      minSpend: 0, 
      isRare: false,
      sellerName: 'Sahil (Master Admin)',
      availableSizes: ['S', 'M', 'L', 'XL'],
      availableColors: ['Black', 'Navy Blue', 'Olive']
    },
    { 
      id: '2', 
      title: 'Women Ethnic Kurti', 
      category: 'Women', 
      price: '₹999', 
      discountPercent: 15, 
      desc: 'Beautiful festive collection.', 
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500', 
      minSpend: 0, 
      isRare: false,
      sellerName: 'Sahil (Master Admin)',
      availableSizes: ['XS', 'S', 'M', 'L'],
      availableColors: ['Red', 'Pink', 'Yellow']
    }
  ]);

  const topSellers = useMemo(() => [
    { id: '1', name: 'Rahul Verma', sales: '₹3,500', insta: '@rahul_insta', photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' },
    { id: '2', name: 'Aman Khan', sales: '₹4,200', insta: '@aman_official', photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100' }
  ], []);

  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  // एडमिन प्रोडक्ट स्टेट्स
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDiscount, setNewDiscount] = useState('0');
  const [newDesc, setNewDesc] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newCategory, setNewCategory] = useState('Men');
  const [newMinSpend, setNewMinSpend] = useState('0');
  const [newSizes, setNewSizes] = useState('S, M, L, XL');
  const [newColors, setNewColors] = useState('Black, White, Blue');

  // सेलर रजिस्ट्रेशन स्टेट्स
  const [showSellerRegModal, setShowSellerRegModal] = useState(false);
  const [vendorShopName, setVendorShopName] = useState('');
  const [vendorOwnerName, setVendorOwnerName] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [vendorProdTitle, setVendorProdTitle] = useState('');
  const [vendorProdPrice, setVendorProdPrice] = useState('');
  const [vendorProdImage, setVendorProdImage] = useState('');

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerPincode, setBuyerPincode] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  
  const [supportMessage, setSupportMessage] = useState('');
  const [aiChatLog, setAiChatLog] = useState([
    { sender: 'ai', text: 'Hello! Welcome to Arishop. How can I help you with your order or selling today?' }
  ]);

  const handleLogin = useCallback(() => {
    if (!authInput.trim()) {
      Alert.alert('Error', 'कृपया अपना मोबाइल नंबर या जीमेल आईडी दर्ज करें!');
      return;
    }
    setLoggedInUser(authInput.trim());
    setCurrentScreen('welcome');
  }, [authInput]);

  const handleAddProduct = useCallback(() => {
    if (!newTitle.trim() || !newPrice.trim()) {
      Alert.alert('Error', 'कृपया प्रोडक्ट का नाम और प्राइस भरें!');
      return;
    }
    const numericPrice = parseInt(newPrice.replace(/[^0-9]/g, '')) || 1000;
    const isLuxury = numericPrice >= 5000;

    const newProd = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      category: newCategory,
      price: '₹' + numericPrice,
      discountPercent: parseInt(newDiscount) || 0,
      desc: newDesc.trim() || 'High quality item from Arishop.',
      image: newImage.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      minSpend: isLuxury ? 5000 : 0,
      isRare: isLuxury,
      sellerName: 'Sahil (Master Admin)',
      availableSizes: newSizes ? newSizes.split(',').map(s => s.trim()) : ['Standard'],
      availableColors: newColors ? newColors.split(',').map(c => c.trim()) : ['Default']
    };

    setProducts(prev => [newProd, ...prev]);
    setNewTitle('');
    setNewPrice('');
    setNewDiscount('0');
    setNewDesc('');
    setNewImage('');
    setShowAdminPanel(false);
    Alert.alert('Success', 'मास्टर एडमिन द्वारा नया प्रोडक्ट लाइव कर दिया गया है!');
  }, [newTitle, newPrice, newCategory, newDiscount, newDesc, newImage, newSizes, newColors]);

  const handleVendorProductSubmit = useCallback(() => {
    if (!enableMultiVendor) {
      Alert.alert('Notice', 'फिलहाल अन्य सेलर्स के लिए रजिस्ट्रेशन बंद (OFF) है।');
      return;
    }
    if (!vendorShopName.trim() || !vendorOwnerName.trim() || !vendorPhone.trim() || !vendorProdTitle.trim() || !vendorProdPrice.trim()) {
      Alert.alert('अधूरा फॉर्म', 'कृपया सभी अनिवार्य विवरण भरें!');
      return;
    }

    const rawPrice = parseInt(vendorProdPrice.replace(/[^0-9]/g, '')) || 500;
    const newVendorProd = {
      id: Date.now().toString(),
      title: vendorProdTitle.trim(),
      category: 'Men',
      price: '₹' + rawPrice,
      discountPercent: 5,
      desc: `Sold by partner store: ${vendorShopName.trim()}`,
      image: vendorProdImage.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      minSpend: 0,
      isRare: false,
      sellerName: `${vendorShopName.trim()} (${vendorOwnerName.trim()})`,
      availableSizes: ['S', 'M', 'L', 'XL'],
      availableColors: ['Default']
    };

    setProducts(prev => [newVendorProd, ...prev]);
    setShowSellerRegModal(false);
    setVendorShopName('');
    setVendorOwnerName('');
    setVendorPhone('');
    setVendorProdTitle('');
    setVendorProdPrice('');
    setVendorProdImage('');

    Alert.alert(
      'पार्टनर सेलर प्रोडक्ट लाइव! 🤝', 
      `बधाई हो ${vendorOwnerName}!\nआपका प्रोडक्ट Arishop पर लाइव हो गया है।\n\n📌 नियम: प्रत्येक सफल बिक्री पर 10% प्लेटफॉर्म कमीशन और 2% डिलीवरी चार्ज कटेगा।`
    );
  }, [enableMultiVendor, vendorShopName, vendorOwnerName, vendorPhone, vendorProdTitle, vendorProdPrice, vendorProdImage]);

  const handleCheckout = useCallback(() => {
    if (!buyerName.trim() || !buyerPhone.trim() || !buyerPincode.trim() || !buyerAddress.trim()) {
      Alert.alert('अधूरा विवरण', 'कृपया नाम, फोन, पिनकोड और पूरा पता भरें!');
      return;
    }
    if (buyerPincode.trim().length !== 6) {
      Alert.alert('अवैध पिन कोड', 'कृपया सही 6-अंकों का भारतीय पिन कोड दर्ज करें!');
      return;
    }

    const courierPartners = ['Delhivery Express', 'Shiprocket Air', 'Blue Dart Express', 'Xpressbees'];
    const assignedCourier = courierPartners[Math.floor(Math.random() * courierPartners.length)];
    const trackingId = 'ARISHOP-' + Math.floor(100000 + Math.random() * 900000);

    const earnedCoins = Math.floor(Math.random() * 10) + 1;
    setUserCoins(prev => prev + earnedCoins);
    setUserSpent(prev => prev + 500);

    const newOrderData = {
      orderId: trackingId,
      productName: selectedProduct.title,
      seller: selectedProduct.sellerName,
      buyer: buyerName.trim(),
      courier: assignedCourier,
      status: 'Dispatched to Courier'
    };

    setLiveOrdersList(prev => [newOrderData, ...prev]);

    Alert.alert(
      'आर्डर सफल & कूरियर बुक! 🚚🎉', 
      `धन्यवाद ${buyerName}!\n\n📦 कूरियर: ${assignedCourier}\n🔖 ट्रैकिंग आईडी: ${trackingId}\n+${earnedCoins} कॉइन्स जुड़े!`
    );

    setSelectedProduct(null);
    setSelectedSize('');
    setBuyerName('');
    setBuyerPhone('');
    setBuyerPincode('');
    setBuyerAddress('');
  }, [buyerName, buyerPhone, buyerPincode, buyerAddress, selectedProduct]);

  const handleSendSupport = useCallback(() => {
    if (!supportMessage.trim()) return;
    const userMsg = supportMessage.trim();
    setAiChatLog(prev => [...prev, { sender: 'user', text: userMsg }]);
    setSupportMessage('');
    setTimeout(() => {
      setAiChatLog(prev => [...prev, { sender: 'ai', text: "For support or commission details (10% platform fee + 2% delivery), contact Sahil Customer Care!" }]);
    }, 800);
  }, [supportMessage]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => selectedCategory === 'All' || p.category === selectedCategory);
  }, [products, selectedCategory]);

  if (currentScreen === 'auth') {
    return (
      <SafeAreaView style={styles.containerStore}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.authContainer}>
          <Text style={styles.authLogo}>Arishop 🛍️</Text>
          <Text style={styles.authSub}>Multi-Vendor Professional Marketplace (Lag-Free)</Text>
          <Text style={styles.label}>Mobile Number or Gmail ID</Text>
          <TextInput style={styles.input} placeholder="e.g. 9876543210 or name@gmail.com" placeholderTextColor="#888" value={authInput} onChangeText={setAuthInput} />
          <TouchableOpacity style={styles.exploreButton} onPress={handleLogin}>
            <Text style={styles.buttonText}>Continue to Store ➔</Text>
          </TouchableOpacity>
          <Text style={styles.footerText}>Secure & Optimized Platform by Sahil Raikwar</Text>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'welcome') {
    return (
      <ImageBackground source={require('./splash.png')} style={styles.backgroundImage} resizeMode="cover">
        <View style={styles.overlay}>
          <SafeAreaView style={styles.container}>
            <View style={styles.content}>
              <View style={{flex: 1}} />
              <View style={styles.card}>
                <Text style={styles.welcomeHeading}>Welcome, {loggedInUser}!</Text>
                <Text style={styles.welcomeText}>India's Best Multi-Vendor Marketplace.</Text>
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

  if (selectedProduct) {
    const rawPriceNum = parseInt(selectedProduct.price.replace(/[^0-9]/g, '')) || 500;
    const finalDiscountPrice = rawPriceNum - (rawPriceNum * (selectedProduct.discountPercent || 0)) / 100;

    return (
      <SafeAreaView style={styles.containerStore}>
        <ScrollView contentContainerStyle={styles.storeScroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.storeHeader}>Secure Checkout & Delivery 🛒</Text>
          <View style={styles.productCard}>
            <Image source={{ uri: selectedProduct.image }} style={styles.checkoutImage} />
            <Text style={styles.productTitle}>{selectedProduct.title}</Text>
            <Text style={{color: '#38bdf8', fontSize: 12, marginBottom: 4}}>Sold By: {selectedProduct.sellerName}</Text>
            <Text style={styles.priceText}>Price: ₹{Math.round(finalDiscountPrice)}</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Select Size</Text>
            <View style={styles.chipRow}>
              {selectedProduct.availableSizes?.map(sz => (
                <TouchableOpacity key={sz} style={[styles.optionChip, selectedSize === sz && styles.optionChipActive]} onPress={() => setSelectedSize(sz)}>
                  <Text style={[styles.optionChipText, selectedSize === sz && styles.optionChipTextActive]}>{sz}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} placeholder="Your name" placeholderTextColor="#888" value={buyerName} onChangeText={setBuyerName} />
            <Text style={styles.label}>Phone Number</Text>
            <TextInput style={styles.input} placeholder="10-digit mobile" placeholderTextColor="#888" keyboardType="phone-pad" value={buyerPhone} onChangeText={setBuyerPhone} />
            <Text style={styles.label}>Pin Code (6 Digits)</Text>
            <TextInput style={styles.input} placeholder="Pincode" placeholderTextColor="#888" keyboardType="numeric" maxLength={6} value={buyerPincode} onChangeText={setBuyerPincode} />
            <Text style={styles.label}>Delivery Address</Text>
            <TextInput style={[styles.input, { height: 70 }]} placeholder="House no, street, city" placeholderTextColor="#888" multiline value={buyerAddress} onChangeText={setBuyerAddress} />

            <TouchableOpacity style={styles.exploreButton} onPress={handleCheckout}>
              <Text style={styles.buttonText}>Confirm Order & Book Delivery 🚀</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton} onPress={() => setSelectedProduct(null)}>
              <Text style={styles.buttonText}>Back to Store</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.containerStore}>
      <ScrollView contentContainerStyle={styles.storeScroll} keyboardShouldPersistTaps="handled">
        
        <View style={styles.headerRow}>
          <Text style={styles.storeHeader}>Arishop 🛍️</Text>
          <View style={styles.coinBadge}>
            <Text style={styles.coinText}>🪙 {userCoins} Coins</Text>
          </View>
        </View>

        <TextInput style={styles.searchBar} placeholder="🔍 Search clothes, gadgets, partner items..." placeholderTextColor="#888" />

        {enableCategoriesGrid && (
          <View style={styles.amazonGridRow}>
            {['All', 'Men', 'Women', 'Kids', 'Gadgets', 'Deals', 'Beauty', 'More'].map(cat => (
              <TouchableOpacity key={cat} style={styles.gridItem} onPress={() => setSelectedCategory(cat === 'Deals' || cat === 'More' ? 'All' : cat)}>
                <View style={styles.gridCircle}>
                  <Text style={{fontSize: 16}}>📦</Text>
                </View>
                <Text style={styles.gridLabel}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {enableBanners && bannerList[currentBannerIndex] && (
          <View style={styles.bannerBox}>
            <Text style={styles.bannerTitle}>{bannerList[currentBannerIndex].title}</Text>
            <Text style={styles.bannerSub}>{bannerList[currentBannerIndex].sub}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.becomeSellerBtn} onPress={() => {
          if (!enableMultiVendor) {
            Alert.alert('Closed', 'वर्तमान में अन्य सेलर्स के लिए रजिस्ट्रेशन मास्टर एडमिन द्वारा बंद (OFF) है।');
            return;
          }
          setShowSellerRegModal(true);
        }}>
          <Text style={styles.becomeSellerText}>💼 Want to Sell on Arishop? Register Store Now</Text>
        </TouchableOpacity>

        {showSellerRegModal && (
          <View style={[styles.formContainer, {borderColor: '#22c55e'}]}>
            <Text style={[styles.formHeading, {color: '#22c55e'}]}>🤝 Partner Seller Registration</Text>
            <Text style={{color: '#cbd5e0', fontSize: 11, marginBottom: 10}}>
              नियम: प्रत्येक आर्डर पर 10% प्लेटफॉर्म कमीशन और 2% डिलीवरी चार्ज कटेगा।
            </Text>

            <Text style={styles.label}>Shop Name</Text>
            <TextInput style={styles.input} placeholder="e.g. Verma Fashions" placeholderTextColor="#888" value={vendorShopName} onChangeText={setVendorShopName} />
            <Text style={styles.label}>Owner Name</Text>
            <TextInput style={styles.input} placeholder="Your name" placeholderTextColor="#888" value={vendorOwnerName} onChangeText={setVendorOwnerName} />
            <Text style={styles.label}>Phone Number</Text>
            <TextInput style={styles.input} placeholder="10-digit mobile" placeholderTextColor="#888" keyboardType="phone-pad" value={vendorPhone} onChangeText={setVendorPhone} />
            <Text style={styles.label}>Product Title</Text>
            <TextInput style={styles.input} placeholder="e.g. Designer Kurti" placeholderTextColor="#888" value={vendorProdTitle} onChangeText={setVendorProdTitle} />
            <Text style={styles.label}>Product Price (₹)</Text>
            <TextInput style={styles.input} placeholder="e.g. ₹999" placeholderTextColor="#888" keyboardType="numeric" value={vendorProdPrice} onChangeText={setVendorProdPrice} />
            <Text style={styles.label}>Image URL</Text>
            <TextInput style={styles.input} placeholder="Paste image link" placeholderTextColor="#888" value={vendorProdImage} onChangeText={setVendorProdImage} />

            <TouchableOpacity style={[styles.exploreButton, {backgroundColor: '#22c55e'}]} onPress={handleVendorProductSubmit}>
              <Text style={[styles.buttonText, {color: '#ffffff'}]}>Submit & Publish Product 🚀</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.backButton, {marginTop: 6}]} onPress={() => setShowSellerRegModal(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.adminToggleButton} onPress={() => setShowAdminPanel(!showAdminPanel)}>
          <Text style={styles.adminToggleText}>{showAdminPanel ? '❌ Close Master Admin Controls' : '⚙️ Master Admin Control Panel'}</Text>
        </TouchableOpacity>

        {showAdminPanel && (
          <View style={styles.formContainer}>
            <Text style={styles.formHeading}>Master Controls</Text>
            <View style={styles.toggleRow}>
              <Text style={styles.label}>Multi-Vendor System:</Text>
              <TouchableOpacity onPress={() => setEnableMultiVendor(!enableMultiVendor)} style={[styles.switchBtn, enableMultiVendor ? styles.onBtn : styles.offBtn]}>
                <Text style={styles.switchText}>{enableMultiVendor ? 'ON' : 'OFF'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.formHeading, {marginTop: 10, color: '#38bdf8'}]}>Add Admin Product</Text>
            <TextInput style={styles.input} placeholder="Product Name" placeholderTextColor="#888" value={newTitle} onChangeText={setNewTitle} />
            <TextInput style={[styles.input, {marginTop: 6}]} placeholder="Price (₹)" placeholderTextColor="#888" keyboardType="numeric" value={newPrice} onChangeText={setNewPrice} />
            <TextInput style={[styles.input, {marginTop: 6}]} placeholder="Image URL" placeholderTextColor="#888" value={newImage} onChangeText={setNewImage} />

            <TouchableOpacity style={styles.exploreButton} onPress={handleAddProduct}>
              <Text style={styles.buttonText}>Publish Official Product 🚀</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.topSellerSection}>
          <Text style={styles.topSellerHeader}>🚚 Live Orders & Tracking</Text>
          {liveOrdersList.length === 0 ? (
            <Text style={{color: '#94a3b8', fontSize: 12}}>No orders yet.</Text>
          ) : (
            liveOrdersList.map((ord, i) => (
              <View key={i} style={[styles.sellerRow, {flexDirection: 'column', alignItems: 'flex-start', padding: 10}]}>
                <Text style={styles.sellerName}>📦 {ord.productName} (ID: {ord.orderId})</Text>
                <Text style={{color: '#22c55e', fontSize: 11, fontWeight: 'bold', marginTop: 2}}>Status: {ord.status}</Text>
                <Text style={{color: '#38bdf8', fontSize: 11}}>Courier: {ord.courier} | Seller: {ord.seller}</Text>
              </View>
            ))
          )}
        </View>

        {enableTopSellers && (
          <View style={styles.topSellerSection}>
            <Text style={styles.topSellerHeader}>🏆 Weekly Top Customers & Sellers</Text>
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

        <Text style={styles.sectionTitle}>Marketplace Products ({selectedCategory})</Text>

        {filteredProducts.map(item => {
          const rawNum = parseInt(item.price.replace(/[^0-9]/g, '')) || 500;
          const discountedVal = Math.round(rawNum - (rawNum * (item.discountPercent || 0)) / 100);

          return (
            <View key={item.id} style={styles.productCard}>
              <Image source={{ uri: item.image }} style={styles.productImage} />
              <View style={{padding: 12}}>
                <Text style={styles.productTitle}>{item.title}</Text>
                <Text style={styles.productDesc}>{item.desc}</Text>
                <Text style={{color: '#38bdf8', fontSize: 11, fontWeight: 'bold', marginBottom: 4}}>
                  🏪 Seller: {item.sellerName || 'Sahil (Master Admin)'}
                </Text>
                <View style={styles.rowBetween}>
                  <Text style={styles.priceText}>₹{discountedVal}</Text>
                  <TouchableOpacity style={styles.buyNowSmallBtn} onPress={() => setSelectedProduct(item)}>
                    <Text style={styles.buyText}>Select & Buy</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        <View style={styles.supportBox}>
          <Text style={styles.supportHeader}>🤖 Arishop AI Support</Text>
          <View style={styles.chatContainer}>
            {aiChatLog.map((chat, idx) => (
              <View key={idx} style={[styles.chatBubble, chat.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
                <Text style={styles.chatText}>{chat.text}</Text>
              </View>
            ))}
          </View>
          <View style={styles.chatInputRow}>
            <TextInput style={[styles.input, {flex: 1, marginRight: 8}]} placeholder="Type your query..." placeholderTextColor="#888" value={supportMessage} onChangeText={setSupportMessage} />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSendSupport}>
              <Text style={styles.buttonText}>Send</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.sahilCareBtn} onPress={() => Alert.alert('Sahil Customer Care', 'Connecting to Sahil Raikwar: +91-9876543210')}>
            <Text style={styles.sahilCareText}>📞 Call Sahil Customer Care</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <View style={styles.bottomNavContainer}>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => setBottomTab('home')}>
          <Text style={[styles.bottomNavText, bottomTab === 'home' && styles.bottomNavActive]}>🏠 Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => { setBottomTab('you'); Alert.alert('Profile', `Logged in: ${loggedInUser || 'Sahil'}`); }}>
          <Text style={[styles.bottomNavText, bottomTab === 'you' && styles.bottomNavActive]}>👤 You</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => { setBottomTab('wallet'); Alert.alert('Wallet', `Coins: ${userCoins} | Spent: ₹${userSpent}`); }}>
          <Text style={[styles.bottomNavText, bottomTab === 'wallet' && styles.bottomNavActive]}>🪙 Wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => { setBottomTab('cart'); Alert.alert('Cart', 'Your cart is ready.'); }}>
          <Text style={[styles.bottomNavText, bottomTab === 'cart' && styles.bottomNavActive]}>🛒 Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => { setBottomTab('menu'); setShowAdminPanel(true); }}>
          <Text style={[styles.bottomNavText, bottomTab === 'menu' && styles.bottomNavActive]}>☰ Menu</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)' },
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 30 },
  card: { width: '100%', backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#38bdf8' },
  authContainer: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', padding: 20 },
  authLogo: { fontSize: 30, fontWeight: 'bold', color: '#38bdf8', textAlign: 'center', marginBottom: 10 },
  authSub: { fontSize: 13, color: '#cbd5e0', textAlign: 'center', marginBottom: 25 },
  welcomeHeading: { fontSize: 22, fontWeight: 'bold', color: '#ffffff', marginBottom: 6 },
  welcomeText: { fontSize: 13, color: '#cbd5e0', textAlign: 'center', marginBottom: 16 },
  exploreButton: { width: '100%', backgroundColor: '#ffcc00', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#000000', fontSize: 15, fontWeight: 'bold' },
  footerText: { color: '#ffffff', fontSize: 11, marginTop: 10, textAlign: 'center' },
  containerStore: { flex: 1, backgroundColor: '#0f172a' },
  storeScroll: { padding: 15, paddingBottom: 80 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 10 },
  storeHeader: { fontSize: 24, fontWeight: 'bold', color: '#38bdf8' },
  coinBadge: { backgroundColor: '#1e293b', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#ffcc00' },
  coinText: { color: '#ffcc00', fontSize: 12, fontWeight: 'bold' },
  bannerBox: { backgroundColor: '#1e293b', borderRadius: 12, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: '#22c55e', alignItems: 'center' },
  bannerTitle: { color: '#22c55e', fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
  bannerSub: { color: '#cbd5e0', fontSize: 11, marginTop: 2, textAlign: 'center' },
  searchBar: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 10, color: '#ffffff', paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 12 },
  amazonGridRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 12 },
  gridItem: { width: '22%', alignItems: 'center', marginBottom: 10 },
  gridCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155', marginBottom: 4 },
  gridLabel: { color: '#cbd5e0', fontSize: 11, textAlign: 'center' },
  becomeSellerBtn: { width: '100%', backgroundColor: '#22c55e', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  becomeSellerText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
  adminToggleButton: { width: '100%', backgroundColor: '#0ea5e9', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  adminToggleText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
  formContainer: { width: '100%', backgroundColor: '#1e293b', borderRadius: 16, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#38bdf8' },
  formHeading: { color: '#38bdf8', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 6 },
  switchBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
  onBtn: { backgroundColor: '#22c55e' },
  offBtn: { backgroundColor: '#ef4444' },
  switchText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  label: { color: '#cbd5e0', fontSize: 12, marginBottom: 4, marginTop: 8 },
  input: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 8, color: '#ffffff', paddingHorizontal: 12, paddingVertical: 9, fontSize: 13 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 4 },
  optionChip: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 6, marginBottom: 6 },
  optionChipActive: { backgroundColor: '#38bdf8', borderColor: '#38bdf8' },
  optionChipText: { color: '#cbd5e0', fontSize: 12, fontWeight: 'bold' },
  optionChipTextActive: { color: '#0f172a' },
  topSellerSection: { width: '100%', backgroundColor: '#1e293b', borderRadius: 14, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#38bdf8' },
  topSellerHeader: { color: '#38bdf8', fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  sellerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', padding: 8, borderRadius: 8, marginBottom: 6 },
  sellerAvatar: { width: 35, height: 35, borderRadius: 17.5 },
  sellerName: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  sellerInsta: { color: '#38bdf8', fontSize: 11 },
  sectionTitle: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  productCard: { width: '100%', backgroundColor: '#1e293b', borderRadius: 16, overflow: 'hidden', marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  productImage: { width: '100%', height: 160 },
  checkoutImage: { width: '100%', height: 180, borderRadius: 10, marginBottom: 10 },
  productTitle: { fontSize: 16, fontWeight: 'bold', color: '#ffffff', marginBottom: 2 },
  productDesc: { fontSize: 12, color: '#cbd5e0', marginBottom: 4 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  priceText: { fontSize: 15, fontWeight: 'bold', color: '#38bdf8' },
  buyNowSmallBtn: { backgroundColor: '#ffcc00', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  buyText: { fontSize: 12, fontWeight: 'bold', color: '#000000' },
  supportBox: { width: '100%', backgroundColor: '#1e293b', borderRadius: 16, padding: 15, marginTop: 10, borderWidth: 1, borderColor: '#38bdf8' },
  supportHeader: { color: '#38bdf8', fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  chatContainer: { maxHeight: 120, backgroundColor: '#0f172a', padding: 8, borderRadius: 8, marginBottom: 8 },
  chatBubble: { padding: 6, borderRadius: 6, marginBottom: 4, maxWidth: '80%' },
  userBubble: { backgroundColor: '#38bdf8', alignSelf: 'flex-end' },
  aiBubble: { backgroundColor: '#334155', alignSelf: 'flex-start' },
  chatText: { color: '#ffffff', fontSize: 11 },
  chatInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  sendBtn: { backgroundColor: '#ffcc00', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, justifyContent: 'center' },
  sahilCareBtn: { backgroundColor: '#22c55e', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  sahilCareText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  backButton: { marginTop: 10, backgroundColor: '#334155', paddingVertical: 12, borderRadius: 10, alignItems: 'center', width: '100%' },
  bottomNavContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: '#0f172a', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#334155' },
  bottomNavItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  bottomNavText: { color: '#94a3b8', fontSize: 12 },
  bottomNavActive: { color: '#38bdf8', fontWeight: 'bold' }
});
