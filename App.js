import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, ImageBackground, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Alert, Image, KeyboardAvoidingView, Platform, Linking } from 'react-native';

export default function App() {
  // परसिस्टेंट लॉगिन स्टेट्स
  const [currentScreen, setActiveScreen] = useState('welcome'); // 'auth', 'otp', 'name', 'welcome', 'store'
  const [authInput, setAuthInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [loggedInUser, setLoggedInUser] = useState('Sahil Raikwar');

  // मास्टर कंट्रोल टॉगल (मास्टर एडमिन के हाथ में)
  const [masterAllOn, setMasterAllOn] = useState(true);
  const [enableBanners, setEnableBanners] = useState(true);
  const [enableCategoriesGrid, setEnableCategoriesGrid] = useState(true);
  const [enableTopSellers, setEnableTopSellers] = useState(true);
  const [enableMultiVendor, setEnableMultiVendor] = useState(true);
  const [enableLuxurySection, setEnableLuxurySection] = useState(true);
  
  // कस्टमर सपोर्ट एजेंट संख्या और सेटिंग्स
  const [supportAgentCount, setSupportAgentCount] = useState(5);
  const supportCareNumber = '9205013660';

  // कैटेगरीज ऑन/ऑफ टॉगल स्टेट्स
  const [categoryToggles, setCategoryToggles] = useState({
    Electronics: true,
    Fashion: true,
    Mobiles: true,
    Home: true,
    Beauty: true,
    Grocery: true,
    Sports: true
  });

  // नैविगेशन और वॉलेट स्टेट्स
  const [bottomTab, setBottomTab] = useState('home');
  const [userSpent, setUserSpent] = useState(1200);
  const [userCoins, setUserCoins] = useState(450); 
  const [liveOrdersList, setLiveOrdersList] = useState([]); 
  const [cancelledOrdersCount, setCancelledOrdersCount] = useState(0);
  const [refundedOrdersCount, setRefundedOrdersCount] = useState(0);

  // बैनर रोटेशन लिस्ट
  const [bannerList, setBannerList] = useState([
    { id: '1', title: '🔥 Mega Shoes & Fashion Sale: Up to 70% OFF!', sub: 'Explore top brand shoes, jackets & ethnic wear.' },
    { id: '2', title: '📱 Latest Flagship Mobiles & Gadgets Live!', sub: 'Get best exchange offers on smart devices.' },
    { id: '3', title: '🚀 Multi-Vendor Marketplace Open!', sub: 'Sell your products on Arishop & earn big.' }
  ]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % bannerList.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [bannerList]);

  const [selectedCategory, setSelectedCategory] = useState('All');

  // प्रोडक्ट्स लिस्ट (मल्टीपल फोटो सपोर्ट के साथ)
  const [products, setProducts] = useState([
    { 
      id: '1', 
      title: 'Men Stylish Winter Jacket & Shoes Combo', 
      category: 'Fashion', 
      price: '₹1499', 
      discountPercent: 10, 
      desc: 'Premium winter wear and sports shoes combo for men.', 
      images: [
        'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=500',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'
      ], 
      minSpend: 0, 
      isRare: false,
      sellerName: 'Sahil (Master Admin)',
      availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
      availableColors: ['Black', 'Navy Blue', 'Olive']
    },
    { 
      id: '2', 
      title: 'Latest 5G Smartphone & Gadgets', 
      category: 'Mobiles', 
      price: '₹18999', 
      discountPercent: 5, 
      desc: 'High performance smartphone with massive battery and AMOLED display.', 
      images: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'
      ], 
      minSpend: 5000, 
      isRare: true,
      sellerName: 'Sahil (Master Admin)',
      availableSizes: ['128GB', '256GB'],
      availableColors: ['Titanium Grey', 'Midnight Black']
    }
  ]);

  const topSellers = useMemo(() => [
    { id: '1', name: 'Rahul Verma', sales: '₹3,500', insta: '@rahul_insta', photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' },
    { id: '2', name: 'Aman Khan', sales: '₹4,200', insta: '@aman_official', photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100' }
  ], []);

  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  
  // एडमिन प्रोडक्ट स्टेट्स (मल्टीपल फोटो - up to 10)
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDiscount, setNewDiscount] = useState('0');
  const [newDesc, setNewDesc] = useState('');
  const [newImage1, setNewImage1] = useState('');
  const [newImage2, setNewImage2] = useState('');
  const [newImage3, setNewImage3] = useState('');
  const [newCategory, setNewCategory] = useState('Fashion');
  const [newSizes, setNewSizes] = useState('S, M, L, XL');
  const [newColors, setNewColors] = useState('Black, White, Blue');

  // बैनर स्टेट
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerSub, setNewBannerSub] = useState('');

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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerPincode, setBuyerPincode] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  
  const [supportMessage, setSupportMessage] = useState('');
  const [aiChatLog, setAiChatLog] = useState([
    { sender: 'ai', text: 'Hello! Welcome to Arishop Customer Support. How can we help you today?' }
  ]);

  // मास्टर ऑन/ऑफ स्विच हैंडलर
  const handleMasterToggleAll = () => {
    const nextState = !masterAllOn;
    setMasterAllOn(nextState);
    setEnableBanners(nextState);
    setEnableCategoriesGrid(nextState);
    setEnableTopSellers(nextState);
    setEnableMultiVendor(nextState);
    setEnableLuxurySection(nextState);
  };

  const handleSendOtp = useCallback(() => {
    if (!authInput.trim()) {
      Alert.alert('Error', 'कृपया अपना मोबाइल नंबर या जीमेल आईडी दर्ज करें!');
      return;
    }
    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(randomOtp);
    Alert.alert('OTP Sent', `ओटीपी भेज दी गई है।\n[Test OTP: ${randomOtp}]`);
    setActiveScreen('otp');
  }, [authInput]);

  const handleVerifyOtp = useCallback(() => {
    if (otpInput.trim() !== generatedOtp) {
      Alert.alert('Invalid OTP', 'गलत ओटीपी दर्ज की गई है!');
      return;
    }
    setActiveScreen('name');
  }, [otpInput, generatedOtp]);

  const handleSaveName = useCallback(() => {
    if (!firstName.trim() || !surname.trim()) {
      Alert.alert('अधूरा विवरण', 'कृपया First Name और Surname दर्ज करें!');
      return;
    }
    const fullName = `${firstName.trim()} ${surname.trim()}`;
    setLoggedInUser(fullName);
    setBuyerName(fullName);
    setActiveScreen('store');
  }, [firstName, surname]);

  const handleAddProduct = useCallback(() => {
    if (!newTitle.trim() || !newPrice.trim()) {
      Alert.alert('Error', 'कृपया प्रोडक्ट का नाम और प्राइस भरें!');
      return;
    }
    const numericPrice = parseInt(newPrice.replace(/[^0-9]/g, '')) || 1000;
    const isLuxury = numericPrice >= 5000;

    const imgArray = [];
    if (newImage1.trim()) imgArray.push(newImage1.trim());
    if (newImage2.trim()) imgArray.push(newImage2.trim());
    if (newImage3.trim()) imgArray.push(newImage3.trim());
    if (imgArray.length === 0) {
      imgArray.push('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500');
    }

    const newProd = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      category: newCategory,
      price: '₹' + numericPrice,
      discountPercent: parseInt(newDiscount) || 0,
      desc: newDesc.trim() || 'High quality certified item from Arishop.',
      images: imgArray,
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
    setNewImage1('');
    setNewImage2('');
    setNewImage3('');
    setShowAdminPanel(false);
    Alert.alert('Success', 'मास्टर एडमिन द्वारा नया प्रोडक्ट लाइव कर दिया गया है!');
  }, [newTitle, newPrice, newCategory, newDiscount, newDesc, newImage1, newImage2, newImage3, newSizes, newColors]);

  const handleAddBanner = useCallback(() => {
    if (!newBannerTitle.trim()) {
      Alert.alert('Error', 'बैनर का टाइटल लिखें!');
      return;
    }
    const newB = { id: Date.now().toString(), title: newBannerTitle.trim(), sub: newBannerSub.trim() || 'Special offer live now!' };
    setBannerList(prev => [...prev, newB]);
    setNewBannerTitle('');
    setNewBannerSub('');
    Alert.alert('Success', 'नया बैनर/ऐड लाइव हो गया है!');
  }, [newBannerTitle, newBannerSub]);

  const handleVendorProductSubmit = useCallback(() => {
    if (!enableMultiVendor) {
      Alert.alert('Notice', 'फिलहाल अन्य सेलर्स के लिए रजिस्ट्रेशन बंद है।');
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
      category: 'Fashion',
      price: '₹' + rawPrice,
      discountPercent: 5,
      desc: `Sold by partner store: ${vendorShopName.trim()}`,
      images: [vendorProdImage.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'],
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

    Alert.alert('पार्टनर सेलर प्रोडक्ट लाइव! 🤝', `बधाई हो ${vendorOwnerName}!\nआपका प्रोडक्ट Arishop पर लाइव हो गया है।`);
  }, [enableMultiVendor, vendorShopName, vendorOwnerName, vendorPhone, vendorProdTitle, vendorProdPrice, vendorProdImage]);

  const handleCheckout = useCallback(() => {
    if (!buyerName.trim() || !buyerPhone.trim() || !buyerPincode.trim() || !buyerAddress.trim()) {
      Alert.alert('अधूरा विवरण', 'कृपया नाम, फोन, पिनकोड और पूरा पता भरें!');
      return;
    }

    const courierPartners = ['Delhivery Express', 'Shiprocket Air', 'Blue Dart Express'];
    const assignedCourier = courierPartners[Math.floor(Math.random() * courierPartners.length)];
    const trackingId = 'ARISHOP-' + Math.floor(100000 + Math.random() * 900000);

    const earnedCoins = Math.floor(Math.random() * 15) + 5;
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
    Alert.alert('आर्डर सफल & कूरियर बुक! 🚚🎉', `धन्यवाद ${buyerName}!\n\n📦 कूरियर: ${assignedCourier}\n🔖 ट्रैकिंग: ${trackingId}`);
    setSelectedProduct(null);
  }, [buyerName, buyerPhone, buyerPincode, buyerAddress, selectedProduct]);

  const handleSendSupport = useCallback(() => {
    if (!supportMessage.trim()) return;
    const userMsg = supportMessage.trim();
    setAiChatLog(prev => [...prev, { sender: 'user', text: userMsg }]);
    setSupportMessage('');
    setTimeout(() => {
      setAiChatLog(prev => [...prev, { sender: 'ai', text: "AI Support: I understand your query. If you need direct human assistance, you can click below to talk directly with Sahil Customer Care." }]);
    }, 800);
  }, [supportMessage]);

  const availableCategories = useMemo(() => {
    const list = ['All'];
    if (categoryToggles.Electronics) list.push('Electronics');
    if (categoryToggles.Fashion) list.push('Fashion');
    if (categoryToggles.Mobiles) list.push('Mobiles');
    if (categoryToggles.Home) list.push('Home');
    if (categoryToggles.Beauty) list.push('Beauty');
    if (categoryToggles.Grocery) list.push('Grocery');
    if (categoryToggles.Sports) list.push('Sports');
    return list;
  }, [categoryToggles]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (p.isRare && !enableLuxurySection) return false;
      return true;
    });
  }, [products, selectedCategory, enableLuxurySection]);

  // चेकआउट स्क्रीन
  if (selectedProduct) {
    const rawPriceNum = parseInt(selectedProduct.price.replace(/[^0-9]/g, '')) || 500;
    const finalDiscountPrice = rawPriceNum - (rawPriceNum * (selectedProduct.discountPercent || 0)) / 100;
    const currentImg = selectedProduct.images?.[activeImageIndex] || selectedProduct.images?.[0];

    return (
      <SafeAreaView style={styles.containerStore}>
        <ScrollView contentContainerStyle={styles.storeScroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.storeHeader}>Secure Checkout & Delivery 🛒</Text>
          
          <View style={styles.productCard}>
            <Image source={{ uri: currentImg }} style={styles.checkoutImage} />
            
            {selectedProduct.images && selectedProduct.images.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginVertical: 6}}>
                {selectedProduct.images.map((imgUri, idx) => (
                  <TouchableOpacity key={idx} onPress={() => setActiveImageIndex(idx)}>
                    <Image source={{ uri: imgUri }} style={[styles.thumbImage, activeImageIndex === idx && styles.thumbActive]} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <Text style={styles.productTitle}>{selectedProduct.title}</Text>
            <Text style={{color: '#0284c7', fontSize: 12, marginBottom: 4}}>Sold By: {selectedProduct.sellerName}</Text>
            <Text style={styles.priceText}>Price: ₹{Math.round(finalDiscountPrice)}</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Select Size / Storage</Text>
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
              <Text style={[styles.buttonText, {color: '#334155'}]}>Back to Store</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // मुख्य स्टोर स्क्रीन (Amazon स्टाइल क्लीन वाइट/क्रीम थीम)
  return (
    <SafeAreaView style={styles.containerStore}>
      <ScrollView contentContainerStyle={styles.storeScroll} keyboardShouldPersistTaps="handled">
        
        <View style={styles.headerRow}>
          <Text style={styles.storeHeader}>Arishop 🛍️</Text>
          <View style={styles.coinBadge}>
            <Text style={styles.coinText}>🪙 {userCoins} Coins</Text>
          </View>
        </View>

        <TextInput style={styles.searchBar} placeholder="🔍 Search clothes, shoes, mobiles, partner items..." placeholderTextColor="#888" />

        {/* कैटेगरीज ग्रिड */}
        {enableCategoriesGrid && (
          <View style={styles.amazonGridRow}>
            {availableCategories.map(cat => (
              <TouchableOpacity key={cat} style={styles.gridItem} onPress={() => setSelectedCategory(cat)}>
                <View style={styles.gridCircle}>
                  <Text style={{fontSize: 16}}>📦</Text>
                </View>
                <Text style={styles.gridLabel}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* बैनर्स स्लाइडर */}
        {enableBanners && bannerList[currentBannerIndex] && (
          <View style={styles.bannerBox}>
            <Text style={styles.bannerTitle}>{bannerList[currentBannerIndex].title}</Text>
            <Text style={styles.bannerSub}>{bannerList[currentBannerIndex].sub}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.becomeSellerBtn} onPress={() => {
          if (!enableMultiVendor) {
            Alert.alert('Closed', 'वर्तमान में अन्य सेलर्स के लिए रजिस्ट्रेशन बंद है।');
            return;
          }
          setShowSellerRegModal(true);
        }}>
          <Text style={styles.becomeSellerText}>💼 Want to Sell on Arishop? Register Store Now</Text>
        </TouchableOpacity>

        {/* सेलर रजिस्ट्रेशन फॉर्म */}
        {showSellerRegModal && (
          <View style={[styles.formContainer, {borderColor: '#16a34a'}]}>
            <Text style={[styles.formHeading, {color: '#16a34a'}]}>🤝 Partner Seller Registration</Text>
            <Text style={{color: '#64748b', fontSize: 11, marginBottom: 10}}>नियम: प्रत्येक आर्डर पर प्लेटफॉर्म कमीशन लागू होगा।</Text>

            <Text style={styles.label}>Shop Name</Text>
            <TextInput style={styles.input} placeholder="e.g. Verma Fashions" placeholderTextColor="#888" value={vendorShopName} onChangeText={setVendorShopName} />
            <Text style={styles.label}>Owner Name</Text>
            <TextInput style={styles.input} placeholder="Your name" placeholderTextColor="#888" value={vendorOwnerName} onChangeText={setVendorOwnerName} />
            <Text style={styles.label}>Phone Number</Text>
            <TextInput style={styles.input} placeholder="10-digit mobile" placeholderTextColor="#888" keyboardType="phone-pad" value={vendorPhone} onChangeText={setVendorPhone} />
            <Text style={styles.label}>Product Title</Text>
            <TextInput style={styles.input} placeholder="e.g. Designer Kurti or Shoes" placeholderTextColor="#888" value={vendorProdTitle} onChangeText={setVendorProdTitle} />
            <Text style={styles.label}>Product Price (₹)</Text>
            <TextInput style={styles.input} placeholder="e.g. ₹999" placeholderTextColor="#888" keyboardType="numeric" value={vendorProdPrice} onChangeText={setVendorProdPrice} />
            <Text style={styles.label}>Image URL</Text>
            <TextInput style={styles.input} placeholder="Paste image link" placeholderTextColor="#888" value={vendorProdImage} onChangeText={setVendorProdImage} />

            <TouchableOpacity style={[styles.exploreButton, {backgroundColor: '#16a34a'}]} onPress={handleVendorProductSubmit}>
              <Text style={[styles.buttonText, {color: '#ffffff'}]}>Submit & Publish Product 🚀</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.backButton, {marginTop: 6}]} onPress={() => setShowSellerRegModal(false)}>
              <Text style={[styles.buttonText, {color: '#334155'}]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.adminToggleButton} onPress={() => setShowAdminPanel(!showAdminPanel)}>
          <Text style={styles.adminToggleText}>{showAdminPanel ? '❌ Close Master Admin Controls' : '⚙️ Master Admin Control Panel (A to Z On/Off)'}</Text>
        </TouchableOpacity>

        {/* मास्टर एडमिन कंट्रोल पैनल */}
        {showAdminPanel && (
          <View style={styles.formContainer}>
            <Text style={styles.formHeading}>Master Controls (Admin Only)</Text>

            {/* ग्लोबल ऑल ऑन/ऑफ मास्टर स्विच */}
            <View style={[styles.toggleRow, {borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 8, marginBottom: 8}]}>
              <Text style={[styles.label, {fontWeight: 'bold', color: '#0284c7'}]}>Master All Apps (On/Off):</Text>
              <TouchableOpacity onPress={handleMasterToggleAll} style={[styles.switchBtn, masterAllOn ? styles.onBtn : styles.offBtn]}>
                <Text style={styles.switchText}>{masterAllOn ? 'ALL ON' : 'ALL OFF'}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.toggleRow}>
              <Text style={styles.label}>Multi-Vendor System:</Text>
              <TouchableOpacity onPress={() => setEnableMultiVendor(!enableMultiVendor)} style={[styles.switchBtn, enableMultiVendor ? styles.onBtn : styles.offBtn]}>
                <Text style={styles.switchText}>{enableMultiVendor ? 'ON' : 'OFF'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.label}>Top Sellers Section:</Text>
              <TouchableOpacity onPress={() => setEnableTopSellers(!enableTopSellers)} style={[styles.switchBtn, enableTopSellers ? styles.onBtn : styles.offBtn]}>
                <Text style={styles.switchText}>{enableTopSellers ? 'ON' : 'OFF'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.label}>Categories Grid:</Text>
              <TouchableOpacity onPress={() => setEnableCategoriesGrid(!enableCategoriesGrid)} style={[styles.switchBtn, enableCategoriesGrid ? styles.onBtn : styles.offBtn]}>
                <Text style={styles.switchText}>{enableCategoriesGrid ? 'ON' : 'OFF'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.label}>Premium/Luxury (₹5000+):</Text>
              <TouchableOpacity onPress={() => setEnableLuxurySection(!enableLuxurySection)} style={[styles.switchBtn, enableLuxurySection ? styles.onBtn : styles.offBtn]}>
                <Text style={styles.switchText}>{enableLuxurySection ? 'ON' : 'OFF'}</Text>
              </TouchableOpacity>
            </View>

            {/* कस्टमर सपोर्ट एजेंट संख्या मैनेज करने का सेक्शन */}
            <Text style={[styles.label, {color: '#0284c7', fontWeight: 'bold', marginTop: 10}]}>Customer Support Agents Count:</Text>
            <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 4}}>
              <TextInput 
                style={[styles.input, {flex: 1, marginRight: 8}]} 
                keyboardType="numeric" 
                value={supportAgentCount.toString()} 
                onChangeText={(val) => setSupportAgentCount(parseInt(val) || 1)} 
              />
              <Text style={{fontSize: 12, color: '#334155'}}>Active Support Agents</Text>
            </View>

            <Text style={[styles.label, {color: '#0284c7', fontWeight: 'bold', marginTop: 10}]}>Category Line-by-Line Controls:</Text>
            {Object.keys(categoryToggles).map(catKey => (
              <View key={catKey} style={styles.toggleRow}>
                <Text style={{color: '#1e293b', fontSize: 12}}>{catKey}</Text>
                <TouchableOpacity 
                  onPress={() => setCategoryToggles(prev => ({...prev, [catKey]: !prev[catKey]}))} 
                  style={[styles.switchBtn, categoryToggles[catKey] ? styles.onBtn : styles.offBtn]}>
                  <Text style={styles.switchText}>{categoryToggles[catKey] ? 'ON' : 'OFF'}</Text>
                </TouchableOpacity>
              </View>
            ))}

            <Text style={[styles.formHeading, {marginTop: 15, color: '#0284c7'}]}>Add Official Product & Multiple Photos (Up to 3)</Text>
            <TextInput style={styles.input} placeholder="Product Name" placeholderTextColor="#888" value={newTitle} onChangeText={setNewTitle} />
            <TextInput style={[styles.input, {marginTop: 6}]} placeholder="Price (₹)" placeholderTextColor="#888" keyboardType="numeric" value={newPrice} onChangeText={setNewPrice} />
            <TextInput style={[styles.input, {marginTop: 6}]} placeholder="Main Image URL" placeholderTextColor="#888" value={newImage1} onChangeText={setNewImage1} />
            <TextInput style={[styles.input, {marginTop: 6}]} placeholder="Second Image URL" placeholderTextColor="#888" value={newImage2} onChangeText={setNewImage2} />
            <TextInput style={[styles.input, {marginTop: 6}]} placeholder="Third Image URL" placeholderTextColor="#888" value={newImage3} onChangeText={setNewImage3} />

            <TouchableOpacity style={styles.exploreButton} onPress={handleAddProduct}>
              <Text style={styles.buttonText}>Publish Official Product 🚀</Text>
            </TouchableOpacity>

            <Text style={[styles.formHeading, {marginTop: 15, color: '#0284c7'}]}>Add New Homepage Banner / Ad</Text>
            <TextInput style={styles.input} placeholder="Banner Title" placeholderTextColor="#888" value={newBannerTitle} onChangeText={setNewBannerTitle} />
            <TextInput style={[styles.input, {marginTop: 6}]} placeholder="Banner Subtitle" placeholderTextColor="#888" value={newBannerSub} onChangeText={setNewBannerSub} />
            <TouchableOpacity style={[styles.exploreButton, {backgroundColor: '#16a34a'}]} onPress={handleAddBanner}>
              <Text style={[styles.buttonText, {color: '#fff'}]}>Add Banner / Ad 📢</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.topSellerSection}>
          <Text style={styles.topSellerHeader}>🚚 Live Orders & Tracking</Text>
          {liveOrdersList.length === 0 ? (
            <Text style={{color: '#64748b', fontSize: 12}}>No orders placed yet.</Text>
          ) : (
            liveOrdersList.map((ord, i) => (
              <View key={i} style={[styles.sellerRow, {flexDirection: 'column', alignItems: 'flex-start', padding: 10}]}>
                <Text style={styles.sellerName}>📦 {ord.productName} (ID: {ord.orderId})</Text>
                <Text style={{color: '#16a34a', fontSize: 11, fontWeight: 'bold', marginTop: 2}}>Status: {ord.status}</Text>
                <Text style={{color: '#0284c7', fontSize: 11}}>Courier: {ord.courier} | Seller: {ord.seller}</Text>
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
          const firstImg = item.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';

          return (
            <View key={item.id} style={styles.productCard}>
              <Image source={{ uri: firstImg }} style={styles.productImage} />
              <View style={{padding: 12}}>
                <Text style={styles.productTitle}>{item.title}</Text>
                <Text style={styles.productDesc}>{item.desc}</Text>
                <Text style={{color: '#0284c7', fontSize: 11, fontWeight: 'bold', marginBottom: 4}}>
                  🏪 Seller: {item.sellerName || 'Sahil (Master Admin)'}
                </Text>
                <View style={styles.rowBetween}>
                  <Text style={styles.priceText}>₹{discountedVal}</Text>
                  <TouchableOpacity style={styles.buyNowSmallBtn} onPress={() => { setSelectedProduct(item); setActiveImageIndex(0); }}>
                    <Text style={styles.buyText}>Select & Buy</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        {/* कस्टमर सपोर्ट सेक्शन (AI बॉट + साहिल कस्टमर केयर नंबर 9205013660) */}
        <View style={styles.supportBox}>
          <Text style={styles.supportHeader}>🤖 Arishop Customer Support & Help Desk</Text>
          <View style={styles.chatContainer}>
            {aiChatLog.map((chat, idx) => (
              <View key={idx} style={[styles.chatBubble, chat.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
                <Text style={[styles.chatText, chat.sender === 'ai' && {color: '#1e293b'}]}>{chat.text}</Text>
              </View>
            ))}
          </View>
          <View style={styles.chatInputRow}>
            <TextInput style={[styles.input, {flex: 1, marginRight: 8}]} placeholder="Type your query..." placeholderTextColor="#888" value={supportMessage} onChangeText={setSupportMessage} />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSendSupport}>
              <Text style={styles.buttonText}>Send</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.sahilCareBtn} onPress={() => {
            Linking.openURL(`tel:${supportCareNumber}`);
            Alert.alert('Sahil Customer Care', `Calling Sahil Support: +91-${supportCareNumber}\nActive Agents: ${supportAgentCount}`);
          }}>
            <Text style={styles.sahilCareText}>📞 Sahil Customer Support ({supportCareNumber})</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* बॉटम नैविगेशन बार */}
      <View style={styles.bottomNavContainer}>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => setBottomTab('home')}>
          <Text style={[styles.bottomNavText, bottomTab === 'home' && styles.bottomNavActive]}>🏠 Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => { 
          setBottomTab('you'); 
          Alert.alert('Profile Info', `Name: ${loggedInUser}\nTotal Spent: ₹${userSpent}\nCoins Earned: ${userCoins}`); 
        }}>
          <Text style={[styles.bottomNavText, bottomTab === 'you' && styles.bottomNavActive]}>👤 You</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => { setBottomTab('wallet'); Alert.alert('Wallet & Coins', `Available Coins: ${userCoins}\nTotal Spent: ₹${userSpent}`); }}>
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
  containerStore: { flex: 1, backgroundColor: '#f8fafc' }, // Amazon जैसी क्लीन वाइट/क्रीम थीम
  storeScroll: { padding: 15, paddingBottom: 80 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 10 },
  storeHeader: { fontSize: 24, fontWeight: 'bold', color: '#0284c7' },
  coinBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#eab308' },
  coinText: { color: '#ca8a04', fontSize: 12, fontWeight: 'bold' },
  bannerBox: { backgroundColor: '#ffffff', borderRadius: 12, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#16a34a', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  bannerTitle: { color: '#16a34a', fontWeight: 'bold', fontSize: 14, textAlign: 'center' },
  bannerSub: { color: '#64748b', fontSize: 12, marginTop: 4, textAlign: 'center' },
  searchBar: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, color: '#1e293b', paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 12 },
  amazonGridRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 12 },
  gridItem: { width: '22%', alignItems: 'center', marginBottom: 10 },
  gridCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e1', marginBottom: 4 },
  gridLabel: { color: '#334155', fontSize: 11, textAlign: 'center' },
  becomeSellerBtn: { width: '100%', backgroundColor: '#16a34a', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  becomeSellerText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
  adminToggleButton: { width: '100%', backgroundColor: '#0284c7', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  adminToggleText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
  formContainer: { width: '100%', backgroundColor: '#ffffff', borderRadius: 16, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#cbd5e1', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  formHeading: { color: '#0284c7', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 6 },
  switchBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
  onBtn: { backgroundColor: '#16a34a' },
  offBtn: { backgroundColor: '#dc2626' },
  switchText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  label: { color: '#334155', fontSize: 12, marginBottom: 4, marginTop: 8 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, color: '#1e293b', paddingHorizontal: 12, paddingVertical: 9, fontSize: 13 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 4 },
  optionChip: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 6, marginBottom: 6 },
  optionChipActive: { backgroundColor: '#0284c7', borderColor: '#0284c7' },
  optionChipText: { color: '#334155', fontSize: 12, fontWeight: 'bold' },
  optionChipTextActive: { color: '#ffffff' },
  topSellerSection: { width: '100%', backgroundColor: '#ffffff', borderRadius: 14, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#cbd5e1' },
  topSellerHeader: { color: '#0284c7', fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  sellerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 8, borderRadius: 8, marginBottom: 6 },
  sellerAvatar: { width: 35, height: 35, borderRadius: 17.5 },
  sellerName: { color: '#1e293b', fontSize: 12, fontWeight: 'bold' },
  sellerInsta: { color: '#0284c7', fontSize: 11 },
  sectionTitle: { color: '#1e293b', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  productCard: { width: '100%', backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', marginBottom: 15, borderWidth: 1, borderColor: '#cbd5e1', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  productImage: { width: '100%', height: 160 },
  checkoutImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 10 },
  thumbImage: { width: 50, height: 50, borderRadius: 6, marginRight: 8, borderWidth: 1, borderColor: '#cbd5e1' },
  thumbActive: { borderColor: '#0284c7', borderWidth: 2 },
  productTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 2 },
  productDesc: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  priceText: { fontSize: 15, fontWeight: 'bold', color: '#0284c7' },
  buyNowSmallBtn: { backgroundColor: '#eab308', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  buyText: { fontSize: 12, fontWeight: 'bold', color: '#ffffff' },
  supportBox: { width: '100%', backgroundColor: '#ffffff', borderRadius: 16, padding: 15, marginTop: 10, borderWidth: 1, borderColor: '#cbd5e1' },
  supportHeader: { color: '#0284c7', fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  chatContainer: { maxHeight: 120, backgroundColor: '#f8fafc', padding: 8, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  chatBubble: { padding: 6, borderRadius: 6, marginBottom: 4, maxWidth: '80%' },
  userBubble: { backgroundColor: '#0284c7', alignSelf: 'flex-end' },
  aiBubble: { backgroundColor: '#e2e8f0', alignSelf: 'flex-start' },
  chatText: { color: '#ffffff', fontSize: 11 },
  chatInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  sendBtn: { backgroundColor: '#eab308', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, justifyContent: 'center' },
  sahilCareBtn: { backgroundColor: '#16a34a', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  sahilCareText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  backButton: { marginTop: 10, backgroundColor: '#f1f5f9', paddingVertical: 12, borderRadius: 10, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: '#cbd5e1' },
  exploreButton: { width: '100%', backgroundColor: '#eab308', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
  bottomNavContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: '#ffffff', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#cbd5e1' },
  bottomNavItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  bottomNavText: { color: '#64748b', fontSize: 12 },
  bottomNavActive: { color: '#0284c7', fontWeight: 'bold' }
});
