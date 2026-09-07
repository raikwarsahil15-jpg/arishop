import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ImageBackground, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Alert, Image } from 'react-native';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('auth');
  const [authInput, setAuthInput] = useState('');
  const [loggedInUser, setLoggedInUser] = useState('');

  // मास्टर कंट्रोल टॉगल (कौन सा सेक्शन दिखाना है या छुपाना है)
  const [enableBanners, setEnableBanners] = useState(true);
  const [enableCategoriesGrid, setEnableCategoriesGrid] = useState(true);
  const [enableLoyaltyTier, setEnableLoyaltyTier] = useState(true);
  const [enableTopSellers, setEnableTopSellers] = useState(true);
  const [enableClothingSection, setEnableClothingSection] = useState(true);
  const [enableGadgetsSection, setEnableGadgetsSection] = useState(true);

  // बॉटम नैविगेशन टैब स्टेट ('home', 'you', 'wallet', 'cart', 'menu')
  const [bottomTab, setBottomTab] = useState('home');

  // वॉलेट और कॉइन्स
  const [userSpent, setUserSpent] = useState(1200);
  const [userCoins, setUserCoins] = useState(450); 

  // बैनर रोटेशन स्टेट
  const bannerList = [
    { id: '1', title: '🔥 Launch Offer: First 100 Orders Get 20% OFF!', sub: 'Earn 1-50 random coins per order!' },
    { id: '2', title: '✨ New Festive Collection Live Now!', sub: 'Explore premium clothes & accessories.' },
    { id: '3', title: '🚀 Super Gadgets & Luxury Watches Available', sub: 'Unlock VIP tier on ₹5000+ purchases.' }
  ];
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % bannerList.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const [selectedCategory, setSelectedCategory] = useState('All');

  // प्रोडक्ट्स की खाली या कस्टमाइज़्ड लिस्ट (सिيर्फ वही जो आप जोड़ेंगे)
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
      availableSizes: ['XS', 'S', 'M', 'L'],
      availableColors: ['Red', 'Pink', 'Yellow']
    },
    { 
      id: '3', 
      title: 'VIP Rare Gold Watch (Luxury)', 
      category: 'Gadgets', 
      price: '₹5500', 
      discountPercent: 20, 
      desc: 'Exclusive item! Unlocked at ₹5000+ spend.', 
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', 
      minSpend: 5000, 
      isRare: true,
      availableSizes: ['Free Size'],
      availableColors: ['Gold', 'Silver', 'Rose Gold']
    }
  ]);

  const [topSellers, setTopSellers] = useState([
    { id: '1', name: 'Rahul Verma', sales: '₹3,500', insta: '@rahul_insta', photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' },
    { id: '2', name: 'Aman Khan', sales: '₹4,200', insta: '@aman_official', photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100' }
  ]);

  // एडमिन पैनल फॉर्म स्टेट
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDiscount, setNewDiscount] = useState('0');
  const [newDesc, setNewDesc] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newCategory, setNewCategory] = useState('Men');
  const [newMinSpend, setNewMinSpend] = useState('0');
  const [newSizes, setNewSizes] = useState('S, M, L, XL');
  const [newColors, setNewColors] = useState('Black, White, Blue');

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerPincode, setBuyerPincode] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [orderCount, setOrderCount] = useState(42);
  
  const [supportMessage, setSupportMessage] = useState('');
  const [aiChatLog, setAiChatLog] = useState([
    { sender: 'ai', text: 'Hello! I am Arishop AI Support. How can I help you with your order or products today?' }
  ]);

  const handleLogin = () => {
    if (!authInput.trim()) {
      Alert.alert('Error', 'कृपया अपना मोबाइल नंबर या जीमेल आईडी दर्ज करें!');
      return;
    }
    setLoggedInUser(authInput);
    setCurrentScreen('welcome');
  };

  const handleAddProduct = () => {
    if (!newTitle || !newPrice) {
      Alert.alert('Error', 'कृपया प्रोडक्ट का नाम और प्राइस भरें!');
      return;
    }
    const numericPrice = parseInt(newPrice.replace(/[^0-9]/g, '')) || 1000;
    const isLuxury = numericPrice >= 5000 || parseInt(newMinSpend) >= 5000;

    const newProd = {
      id: Date.now().toString(),
      title: newTitle,
      category: newCategory,
      price: '₹' + numericPrice,
      discountPercent: parseInt(newDiscount) || 0,
      desc: newDesc || 'High quality item from Arishop.',
      image: newImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      minSpend: isLuxury ? 5000 : (parseInt(newMinSpend) || 0),
      isRare: isLuxury,
      availableSizes: newSizes ? newSizes.split(',').map(s => s.trim()) : ['Standard'],
      availableColors: newColors ? newColors.split(',').map(c => c.trim()) : ['Default']
    };

    setProducts([newProd, ...products]);
    setNewTitle('');
    setNewPrice('');
    setNewDiscount('0');
    setNewDesc('');
    setNewImage('');
    setNewMinSpend('0');
    setShowAdminPanel(false);
    Alert.alert('Success', 'नया प्रोडक्ट सफलतापूर्वक लाइव हो गया है!');
  };

  const getRandomCoins = () => {
    const rand = Math.random();
    if (rand < 0.70) return Math.floor(Math.random() * 5) + 1;
    else if (rand < 0.92) return Math.floor(Math.random() * 5) + 6;
    else return Math.floor(Math.random() * 40) + 11;
  };

  const handleCheckout = () => {
    if (!buyerName || !buyerPhone || !buyerPincode || !buyerAddress) {
      Alert.alert('अधूरा विवरण', 'कृपया अपना नाम, फोन नंबर, पिन कोड और पूरा पता भरें!');
      return;
    }
    if (!selectedSize && selectedProduct?.availableSizes?.length > 0) {
      Alert.alert('साइज चुनें', 'कृपया प्रोडक्ट का साइज चुनें!');
      return;
    }
    if (!selectedColor && selectedProduct?.availableColors?.length > 0) {
      Alert.alert('कलर चुनें', 'कृपया प्रोडक्ट का कलर चुनें!');
      return;
    }

    const earnedCoins = getRandomCoins();
    setUserCoins(prev => prev + earnedCoins);
    setUserSpent(prev => prev + 500);
    setOrderCount(prev => prev + 1);

    Alert.alert('आर्डर सफल! 🎉', `धन्यवाद ${buyerName}! आपका ऑर्डर पिन कोड (${buyerPincode}) पर डिलीवर होगा। +${earnedCoins} कॉइन्स मिले हैं!`);
    setSelectedProduct(null);
    setSelectedSize('');
    setSelectedColor('');
    setBuyerName('');
    setBuyerPhone('');
    setBuyerPincode('');
    setBuyerAddress('');
  };

  const handleSendSupport = () => {
    if (!supportMessage.trim()) return;
    const userMsg = supportMessage;
    setAiChatLog(prev => [...prev, { sender: 'user', text: userMsg }]);
    setSupportMessage('');
    setTimeout(() => {
      setAiChatLog(prev => [...prev, { sender: 'ai', text: "I understand your query. For instant help, you can connect directly with Sahil Customer Care below!" }]);
    }, 1000);
  };

  if (currentScreen === 'auth') {
    return (
      <SafeAreaView style={styles.containerStore}>
        <View style={styles.authContainer}>
          <Text style={styles.authLogo}>Arishop 🛍️</Text>
          <Text style={styles.authSub}>Login with Mobile Number or Gmail to Start Shopping</Text>
          <Text style={styles.label}>Mobile Number or Gmail ID</Text>
          <TextInput style={styles.input} placeholder="e.g. 9876543210 or name@gmail.com" placeholderTextColor="#888" value={authInput} onChangeText={setAuthInput} />
          <TouchableOpacity style={styles.exploreButton} onPress={handleLogin}>
            <Text style={styles.buttonText}>Continue to Store ➔</Text>
          </TouchableOpacity>
          <Text style={styles.footerText}>Secure Login powered by Sahil Raikwar</Text>
        </View>
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
                <Text style={styles.welcomeText}>India's Best Professional Marketplace.</Text>
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
    const productDiscount = selectedProduct.discountPercent || 0;
    let finalDiscountPrice = rawPriceNum - (rawPriceNum * productDiscount) / 100;

    return (
      <SafeAreaView style={styles.containerStore}>
        <ScrollView contentContainerStyle={styles.storeScroll}>
          <Text style={styles.storeHeader}>Secure Checkout 🛒</Text>
          <View style={styles.productCard}>
            <Image source={{ uri: selectedProduct.image }} style={styles.checkoutImage} />
            <Text style={styles.productTitle}>{selectedProduct.title}</Text>
            <Text style={styles.priceText}>Price: ₹{Math.round(finalDiscountPrice)}</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Select Size ({selectedSize || 'Choose'})</Text>
            <View style={styles.chipRow}>
              {selectedProduct.availableSizes?.map(sz => (
                <TouchableOpacity key={sz} style={[styles.optionChip, selectedSize === sz && styles.optionChipActive]} onPress={() => setSelectedSize(sz)}>
                  <Text style={[styles.optionChipText, selectedSize === sz && styles.optionChipTextActive]}>{sz}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Select Color ({selectedColor || 'Choose'})</Text>
            <View style={styles.chipRow}>
              {selectedProduct.availableColors?.map(col => (
                <TouchableOpacity key={col} style={[styles.optionChip, selectedColor === col && styles.optionChipActive]} onPress={() => setSelectedColor(col)}>
                  <Text style={[styles.optionChipText, selectedColor === col && styles.optionChipTextActive]}>{col}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} placeholder="Your name" placeholderTextColor="#888" value={buyerName} onChangeText={setBuyerName} />
            <Text style={styles.label}>Phone Number</Text>
            <TextInput style={styles.input} placeholder="10-digit mobile" placeholderTextColor="#888" keyboardType="phone-pad" value={buyerPhone} onChangeText={setBuyerPhone} />
            <Text style={styles.label}>Pin Code</Text>
            <TextInput style={styles.input} placeholder="6-digit pin code" placeholderTextColor="#888" keyboardType="numeric" value={buyerPincode} onChangeText={setBuyerPincode} />
            <Text style={styles.label}>Delivery Address</Text>
            <TextInput style={[styles.input, { height: 70 }]} placeholder="House no, street, city" placeholderTextColor="#888" multiline value={buyerAddress} onChangeText={setBuyerAddress} />

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

  return (
    <SafeAreaView style={styles.containerStore}>
      <ScrollView contentContainerStyle={styles.storeScroll}>
        
        {/* टॉप हेडर */}
        <View style={styles.headerRow}>
          <Text style={styles.storeHeader}>Arishop 🛍️</Text>
          <View style={styles.coinBadge}>
            <Text style={styles.coinText}>🪙 {userCoins} Coins</Text>
          </View>
        </View>

        <TextInput style={styles.searchBar} placeholder="🔍 Search clothes, gadgets, shoes..." placeholderTextColor="#888" />

        {/* 1. Amazon/Flipkart स्टाइल कैटेगरी आइकॉन ग्रिड (On/Off समर्थित) */}
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

        {/* 2. ऑटो-रोटेटिंग प्रमोशनल बैनर (On/Off समर्थित) */}
        {enableBanners && (
          <View style={styles.bannerBox}>
            <Text style={styles.bannerTitle}>{bannerList[currentBannerIndex].title}</Text>
            <Text style={styles.bannerSub}>{bannerList[currentBannerIndex].sub}</Text>
          </View>
        )}

        {/* एडमिन मास्टर टॉगल पैनल बटन */}
        <TouchableOpacity style={styles.adminToggleButton} onPress={() => setShowAdminPanel(!showAdminPanel)}>
          <Text style={styles.adminToggleText}>{showAdminPanel ? '❌ Close Admin Panel & Controls' : '⚙️ Admin Panel (On/Off Sections & Add Products)'}</Text>
        </TouchableOpacity>

        {/* एडमिन पैनल: मास्टर ऑन/ऑफ टॉगल स्विच और प्रोडक्ट जोड़ने का फॉर्म */}
        {showAdminPanel && (
          <View style={styles.formContainer}>
            <Text style={styles.formHeading}>Master Section Controls (On/Off)</Text>
            
            <View style={styles.toggleRow}>
              <Text style={styles.label}>Auto Banners:</Text>
              <TouchableOpacity onPress={() => setEnableBanners(!enableBanners)} style={[styles.switchBtn, enableBanners ? styles.onBtn : styles.offBtn]}>
                <Text style={styles.switchText}>{enableBanners ? 'ON' : 'OFF'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.label}>Categories Grid:</Text>
              <TouchableOpacity onPress={() => setEnableCategoriesGrid(!enableCategoriesGrid)} style={[styles.switchBtn, enableCategoriesGrid ? styles.onBtn : styles.offBtn]}>
                <Text style={styles.switchText}>{enableCategoriesGrid ? 'ON' : 'OFF'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.label}>VIP Loyalty Tier:</Text>
              <TouchableOpacity onPress={() => setEnableLoyaltyTier(!enableLoyaltyTier)} style={[styles.switchBtn, enableLoyaltyTier ? styles.onBtn : styles.offBtn]}>
                <Text style={styles.switchText}>{enableLoyaltyTier ? 'ON' : 'OFF'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.label}>Weekly Top Customers:</Text>
              <TouchableOpacity onPress={() => setEnableTopSellers(!enableTopSellers)} style={[styles.switchBtn, enableTopSellers ? styles.onBtn : styles.offBtn]}>
                <Text style={styles.switchText}>{enableTopSellers ? 'ON' : 'OFF'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.formHeading, {marginTop: 15, color: '#38bdf8'}]}>Add New Product</Text>
            <Text style={styles.label}>Product Name</Text>
            <TextInput style={styles.input} placeholder="e.g. Nike Sneakers" placeholderTextColor="#888" value={newTitle} onChangeText={setNewTitle} />
            <Text style={styles.label}>Category (Men / Women / Kids / Gadgets)</Text>
            <TextInput style={styles.input} placeholder="Men" placeholderTextColor="#888" value={newCategory} onChangeText={setNewCategory} />
            <Text style={styles.label}>Price (₹)</Text>
            <TextInput style={styles.input} placeholder="e.g. ₹1999" placeholderTextColor="#888" value={newPrice} onChangeText={setNewPrice} />
            <Text style={styles.label}>Discount Percentage (%)</Text>
            <TextInput style={styles.input} placeholder="0" placeholderTextColor="#888" keyboardType="numeric" value={newDiscount} onChangeText={setNewDiscount} />
            <Text style={styles.label}>Available Sizes (Comma separated)</Text>
            <TextInput style={styles.input} placeholder="S, M, L, XL" placeholderTextColor="#888" value={newSizes} onChangeText={setNewSizes} />
            <Text style={styles.label}>Available Colors (Comma separated)</Text>
            <TextInput style={styles.input} placeholder="Black, Red" placeholderTextColor="#888" value={newColors} onChangeText={setNewColors} />
            <Text style={styles.label}>Image URL</Text>
            <TextInput style={styles.input} placeholder="Paste image link" placeholderTextColor="#888" value={newImage} onChangeText={setNewImage} />
            <Text style={styles.label}>Description</Text>
            <TextInput style={styles.input} placeholder="Short details" placeholderTextColor="#888" value={newDesc} onChangeText={setNewDesc} />

            <TouchableOpacity style={styles.exploreButton} onPress={handleAddProduct}>
              <Text style={styles.buttonText}>Publish Product Now 🚀</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* वीकली टॉप सेलर सेक्शन */}
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

        {/* VIP लॉयल्टी सेक्शन */}
        {enableLoyaltyTier && (
          <View style={styles.levelCard}>
            <Text style={styles.levelTitle}>👑 VIP & Luxury Section Status</Text>
            <Text style={styles.levelText}>Your Total Spent: ₹{userSpent}</Text>
            <Text style={styles.levelSubText}>
              {userSpent >= 5000 ? '✨ Super Premium Items Unlocked!' : '🔒 Spend ₹5000+ to unlock VIP status!'}
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Trending Products ({selectedCategory})</Text>

        {/* प्रोडक्ट्स ग्रिड लिस्ट */}
        {products.filter(p => selectedCategory === 'All' || p.category === selectedCategory).map(item => {
          const isLocked = enableLoyaltyTier && (userSpent < item.minSpend) && item.isRare;
          const rawNum = parseInt(item.price.replace(/[^0-9]/g, '')) || 500;
          const disc = item.discountPercent || 0;
          const discountedVal = Math.round(rawNum - (rawNum * disc) / 100);

          return (
            <View key={item.id} style={[styles.productCard, isLocked && styles.lockedCard]}>
              <Image source={{ uri: item.image }} style={styles.productImage} />
              <View style={{padding: 12}}>
                <Text style={styles.productTitle}>{item.title}</Text>
                <Text style={styles.productDesc}>{item.desc}</Text>
                <Text style={{color: '#94a3b8', fontSize: 11, marginBottom: 4}}>
                  Sizes: {item.availableSizes?.join(', ')} | Colors: {item.availableColors?.join(', ')}
                </Text>
                <View style={styles.rowBetween}>
                  <Text style={styles.priceText}>₹{discountedVal}</Text>
                  {isLocked ? (
                    <Text style={styles.lockText}>🔒 Locked</Text>
                  ) : (
                    <TouchableOpacity style={styles.buyNowSmallBtn} onPress={() => setSelectedProduct(item)}>
                      <Text style={styles.buyText}>Select & Buy</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        })}

        {/* AI सपोर्ट + साहिल कस्टमर केयर */}
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
            <TextInput style={[styles.input, {flex: 1, marginRight: 8}]} placeholder="Type your issue..." placeholderTextColor="#888" value={supportMessage} onChangeText={setSupportMessage} />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSendSupport}>
              <Text style={styles.buttonText}>Send</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.sahilCareBtn} onPress={() => Alert.alert('Sahil Customer Care', 'Connecting to Sahil Raikwar: +91-9876543210')}>
            <Text style={styles.sahilCareText}>📞 Call Sahil Customer Care</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* 3. बॉटम नैविगेशन बार (Amazon/Flipkart स्टाइल: Home, You, Wallet, Cart, Menu) */}
      <View style={styles.bottomNavContainer}>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => setBottomTab('home')}>
          <Text style={[styles.bottomNavText, bottomTab === 'home' && styles.bottomNavActive]}>🏠 Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => { setBottomTab('you'); Alert.alert('Profile (You)', `Logged in user: ${loggedInUser || 'Sahil'}`); }}>
          <Text style={[styles.bottomNavText, bottomTab === 'you' && styles.bottomNavActive]}>👤 You</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => { setBottomTab('wallet'); Alert.alert('Wallet & Coins', `Total Coins: ${userCoins}\nTotal Spent: ₹${userSpent}`); }}>
          <Text style={[styles.bottomNavText, bottomTab === 'wallet' && styles.bottomNavActive]}>🪙 Wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => { setBottomTab('cart'); Alert.alert('Cart', 'Your cart is ready for checkout.'); }}>
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
  levelCard: { width: '100%', backgroundColor: '#1e293b', borderRadius: 14, padding: 14, marginBottom: 15, borderWidth: 1, borderColor: '#ffcc00' },
  levelTitle: { color: '#ffcc00', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  levelText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold', marginBottom: 2 },
  levelSubText: { color: '#94a3b8', fontSize: 11 },
  sectionTitle: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  productCard: { width: '100%', backgroundColor: '#1e293b', borderRadius: 16, overflow: 'hidden', marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  lockedCard: { opacity: 0.75, borderColor: '#475569' },
  productImage: { width: '100%', height: 160 },
  checkoutImage: { width: '100%', height: 180, borderRadius: 10, marginBottom: 10 },
  productTitle: { fontSize: 16, fontWeight: 'bold', color: '#ffffff', marginBottom: 2 },
  productDesc: { fontSize: 12, color: '#cbd5e0', marginBottom: 4 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  priceText: { fontSize: 15, fontWeight: 'bold', color: '#38bdf8' },
  buyNowSmallBtn: { backgroundColor: '#ffcc00', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  buyText: { fontSize: 12, fontWeight: 'bold', color: '#000000' },
  lockText: { fontSize: 11, fontWeight: 'bold', color: '#ef4444' },
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
