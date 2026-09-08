import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Alert, Image, Linking, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  // Authentication & Session States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('phone'); // 'phone' or 'otp'
  const [inputPhone, setInputPhone] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [inputFullName, setInputFullName] = useState('');
  const [roleType, setRoleType] = useState('buyer'); // 'buyer' or 'seller'

  const [activeScreen, setActiveScreen] = useState('home'); // 'home', 'you', 'wallet', 'cart', 'menu', 'orders', 'refunds', 'seller_dashboard'
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
  const defaultUpiId = 'sahil9205@paytm'; // आपकी मास्टर यूपीआई आईडी

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
  const [userCoins, setUserCoins] = useState(450); 
  const [walletBalance, setWalletBalance] = useState(2500); // Sahil's direct earnings wallet
  
  const [liveOrdersList, setLiveOrdersList] = useState([
    { orderId: 'ARISHOP-883920', productName: 'Men Stylish Winter Jacket', status: 'Dispatched (Standard 5-7 Days)', courier: 'Delhivery Express', price: '₹1499', date: '2026-09-06' }
  ]);
  const [refundRequests, setRefundRequests] = useState([]);

  // Pending Seller Requests for Admin Approval
  const [sellerRequests, setSellerRequests] = useState([
    { id: 's1', storeName: 'Rahul Garments', ownerName: 'Rahul Verma', phone: '9876543210', status: 'Pending' }
  ]);

  const [bannerList] = useState([
    { id: '1', title: '🔥 Mega Fashion & Electronics Sale: Up to 70% OFF!', sub: 'Explore top brand items shipped by Sahil Direct.' },
    { id: '2', title: '⚡ 3-Day Express Fast Delivery Now Live!', sub: 'Get your orders super fast with priority shipping.' },
    { id: '3', title: '🪙 Earn Arishop Coins on Every Direct UPI Payment!', sub: 'Use coins for instant discounts on checkout.' }
  ]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % bannerList.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [bannerList]);

  const [selectedCategory, setSelectedCategory] = useState('All');

  // Products State with Individual Payment & QR Settings
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
      customQrImage: ''
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
      customQrImage: ''
    }
  ]);

  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  // Admin / Seller Product Form States
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

  // Checkout States
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFastDelivery, setIsFastDelivery] = useState(false); // Fast Delivery option (+₹40)
  
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerPincode, setBuyerPincode] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' or 'cod'
  const [upiRefId, setUpiRefId] = useState('');

  // Support & Chat
  const [aiChatLog, setAiChatLog] = useState([
    { sender: 'ai', text: 'Hello! Welcome to Arishop Support. How can Sahil help you today?' }
  ]);

  const pickImageFromGallery = async (isQr = false) => {
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
    Alert.alert('Welcome!', `सफलतापूर्वक लॉगिन हो गया है, ${inputFullName}! 🎉`);
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
      customQrImage: productCustomQr
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

  const handleCheckout = useCallback(() => {
    if (!buyerName.trim() || !buyerPhone.trim() || !buyerPincode.trim() || !buyerAddress.trim()) {
      Alert.alert('अधूरा विवरण', 'कृपया नाम, फोन, पिनकोड और पूरा पता भरें!');
      return;
    }

    if (paymentMethod === 'upi' && !upiRefId.trim()) {
      Alert.alert('UPI Ref Required', 'कृपया पेमेंट करने के बाद UPI Transaction ID / UTR नंबर दर्ज करें ताकि पैसे सीधे आपके वॉलेट/अकाउंट में आ सकें!');
      return;
    }

    const rawNum = parseInt(selectedProduct.price) || 500;
    const discountedVal = rawNum - (rawNum * (selectedProduct.discountPercent || 0)) / 100;
    const finalAmount = isFastDelivery ? discountedVal + 40 : discountedVal;

    const courierPartners = ['Delhivery Express', 'Shiprocket Air', 'Blue Dart Express'];
    const assignedCourier = courierPartners[Math.floor(Math.random() * courierPartners.length)];
    const trackingId = 'ARISHOP-' + Math.floor(100000 + Math.random() * 900000);
    const deliveryTimeline = isFastDelivery ? '⚡ Fast Delivery (3 Days - Priority)' : '📦 Standard Delivery (5-7 Days)';

    // Add to direct wallet earnings immediately
    setWalletBalance(prev => prev + finalAmount);
    setUserCoins(prev => prev + 15);
    setUserSpent(prev => prev + finalAmount);

    const newOrderData = {
      orderId: trackingId,
      productName: selectedProduct.title,
      status: `Dispatched via ${deliveryTimeline}`,
      courier: assignedCourier,
      price: '₹' + finalAmount,
      date: new Date().toISOString().split('T')[0]
    };

    setLiveOrdersList(prev => [newOrderData, ...prev]);
    Alert.alert('आर्डर सफल & डायरेक्ट पेमेंट कंफर्म! 🚚💰', `धन्यवाद ${buyerName}!\n\n💸 कुल राशि: ₹${finalAmount} सीधे आपके UPI (${selectedProduct.customUpiId || defaultUpiId}) पर ट्रैक हो गई।\n📦 कूरियर: ${assignedCourier}\n🔖 ट्रैकिंग: ${trackingId}`);
    setSelectedProduct(null);
    setActiveScreen('orders');
  }, [buyerName, buyerPhone, buyerPincode, buyerAddress, selectedProduct, isFastDelivery, paymentMethod, upiRefId]);

  const handleCancelOrder = (orderId) => {
    Alert.alert('Cancel Order', 'क्या आप वाकई इस आर्डर को कैंसिल करना चाहते हैं?', [
      { text: 'No', style: 'cancel' },
      { 
        text: 'Yes, Cancel & Refund', 
        onPress: () => {
          setLiveOrdersList(prev => prev.filter(o => o.orderId !== orderId));
          setRefundRequests(prev => [...prev, { orderId, date: new Date().toISOString().split('T')[0], status: 'Refund Credited to Wallet' }]);
          Alert.alert('Cancelled', 'आर्डर सफलतापर्वक कैंसिल हो गया है और रिफंड आपके वॉलेट में जोड़ दिया गया है!');
        } 
      }
    ]);
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
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (p.isRare && !enableLuxurySection) return false;
      return true;
    });
  }, [products, selectedCategory, enableLuxurySection]);

  // ================= LOGIN SCREEN (BEFORE APP OPENS) =================
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

  // ================= RENDER CHECKOUT SCREEN =================
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
            <Text style={styles.priceText}>Price: ₹{Math.round(finalDiscountPrice)}</Text>
          </View>

          {/* Delivery Speed Selection */}
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
            <TextInput style={styles.input} placeholder="Pincode" placeholderTextColor="#888" keyboardType="numeric" maxLength={6} value={buyerPincode} onChangeText={setBuyerPincode} />
            <Text style={styles.label}>Delivery Address</Text>
            <TextInput style={[styles.input, { height: 70 }]} placeholder="House no, street, city" placeholderTextColor="#888" multiline value={buyerAddress} onChangeText={setBuyerAddress} />

            {/* Payment Methods Selection */}
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

  // ================= RENDER SELLER DASHBOARD / REGISTRATION =================
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

  // ================= RENDER PROFILE / YOU SCREEN =================
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

            <TouchableOpacity style={styles.profileMenuRow} onPress={() => setActiveScreen('wallet')}>
              <Text style={styles.profileMenuText}>🪙 Arishop Wallet & Earnings (₹{walletBalance})</Text>
              <Text style={{color: '#0284c7'}}>➔</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.profileMenuRow} onPress={() => setActiveScreen('refunds')}>
              <Text style={styles.profileMenuText}>🔄 Cancellations & Refunds</Text>
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

  // ================= RENDER WALLET SCREEN =================
  if (activeScreen === 'wallet') {
    return (
      <SafeAreaView style={styles.containerStore}>
        <ScrollView contentContainerStyle={styles.storeScroll}>
          <Text style={styles.storeHeader}>🪙 Arishop Wallet & Direct Earnings</Text>
          
          <View style={[styles.formContainer, {backgroundColor: '#0284c7', alignItems: 'center'}]}>
            <Text style={{color: '#e2e8f0', fontSize: 13}}>Total Earnings Wallet Balance</Text>
            <Text style={{color: '#ffffff', fontSize: 32, fontWeight: 'bold', marginVertical: 8}}>₹{walletBalance}</Text>
            <Text style={{color: '#fef08a', fontSize: 12}}>🪙 Available Coins: {userCoins}</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.formHeading}>💰 How Direct Payments Work for You:</Text>
            <Text style={{color: '#334155', fontSize: 13, lineHeight: 20, marginBottom: 10}}>
              1. जब भी कोई ग्राहक आर्डर करता है और UPI या QR के जरिए पेमेंट करता है, तो राशि सीधे आपके पास आती है और आपके वॉलेट में जुड़ जाती है।{'\n'}
              2. आप चाहें तो इस बैलेंस को अपने बैंक खाते में कभी भी ट्रांसफर कर सकते हैं।{'\n'}
              3. फास्ट डिलीवरी (3 दिन) के लिए ग्राहक ₹40 एक्स्ट्रा पे करते हैं जो सीधा आपका मुनाफा है।
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

  // ================= RENDER ORDERS & REFUNDS SCREEN =================
  if (activeScreen === 'orders' || activeScreen === 'refunds') {
    return (
      <SafeAreaView style={styles.containerStore}>
        <ScrollView contentContainerStyle={styles.storeScroll}>
          <Text style={styles.storeHeader}>{activeScreen === 'orders' ? '📦 Your Orders & Tracking' : '🔄 Cancellations & Refunds'}</Text>
          
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
                  
                  <TouchableOpacity style={[styles.buyNowSmallBtn, {backgroundColor: '#dc2626', marginTop: 10, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6}]} onPress={() => handleCancelOrder(ord.orderId)}>
                    <Text style={styles.buyText}>Cancel Order & Refund</Text>
                  </TouchableOpacity>
                </View>
              ))
            )
          ) : (
            refundRequests.length === 0 ? (
              <Text style={{color: '#64748b', textAlign: 'center', marginTop: 20}}>No refund requests yet.</Text>
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

  // ================= RENDER HOME SCREEN =================
  return (
    <SafeAreaView style={styles.containerStore}>
      <ScrollView contentContainerStyle={styles.storeScroll} keyboardShouldPersistTaps="handled">
        
        <View style={styles.headerRow}>
          <Text style={styles.storeHeader}>Arishop 🛍️</Text>
          <TouchableOpacity style={styles.coinBadge} onPress={() => setActiveScreen('wallet')}>
            <Text style={styles.coinText}>🪙 {userCoins} Coins</Text>
          </TouchableOpacity>
        </View>

        <TextInput style={styles.searchBar} placeholder="🔍 Search clothes, shoes, mobiles, fast delivery items..." placeholderTextColor="#888" />

        {/* Categories Grid */}
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
          <View style={styles.bannerBox}>
            <Text style={styles.bannerTitle}>{bannerList[currentBannerIndex].title}</Text>
            <Text style={styles.bannerSub}>{bannerList[currentBannerIndex].sub}</Text>
          </View>
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

            {/* Product Specific Payment Settings */}
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

        {/* Customer Support & Sahil Care Section */}
        <View style={styles.supportBox}>
          <Text style={styles.supportHeader}>🤖 Arishop Customer Support & Help Desk</Text>
          <View style={styles.chatContainer}>
            {aiChatLog.map((chat, idx) => (
              <View key={idx} style={[styles.chatBubble, chat.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
                <Text style={[styles.chatText, chat.sender === 'ai' && {color: '#1e293b'}]}>{chat.text}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.sahilCareBtn} onPress={() => {
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
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => setActiveScreen('you')}>
          <Text style={[styles.bottomNavText, activeScreen === 'you' && styles.bottomNavActive]}>👤 You</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => setActiveScreen('wallet')}>
          <Text style={[styles.bottomNavText, activeScreen === 'wallet' && styles.bottomNavActive]}>🪙 Wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => setActiveScreen('orders')}>
          <Text style={[styles.bottomNavText, activeScreen === 'orders' && styles.bottomNavActive]}>📦 Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => setShowAdminPanel(true)}>
          <Text style={[styles.bottomNavText, showAdminPanel && styles.bottomNavActive]}>☰ Menu</Text>
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
  adminToggleButton: { width: '100%', backgroundColor: '#0284c7', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  adminToggleText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
  formContainer: { width: '100%', backgroundColor: '#ffffff', borderRadius: 16, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#cbd5e1', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
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
  sahilCareBtn: { backgroundColor: '#16a34a', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  sahilCareText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  backButton: { marginTop: 10, backgroundColor: '#f1f5f9', paddingVertical: 12, borderRadius: 10, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: '#cbd5e1' },
  exploreButton: { width: '100%', backgroundColor: '#eab308', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
  bottomNavContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: '#ffffff', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#cbd5e1' },
  bottomNavItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  bottomNavText: { color: '#64748b', fontSize: 12 },
  bottomNavActive: { color: '#0284c7', fontWeight: 'bold' },
  profileMenuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  profileMenuText: { color: '#1e293b', fontSize: 14, fontWeight: 'bold' },
  deliveryOptionBtn: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 12, marginBottom: 8 },
  deliveryOptionActive: { borderColor: '#0284c7', backgroundColor: '#e0f2fe' },
  deliveryTitle: { fontWeight: 'bold', color: '#1e293b', fontSize: 13 },
  deliverySub: { color: '#64748b', fontSize: 11, marginTop: 2 }
});
