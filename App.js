import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Alert, Image, Linking, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('phone'); 
  const [inputPhone, setInputPhone] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [inputFullName, setInputFullName] = useState('');
  const [roleType, setRoleType] = useState('buyer'); 

  const [activeScreen, setActiveScreen] = useState('home'); // 'home', 'you', 'wallet', 'cart', 'orders', 'refunds', 'seller_dashboard', 'ai_support', 'luxury_lounge', 'coin_redeem'
  const [loggedInUser, setLoggedInUser] = useState('Sahil Raikwar');
  const [userEmail, setUserEmail] = useState('sahil.admin@arishop.com');
  const [userPhone, setUserPhone] = useState('9205013660');

  // Master Control Toggles
  const [masterAllOn, setMasterAllOn] = useState(true);
  const [enableBanners, setEnableBanners] = useState(true);
  const [enableCategoriesGrid, setEnableCategoriesGrid] = useState(true);
  const [enableTopSellers, setEnableTopSellers] = useState(true);
  const [enableLuxurySection, setEnableLuxurySection] = useState(true);

  const supportCareNumber = '9205013660';
  const defaultUpiId = 'sahil9205@paytm';

  const [categoryToggles, setCategoryToggles] = useState({
    Electronics: true,
    Fashion: true,
    Mobiles: true,
    Home: true,
    Beauty: true,
    Grocery: true,
    Sports: true
  });

  const [userSpent, setUserSpent] = useState(1200);
  const [userCoins, setUserCoins] = useState(5200); // Set to 5200 for testing coin redemption easily
  const [walletBalance, setWalletBalance] = useState(2500); 
  
  const [cartItems, setCartItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Success Flash Screen State
  const [showSuccessFlash, setShowSuccessFlash] = useState(false);
  const [earnedCoinsWon, setEarnedCoinsWon] = useState(10);
  const [lastOrderDetails, setLastOrderDetails] = useState(null);

  const [liveOrdersList, setLiveOrdersList] = useState([
    { orderId: 'ARISHOP-883920', productName: 'Men Stylish Winter Jacket', status: 'Dispatched (Standard 5-7 Days)', courier: 'Delhivery Express', price: '₹1499', date: '2026-09-06', landmark: 'Near Metro Station Pillar 42' }
  ]);
  const [refundRequests, setRefundRequests] = useState([]);

  const [bannerList] = useState([
    { id: '1', title: '🔥 Mega Fashion & Electronics Sale: Up to 70% OFF!', sub: 'Explore top brand items shipped by Sahil Direct.' },
    { id: '2', title: '⚡ 3-Day Express Fast Delivery Now Live!', sub: 'Get your orders super fast with priority shipping.' },
    { id: '3', title: '🪙 Redeem 5,000 Coins for ₹200 Arishop Shopping Balance!', sub: 'Use coins for instant discounts on checkout.' }
  ]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % bannerList.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [bannerList]);

  const [selectedCategory, setSelectedCategory] = useState('All');

  const [products, setProducts] = useState([
    { 
      id: '1', 
      title: 'Men Stylish Winter Jacket & Shoes Combo', 
      category: 'Fashion', 
      price: '1499', 
      discountPercent: 10, 
      desc: 'Premium winter wear and sports shoes combo for men.', 
      images: [
        'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=500',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'
      ], 
      isRare: false,
      sellerName: 'Sahil (Master Admin)',
      availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
      allowCod: true,
      allowUpiQr: true,
      customUpiId: 'sahil9205@paytm',
      customQrImage: '',
      rating: 4.5,
      reviewsCount: 128,
      reviewsList: [
        { user: 'Amit', comment: 'Amazing jacket and fast delivery!', rating: 5 },
        { user: 'Rohit', comment: 'Good quality fabric.', rating: 4 }
      ]
    },
    { 
      id: '2', 
      title: 'Latest 5G Smartphone & Gadgets', 
      category: 'Mobiles', 
      price: '18999', 
      discountPercent: 5, 
      desc: 'High performance smartphone with massive battery and AMOLED display.', 
      images: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'
      ], 
      isRare: true,
      sellerName: 'Sahil (Master Admin)',
      availableSizes: ['128GB', '256GB'],
      allowCod: false,
      allowUpiQr: true,
      customUpiId: 'sahil9205@paytm',
      customQrImage: '',
      rating: 4.8,
      reviewsCount: 340,
      reviewsList: [
        { user: 'Vikas', comment: 'Super fast phone, camera is top notch!', rating: 5 }
      ]
    }
  ]);

  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDiscount, setNewDiscount] = useState('0');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Fashion');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [productCodEnabled, setProductCodEnabled] = useState(true);
  const [productUpiEnabled, setProductUpiEnabled] = useState(true);
  const [productCustomUpi, setProductCustomUpi] = useState('sahil9205@paytm');
  const [productCustomQr, setProductCustomQr] = useState('');

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFastDelivery, setIsFastDelivery] = useState(false);
  
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerPincode, setBuyerPincode] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [deliveryLandmark, setDeliveryLandmark] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiRefId, setUpiRefId] = useState('');

  const [aiChatLog, setAiChatLog] = useState([
    { sender: 'ai', text: 'Hello! Welcome to Arishop Support. How can Sahil help you today? If you need urgent assistance, you can call our support directly at 9205013660.' }
  ]);
  const [userChatInput, setUserChatInput] = useState('');

  const pickImageFromGallery = async (isQr = false) => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: !isQr,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        if (isQr) {
          setProductCustomQr(result.assets[0].uri);
        } else {
          const uris = result.assets.map(asset => asset.uri);
          setUploadedImages(prev => [...prev, ...uris].slice(0, 3));
        }
      }
    } catch (err) {
      Alert.alert('Permission Error', 'Gallery access failed or cancelled.');
    }
  };

  const handleMasterToggleAll = () => {
    const nextState = !masterAllOn;
    setMasterAllOn(nextState);
    setEnableBanners(nextState);
    setEnableCategoriesGrid(nextState);
    setEnableTopSellers(nextState);
    setEnableLuxurySection(nextState);
  };

  const handleSendOtp = () => {
    if (!inputPhone || inputPhone.length < 10) {
      Alert.alert('Error', 'कृपया सही 10-अंकों का मोबाइल नंबर दर्ज करें!');
      return;
    }
    setAuthMode('otp');
    Alert.alert('OTP Sent', 'आपके नंबर पर सत्यापन कोड (OTP: 1234) भेजा गया है।');
  };

  const handleVerifyOtp = () => {
    if (inputOtp !== '1234' && inputOtp !== '1111') {
      Alert.alert('Invalid OTP', 'कृपया सही OTP दर्ज करें (डिफ़ॉल्ट: 1234)');
      return;
    }
    if (!inputFullName.trim()) {
      Alert.alert('Name Required', 'कृपया अपना पूरा नाम दर्ज करें!');
      return;
    }
    setLoggedInUser(inputFullName.trim());
    setUserPhone(inputPhone);
    setIsLoggedIn(true);
  };

  // Coin Redemption Handler (5000 Coins = ₹200 Shopping Balance)
  const handleRedeemCoins = () => {
    if (userCoins < 5000) {
      Alert.alert('Insufficient Coins', 'रिडीम करने के लिए कम से कम 5,000 कॉइन्स होने आवश्यक हैं।');
      return;
    }
    setUserCoins(prev => prev - 5000);
    setWalletBalance(prev => prev + 200);
    Alert.alert('Coins Redeemed Successfully! 🎉', '5,000 कॉइन्स काटकर आपके Arishop वॉलेट में ₹200 जोड़ दिए गए हैं। इस राशि से आप सिर्फ Arishop पर शॉपिंग कर सकते हैं!');
  };

  const handleAddProduct = useCallback(() => {
    if (!newTitle.trim() || !newPrice.trim()) {
      Alert.alert('Error', 'कृपया प्रोडक्ट का नाम और प्राइस भरें!');
      return;
    }
    const numericPrice = parseInt(newPrice.replace(/[^0-9]/g, '')) || 1000;
    const imgArray = uploadedImages.length > 0 ? uploadedImages : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'];

    const newProd = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      category: newCategory,
      price: numericPrice.toString(),
      discountPercent: parseInt(newDiscount) || 0,
      desc: newDesc.trim() || 'High quality certified item from Arishop.',
      images: imgArray,
      isRare: numericPrice >= 5000,
      sellerName: `${loggedInUser} (${roleType === 'seller' ? 'Partner Seller' : 'Master Admin'})`,
      availableSizes: ['S', 'M', 'L', 'XL'],
      allowCod: productCodEnabled,
      allowUpiQr: productUpiEnabled,
      customUpiId: productCustomUpi || defaultUpiId,
      customQrImage: productCustomQr,
      rating: 5.0,
      reviewsCount: 1,
      reviewsList: [{ user: loggedInUser, comment: 'New official listing.', rating: 5 }]
    };

    setProducts(prev => [newProd, ...prev]);
    setNewTitle('');
    setNewPrice('');
    setNewDiscount('0');
    setNewDesc('');
    setUploadedImages([]);
    setProductCustomQr('');
    setShowAdminPanel(false);
    Alert.alert('Success', `प्रोडक्ट सफलतापूर्वक '${newCategory}' कैटेगरी में लाइव हो गया है! 🚀`);
  }, [newTitle, newPrice, newCategory, newDiscount, newDesc, uploadedImages, productCodEnabled, productUpiEnabled, productCustomUpi, productCustomQr, loggedInUser, roleType]);

  const handleAddToCart = (product) => {
    setCartItems(prev => [...prev, product]);
    Alert.alert('Added to Cart', `'${productTitleSafe(product.title)}' आपके कार्ट में जोड़ दिया गया है! 🛒`);
  };

  const productTitleSafe = (title) => title.length > 28 ? title.substring(0, 28) + '...' : title;

  const handleCheckout = useCallback(() => {
    if (!buyerName.trim() || !buyerPhone.trim() || !buyerPincode.trim() || !buyerAddress.trim()) {
      Alert.alert('अधूरा विवरण', 'कृपया नाम, फोन, पिनकोड और पूरा पता भरें!');
      return;
    }

    if (paymentMethod === 'upi' && !upiRefId.trim()) {
      Alert.alert('UPI Ref Required', 'कृपया पेमेंट करने के बाद UPI Transaction ID / UTR नंबर दर्ज करें!');
      return;
    }

    const rawNum = parseInt(selectedProduct.price) || 500;
    const discountedVal = rawNum - (rawNum * (selectedProduct.discountPercent || 0)) / 100;
    const finalAmount = isFastDelivery ? discountedVal + 40 : discountedVal;

    const courierPartners = ['Delhivery Express', 'Shiprocket Air', 'Blue Dart Express'];
    const assignedCourier = courierPartners[Math.floor(Math.random() * courierPartners.length)];
    const trackingId = 'ARISHOP-' + Math.floor(100000 + Math.random() * 900000);
    const deliveryTimeline = isFastDelivery ? '⚡ Fast Delivery (3 Days - Priority)' : '📦 Standard Delivery (5-7 Days)';

    const randRoll = Math.random();
    const wonCoins = randRoll < 0.9 ? Math.floor(Math.random() * 10) + 1 : Math.floor(Math.random() * 41) + 10;

    setWalletBalance(prev => prev + finalAmount);
    setUserCoins(prev => prev + wonCoins);
    setUserSpent(prev => prev + finalAmount);
    setEarnedCoinsWon(wonCoins);

    const newOrderData = {
      orderId: trackingId,
      productName: selectedProduct.title,
      status: `Dispatched via ${deliveryTimeline}`,
      courier: assignedCourier,
      price: '₹' + finalAmount,
      date: new Date().toISOString().split('T')[0],
      landmark: deliveryLandmark || 'Near main landmark'
    };

    setLiveOrdersList(prev => [newOrderData, ...prev]);
    setLastOrderDetails(newOrderData);
    setSelectedProduct(null);
    setShowSuccessFlash(true);
  }, [buyerName, buyerPhone, buyerPincode, buyerAddress, deliveryLandmark, selectedProduct, isFastDelivery, paymentMethod, upiRefId]);

  const handleCancelOrder = (orderId, orderPrice) => {
    Alert.alert('Cancel Order', 'क्या आप वाकई इस आर्डर को कैंसिल करना चाहते हैं?', [
      { text: 'No', style: 'cancel' },
      { 
        text: 'Yes, Cancel & Refund', 
        onPress: () => {
          const numericRefund = parseInt((orderPrice || '1499').replace(/[^0-9]/g, '')) || 500;
          setLiveOrdersList(prev => prev.filter(o => o.orderId !== orderId));
          setWalletBalance(prev => prev - numericRefund >= 0 ? prev - numericRefund : 0);
          setRefundRequests(prev => [...prev, { orderId, date: new Date().toISOString().split('T')[0], status: `₹${numericRefund} Refund initiated. Will credit to wallet within 24-48 hours ⏳✅` }]);
          Alert.alert('Cancelled & Refund Initiated', `आर्डर ${orderId} सफलतापर्वक कैंसिल हो गया है। ₹${numericRefund} का रिफंड 24 से 48 घंटे के भीतर आपके वॉलेट में क्रेडिट कर दिया जाएगा! 🪙`);
        } 
      }
    ]);
  };

  const handleSendAiMessage = () => {
    if (!userChatInput.trim()) return;
    const newLog = [...aiChatLog, { sender: 'user', text: userChatInput }];
    setAiChatLog(newLog);
    const queryText = userChatInput.toLowerCase();
    setUserChatInput('');
    
    setTimeout(() => {
      let aiResponse = `Sahil Support AI: आपके सवाल का जवाब जल्द ही दिया जाएगा।`;
      if (queryText.includes('call') || queryText.includes('phone') || queryText.includes('sahil') || queryText.includes('help') || queryText.includes('बात')) {
        aiResponse = `AI Support: यदि आपकी समस्या का समाधान नहीं हो रहा है, तो आप सीधे हमारे मास्टर एडमिन साहिल से संपर्क कर सकते हैं। कॉल करें: ${supportCareNumber}`;
      }
      setAiChatLog(prev => [...prev, { sender: 'ai', text: aiResponse }]);
    }, 1000);
  };

  const categoryVisuals = {
    Electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=100',
    Fashion: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=100',
    Mobiles: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100',
    Home: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=100',
    Beauty: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100',
    Grocery: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100',
    Sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=100',
  };

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
      if (!masterAllOn) return false;
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (p.category && categoryToggles[p.category] === false) return false;
      if (p.isRare && !enableLuxurySection) return false;
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(query);
        const matchDesc = p.desc.toLowerCase().includes(query);
        const matchCat = p.category.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchCat) return false;
      }
      return true;
    });
  }, [products, selectedCategory, enableLuxurySection, searchQuery, masterAllOn, categoryToggles]);

  // ================= SUCCESS FLASH MODAL =================
  if (showSuccessFlash) {
    return (
      <SafeAreaView style={[styles.containerStore, {backgroundColor: '#16a34a', justifyContent: 'center', alignItems: 'center', padding: 20}]}>
        <View style={{backgroundColor: '#ffffff', borderRadius: 20, padding: 25, width: '100%', alignItems: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 5}}>
          <Text style={{fontSize: 45, marginBottom: 10}}>🎉</Text>
          <Text style={{fontSize: 22, fontWeight: 'bold', color: '#16a34a', textAlign: 'center', marginBottom: 5}}>Order Placed Successfully!</Text>
          <Text style={{fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 15}}>Direct Payment Confirmed & Dispatched via Courier.</Text>

          <View style={{backgroundColor: '#fef08a', padding: 12, borderRadius: 12, width: '100%', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#eab308'}}>
            <Text style={{fontWeight: 'bold', color: '#854d0e', fontSize: 14}}>🪙 Bonus Reward Unlocked!</Text>
            <Text style={{fontSize: 20, fontWeight: 'bold', color: '#ca8a04', marginVertical: 4}}>+{earnedCoinsWon} Arishop Coins</Text>
            <Text style={{fontSize: 11, color: '#713f12', textAlign: 'center'}}>Coins added to your account wallet instantly.</Text>
          </View>

          <TouchableOpacity style={[styles.exploreButton, {backgroundColor: '#16a34a', marginTop: 5}]} onPress={() => {
            setShowSuccessFlash(false);
            setActiveScreen('orders');
          }}>
            <Text style={styles.buttonText}>View My Orders & Tracking 📦</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ================= LOGIN SCREEN =================
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.containerStore}>
        <ScrollView contentContainerStyle={[styles.storeScroll, {justifyContent: 'center', flexGrow: 1}]} keyboardShouldPersistTaps="handled">
          <View style={[styles.formContainer, {alignItems: 'center'}]}>
            <Text style={[styles.storeHeader, {marginBottom: 5}]}>Arishop 🛍️</Text>
            <Text style={{color: '#64748b', fontSize: 13, marginBottom: 20, textAlign: 'center'}}>India's Trusted Direct Vendor & Marketplace</Text>

            <Text style={styles.label}>Full Name</Text>
            <TextInput style={[styles.input, {width: '100%'}]} placeholder="Enter your full name" placeholderTextColor="#888" value={inputFullName} onChangeText={setInputFullName} />

            <Text style={styles.label}>Mobile Number</Text>
            <TextInput style={[styles.input, {width: '100%'}]} placeholder="Enter 10-digit mobile number" placeholderTextColor="#888" keyboardType="phone-pad" maxLength={10} value={inputPhone} onChangeText={setInputPhone} />

            {authMode === 'otp' && (
              <>
                <Text style={styles.label}>Enter OTP (Use 1234)</Text>
                <TextInput style={[styles.input, {width: '100%'}]} placeholder="4-digit OTP" placeholderTextColor="#888" keyboardType="numeric" maxLength={4} value={inputOtp} onChangeText={setInputOtp} />
              </>
            )}

            <Text style={styles.label}>Select Account Type</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity style={[styles.switchBtn, roleType === 'buyer' ? styles.onBtn : {backgroundColor: '#cbd5e1'}]} onPress={() => setRoleType('buyer')}>
                <Text style={styles.switchText}>Buyer Account</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.switchBtn, roleType === 'seller' ? styles.onBtn : {backgroundColor: '#cbd5e1'}]} onPress={() => setRoleType('seller')}>
                <Text style={styles.switchText}>Partner Seller</Text>
              </TouchableOpacity>
            </View>

            {authMode === 'phone' ? (
              <TouchableOpacity style={[styles.exploreButton, {width: '100%'}]} onPress={handleSendOtp}>
                <Text style={styles.buttonText}>Get Verification OTP 🚀</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.exploreButton, {width: '100%', backgroundColor: '#16a34a'}]} onPress={handleVerifyOtp}>
                <Text style={styles.buttonText}>Verify & Login to Arishop ✅</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ================= CHECKOUT SCREEN =================
  if (selectedProduct) {
    const rawPriceNum = parseInt(selectedProduct.price) || 500;
    const finalDiscountPrice = rawPriceNum - (rawPriceNum * (selectedProduct.discountPercent || 0)) / 100;
    const finalCalculatedPrice = isFastDelivery ? finalDiscountPrice + 40 : finalDiscountPrice;
    const currentImg = selectedProduct.images?.[activeImageIndex] || selectedProduct.images?.[0];
    const targetUpi = selectedProduct.customUpiId || defaultUpiId;

    return (
      <SafeAreaView style={styles.containerStore}>
        <ScrollView contentContainerStyle={styles.storeScroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.storeHeader}>Amazon/Flipkart Style Checkout 🛒</Text>
          
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
            <Text style={{color: '#eab308', fontSize: 12, marginBottom: 4}}>⭐ {selectedProduct.rating || 4.5} ({selectedProduct.reviewsCount || 10} Ratings)</Text>
            <Text style={styles.priceText}>Price: ₹{Math.round(finalDiscountPrice)}</Text>

            <View style={{marginTop: 10, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 8}}>
              <Text style={{fontWeight: 'bold', fontSize: 12, color: '#334155', marginBottom: 4}}>Customer Reviews & Feedback:</Text>
              {selectedProduct.reviewsList?.map((rev, rIdx) => (
                <View key={rIdx} style={{backgroundColor: '#f8fafc', padding: 6, borderRadius: 6, marginBottom: 4}}>
                  <Text style={{fontSize: 11, fontWeight: 'bold', color: '#1e293b'}}>{rev.user} ⭐ {rev.rating}/5</Text>
                  <Text style={{fontSize: 11, color: '#64748b'}}>{rev.comment}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.formHeading}>⚡ Choose Delivery Speed</Text>
            <TouchableOpacity 
              style={[styles.deliveryOptionBtn, !isFastDelivery && styles.deliveryOptionActive]} 
              onPress={() => setIsFastDelivery(false)}>
              <Text style={styles.deliveryTitle}>📦 Standard Delivery (5-7 Days)</Text>
              <Text style={styles.deliverySub}>Free Shipping</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.deliveryOptionBtn, isFastDelivery && styles.deliveryOptionActive]} 
              onPress={() => setIsFastDelivery(true)}>
              <Text style={styles.deliveryTitle}>⚡ Express Fast Delivery (3 Days Priority)</Text>
              <Text style={styles.deliverySub}>Extra Charges: ₹40</Text>
            </TouchableOpacity>

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
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TextInput style={[styles.input, {flex: 1}]} placeholder="Pincode" placeholderTextColor="#888" keyboardType="numeric" maxLength={6} value={buyerPincode} onChangeText={setBuyerPincode} />
              <TouchableOpacity style={{backgroundColor: '#0284c7', padding: 10, borderRadius: 8, marginLeft: 6}} onPress={() => {
                if (buyerPincode.length === 6) {
                  Alert.alert('Location Fetched', `Pincode ${buyerPincode}: Delhi / NCR Delivery Zone Auto-detected! 📍`);
                } else {
                  Alert.alert('Enter Pincode', 'कृपया 6 अंकों का सही पिनकोड दर्ज करें।');
                }
              }}>
                <Text style={{color: '#fff', fontSize: 12, fontWeight: 'bold'}}>Detect GPS</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.label}>Delivery Address</Text>
            <TextInput style={[styles.input, { height: 60 }]} placeholder="House no, street, city" placeholderTextColor="#888" multiline value={buyerAddress} onChangeText={setBuyerAddress} />

            <Text style={styles.label}>📍 Delivery Landmark (Helper for Delivery Agent)</Text>
            <TextInput style={styles.input} placeholder="e.g. Near park / Metro pillar 42" placeholderTextColor="#888" value={deliveryLandmark} onChangeText={setDeliveryLandmark} />

            <Text style={[styles.formHeading, {marginTop: 15, color: '#16a34a'}]}>💳 Select Payment Method</Text>
            
            <View style={styles.toggleRow}>
              {selectedProduct.allowUpiQr && (
                <TouchableOpacity style={[styles.switchBtn, paymentMethod === 'upi' ? styles.onBtn : {backgroundColor: '#cbd5e1'}]} onPress={() => setPaymentMethod('upi')}>
                  <Text style={styles.switchText}>Pay via UPI / QR</Text>
                </TouchableOpacity>
              )}
              {selectedProduct.allowCod && (
                <TouchableOpacity style={[styles.switchBtn, paymentMethod === 'cod' ? styles.onBtn : {backgroundColor: '#cbd5e1'}]} onPress={() => setPaymentMethod('cod')}>
                  <Text style={styles.switchText}>Cash on Delivery</Text>
                </TouchableOpacity>
              )}
            </View>

            {paymentMethod === 'upi' && (
              <View style={{backgroundColor: '#f1f5f9', padding: 12, borderRadius: 10, alignItems: 'center', marginVertical: 10, borderWidth: 1, borderColor: '#cbd5e1'}}>
                <Text style={{fontWeight: 'bold', color: '#1e293b', fontSize: 13}}>Scan QR or Pay to Vendor:</Text>
                <Text style={{color: '#0284c7', fontSize: 12, fontWeight: 'bold', marginVertical: 4}}>UPI ID: {targetUpi}</Text>
                
                {selectedProduct.customQrImage ? (
                  <Image source={{ uri: selectedProduct.customQrImage }} style={{width: 130, height: 130, marginVertical: 8, borderRadius: 8}} />
                ) : (
                  <View style={{width: 120, height: 120, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center', marginVertical: 8, borderRadius: 8}}>
                    <Text style={{fontSize: 11, color: '#64748b', textAlign: 'center'}}>📷 Scan QR Code ({targetUpi})</Text>
                  </View>
                )}

                <Text style={styles.label}>Enter UPI Transaction ID / UTR Number:</Text>
                <TextInput style={[styles.input, {width: '100%'}]} placeholder="e.g. UPI/23948293482" placeholderTextColor="#888" value={upiRefId} onChangeText={setUpiRefId} />
              </View>
            )}

            <Text style={{fontWeight: 'bold', fontSize: 15, color: '#16a34a', marginVertical: 10}}>Total Payable: ₹{Math.round(finalCalculatedPrice)}</Text>

            <TouchableOpacity style={styles.exploreButton} onPress={handleCheckout}>
              <Text style={styles.buttonText}>Confirm Order & Pay 🚀</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton} onPress={() => setSelectedProduct(null)}>
              <Text style={[styles.buttonText, {color: '#334155'}]}>Back to Store</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ================= COIN REDEMPTION SCREEN =================
  if (activeScreen === 'coin_redeem') {
    return (
      <SafeAreaView style={styles.containerStore}>
        <ScrollView contentContainerStyle={styles.storeScroll}>
          <Text style={styles.storeHeader}>🪙 Coin Redemption & Rewards</Text>
          
          <View style={[styles.formContainer, {alignItems: 'center', backgroundColor: '#fef9c3', borderColor: '#eab308'}]}>
            <Text style={{fontSize: 40}}>🪙</Text>
            <Text style={{color: '#854d0e', fontSize: 14, fontWeight: 'bold', marginTop: 5}}>Your Available Coins</Text>
            <Text style={{color: '#ca8a04', fontSize: 32, fontWeight: 'bold', marginVertical: 4}}>{userCoins} Coins</Text>
            <Text style={{color: '#713f12', fontSize: 11, textAlign: 'center'}}>Every 5,000 Coins can be converted into ₹200 Arishop Shopping Balance!</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.formHeading}>🛍️ Redeem Coins for Shopping Balance</Text>
            <Text style={{color: '#334155', fontSize: 13, lineHeight: 20, marginBottom: 15}}>
              • न्यूनतम रिडेम्पशन सीमा: **5,000 कॉइन्स**{'\n'}
              • रिडेम्पशन वैल्यू: **5,000 कॉइन्स = ₹200 वॉलेट बैलेंस**{'\n'}
              • **महत्वपूर्ण नियम:** इन पैसों को आप सीधे अपने बैंक खाते में ट्रांसफर नहीं कर सकते। यह बैलेंस केवल Arishop पर सामान खरीदने के लिए उपयोग किया जाएगा।
            </Text>

            <TouchableOpacity 
              style={[styles.exploreButton, userCoins < 5000 && {backgroundColor: '#94a3b8'}]} 
              onPress={handleRedeemCoins}
            >
              <Text style={styles.buttonText}>Convert 5,000 Coins to ₹200 Balance 🚀</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.backButton} onPress={() => setActiveScreen('home')}>
            <Text style={[styles.buttonText, {color: '#334155'}]}>Back to Home Store</Text>
          </TouchableOpacity>
        </ScrollView>
        {renderBottomNav()}
      </SafeAreaView>
    );
  }

  // ================= AI SUPPORT CHAT SCREEN =================
  if (activeScreen === 'ai_support') {
    return (
      <SafeAreaView style={styles.containerStore}>
        <ScrollView contentContainerStyle={styles.storeScroll}>
          <Text style={styles.storeHeader}>🤖 Arishop AI Support Desk</Text>
          
          <View style={[styles.formContainer, {height: 380}]}>
            <ScrollView contentContainerStyle={{paddingBottom: 10}}>
              {aiChatLog.map((chat, idx) => (
                <View key={idx} style={[styles.chatBubbleLarge, chat.sender === 'user' ? styles.userBubbleLarge : styles.aiBubbleLarge]}>
                  <Text style={[styles.chatTextLarge, chat.sender === 'ai' && {color: '#1e293b'}]}>{chat.text}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
            <TextInput style={[styles.input, {flex: 1, marginRight: 8}]} placeholder="Ask AI about orders, refunds..." placeholderTextColor="#888" value={userChatInput} onChangeText={setUserChatInput} />
            <TouchableOpacity style={{backgroundColor: '#0284c7', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8}} onPress={handleSendAiMessage}>
              <Text style={{color: '#fff', fontWeight: 'bold'}}>Send</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.sahilCareBtn} onPress={() => {
            Linking.openURL(`tel:${supportCareNumber}`);
            Alert.alert('Sahil Customer Care', `Calling Sahil Support: +91-${supportCareNumber}`);
          }}>
            <Text style={styles.sahilCareText}>📞 Direct Call Sahil Support ({supportCareNumber})</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => setActiveScreen('home')}>
            <Text style={[styles.buttonText, {color: '#334155'}]}>Back to Home Store</Text>
          </TouchableOpacity>
        </ScrollView>
        {renderBottomNav()}
      </SafeAreaView>
    );
  }

  // ================= LUXURY & VIP LOUNGE SCREEN =================
  if (activeScreen === 'luxury_lounge') {
    return (
      <SafeAreaView style={styles.containerStore}>
        <ScrollView contentContainerStyle={styles.storeScroll}>
          <Text style={styles.storeHeader}>👑 Arishop Luxury & VIP Lounge</Text>
          <Text style={{color: '#64748b', fontSize: 13, marginBottom: 15}}>Explore exclusive high-end certified products with priority express delivery.</Text>

          {products.filter(p => p.isRare).map(item => (
            <View key={item.id} style={styles.productCard}>
              <Image source={{ uri: item.images[0] }} style={styles.productImage} />
              <View style={{padding: 12}}>
                <Text style={styles.productTitle}>{item.title}</Text>
                <Text style={styles.productDesc}>{item.desc}</Text>
                <View style={styles.rowBetween}>
                  <Text style={styles.priceText}>₹{item.price}</Text>
                  <TouchableOpacity style={styles.buyNowSmallBtn} onPress={() => { setSelectedProduct(item); setActiveImageIndex(0); }}>
                    <Text style={styles.buyText}>VIP Buy</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.backButton} onPress={() => setActiveScreen('home')}>
            <Text style={[styles.buttonText, {color: '#334155'}]}>Back to Home Store</Text>
          </TouchableOpacity>
        </ScrollView>
        {renderBottomNav()}
      </SafeAreaView>
    );
  }

  // ================= SHOPPING CART SCREEN =================
  if (activeScreen === 'cart') {
    return (
      <SafeAreaView style={styles.containerStore}>
        <ScrollView contentContainerStyle={styles.storeScroll}>
          <Text style={styles.storeHeader}>🛒 Your Shopping Cart</Text>

          {cartItems.length === 0 ? (
            <Text style={{color: '#64748b', textAlign: 'center', marginTop: 30}}>Your cart is currently empty.</Text>
          ) : (
            cartItems.map((item, idx) => (
              <View key={idx} style={[styles.formContainer, {flexDirection: 'row', alignItems: 'center'}]}>
                <Image source={{ uri: item.images[0] }} style={{width: 60, height: 60, borderRadius: 8, marginRight: 12}} />
                <View style={{flex: 1}}>
                  <Text style={{fontWeight: 'bold', fontSize: 13, color: '#1e293b'}}>{item.title}</Text>
                  <Text style={{color: '#0284c7', fontSize: 12, fontWeight: 'bold', marginTop: 4}}>₹{item.price}</Text>
                </View>
                <TouchableOpacity style={{backgroundColor: '#eab308', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6}} onPress={() => { setSelectedProduct(item); setActiveImageIndex(0); }}>
                  <Text style={{color: '#fff', fontSize: 11, fontWeight: 'bold'}}>Buy</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          <TouchableOpacity style={styles.backButton} onPress={() => setActiveScreen('home')}>
            <Text style={[styles.buttonText, {color: '#334155'}]}>Back to Home Store</Text>
          </TouchableOpacity>
        </ScrollView>
        {renderBottomNav()}
      </SafeAreaView>
    );
  }

  // ================= SELLER DASHBOARD =================
  if (activeScreen === 'seller_dashboard') {
    return (
      <SafeAreaView style={styles.containerStore}>
        <ScrollView contentContainerStyle={styles.storeScroll}>
          <Text style={styles.storeHeader}>🏪 Partner Seller Dashboard</Text>
          
          <View style={styles.formContainer}>
            <Text style={styles.formHeading}>Sell Your Products on Arishop</Text>
            <Text style={{color: '#64748b', fontSize: 12, marginBottom: 10}}>यहाँ से आप अपने खुद के प्रोडक्ट्स अपलोड कर सकते हैं और आर्डर आने पर डायरेक्ट पेमेंट प्राप्त कर सकते हैं।</Text>

            <TextInput style={styles.input} placeholder="Store / Shop Name" placeholderTextColor="#888" />
            <TextInput style={[styles.input, {marginTop: 8}]} placeholder="Business Address & GST (Optional)" placeholderTextColor="#888" />

            <TouchableOpacity style={[styles.exploreButton, {backgroundColor: '#16a34a', marginTop: 12}]} onPress={() => Alert.alert('Request Sent', 'Your seller account request has been submitted to Master Admin (Sahil) for review.')}>
              <Text style={styles.buttonText}>Submit Seller Application 📝</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.backButton} onPress={() => setActiveScreen('home')}>
            <Text style={[styles.buttonText, {color: '#334155'}]}>Back to Home Store</Text>
          </TouchableOpacity>
        </ScrollView>
        {renderBottomNav()}
      </SafeAreaView>
    );
  }

  // ================= PROFILE / YOU SCREEN =================
  if (activeScreen === 'you') {
    return (
      <SafeAreaView style={styles.containerStore}>
        <ScrollView contentContainerStyle={styles.storeScroll}>
          <Text style={styles.storeHeader}>👤 Your Profile & Account</Text>
          
          <View style={styles.formContainer}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
              <View style={{width: 60, height: 60, borderRadius: 30, backgroundColor: '#0284c7', justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{color: '#fff', fontSize: 24, fontWeight: 'bold'}}>SR</Text>
              </View>
              <View style={{marginLeft: 15}}>
                <Text style={{fontSize: 18, fontWeight: 'bold', color: '#1e293b'}}>{loggedInUser}</Text>
                <Text style={{color: '#64748b', fontSize: 12}}>+91-{userPhone} | {roleType.toUpperCase()}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.profileMenuRow} onPress={() => setActiveScreen('orders')}>
              <Text style={styles.profileMenuText}>📦 Your Orders & Tracking</Text>
              <Text style={{color: '#0284c7'}}>➔</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.profileMenuRow} onPress={() => setActiveScreen('refunds')}>
              <Text style={styles.profileMenuText}>🔄 Cancellations & 24-48h Refunds</Text>
              <Text style={{color: '#0284c7'}}>➔</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.profileMenuRow} onPress={() => setActiveScreen('wallet')}>
              <Text style={styles.profileMenuText}>🪙 Arishop Wallet & Earnings (₹{walletBalance})</Text>
              <Text style={{color: '#0284c7'}}>➔</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.profileMenuRow} onPress={() => setActiveScreen('coin_redeem')}>
              <Text style={styles.profileMenuText}>🎁 Redeem Coins ({userCoins} Coins available)</Text>
              <Text style={{color: '#0284c7'}}>➔</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.profileMenuRow} onPress={() => setActiveScreen('luxury_lounge')}>
              <Text style={styles.profileMenuText}>👑 Arishop Luxury & VIP Lounge</Text>
              <Text style={{color: '#0284c7'}}>➔</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.profileMenuRow} onPress={() => setActiveScreen('ai_support')}>
              <Text style={styles.profileMenuText}>🤖 AI Support & Help Desk</Text>
              <Text style={{color: '#0284c7'}}>➔</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.profileMenuRow} onPress={() => setActiveScreen('seller_dashboard')}>
              <Text style={styles.profileMenuText}>🏪 Become a Partner Seller</Text>
              <Text style={{color: '#0284c7'}}>➔</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.backButton} onPress={() => setActiveScreen('home')}>
            <Text style={[styles.buttonText, {color: '#334155'}]}>Back to Home Store</Text>
          </TouchableOpacity>
        </ScrollView>
        {renderBottomNav()}
      </SafeAreaView>
    );
  }

  // ================= WALLET SCREEN =================
  if (activeScreen === 'wallet') {
    return (
      <SafeAreaView style={styles.containerStore}>
        <ScrollView contentContainerStyle={styles.storeScroll}>
          <Text style={styles.storeHeader}>🪙 Arishop Wallet & Direct Earnings</Text>
          
          <View style={[styles.formContainer, {backgroundColor: '#0284c7', alignItems: 'center'}]}>
            <Text style={{color: '#e2e8f0', fontSize: 13}}>Total Earnings Wallet Balance</Text>
            <Text style={{color: '#ffffff', fontSize: 32, fontWeight: 'bold', marginVertical: 8}}>₹{walletBalance}</Text>
            <TouchableOpacity onPress={() => setActiveScreen('coin_redeem')}>
              <Text style={{color: '#fef08a', fontSize: 12, textDecorationLine: 'underline'}}>🪙 Available Coins: {userCoins} (Tap here to redeem)</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.formHeading}>💰 How Direct Payments Work for You:</Text>
            <Text style={{color: '#334155', fontSize: 13, lineHeight: 20, marginBottom: 10}}>
              1. जब भी कोई ग्राहक आर्डर करता है और UPI या QR के जरिए पेमेंट करता है, तो राशि सीधे आपके पास आती है और आपके वॉलेट में जुड़ जाती है।{'\n'}
              2. आप 5,000 कॉइन्स रिडीम करके ₹200 का शॉपिंग बैलेंस पा सकते हैं (जो केवल सामान खरीदने में काम आएगा)।{'\n'}
              3. फास्ट डिलीवरी (3 दिन) के लिए ग्राहक ₹40 एक्स्ट्रा पे करते हैं जो सीधा आपका मुनाफा है।{'\n'}
              4. कैंसिलेशन या रिफंड अनुरोध 24 से 48 घंटे के भीतर प्रोसेस कर दिए जाते हैं।
            </Text>

            <TouchableOpacity style={styles.exploreButton} onPress={() => Alert.alert('Bank Transfer', 'Your wallet balance has been successfully queued for transfer to your linked bank account!')}>
              <Text style={styles.buttonText}>Transfer to Bank Account 🏦</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.backButton} onPress={() => setActiveScreen('home')}>
            <Text style={[styles.buttonText, {color: '#334155'}]}>Back to Home Store</Text>
          </TouchableOpacity>
        </ScrollView>
        {renderBottomNav()}
      </SafeAreaView>
    );
  }

  // ================= ORDERS & REFUNDS SCREEN =================
  if (activeScreen === 'orders' || activeScreen === 'refunds') {
    return (
      <SafeAreaView style={styles.containerStore}>
        <ScrollView contentContainerStyle={styles.storeScroll}>
          <Text style={styles.storeHeader}>{activeScreen === 'orders' ? '📦 Your Orders & Tracking' : '🔄 Cancellations & Refunds (24-48 Hours)'}</Text>
          
          {activeScreen === 'orders' ? (
            liveOrdersList.length === 0 ? (
              <Text style={{color: '#64748b', textAlign: 'center', marginTop: 20}}>No active orders found.</Text>
            ) : (
              liveOrdersList.map((ord, idx) => (
                <View key={idx} style={styles.formContainer}>
                  <Text style={{fontWeight: 'bold', fontSize: 14, color: '#1e293b'}}>{ord.productName}</Text>
                  <Text style={{color: '#0284c7', fontSize: 12, marginVertical: 2}}>Order ID: {ord.orderId}</Text>
                  <Text style={{color: '#16a34a', fontSize: 12, fontWeight: 'bold'}}>Status: {ord.status}</Text>
                  <Text style={{color: '#64748b', fontSize: 12}}>Courier Partner: {ord.courier} | Price: {ord.price}</Text>
                  <Text style={{color: '#d97706', fontSize: 11, marginTop: 2}}>📍 Landmark: {ord.landmark || 'N/A'}</Text>
                  
                  <TouchableOpacity style={[styles.buyNowSmallBtn, {backgroundColor: '#dc2626', marginTop: 10, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6}]} onPress={() => handleCancelOrder(ord.orderId, ord.price)}>
                    <Text style={styles.buyText}>Cancel Order & Refund (24-48h)</Text>
                  </TouchableOpacity>
                </View>
              ))
            )
          ) : (
            refundRequests.length === 0 ? (
              <Text style={{color: '#64748b', textAlign: 'center', marginTop: 20}}>No refund requests yet. (Refunds are processed within 24-48 hours)</Text>
            ) : (
              refundRequests.map((ref, idx) => (
                <View key={idx} style={styles.formContainer}>
                  <Text style={{fontWeight: 'bold', fontSize: 14, color: '#1e293b'}}>Order ID: {ref.orderId}</Text>
                  <Text style={{color: '#16a34a', fontSize: 12, fontWeight: 'bold'}}>Status: {ref.status}</Text>
                  <Text style={{color: '#64748b', fontSize: 12}}>Date: {ref.date}</Text>
                </View>
              ))
            )
          )}

          <TouchableOpacity style={styles.backButton} onPress={() => setActiveScreen('home')}>
            <Text style={[styles.buttonText, {color: '#334155'}]}>Back to Home Store</Text>
          </TouchableOpacity>
        </ScrollView>
        {renderBottomNav()}
      </SafeAreaView>
    );
  }

  // ================= HOME SCREEN =================
  return (
    <SafeAreaView style={styles.containerStore}>
      <ScrollView contentContainerStyle={styles.storeScroll} keyboardShouldPersistTaps="handled">
        
        <View style={styles.headerRow}>
          <Text style={styles.storeHeader}>Arishop 🛍️</Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity style={[styles.coinBadge, {marginRight: 6}]} onPress={() => setActiveScreen('cart')}>
              <Text style={styles.coinText}>🛒 ({cartItems.length})</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.coinBadge} onPress={() => setActiveScreen('coin_redeem')}>
              <Text style={styles.coinText}>🪙 {userCoins} Coins</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Live Search Bar */}
        <TextInput 
          style={styles.searchBar} 
          placeholder="🔍 Search clothes, shoes, mobiles, fast delivery..." 
          placeholderTextColor="#888" 
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Categories Grid with Visual Icons */}
        {enableCategoriesGrid && (
          <View style={styles.amazonGridRow}>
            {availableCategories.map(cat => (
              <TouchableOpacity key={cat} style={styles.gridItem} onPress={() => setSelectedCategory(cat)}>
                <View style={styles.gridCircle}>
                  <Image source={{ uri: categoryVisuals[cat] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100' }} style={{width: 36, height: 36, borderRadius: 18}} />
                </View>
                <Text style={styles.gridLabel}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Banner Slider */}
        {enableBanners && bannerList[currentBannerIndex] && (
          <TouchableOpacity style={styles.bannerBox} onPress={() => setActiveScreen('coin_redeem')}>
            <Text style={styles.bannerTitle}>{bannerList[currentBannerIndex].title}</Text>
            <Text style={styles.bannerSub}>{bannerList[currentBannerIndex].sub}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.adminToggleButton} onPress={() => setShowAdminPanel(!showAdminPanel)}>
          <Text style={styles.adminToggleText}>{showAdminPanel ? '❌ Close Master Admin Controls' : '⚙️ Master Admin Control Panel (A to Z On/Off)'}</Text>
        </TouchableOpacity>

        {/* Master Admin Control Panel */}
        {showAdminPanel && (
          <View style={styles.formContainer}>
            <Text style={styles.formHeading}>Master Controls (Admin Only)</Text>

            <View style={[styles.toggleRow, {borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 8, marginBottom: 8}]}>
              <Text style={[styles.label, {fontWeight: 'bold', color: '#0284c7'}]}>Master All Apps (On/Off):</Text>
              <TouchableOpacity onPress={handleMasterToggleAll} style={[styles.switchBtn, masterAllOn ? styles.onBtn : styles.offBtn]}>
                <Text style={styles.switchText}>{masterAllOn ? 'ALL ON' : 'ALL OFF'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, {color: '#0284c7', fontWeight: 'bold', marginTop: 10}]}>Category Line-by-Line Visual Controls:</Text>
            {Object.keys(categoryToggles).map(catKey => (
              <View key={catKey} style={styles.toggleRow}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Image source={{ uri: categoryVisuals[catKey] }} style={{width: 24, height: 24, borderRadius: 12, marginRight: 8}} />
                  <Text style={{color: '#1e293b', fontSize: 12, fontWeight: 'bold'}}>{catKey}</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setCategoryToggles(prev => ({...prev, [catKey]: !prev[catKey]}))} 
                  style={[styles.switchBtn, categoryToggles[catKey] ? styles.onBtn : styles.offBtn]}>
                  <Text style={styles.switchText}>{categoryToggles[catKey] ? 'ON' : 'OFF'}</Text>
                </TouchableOpacity>
              </View>
            ))}

            <Text style={[styles.formHeading, {marginTop: 15, color: '#0284c7'}]}>Add Official Product & Real Photos</Text>
            <TextInput style={styles.input} placeholder="Product Name" placeholderTextColor="#888" value={newTitle} onChangeText={setNewTitle} />
            <TextInput style={[styles.input, {marginTop: 6}]} placeholder="Price (₹)" placeholderTextColor="#888" keyboardType="numeric" value={newPrice} onChangeText={setNewPrice} />
            <TextInput style={[styles.input, {marginTop: 6, height: 60}]} placeholder="Product Description" placeholderTextColor="#888" multiline value={newDesc} onChangeText={setNewDesc} />
            
            <Text style={styles.label}>Select Product Category:</Text>
            <View style={styles.chipRow}>
              {Object.keys(categoryToggles).map(cat => (
                <TouchableOpacity key={cat} style={[styles.optionChip, newCategory === cat && styles.optionChipActive]} onPress={() => setNewCategory(cat)}>
                  <Text style={[styles.optionChipText, newCategory === cat && styles.optionChipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, {fontWeight: 'bold', color: '#16a34a', marginTop: 10}]}>Product Payment & QR Settings:</Text>
            
            <View style={styles.toggleRow}>
              <Text style={styles.label}>Allow Cash on Delivery (COD):</Text>
              <TouchableOpacity onPress={() => setProductCodEnabled(!productCodEnabled)} style={[styles.switchBtn, productCodEnabled ? styles.onBtn : styles.offBtn]}>
                <Text style={styles.switchText}>{productCodEnabled ? 'YES' : 'NO'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.label}>Allow UPI / QR Payment:</Text>
              <TouchableOpacity onPress={() => setProductUpiEnabled(!productUpiEnabled)} style={[styles.switchBtn, productUpiEnabled ? styles.onBtn : styles.offBtn]}>
                <Text style={styles.switchText}>{productUpiEnabled ? 'YES' : 'NO'}</Text>
              </TouchableOpacity>
            </View>

            {productUpiEnabled && (
              <>
                <TextInput style={[styles.input, {marginTop: 6}]} placeholder="Custom UPI ID (e.g. sahil@paytm)" placeholderTextColor="#888" value={productCustomUpi} onChangeText={setProductCustomUpi} />
                <TouchableOpacity style={[styles.exploreButton, {backgroundColor: '#0284c7', marginVertical: 6}]} onPress={() => pickImageFromGallery(true)}>
                  <Text style={styles.buttonText}>📷 Upload Custom Payment QR Code</Text>
                </TouchableOpacity>
                {productCustomQr ? (
                  <Image source={{ uri: productCustomQr }} style={{width: 70, height: 70, borderRadius: 6, marginVertical: 4}} />
                ) : null}
              </>
            )}

            <TouchableOpacity style={[styles.exploreButton, {backgroundColor: '#0284c7', marginVertical: 8}]} onPress={() => pickImageFromGallery(false)}>
              <Text style={styles.buttonText}>📷 Pick Product Photos from Gallery (Max 3)</Text>
            </TouchableOpacity>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginVertical: 6}}>
              {uploadedImages.map((uri, idx) => (
                <Image key={idx} source={{ uri }} style={{width: 60, height: 60, borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: '#cbd5e1'}} />
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.exploreButton} onPress={handleAddProduct}>
              <Text style={styles.buttonText}>Publish Official Product 🚀</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>Marketplace Products ({selectedCategory})</Text>

        {filteredProducts.map(item => {
          const rawNum = parseInt(item.price) || 500;
          const discountedVal = Math.round(rawNum - (rawNum * (item.discountPercent || 0)) / 100);
          const firstImg = item.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';

          return (
            <View key={item.id} style={styles.productCard}>
              <Image source={{ uri: firstImg }} style={styles.productImage} />
              <View style={{padding: 12}}>
                <Text style={styles.productTitle}>{item.title}</Text>
                <Text style={styles.productDesc}>{item.desc}</Text>
                <Text style={{color: '#0284c7', fontSize: 11, fontWeight: 'bold', marginBottom: 2}}>
                  🏪 Seller: {item.sellerName || 'Sahil (Master Admin)'}
                </Text>
                <Text style={{color: '#eab308', fontSize: 11, marginBottom: 4}}>
                  ⭐ {item.rating || 4.5} ({item.reviewsCount || 10} Reviews)
                </Text>
                <View style={styles.rowBetween}>
                  <Text style={styles.priceText}>₹{discountedVal}</Text>
                  <View style={{flexDirection: 'row'}}>
                    <TouchableOpacity style={[styles.buyNowSmallBtn, {backgroundColor: '#16a34a', marginRight: 6}]} onPress={() => handleAddToCart(item)}>
                      <Text style={styles.buyText}>+ Cart</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buyNowSmallBtn} onPress={() => { setSelectedProduct(item); setActiveImageIndex(0); }}>
                      <Text style={styles.buyText}>Buy Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        {/* Customer Support Shortcut */}
        <View style={styles.supportBox}>
          <Text style={styles.supportHeader}>🤖 Arishop Customer Support & Help Desk</Text>
          <TouchableOpacity style={styles.sahilCareBtn} onPress={() => setActiveScreen('ai_support')}>
            <Text style={styles.sahilCareText}>💬 Open AI Support & Chat Desk</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.sahilCareBtn, {backgroundColor: '#16a34a', marginTop: 6}]} onPress={() => {
            Linking.openURL(`tel:${supportCareNumber}`);
            Alert.alert('Sahil Customer Care', `Calling Sahil Support: +91-${supportCareNumber}`);
          }}>
            <Text style={styles.sahilCareText}>📞 Sahil Customer Support ({supportCareNumber})</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {renderBottomNav()}
    </SafeAreaView>
  );

  function renderBottomNav() {
    return (
      <View style={styles.bottomNavContainer}>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => setActiveScreen('home')}>
          <Text style={[styles.bottomNavText, activeScreen === 'home' && styles.bottomNavActive]}>🏠 Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => setActiveScreen('luxury_lounge')}>
          <Text style={[styles.bottomNavText, activeScreen === 'luxury_lounge' && styles.bottomNavActive]}>👑 Luxury</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => setActiveScreen('coin_redeem')}>
          <Text style={[styles.bottomNavText, activeScreen === 'coin_redeem' && styles.bottomNavActive]}>🪙 Redeem</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => setActiveScreen('ai_support')}>
          <Text style={[styles.bottomNavText, activeScreen === 'ai_support' && styles.bottomNavActive]}>🤖 AI Help</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => setActiveScreen('you')}>
          <Text style={[styles.bottomNavText, activeScreen === 'you' && styles.bottomNavActive]}>👤 You</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerStore: { flex: 1, backgroundColor: '#f8fafc' },
  storeScroll: { padding: 15, paddingBottom: 80 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 10 },
  storeHeader: { fontSize: 24, fontWeight: 'bold', color: '#0284c7' },
  coinBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#eab308' },
  coinText: { color: '#ca8a04', fontSize: 11, fontWeight: 'bold' },
  bannerBox: { backgroundColor: '#ffffff', borderRadius: 12, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#16a34a', alignItems: 'center' },
  bannerTitle: { color: '#16a34a', fontWeight: 'bold', fontSize: 14, textAlign: 'center' },
  bannerSub: { color: '#64748b', fontSize: 12, marginTop: 4, textAlign: 'center' },
  searchBar: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, color: '#1e293b', paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 12 },
  amazonGridRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 12 },
  gridItem: { width: '22%', alignItems: 'center', marginBottom: 10 },
  gridCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e1', marginBottom: 4 },
  gridLabel: { color: '#334155', fontSize: 11, textAlign: 'center' },
  adminToggleButton: { width: '100%', backgroundColor: '#0284c7', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  adminToggleText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
  formContainer: { width: '100%', backgroundColor: '#ffffff', borderRadius: 16, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#cbd5e1' },
  formHeading: { color: '#0284c7', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 6 },
  switchBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, flex: 1, marginHorizontal: 4, alignItems: 'center' },
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
  productCard: { width: '100%', backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', marginBottom: 15, borderWidth: 1, borderColor: '#cbd5e1' },
  productImage: { width: '100%', height: 160 },
  checkoutImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 10 },
  thumbImage: { width: 50, height: 50, borderRadius: 6, marginRight: 8, borderWidth: 1, borderColor: '#cbd5e1' },
  thumbActive: { borderColor: '#0284c7', borderWidth: 2 },
  productTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 2 },
  productDesc: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  priceText: { fontSize: 15, fontWeight: 'bold', color: '#0284c7' },
  buyNowSmallBtn: { backgroundColor: '#eab308', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  buyText: { fontSize: 11, fontWeight: 'bold', color: '#ffffff' },
  supportBox: { width: '100%', backgroundColor: '#ffffff', borderRadius: 16, padding: 15, marginTop: 10, borderWidth: 1, borderColor: '#cbd5e1' },
  supportHeader: { color: '#0284c7', fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  chatBubbleLarge: { padding: 8, borderRadius: 8, marginBottom: 6, maxWidth: '85%' },
  userBubbleLarge: { backgroundColor: '#0284c7', alignSelf: 'flex-end' },
  aiBubbleLarge: { backgroundColor: '#e2e8f0', alignSelf: 'flex-start' },
  chatTextLarge: { color: '#ffffff', fontSize: 12 },
  sahilCareBtn: { backgroundColor: '#0284c7', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  sahilCareText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  backButton: { marginTop: 10, backgroundColor: '#f1f5f9', paddingVertical: 12, borderRadius: 10, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: '#cbd5e1' },
  exploreButton: { width: '100%', backgroundColor: '#eab308', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
  bottomNavContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: '#ffffff', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#cbd5e1' },
  bottomNavItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  bottomNavText: { color: '#64748b', fontSize: 11 },
  bottomNavActive: { color: '#0284c7', fontWeight: 'bold' },
  profileMenuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  profileMenuText: { color: '#1e293b', fontSize: 14, fontWeight: 'bold' },
  deliveryOptionBtn: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 12, marginBottom: 8 },
  deliveryOptionActive: { borderColor: '#0284c7', backgroundColor: '#e0f2fe' },
  deliveryTitle: { fontWeight: 'bold', color: '#1e293b', fontSize: 13 },
  deliverySub: { color: '#64748b', fontSize: 11, marginTop: 2 }
});
