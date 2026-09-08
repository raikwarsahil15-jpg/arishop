import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

const APP_NAME = "Arishop";
const SUPPORT_PHONE = "9999999999";

const LOGO = require("./logo.png");
const WELCOME_IMAGE = require("./welcome.png");

const STORAGE = {
  session: "arishop_session_v2",
  products: "arishop_products_v2",
  cart: "arishop_cart_v2",
  orders: "arishop_orders_v2",
  profile: "arishop_profile_v2",
  settings: "arishop_settings_v2",
  seller: "arishop_seller_v2",
};

const CATEGORIES = [
  { id: "tshirt", name: "T-Shirts", icon: "👕" },
  { id: "shirt", name: "Shirts", icon: "👔" },
  { id: "pants", name: "Pants", icon: "👖" },
  { id: "anime", name: "Anime", icon: "🎌" },
  { id: "shoes", name: "Shoes", icon: "👟" },
  { id: "accessories", name: "Accessories", icon: "👜" },
  { id: "electronics", name: "Electronics", icon: "📱" },
  { id: "other", name: "Other", icon: "📦" },
];

const DEFAULT_SETTINGS = {
  aiSupport: true,
  humanSupport: true,
  sellerSystem: true,
  coinsSystem: true,
  premiumSystem: true,
  weeklyCustomer: true,
  fastDelivery: true,
  refunds: true,
  cod: true,
};

const SEED_PRODUCTS = [
  {
    id: "welcome-1",
    name: "Premium Anime T-Shirt",
    description:
      "Premium printed anime T-shirt. Product photos, sizes and colors can be managed by admin.",
    price: 499,
    category: "anime",
    images: [],
    colors: [
      { name: "Black", available: true },
      { name: "White", available: true },
    ],
    sizes: [
      { name: "S", available: true },
      { name: "M", available: true },
      { name: "L", available: true },
      { name: "XL", available: true },
    ],
    pickupLocation: "",
    sellerId: "admin",
    sellerName: "Arishop",
    sellerLat: null,
    sellerLng: null,
    qrImage: null,
    active: true,
  },
  {
    id: "welcome-2",
    name: "Street Style Pants",
    description: "Comfortable everyday pants.",
    price: 799,
    category: "pants",
    images: [],
    colors: [
      { name: "Black", available: true },
      { name: "Blue", available: false },
    ],
    sizes: [
      { name: "28", available: true },
      { name: "30", available: true },
      { name: "32", available: true },
      { name: "34", available: true },
    ],
    pickupLocation: "",
    sellerId: "admin",
    sellerName: "Arishop",
    sellerLat: null,
    sellerLng: null,
    qrImage: null,
    active: true,
  },
];

const money = (value) => `₹${Number(value || 0).toFixed(0)}`;

const loadJSON = async (key, fallback) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const saveJSON = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

const getCategoryName = (id) => {
  const item = CATEGORIES.find((x) => x.id === id);
  return item ? item.name : "Other";
};

const generateId = (prefix = "id") =>
  `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

export default function App() {
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState("home");

  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    email: "",
    role: "buyer",
    coins: 0,
    instagramId: "",
    instagramPhoto: null,
    weeklyConsent: false,
  });

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [deliveryMode, setDeliveryMode] = useState("standard");

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const [loginPhone, setLoginPhone] = useState("");
  const [loginName, setLoginName] = useState("");

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "tshirt",
    colors: "",
    unavailableColors: "",
    sizes: "",
    pickupLocation: "",
    sellerName: "Arishop",
    sellerLat: "",
    sellerLng: "",
  });

  const [newImages, setNewImages] = useState([]);
  const [newQR, setNewQR] = useState(null);

  const [sellerForm, setSellerForm] = useState({
    name: "",
    phone: "",
    storeName: "",
    address: "",
  });

  const [sellerApplication, setSellerApplication] = useState(null);

  const [supportMessage, setSupportMessage] = useState("");
  const [supportMessages, setSupportMessages] = useState([]);

  const [modal, setModal] = useState(null);

  const [orderPaymentMode, setOrderPaymentMode] = useState("COD");

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (!loading) saveJSON(STORAGE.products, products);
  }, [products, loading]);

  useEffect(() => {
    if (!loading) saveJSON(STORAGE.cart, cart);
  }, [cart, loading]);

  useEffect(() => {
    if (!loading) saveJSON(STORAGE.orders, orders);
  }, [orders, loading]);

  useEffect(() => {
    if (!loading) saveJSON(STORAGE.profile, profile);
  }, [profile, loading]);

  useEffect(() => {
    if (!loading) saveJSON(STORAGE.settings, settings);
  }, [settings, loading]);

  const initialize = async () => {
    const savedSession = await loadJSON(STORAGE.session, null);
    const savedProducts = await loadJSON(STORAGE.products, null);
    const savedCart = await loadJSON(STORAGE.cart, []);
    const savedOrders = await loadJSON(STORAGE.orders, []);
    const savedProfile = await loadJSON(STORAGE.profile, profile);
    const savedSettings = await loadJSON(STORAGE.settings, DEFAULT_SETTINGS);
    const savedSeller = await loadJSON(STORAGE.seller, null);

    setSession(savedSession);
    setProducts(savedProducts || SEED_PRODUCTS);
    setCart(savedCart || []);
    setOrders(savedOrders || []);
    setProfile(savedProfile || profile);
    setSettings({ ...DEFAULT_SETTINGS, ...(savedSettings || {}) });
    setSellerApplication(savedSeller);

    setTimeout(() => setLoading(false), 500);
  };

  const isAdmin = profile.role === "admin";
  const isSeller = profile.role === "seller" || profile.role === "admin";

  const completedSpend = useMemo(() => {
    return orders
      .filter(
        (order) =>
          order.userId === session?.id &&
          ["DELIVERED", "COMPLETED"].includes(order.status)
      )
      .reduce((sum, order) => sum + Number(order.total || 0), 0);
  }, [orders, session]);

  const premiumUnlocked =
    settings.premiumSystem && completedSpend >= 5000;

  const shoppingCredit =
    settings.coinsSystem && profile.coins >= 5000 ? 200 : 0;

  const cartItemsDetailed = useMemo(() => {
    return cart
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return null;
        return { ...item, product };
      })
      .filter(Boolean);
  }, [cart, products]);

  const cartTotal = useMemo(() => {
    return cartItemsDetailed.reduce(
      (sum, item) => sum + Number(item.product.price || 0) * item.qty,
      0
    );
  }, [cartItemsDetailed]);

  const cartCount = cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    return products.filter((product) => {
      if (!product.active) return false;

      if (
        category !== "all" &&
        product.category !== category
      ) {
        return false;
      }

      if (!q) return true;

      return (
        product.name.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q) ||
        getCategoryName(product.category).toLowerCase().includes(q)
      );
    });
  }, [products, search, category]);

  const login = async () => {
    if (!loginPhone.trim() || loginPhone.trim().length < 10) {
      Alert.alert("Phone Number", "10 digit mobile number डालें।");
      return;
    }

    if (!loginName.trim()) {
      Alert.alert("Name", "अपना नाम डालें।");
      return;
    }

    const user = {
      id: `user_${loginPhone.trim()}`,
      name: loginName.trim(),
      phone: loginPhone.trim(),
      role: "buyer",
    };

    const updatedProfile = {
      ...profile,
      name: loginName.trim(),
      phone: loginPhone.trim(),
    };

    setSession(user);
    setProfile(updatedProfile);

    await saveJSON(STORAGE.session, user);
    await saveJSON(STORAGE.profile, updatedProfile);

    setScreen("home");
  };

  const logout = async () => {
    await AsyncStorage.removeItem(STORAGE.session);
    setSession(null);
    setScreen("home");
  };

  const addToCart = () => {
    if (!selectedProduct) return;

    const hasColors = selectedProduct.colors?.length > 0;
    const hasSizes = selectedProduct.sizes?.length > 0;

    if (hasColors && !selectedColor) {
      Alert.alert("Color चुनें", "पहले available color चुनें।");
      return;
    }

    if (hasSizes && !selectedSize) {
      Alert.alert("Size चुनें", "पहले available size चुनें।");
      return;
    }

    const existingIndex = cart.findIndex(
      (x) =>
        x.productId === selectedProduct.id &&
        x.color === selectedColor &&
        x.size === selectedSize
    );

    let updated = [...cart];

    if (existingIndex >= 0) {
      updated[existingIndex] = {
        ...updated[existingIndex],
        qty: updated[existingIndex].qty + 1,
      };
    } else {
      updated.push({
        id: generateId("cart"),
        productId: selectedProduct.id,
        color: selectedColor,
        size: selectedSize,
        qty: 1,
      });
    }

    setCart(updated);
    Alert.alert("Cart में जोड़ दिया", "Product cart में add हो गया।");
  };

  const changeQty = (itemId, amount) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === itemId
            ? { ...item, qty: item.qty + amount }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const openProduct = (product) => {
    setSelectedProduct(product);
    setSelectedColor(
      product.colors?.find((x) => x.available)?.name || ""
    );
    setSelectedSize(
      product.sizes?.find((x) => x.available)?.name || ""
    );
    setDeliveryMode("standard");
    setScreen("product");
  };

  const pickGalleryImages = async () => {
    if (newImages.length >= 10) {
      Alert.alert("Maximum 10 Photos", "एक product के लिए maximum 10 photos रख सकते हैं।");
      return;
    }

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission चाहिए",
        "Gallery से photo चुनने के लिए permission allow करें।"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 10 - newImages.length,
      quality: 0.85,
    });

    if (!result.canceled) {
      const selected = result.assets.map((asset) => asset.uri);
      setNewImages((current) => [...current, ...selected].slice(0, 10));
    }
  };

  const takeProductPhoto = async () => {
    if (newImages.length >= 10) {
      Alert.alert("Maximum 10 Photos", "एक product के लिए maximum 10 photos रख सकते हैं।");
      return;
    }

    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Camera Permission",
        "Photo लेने के लिए camera permission allow करें।"
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setNewImages((current) =>
        [...current, result.assets[0].uri].slice(0, 10)
      );
    }
  };

  const pickQR = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission चाहिए", "QR image चुनने के लिए gallery permission allow करें।");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setNewQR(result.assets[0].uri);
    }
  };

  const removeNewImage = (index) => {
    setNewImages((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  const addProduct = () => {
    if (!isAdmin && !isSeller) {
      Alert.alert(
        "Admin/Seller Approval Required",
        "Product add करने के लिए approved seller या admin account चाहिए।"
      );
      return;
    }

    if (!newProduct.name.trim()) {
      Alert.alert("Product Name", "Product का नाम डालें।");
      return;
    }

    if (!newProduct.price || Number(newProduct.price) <= 0) {
      Alert.alert("Price", "Valid product price डालें।");
      return;
    }

    const colors = newProduct.colors
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    const unavailableColors = newProduct.unavailableColors
      .split(",")
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean);

    const sizes = newProduct.sizes
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    const product = {
      id: generateId("product"),
      name: newProduct.name.trim(),
      description:
        newProduct.description.trim() ||
        "Product description उपलब्ध नहीं है।",
      price: Number(newProduct.price),
      category: newProduct.category,
      images: newImages,
      colors: colors.map((name) => ({
        name,
        available: !unavailableColors.includes(name.toLowerCase()),
      })),
      sizes: sizes.map((name) => ({
        name,
        available: true,
      })),
      pickupLocation: newProduct.pickupLocation.trim(),
      sellerName: newProduct.sellerName.trim() || "Arishop",
      sellerId: profile.phone || "admin",
      sellerLat: newProduct.sellerLat
        ? Number(newProduct.sellerLat)
        : null,
      sellerLng: newProduct.sellerLng
        ? Number(newProduct.sellerLng)
        : null,
      qrImage: newQR,
      active: true,
    };

    setProducts((current) => [product, ...current]);

    setNewProduct({
      name: "",
      description: "",
      price: "",
      category: "tshirt",
      colors: "",
      unavailableColors: "",
      sizes: "",
      pickupLocation: "",
      sellerName: "Arishop",
      sellerLat: "",
      sellerLng: "",
    });

    setNewImages([]);
    setNewQR(null);

    Alert.alert(
      "Product Added",
      "Product local catalog में add हो गया। Production में इसे Firebase/backend में save करना होगा।"
    );
  };

  const deleteProduct = (id) => {
    if (!isAdmin) {
      Alert.alert("Admin Only", "Product delete करने के लिए admin permission चाहिए।");
      return;
    }

    Alert.alert(
      "Delete Product?",
      "क्या आप यह product हटाना चाहते हैं?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            setProducts((current) =>
              current.filter((product) => product.id !== id)
            ),
        },
      ]
    );
  };

  const toggleProduct = (id) => {
    if (!isAdmin) return;

    setProducts((current) =>
      current.map((product) =>
        product.id === id
          ? { ...product, active: !product.active }
          : product
      )
    );
  };

  const placeOrder = () => {
    if (!session) {
      Alert.alert("Login Required", "Order करने से पहले login करें।");
      setScreen("profile");
      return;
    }

    if (!address.name || !address.phone || !address.address || !address.pincode) {
      Alert.alert(
        "Address Required",
        "नाम, phone, address और pincode पूरा भरें।"
      );
      return;
    }

    if (!cartItemsDetailed.length) {
      Alert.alert("Cart Empty", "Cart में कोई product नहीं है।");
      return;
    }

    const fastFee =
      deliveryMode === "fast" && settings.fastDelivery ? 40 : 0;

    const finalTotal = cartTotal + fastFee - shoppingCredit;

    if (orderPaymentMode === "UPI") {
      const order = {
        id: generateId("order"),
        userId: session.id,
        items: cartItemsDetailed,
        subtotal: cartTotal,
        deliveryFee: fastFee,
        shoppingCredit,
        total: Math.max(0, finalTotal),
        address,
        deliveryMode,
        paymentMode: "UPI",
        paymentStatus: "PENDING_VERIFICATION",
        status: "PAYMENT_PENDING",
        createdAt: new Date().toISOString(),
        refundStatus: null,
      };

      setOrders((current) => [order, ...current]);
      setCart([]);

      Alert.alert(
        "Payment Verification Pending",
        "UPI payment को अभी successful नहीं माना गया है। Real backend/payment verification के बाद ही order confirm होगा।"
      );

      setScreen("orders");
      return;
    }

    const order = {
      id: generateId("order"),
      userId: session.id,
      items: cartItemsDetailed,
      subtotal: cartTotal,
      deliveryFee: fastFee,
      shoppingCredit,
      total: Math.max(0, finalTotal),
      address,
      deliveryMode,
      paymentMode: "COD",
      paymentStatus: "COD",
      status: "PLACED",
      createdAt: new Date().toISOString(),
      refundStatus: null,
    };

    setOrders((current) => [order, ...current]);
    setCart([]);

    Alert.alert(
      "Order Placed",
      "COD order local preview में place हो गया। Production में secure backend order creation जरूरी होगा।"
    );

    setScreen("orders");
  };

  const requestRefund = (orderId) => {
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? {
              ...order,
              refundStatus: "REQUESTED",
              refundRequestedAt: new Date().toISOString(),
            }
          : order
      )
    );

    Alert.alert(
      "Refund Request Submitted",
      "Refund request submit हुई है। Target processing time 24–48 घंटे है। Bank/payment provider के कारण actual time अधिक हो सकता है।"
    );
  };

  const submitSellerApplication = async () => {
    if (!settings.sellerSystem) {
      Alert.alert("Seller System Off", "Seller applications अभी बंद हैं।");
      return;
    }

    if (
      !sellerForm.name ||
      !sellerForm.phone ||
      !sellerForm.storeName ||
      !sellerForm.address
    ) {
      Alert.alert("Complete Details", "सभी seller details भरें।");
      return;
    }

    const application = {
      id: generateId("seller"),
      ...sellerForm,
      status: "PENDING",
      submittedAt: new Date().toISOString(),
    };

    setSellerApplication(application);
    await saveJSON(STORAGE.seller, application);

    Alert.alert(
      "Application Submitted",
      "Seller application admin approval के लिए भेज दी गई है।"
    );
  };

  const grantPreviewCoins = () => {
    if (!__DEV__) {
      Alert.alert(
        "Production Security",
        "Coins production में server-side reward system से मिलेंगे।"
      );
      return;
    }

    const reward = Math.floor(Math.random() * 15) + 1;

    setProfile((current) => ({
      ...current,
      coins: current.coins + reward,
    }));

    Alert.alert(
      "Preview Reward",
      `${reward} coins मिले। Production में reward server-side तय होगा।`
    );
  };

  const redeemCoins = () => {
    if (profile.coins < 5000) {
      Alert.alert(
        "Coins कम हैं",
        "5000 coins पूरे होने पर ₹200 shopping credit मिलेगा।"
      );
      return;
    }

    setProfile((current) => ({
      ...current,
      coins: current.coins - 5000,
    }));

    Alert.alert(
      "₹200 Shopping Credit",
      "₹200 cash नहीं है। यह केवल eligible shopping credit के रूप में इस्तेमाल होगा।"
    );
  };

  const pickInstagramPhoto = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Required", "Photo select करने के लिए permission allow करें।");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setProfile((current) => ({
        ...current,
        instagramPhoto: result.assets[0].uri,
      }));
    }
  };

  const sendSupportMessage = () => {
    if (!supportMessage.trim()) return;

    const userText = supportMessage.trim();

    const lower = userText.toLowerCase();

    let reply =
      "मैं आपकी मदद करने की कोशिश कर सकता हूँ। Order ID, product name या problem लिखें।";

    if (lower.includes("refund")) {
      reply =
        "Refund request के लिए Orders section में जाकर Refund Request दबाएँ। Target processing time 24–48 घंटे है।";
    } else if (lower.includes("delivery")) {
      reply =
        "Standard delivery 1–7 days है। Fast delivery केवल eligible location पर 1–3 days और ₹40 extra होगी।";
    } else if (lower.includes("coin")) {
      reply =
        "5000 coins = ₹200 shopping credit. Coins cash में withdraw नहीं किए जा सकते।";
    } else if (lower.includes("seller")) {
      reply =
        "Seller बनने के लिए Seller Application submit करें। Admin approval के बाद seller account active होगा।";
    } else if (lower.includes("payment")) {
      reply =
        "Online payment production में server-side verification के बाद ही successful माना जाएगा।";
    }

    setSupportMessages((current) => [
      ...current,
      { from: "user", text: userText },
      { from: "ai", text: reply },
    ]);

    setSupportMessage("");
  };

  const callHumanSupport = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE}`).catch(() => {
      Alert.alert("Support", `Support: ${SUPPORT_PHONE}`);
    });
  };

  const setAdminSetting = (key, value) => {
    if (!isAdmin) {
      Alert.alert("Admin Only", "Master controls केवल admin के लिए हैं।");
      return;
    }

    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const makeWeeklyConsent = () => {
    setProfile((current) => ({
      ...current,
      weeklyConsent: !current.weeklyConsent,
    }));
  };

  const adminMarkDelivered = (orderId) => {
    if (!isAdmin) return;

    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? { ...order, status: "DELIVERED" }
          : order
      )
    );
  };

  const approveSeller = async () => {
    if (!isAdmin || !sellerApplication) return;

    const approved = {
      ...sellerApplication,
      status: "APPROVED",
      approvedAt: new Date().toISOString(),
    };

    setSellerApplication(approved);
    await saveJSON(STORAGE.seller, approved);

    Alert.alert(
      "Seller Approved",
      "Local preview में seller approved है। Production में यह Firebase/backend permission से होगा।"
    );
  };

  const rejectSeller = async () => {
    if (!isAdmin || !sellerApplication) return;

    const rejected = {
      ...sellerApplication,
      status: "REJECTED",
      rejectedAt: new Date().toISOString(),
    };

    setSellerApplication(rejected);
    await saveJSON(STORAGE.seller, rejected);
  };

  const loginAsPreviewAdmin = () => {
    if (!__DEV__) {
      Alert.alert(
        "Production",
        "Production app में admin role backend से मिलेगा।"
      );
      return;
    }

    const admin = {
      id: "preview_admin",
      name: "Arishop Admin",
      phone: "0000000000",
      role: "admin",
    };

    setSession(admin);
    setProfile((current) => ({
      ...current,
      name: "Arishop Admin",
      phone: "0000000000",
      role: "admin",
    }));

    saveJSON(STORAGE.session, admin);

    Alert.alert(
      "Preview Admin",
      "यह केवल development preview है। Production में admin Firebase/backend से secure होगा।"
    );

    setScreen("admin");
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => setScreen("home")}>
        <Image source={LOGO} style={styles.headerLogo} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.headerCart}
        onPress={() => setScreen("cart")}
      >
        <Text style={styles.cartIcon}>🛒</Text>
        {cartCount > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderBottomNav = () => (
    <View style={styles.bottomNav}>
      <NavButton
        icon="🏠"
        label="Home"
        active={screen === "home"}
        onPress={() => setScreen("home")}
      />

      <NavButton
        icon="📦"
        label="Orders"
        active={screen === "orders"}
        onPress={() => setScreen("orders")}
      />

      <NavButton
        icon="🛒"
        label="Cart"
        active={screen === "cart"}
        onPress={() => setScreen("cart")}
      />

      <NavButton
        icon="👤"
        label="Profile"
        active={screen === "profile"}
        onPress={() => setScreen("profile")}
      />
    </View>
  );

  const renderLogin = () => (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.loginContainer}>
        <Image source={LOGO} style={styles.loginLogo} />

        <Text style={styles.appTitle}>{APP_NAME}</Text>
        <Text style={styles.subtitle}>
          Shopping • Sellers • Fast Delivery
        </Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Login / Signup</Text>

          <TextInput
            style={styles.input}
            placeholder="आपका नाम"
            value={loginName}
            onChangeText={setLoginName}
          />

          <TextInput
            style={styles.input}
            placeholder="10 digit mobile number"
            keyboardType="phone-pad"
            maxLength={10}
            value={loginPhone}
            onChangeText={setLoginPhone}
          />

          <PrimaryButton title="Continue" onPress={login} />

          {__DEV__ && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={loginAsPreviewAdmin}
            >
              <Text style={styles.secondaryButtonText}>
                Development Admin Preview
              </Text>
            </TouchableOpacity>
          )}

          <Text style={styles.smallNote}>
            Production version में real OTP/Auth backend लगाया जाएगा।
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  const renderHome = () => (
    <SafeAreaView style={styles.safe}>
      {renderHeader()}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Image source={WELCOME_IMAGE} style={styles.welcomeImage} />

        <Text style={styles.heroTitle}>
          Arishop पर आपका स्वागत है
        </Text>

        <Text style={styles.heroText}>
          Fashion, Anime, Accessories और बहुत कुछ।
        </Text>

        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Product search करें..."
          value={search}
          onChangeText={setSearch}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          <CategoryButton
            name="All"
            icon="✨"
            active={category === "all"}
            onPress={() => setCategory("all")}
          />

          {CATEGORIES.map((item) => (
            <CategoryButton
              key={item.id}
              name={item.name}
              icon={item.icon}
              active={category === item.id}
              onPress={() => setCategory(item.id)}
            />
          ))}
        </ScrollView>

        <View style={styles.infoRow}>
          <InfoBox icon="🚚" title="Standard" text="1–7 Days" />
          <InfoBox icon="⚡" title="Fast" text="1–3 Days*" />
          <InfoBox icon="🪙" title="Coins" text="Rewards" />
        </View>

        <Text style={styles.sectionTitle}>Products</Text>

        {filteredProducts.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>कोई product नहीं मिला।</Text>
          </View>
        ) : (
          <View style={styles.productGrid}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={() => openProduct(product)}
              />
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.supportCard}
          onPress={() => setScreen("support")}
        >
          <Text style={styles.supportIcon}>🤖</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.supportTitle}>
              AI Shopping Support
            </Text>
            <Text style={styles.supportText}>
              Product, delivery, refund और coins के बारे में पूछें।
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </ScrollView>

      {renderBottomNav()}
    </SafeAreaView>
  );

  const renderProduct = () => {
    if (!selectedProduct) {
      setScreen("home");
      return null;
    }

    const fastAvailable =
      settings.fastDelivery &&
      selectedProduct.sellerLat !== null &&
      selectedProduct.sellerLng !== null;

    return (
      <SafeAreaView style={styles.safe}>
        {renderHeader()}

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity onPress={() => setScreen("home")}>
            <Text style={styles.backButton}>‹ Back</Text>
          </TouchableOpacity>

          <View style={styles.productImageLarge}>
            {selectedProduct.images?.[0] ? (
              <Image
                source={{ uri: selectedProduct.images[0] }}
                style={styles.largeImage}
              />
            ) : (
              <View style={styles.noImage}>
                <Text style={styles.noImageText}>📦</Text>
              </View>
            )}
          </View>

          {selectedProduct.images?.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnailScroll}
            >
              {selectedProduct.images.map((uri, index) => (
                <Image
                  key={`${uri}_${index}`}
                  source={{ uri }}
                  style={styles.thumbnail}
                />
              ))}
            </ScrollView>
          )}

          <Text style={styles.productTitle}>
            {selectedProduct.name}
          </Text>

          <Text style={styles.productPrice}>
            {money(selectedProduct.price)}
          </Text>

          <Text style={styles.productDescription}>
            {selectedProduct.description}
          </Text>

          <Text style={styles.sellerText}>
            Seller: {selectedProduct.sellerName || "Arishop"}
          </Text>

          {selectedProduct.colors?.length > 0 && (
            <>
              <Text style={styles.optionTitle}>Color</Text>
              <View style={styles.optionWrap}>
                {selectedProduct.colors.map((color) => (
                  <TouchableOpacity
                    key={color.name}
                    disabled={!color.available}
                    style={[
                      styles.optionChip,
                      selectedColor === color.name &&
                        styles.optionChipSelected,
                      !color.available && styles.optionChipDisabled,
                    ]}
                    onPress={() => setSelectedColor(color.name)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        !color.available && styles.disabledText,
                      ]}
                    >
                      {color.name}
                      {!color.available ? " • Unavailable" : ""}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {selectedProduct.sizes?.length > 0 && (
            <>
              <Text style={styles.optionTitle}>Size</Text>
              <View style={styles.optionWrap}>
                {selectedProduct.sizes.map((size) => (
                  <TouchableOpacity
                    key={size.name}
                    disabled={!size.available}
                    style={[
                      styles.optionChip,
                      selectedSize === size.name &&
                        styles.optionChipSelected,
                      !size.available && styles.optionChipDisabled,
                    ]}
                    onPress={() => setSelectedSize(size.name)}
                  >
                    <Text style={styles.optionText}>
                      {size.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <Text style={styles.optionTitle}>Delivery</Text>

          <TouchableOpacity
            style={[
              styles.deliveryCard,
              deliveryMode === "standard" &&
                styles.deliveryCardSelected,
            ]}
            onPress={() => setDeliveryMode("standard")}
          >
            <Text style={styles.deliveryTitle}>
              🚚 Standard Delivery
            </Text>
            <Text style={styles.deliveryText}>
              1–7 days • No extra fast fee
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={!fastAvailable}
            style={[
              styles.deliveryCard,
              deliveryMode === "fast" &&
                styles.deliveryCardSelected,
              !fastAvailable && styles.deliveryDisabled,
            ]}
            onPress={() => setDeliveryMode("fast")}
          >
            <Text style={styles.deliveryTitle}>
              ⚡ Fast Delivery
            </Text>
            <Text style={styles.deliveryText}>
              {fastAvailable
                ? "1–3 days • ₹40 extra • Server distance verification required"
                : "5 km seller-radius verification pending"}
            </Text>
          </TouchableOpacity>

          <View style={styles.securityNote}>
            <Text style={styles.securityTitle}>
              🔐 Production Security
            </Text>
            <Text style={styles.securityText}>
              Fast delivery eligibility production में customer और seller
              location को server पर verify करके तय होगी।
            </Text>
          </View>

          <PrimaryButton
            title={`Add to Cart • ${money(selectedProduct.price)}`}
            onPress={addToCart}
          />
        </ScrollView>
      </SafeAreaView>
    );
  };

  const renderCart = () => (
    <SafeAreaView style={styles.safe}>
      {renderHeader()}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>My Cart</Text>

        {cartItemsDetailed.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyText}>
              आपका cart अभी empty है।
            </Text>

            <PrimaryButton
              title="Shopping शुरू करें"
              onPress={() => setScreen("home")}
            />
          </View>
        ) : (
          <>
            {cartItemsDetailed.map((item) => (
              <View style={styles.cartItem} key={item.id}>
                <View style={styles.cartImage}>
                  {item.product.images?.[0] ? (
                    <Image
                      source={{ uri: item.product.images[0] }}
                      style={styles.cartImageReal}
                    />
                  ) : (
                    <Text style={styles.cartImageEmoji}>📦</Text>
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.cartProductName}>
                    {item.product.name}
                  </Text>

                  <Text style={styles.cartVariant}>
                    {item.color ? `Color: ${item.color}` : ""}
                    {item.size ? ` • Size: ${item.size}` : ""}
                  </Text>

                  <Text style={styles.cartPrice}>
                    {money(item.product.price)}
                  </Text>

                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() => changeQty(item.id, -1)}
                    >
                      <Text>−</Text>
                    </TouchableOpacity>

                    <Text style={styles.qtyText}>{item.qty}</Text>

                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() => changeQty(item.id, 1)}
                    >
                      <Text>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            <View style={styles.totalCard}>
              <Row label="Subtotal" value={money(cartTotal)} />
              <Row label="Standard Delivery" value="₹0" />

              {shoppingCredit > 0 && (
                <Row
                  label="Coin Shopping Credit"
                  value={`-${money(shoppingCredit)}`}
                />
              )}

              <View style={styles.divider} />

              <Row
                label="Total"
                value={money(Math.max(0, cartTotal - shoppingCredit))}
                bold
              />
            </View>

            <PrimaryButton
              title="Checkout"
              onPress={() => setScreen("checkout")}
            />
          </>
        )}
      </ScrollView>

      {renderBottomNav()}
    </SafeAreaView>
  );

  const renderCheckout = () => {
    const fastFee =
      deliveryMode === "fast" && settings.fastDelivery ? 40 : 0;

    const total = Math.max(
      0,
      cartTotal + fastFee - shoppingCredit
    );

    return (
      <SafeAreaView style={styles.safe}>
        {renderHeader()}

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.pageTitle}>Checkout</Text>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>

            <TextInput
              style={styles.input}
              placeholder="Name"
              value={address.name}
              onChangeText={(v) =>
                setAddress({ ...address, name: v })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Phone"
              keyboardType="phone-pad"
              value={address.phone}
              onChangeText={(v) =>
                setAddress({ ...address, phone: v })
              }
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Full Address"
              multiline
              value={address.address}
              onChangeText={(v) =>
                setAddress({ ...address, address: v })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="City"
              value={address.city}
              onChangeText={(v) =>
                setAddress({ ...address, city: v })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Pincode"
              keyboardType="number-pad"
              maxLength={6}
              value={address.pincode}
              onChangeText={(v) =>
                setAddress({ ...address, pincode: v })
              }
            />
          </View>

          <Text style={styles.sectionTitle}>Delivery</Text>

          <TouchableOpacity
            style={[
              styles.deliveryCard,
              deliveryMode === "standard" &&
                styles.deliveryCardSelected,
            ]}
            onPress={() => setDeliveryMode("standard")}
          >
            <Text style={styles.deliveryTitle}>
              🚚 Standard • 1–7 Days
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.deliveryCard,
              deliveryMode === "fast" &&
                styles.deliveryCardSelected,
            ]}
            onPress={() => {
              Alert.alert(
                "Fast Delivery",
                "Fast Delivery production में तभी available होगी जब server customer और seller की दूरी 5 km या कम verify करे।"
              );
            }}
          >
            <Text style={styles.deliveryTitle}>
              ⚡ Fast • 1–3 Days • ₹40
            </Text>
            <Text style={styles.deliveryText}>
              5 km seller-radius verification required
            </Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Payment</Text>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              orderPaymentMode === "COD" &&
                styles.paymentSelected,
            ]}
            onPress={() => setOrderPaymentMode("COD")}
          >
            <Text style={styles.paymentTitle}>
              💵 Cash on Delivery
            </Text>
            <Text style={styles.paymentText}>
              COD available
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              orderPaymentMode === "UPI" &&
                styles.paymentSelected,
            ]}
            onPress={() => setOrderPaymentMode("UPI")}
          >
            <Text style={styles.paymentTitle}>
              📲 UPI / QR
            </Text>
            <Text style={styles.paymentText}>
              Payment verification required
            </Text>
          </TouchableOpacity>

          {orderPaymentMode === "UPI" && (
            <View style={styles.securityNote}>
              <Text style={styles.securityTitle}>
                UPI Payment
              </Text>
              <Text style={styles.securityText}>
                Product/seller का QR production में backend से आएगा।
                App payment को खुद से successful नहीं मानेगा।
              </Text>
            </View>
          )}

          <View style={styles.totalCard}>
            <Row label="Subtotal" value={money(cartTotal)} />

            {fastFee > 0 && (
              <Row label="Fast Delivery" value={money(fastFee)} />
            )}

            {shoppingCredit > 0 && (
              <Row
                label="Shopping Credit"
                value={`-${money(shoppingCredit)}`}
              />
            )}

            <View style={styles.divider} />

            <Row label="Payable" value={money(total)} bold />
          </View>

          <PrimaryButton
            title={
              orderPaymentMode === "COD"
                ? "Place COD Order"
                : "Continue to Payment Verification"
            }
            onPress={placeOrder}
          />
        </ScrollView>
      </SafeAreaView>
    );
  };

  const renderOrders = () => {
    const myOrders = orders.filter(
      (order) => !session || order.userId === session.id
    );

    return (
      <SafeAreaView style={styles.safe}>
        {renderHeader()}

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.pageTitle}>My Orders</Text>

          {myOrders.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>
                अभी कोई order नहीं है।
              </Text>
            </View>
          ) : (
            myOrders.map((order) => (
              <View style={styles.orderCard} key={order.id}>
                <View style={styles.orderTop}>
                  <Text style={styles.orderId}>
                    Order #{order.id.slice(-8)}
                  </Text>

                  <Text style={styles.orderStatus}>
                    {order.status}
                  </Text>
                </View>

                <Text style={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleString()}
                </Text>

                {order.items?.map((item) => (
                  <Text
                    key={item.id}
                    style={styles.orderItem}
                  >
                    • {item.product?.name || "Product"} × {item.qty}
                  </Text>
                ))}

                <Text style={styles.orderTotal}>
                  Total: {money(order.total)}
                </Text>

                <Text style={styles.orderPayment}>
                  Payment: {order.paymentMode}
                </Text>

                {order.refundStatus && (
                  <Text style={styles.refundStatus}>
                    Refund: {order.refundStatus}
                  </Text>
                )}

                {["DELIVERED", "COMPLETED"].includes(order.status) &&
                  !order.refundStatus &&
                  settings.refunds && (
                    <TouchableOpacity
                      style={styles.outlineButton}
                      onPress={() => requestRefund(order.id)}
                    >
                      <Text style={styles.outlineButtonText}>
                        Request Refund
                      </Text>
                    </TouchableOpacity>
                  )}
              </View>
            ))
          )}
        </ScrollView>

        {renderBottomNav()}
      </SafeAreaView>
    );
  };

  const renderProfile = () => (
    <SafeAreaView style={styles.safe}>
      {renderHeader()}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>My Profile</Text>

        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {(profile.name || "A").charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text style={styles.profileName}>
            {profile.name || "Guest"}
          </Text>

          <Text style={styles.profilePhone}>
            {profile.phone || "Login required"}
          </Text>
        </View>

        <View style={styles.walletCard}>
          <Text style={styles.walletTitle}>🪙 Arishop Coins</Text>
          <Text style={styles.coinNumber}>
            {profile.coins}
          </Text>

          <Text style={styles.walletText}>
            5000 coins = ₹200 shopping credit
          </Text>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progress,
                {
                  width: `${Math.min(
                    100,
                    (profile.coins / 5000) * 100
                  )}%`,
                },
              ]}
            />
          </View>

          <Text style={styles.walletText}>
            {Math.max(0, 5000 - profile.coins)} coins बाकी
          </Text>

          {profile.coins >= 5000 && (
            <PrimaryButton
              title="Redeem ₹200 Shopping Credit"
              onPress={redeemCoins}
            />
          )}

          {__DEV__ && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={grantPreviewCoins}
            >
              <Text style={styles.secondaryButtonText}>
                Preview Reward Event
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Premium / Luxury
          </Text>

          <Text style={styles.bigStatus}>
            {premiumUnlocked ? "🔓 UNLOCKED" : "🔒 LOCKED"}
          </Text>

          <Text style={styles.smallNote}>
            ₹5,000 eligible completed shopping के बाद Premium/Luxury
            benefits unlock होंगे।
          </Text>

          <Text style={styles.smallNote}>
            Current eligible spend: {money(completedSpend)}
          </Text>
        </View>

        {settings.weeklyCustomer && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              🏆 Weekly Top Customer
            </Text>

            <Text style={styles.smallNote}>
              ₹2,500+ eligible completed spend पर weekly customer
              eligibility बन सकती है।
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Instagram ID"
              value={profile.instagramId}
              onChangeText={(v) =>
                setProfile((current) => ({
                  ...current,
                  instagramId: v,
                }))
              }
            />

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={pickInstagramPhoto}
            >
              <Text style={styles.secondaryButtonText}>
                Instagram/Profile Photo चुनें
              </Text>
            </TouchableOpacity>

            {profile.instagramPhoto && (
              <Image
                source={{ uri: profile.instagramPhoto }}
                style={styles.profilePhoto}
              />
            )}

            <TouchableOpacity
              style={[
                styles.consentBox,
                profile.weeklyConsent &&
                  styles.consentBoxActive,
              ]}
              onPress={makeWeeklyConsent}
            >
              <Text style={styles.consentText}>
                {profile.weeklyConsent ? "☑" : "☐"} मैं consent देता/देती हूँ कि
                eligible होने पर मेरा Instagram ID/photo weekly customer
                profile में दिखाया जा सकता है।
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {settings.sellerSystem && (
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => setScreen("seller")}
          >
            <Text style={styles.menuIcon}>🏪</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>
                Become a Seller
              </Text>
              <Text style={styles.menuText}>
                Seller application submit करें
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => setScreen("support")}
        >
          <Text style={styles.menuIcon}>🤖</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>
              AI + Human Support
            </Text>
            <Text style={styles.menuText}>
              Help और support
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity
            style={styles.adminMenuCard}
            onPress={() => setScreen("admin")}
          >
            <Text style={styles.menuIcon}>⚙️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>
                Master Admin Panel
              </Text>
              <Text style={styles.menuText}>
                Products, sellers, categories और controls
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        )}

        {session && (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={logout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}

        {!session && (
          <PrimaryButton
            title="Login / Signup"
            onPress={() => setScreen("login")}
          />
        )}
      </ScrollView>

      {renderBottomNav()}
    </SafeAreaView>
  );

  const renderSeller = () => (
    <SafeAreaView style={styles.safe}>
      {renderHeader()}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => setScreen("profile")}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>
          Become a Seller
        </Text>

        {sellerApplication && (
          <View style={styles.statusCard}>
            <Text style={styles.sectionTitle}>
              Application Status
            </Text>

            <Text style={styles.bigStatus}>
              {sellerApplication.status}
            </Text>

            <Text style={styles.smallNote}>
              Store: {sellerApplication.storeName}
            </Text>

            {sellerApplication.status === "PENDING" && (
              <Text style={styles.smallNote}>
                Admin approval का इंतजार है।
              </Text>
            )}
          </View>
        )}

        {!sellerApplication ||
        sellerApplication.status === "REJECTED" ? (
          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={sellerForm.name}
              onChangeText={(v) =>
                setSellerForm({ ...sellerForm, name: v })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Phone"
              keyboardType="phone-pad"
              value={sellerForm.phone}
              onChangeText={(v) =>
                setSellerForm({ ...sellerForm, phone: v })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Store Name"
              value={sellerForm.storeName}
              onChangeText={(v) =>
                setSellerForm({
                  ...sellerForm,
                  storeName: v,
                })
              }
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Pickup Address"
              multiline
              value={sellerForm.address}
              onChangeText={(v) =>
                setSellerForm({
                  ...sellerForm,
                  address: v,
                })
              }
            />

            <PrimaryButton
              title="Submit Seller Application"
              onPress={submitSellerApplication}
            />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );

  const renderSupport = () => (
    <SafeAreaView style={styles.safe}>
      {renderHeader()}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>
          AI + Human Support
        </Text>

        <View style={styles.aiHeader}>
          <Text style={styles.aiIcon}>🤖</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.aiTitle}>
              Arishop Assistant
            </Text>
            <Text style={styles.aiSub}>
              Basic AI support preview
            </Text>
          </View>
        </View>

        <View style={styles.chatBox}>
          {supportMessages.length === 0 && (
            <Text style={styles.chatEmpty}>
              आप refund, delivery, coins, seller या payment के बारे में पूछ सकते हैं।
            </Text>
          )}

          {supportMessages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageBubble,
                message.from === "user"
                  ? styles.userMessage
                  : styles.aiMessage,
              ]}
            >
              <Text>{message.text}</Text>
            </View>
          ))}
        </View>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="अपना सवाल लिखें..."
          multiline
          value={supportMessage}
          onChangeText={setSupportMessage}
        />

        <PrimaryButton
          title="Send"
          onPress={sendSupportMessage}
        />

        {settings.humanSupport && (
          <TouchableOpacity
            style={styles.humanSupport}
            onPress={callHumanSupport}
          >
            <Text style={styles.humanTitle}>
              👨‍💼 Human Support
            </Text>
            <Text style={styles.humanText}>
              जरूरत पड़ने पर support team से संपर्क करें।
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.securityNote}>
          <Text style={styles.securityTitle}>
            Production AI
          </Text>
          <Text style={styles.securityText}>
            Real AI API key app के अंदर नहीं रखी जाएगी। Production में
            AI request secure backend के जरिए जाएगी।
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  const renderAdmin = () => (
    <SafeAreaView style={styles.safe}>
      {renderHeader()}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>
          Master Admin Panel
        </Text>

        <View style={styles.adminWarning}>
          <Text style={styles.adminWarningTitle}>
            🔐 Secure Admin Area
          </Text>
          <Text style={styles.adminWarningText}>
            Production में admin role Firebase/backend से verify होगा।
            Local app role को production security नहीं माना जाएगा।
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          Master Controls
        </Text>

        <AdminToggle
          title="AI Support"
          value={settings.aiSupport}
          onChange={(v) => setAdminSetting("aiSupport", v)}
        />

        <AdminToggle
          title="Human Support"
          value={settings.humanSupport}
          onChange={(v) => setAdminSetting("humanSupport", v)}
        />

        <AdminToggle
          title="Seller System"
          value={settings.sellerSystem}
          onChange={(v) => setAdminSetting("sellerSystem", v)}
        />

        <AdminToggle
          title="Coins System"
          value={settings.coinsSystem}
          onChange={(v) => setAdminSetting("coinsSystem", v)}
        />

        <AdminToggle
          title="Premium/Luxury"
          value={settings.premiumSystem}
          onChange={(v) => setAdminSetting("premiumSystem", v)}
        />

        <AdminToggle
          title="Weekly Customer"
          value={settings.weeklyCustomer}
          onChange={(v) => setAdminSetting("weeklyCustomer", v)}
        />

        <AdminToggle
          title="Fast Delivery"
          value={settings.fastDelivery}
          onChange={(v) => setAdminSetting("fastDelivery", v)}
        />

        <AdminToggle
          title="Refund System"
          value={settings.refunds}
          onChange={(v) => setAdminSetting("refunds", v)}
        />

        <AdminToggle
          title="COD"
          value={settings.cod}
          onChange={(v) => setAdminSetting("cod", v)}
        />

        <Text style={styles.sectionTitle}>
          Categories
        </Text>

        {CATEGORIES.map((item) => (
          <View style={styles.categoryAdminRow} key={item.id}>
            <Text style={styles.categoryAdminText}>
              {item.icon} {item.name}
            </Text>

            <Text style={styles.categoryAdminStatus}>
              ON
            </Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>
          Add Product
        </Text>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Product Name"
            value={newProduct.name}
            onChangeText={(v) =>
              setNewProduct({
                ...newProduct,
                name: v,
              })
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Price ₹"
            keyboardType="decimal-pad"
            value={newProduct.price}
            onChangeText={(v) =>
              setNewProduct({
                ...newProduct,
                price: v,
              })
            }
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            multiline
            value={newProduct.description}
            onChangeText={(v) =>
              setNewProduct({
                ...newProduct,
                description: v,
              })
            }
          />

          <Text style={styles.fieldLabel}>
            Category
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {CATEGORIES.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.optionChip,
                  newProduct.category === item.id &&
                    styles.optionChipSelected,
                ]}
                onPress={() =>
                  setNewProduct({
                    ...newProduct,
                    category: item.id,
                  })
                }
              >
                <Text>
                  {item.icon} {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TextInput
            style={styles.input}
            placeholder="Colors: Black, White, Red"
            value={newProduct.colors}
            onChangeText={(v) =>
              setNewProduct({
                ...newProduct,
                colors: v,
              })
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Unavailable Colors: Red, Blue"
            value={newProduct.unavailableColors}
            onChangeText={(v) =>
              setNewProduct({
                ...newProduct,
                unavailableColors: v,
              })
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Sizes: S, M, L, XL"
            value={newProduct.sizes}
            onChangeText={(v) =>
              setNewProduct({
                ...newProduct,
                sizes: v,
              })
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Pickup Location"
            value={newProduct.pickupLocation}
            onChangeText={(v) =>
              setNewProduct({
                ...newProduct,
                pickupLocation: v,
              })
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Seller Name"
            value={newProduct.sellerName}
            onChangeText={(v) =>
              setNewProduct({
                ...newProduct,
                sellerName: v,
              })
            }
          />

          <Text style={styles.fieldLabel}>
            Seller Location (production GPS/backend में आएगा)
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Seller Latitude"
            keyboardType="decimal-pad"
            value={newProduct.sellerLat}
            onChangeText={(v) =>
              setNewProduct({
                ...newProduct,
                sellerLat: v,
              })
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Seller Longitude"
            keyboardType="decimal-pad"
            value={newProduct.sellerLng}
            onChangeText={(v) =>
              setNewProduct({
                ...newProduct,
                sellerLng: v,
              })
            }
          />

          <Text style={styles.fieldLabel}>
            Product Photos: {newImages.length}/10
          </Text>

          <View style={styles.photoButtonRow}>
            <TouchableOpacity
              style={styles.photoButton}
              onPress={pickGalleryImages}
            >
              <Text style={styles.photoButtonText}>
                🖼️ Gallery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.photoButton}
              onPress={takeProductPhoto}
            >
              <Text style={styles.photoButtonText}>
                📷 Camera
              </Text>
            </TouchableOpacity>
          </View>

          {newImages.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.uploadPreview}
            >
              {newImages.map((uri, index) => (
                <View key={`${uri}_${index}`}>
                  <Image
                    source={{ uri }}
                    style={styles.uploadImage}
                  />

                  <TouchableOpacity
                    style={styles.removePhoto}
                    onPress={() => removeNewImage(index)}
                  >
                    <Text style={styles.removePhotoText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          <Text style={styles.fieldLabel}>
            Seller UPI QR
          </Text>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={pickQR}
          >
            <Text style={styles.secondaryButtonText}>
              Upload QR Image
            </Text>
          </TouchableOpacity>

          {newQR && (
            <Image
              source={{ uri: newQR }}
              style={styles.qrPreview}
            />
          )}

          <PrimaryButton
            title="Add Product"
            onPress={addProduct}
          />
        </View>

        <Text style={styles.sectionTitle}>
          Product Management
        </Text>

        {products.map((product) => (
          <View style={styles.adminProduct} key={product.id}>
            <View style={{ flex: 1 }}>
              <Text style={styles.adminProductName}>
                {product.name}
              </Text>

              <Text style={styles.adminProductText}>
                {money(product.price)} •{" "}
                {getCategoryName(product.category)}
              </Text>

              <Text style={styles.adminProductText}>
                Photos: {product.images?.length || 0}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.smallAdminButton}
              onPress={() => toggleProduct(product.id)}
            >
              <Text>
                {product.active ? "ON" : "OFF"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteProduct(product.id)}
            >
              <Text style={styles.deleteButtonText}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        <Text style={styles.sectionTitle}>
          Seller Applications
        </Text>

        {sellerApplication ? (
          <View style={styles.sellerAdminCard}>
            <Text style={styles.adminProductName}>
              {sellerApplication.storeName}
            </Text>

            <Text style={styles.adminProductText}>
              {sellerApplication.name}
            </Text>

            <Text style={styles.adminProductText}>
              {sellerApplication.phone}
            </Text>

            <Text style={styles.adminProductText}>
              {sellerApplication.address}
            </Text>

            <Text style={styles.bigStatus}>
              {sellerApplication.status}
            </Text>

            {sellerApplication.status === "PENDING" && (
              <View style={styles.photoButtonRow}>
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={approveSeller}
                >
                  <Text style={styles.approveText}>
                    Approve
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={rejectSeller}
                >
                  <Text style={styles.rejectText}>
                    Reject
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              कोई seller application नहीं है।
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>
          Order Management
        </Text>

        {orders.map((order) => (
          <View style={styles.orderCard} key={order.id}>
            <Text style={styles.orderId}>
              #{order.id.slice(-8)}
            </Text>

            <Text style={styles.orderTotal}>
              {money(order.total)}
            </Text>

            <Text style={styles.orderPayment}>
              Status: {order.status}
            </Text>

            {order.status !== "DELIVERED" && (
              <TouchableOpacity
                style={styles.outlineButton}
                onPress={() => adminMarkDelivered(order.id)}
              >
                <Text style={styles.outlineButtonText}>
                  Mark Delivered
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <Image source={LOGO} style={styles.loadingLogo} />
        <Text style={styles.loadingTitle}>{APP_NAME}</Text>
        <Text style={styles.loadingText}>
          Loading your shopping experience...
        </Text>
      </SafeAreaView>
    );
  }

  if (!session && screen === "login") {
    return renderLogin();
  }

  if (!session && screen !== "login") {
    return (
      <SafeAreaView style={styles.safe}>
        {renderHeader()}

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderHome()}

          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptTitle}>
              Shopping करने के लिए Login करें
            </Text>

            <PrimaryButton
              title="Login / Signup"
              onPress={() => setScreen("login")}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === "home") return renderHome();
  if (screen === "product") return renderProduct();
  if (screen === "cart") return renderCart();
  if (screen === "checkout") return renderCheckout();
  if (screen === "orders") return renderOrders();
  if (screen === "profile") return renderProfile();
  if (screen === "seller") return renderSeller();
  if (screen === "support") return renderSupport();
  if (screen === "admin") return renderAdmin();

  return renderHome();
}

function PrimaryButton({ title, onPress }) {
  return (
    <TouchableOpacity
      style={styles.primaryButton}
      onPress={onPress}
    >
      <Text style={styles.primaryButtonText}>{title}</Text>
    </TouchableOpacity>
  );
}

function NavButton({ icon, label, active, onPress }) {
  return (
    <TouchableOpacity
      style={styles.navButton}
      onPress={onPress}
    >
      <Text style={styles.navIcon}>{icon}</Text>
      <Text
        style={[
          styles.navLabel,
          active && styles.navLabelActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function CategoryButton({ name, icon, active, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        active && styles.categoryButtonActive,
      ]}
      onPress={onPress}
    >
      <Text style={styles.categoryIcon}>{icon}</Text>
      <Text style={styles.categoryName}>{name}</Text>
    </TouchableOpacity>
  );
}

function ProductCard({ product, onPress }) {
  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={onPress}
    >
      <View style={styles.productImage}>
        {product.images?.[0] ? (
          <Image
            source={{ uri: product.images[0] }}
            style={styles.productImageReal}
          />
        ) : (
          <Text style={styles.productEmoji}>📦</Text>
        )}
      </View>

      <Text
        style={styles.productCardName}
        numberOfLines={2}
      >
        {product.name}
      </Text>

      <Text style={styles.productCardPrice}>
        {money(product.price)}
      </Text>

      <Text style={styles.productCardCategory}>
        {getCategoryName(product.category)}
      </Text>
    </TouchableOpacity>
  );
}

function InfoBox({ icon, title, text }) {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

function Row({ label, value, bold }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.rowBold]}>
        {label}
      </Text>
      <Text style={[styles.rowValue, bold && styles.rowBold]}>
        {value}
      </Text>
    </View>
  );
}

function AdminToggle({ title, value, onChange }) {
  return (
    <TouchableOpacity
      style={styles.adminToggle}
      onPress={() => onChange(!value)}
    >
      <Text style={styles.adminToggleTitle}>
        {title}
      </Text>

      <View
        style={[
          styles.toggle,
          value && styles.toggleOn,
        ]}
      >
        <Text style={styles.toggleText}>
          {value ? "ON" : "OFF"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F6F7F9",
  },

  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#004D40",
  },

  loadingLogo: {
    width: 110,
    height: 110,
    resizeMode: "contain",
    borderRadius: 25,
  },

  loadingTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
    marginTop: 15,
  },

  loadingText: {
    color: "#D8EEEE",
    marginTop: 8,
  },

  header: {
    height: 65,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  headerLogo: {
    width: 48,
    height: 48,
    resizeMode: "contain",
    borderRadius: 12,
  },

  headerCart: {
    width: 45,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
  },

  cartIcon: {
    fontSize: 25,
  },

  cartBadge: {
    position: "absolute",
    right: 0,
    top: 0,
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: "#D32F2F",
    alignItems: "center",
    justifyContent: "center",
  },

  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },

  loginContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },

  loginLogo: {
    width: 130,
    height: 130,
    resizeMode: "contain",
    alignSelf: "center",
    borderRadius: 30,
    marginBottom: 10,
  },

  appTitle: {
    textAlign: "center",
    fontSize: 34,
    fontWeight: "900",
    color: "#004D40",
  },

  subtitle: {
    textAlign: "center",
    color: "#667085",
    marginTop: 4,
    marginBottom: 25,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#172026",
    marginBottom: 12,
  },

  pageTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#172026",
    marginBottom: 16,
  },

  heroTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#004D40",
    marginTop: 18,
  },

  heroText: {
    color: "#667085",
    fontSize: 15,
    marginTop: 5,
    marginBottom: 15,
  },

  welcomeImage: {
    width: "100%",
    height: 175,
    resizeMode: "cover",
    borderRadius: 20,
    backgroundColor: "#E8F1F0",
  },

  searchInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: "#E1E5EA",
    fontSize: 16,
  },

  categoryScroll: {
    marginTop: 14,
    marginBottom: 15,
  },

  categoryButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderRadius: 14,
    marginRight: 9,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  categoryButtonActive: {
    borderColor: "#004D40",
    backgroundColor: "#E8F3F1",
  },

  categoryIcon: {
    fontSize: 23,
  },

  categoryName: {
    fontSize: 11,
    marginTop: 3,
    fontWeight: "700",
  },

  infoRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },

  infoBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  infoIcon: {
    fontSize: 20,
  },

  infoTitle: {
    fontWeight: "800",
    marginTop: 3,
  },

  infoText: {
    fontSize: 11,
    color: "#667085",
    marginTop: 2,
  },

  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  productCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 10,
    marginBottom: 14,
    elevation: 2,
  },

  productImage: {
    height: 150,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#EEF1F3",
    alignItems: "center",
    justifyContent: "center",
  },

  productImageReal: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  productEmoji: {
    fontSize: 48,
  },

  productCardName: {
    fontSize: 15,
    fontWeight: "800",
    marginTop: 9,
  },

  productCardPrice: {
    fontSize: 18,
    fontWeight: "900",
    color: "#004D40",
    marginTop: 5,
  },

  productCardCategory: {
    color: "#667085",
    fontSize: 11,
    marginTop: 2,
  },

  supportCard: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },

  supportIcon: {
    fontSize: 30,
    marginRight: 12,
  },

  supportTitle: {
    fontWeight: "900",
    fontSize: 16,
  },

  supportText: {
    color: "#667085",
    fontSize: 12,
    marginTop: 3,
  },

  arrow: {
    fontSize: 28,
    color: "#98A2B3",
  },

  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 75,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  navButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 70,
  },

  navIcon: {
    fontSize: 22,
  },

  navLabel: {
    fontSize: 11,
    color: "#667085",
    marginTop: 2,
  },

  navLabelActive: {
    color: "#004D40",
    fontWeight: "900",
  },

  primaryButton: {
    backgroundColor: "#004D40",
    minHeight: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    marginTop: 12,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  secondaryButton: {
    minHeight: 46,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#004D40",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    marginTop: 10,
  },

  secondaryButtonText: {
    color: "#004D40",
    fontWeight: "800",
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#D9DEE5",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    marginBottom: 11,
    fontSize: 15,
  },

  textArea: {
    height: 100,
    paddingTop: 13,
    textAlignVertical: "top",
  },

  smallNote: {
    color: "#667085",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },

  backButton: {
    color: "#004D40",
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 10,
  },

  productImageLarge: {
    width: "100%",
    height: 330,
    backgroundColor: "#EEF1F3",
    borderRadius: 20,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  largeImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  noImage: {
    alignItems: "center",
    justifyContent: "center",
  },

  noImageText: {
    fontSize: 75,
  },

  thumbnailScroll: {
    marginTop: 10,
  },

  thumbnail: {
    width: 65,
    height: 65,
    borderRadius: 10,
    marginRight: 8,
    backgroundColor: "#EEE",
  },

  productTitle: {
    fontSize: 27,
    fontWeight: "900",
    marginTop: 17,
  },

  productPrice: {
    fontSize: 27,
    fontWeight: "900",
    color: "#004D40",
    marginTop: 6,
  },

  productDescription: {
    color: "#4B5563",
    lineHeight: 21,
    marginTop: 12,
  },

  sellerText: {
    color: "#667085",
    marginTop: 12,
    fontWeight: "700",
  },

  optionTitle: {
    fontSize: 17,
    fontWeight: "900",
    marginTop: 20,
    marginBottom: 8,
  },

  optionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  optionChip: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9DEE5",
  },

  optionChipSelected: {
    backgroundColor: "#E5F2EF",
    borderColor: "#004D40",
  },

  optionChipDisabled: {
    opacity: 0.4,
    backgroundColor: "#E5E7EB",
  },

  optionText: {
    fontWeight: "700",
  },

  disabledText: {
    textDecorationLine: "line-through",
  },

  deliveryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E0E4E8",
    marginBottom: 10,
  },

  deliveryCardSelected: {
    borderColor: "#004D40",
    backgroundColor: "#EDF7F5",
  },

  deliveryDisabled: {
    opacity: 0.55,
  },

  deliveryTitle: {
    fontWeight: "900",
    fontSize: 16,
  },

  deliveryText: {
    color: "#667085",
    marginTop: 4,
    fontSize: 12,
  },

  securityNote: {
    backgroundColor: "#FFF8E6",
    borderRadius: 14,
    padding: 13,
    marginTop: 12,
    marginBottom: 10,
  },

  securityTitle: {
    fontWeight: "900",
    color: "#7A5B00",
  },

  securityText: {
    color: "#6B5A20",
    marginTop: 5,
    lineHeight: 18,
    fontSize: 12,
  },

  emptyBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },

  emptyIcon: {
    fontSize: 50,
  },

  emptyText: {
    color: "#667085",
    textAlign: "center",
    marginTop: 10,
  },

  cartItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    marginBottom: 10,
  },

  cartImage: {
    width: 85,
    height: 85,
    borderRadius: 12,
    backgroundColor: "#EEF1F3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: "hidden",
  },

  cartImageReal: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  cartImageEmoji: {
    fontSize: 32,
  },

  cartProductName: {
    fontWeight: "900",
    fontSize: 15,
  },

  cartVariant: {
    color: "#667085",
    fontSize: 11,
    marginTop: 4,
  },

  cartPrice: {
    fontWeight: "900",
    color: "#004D40",
    marginTop: 4,
  },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  qtyButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#E9EEF0",
    alignItems: "center",
    justifyContent: "center",
  },

  qtyText: {
    fontWeight: "900",
    marginHorizontal: 12,
  },

  totalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginTop: 5,
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },

  rowLabel: {
    color: "#667085",
  },

  rowValue: {
    fontWeight: "700",
  },

  rowBold: {
    color: "#172026",
    fontWeight: "900",
    fontSize: 17,
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 7,
  },

  paymentOption: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E0E4E8",
    marginBottom: 10,
  },

  paymentSelected: {
    borderColor: "#004D40",
    backgroundColor: "#EDF7F5",
  },

  paymentTitle: {
    fontWeight: "900",
    fontSize: 16,
  },

  paymentText: {
    color: "#667085",
    fontSize: 12,
    marginTop: 4,
  },

  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    elevation: 1,
  },

  orderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  orderId: {
    fontWeight: "900",
  },

  orderStatus: {
    fontSize: 11,
    fontWeight: "900",
    color: "#004D40",
  },

  orderDate: {
    color: "#98A2B3",
    fontSize: 11,
    marginTop: 4,
  },

  orderItem: {
    marginTop: 8,
    color: "#4B5563",
  },

  orderTotal: {
    fontSize: 18,
    fontWeight: "900",
    color: "#004D40",
    marginTop: 10,
  },

  orderPayment: {
    color: "#667085",
    fontSize: 12,
    marginTop: 4,
  },

  refundStatus: {
    color: "#7A5B00",
    fontWeight: "800",
    marginTop: 5,
  },

  outlineButton: {
    borderWidth: 1,
    borderColor: "#004D40",
    borderRadius: 11,
    padding: 10,
    alignItems: "center",
    marginTop: 10,
  },

  outlineButtonText: {
    color: "#004D40",
    fontWeight: "800",
  },

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    alignItems: "center",
    padding: 22,
    marginBottom: 14,
  },

  profileAvatar: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: "#004D40",
    alignItems: "center",
    justifyContent: "center",
  },

  profileAvatarText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
  },

  profileName: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 10,
  },

  profilePhone: {
    color: "#667085",
    marginTop: 3,
  },

  walletCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },

  walletTitle: {
    fontSize: 18,
    fontWeight: "900",
  },

  coinNumber: {
    fontSize: 38,
    fontWeight: "900",
    color: "#004D40",
    marginTop: 5,
  },

  walletText: {
    color: "#667085",
    marginTop: 5,
  },

  progressBackground: {
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 5,
    marginTop: 12,
    overflow: "hidden",
  },

  progress: {
    height: "100%",
    backgroundColor: "#004D40",
  },

  bigStatus: {
    fontSize: 22,
    fontWeight: "900",
    color: "#004D40",
    marginBottom: 5,
  },

  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  adminMenuCard: {
    backgroundColor: "#E8F3F1",
    borderRadius: 16,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#004D40",
  },

  menuIcon: {
    fontSize: 27,
    marginRight: 12,
  },

  menuTitle: {
    fontSize: 16,
    fontWeight: "900",
  },

  menuText: {
    color: "#667085",
    fontSize: 12,
    marginTop: 3,
  },

  logoutButton: {
    height: 50,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#D32F2F",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  logoutText: {
    color: "#D32F2F",
    fontWeight: "900",
  },

  profilePhoto: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignSelf: "center",
    marginTop: 10,
  },

  consentBox: {
    borderWidth: 1,
    borderColor: "#D9DEE5",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },

  consentBoxActive: {
    borderColor: "#004D40",
    backgroundColor: "#EDF7F5",
  },

  consentText: {
    color: "#4B5563",
    fontSize: 12,
    lineHeight: 18,
  },

  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 16,
    marginBottom: 15,
  },

  aiHeader: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  aiIcon: {
    fontSize: 35,
    marginRight: 12,
  },

  aiTitle: {
    fontWeight: "900",
    fontSize: 18,
  },

  aiSub: {
    color: "#667085",
    fontSize: 12,
    marginTop: 3,
  },

  chatBox: {
    backgroundColor: "#F0F3F5",
    borderRadius: 17,
    padding: 12,
    marginVertical: 12,
    minHeight: 250,
  },

  chatEmpty: {
    color: "#667085",
    textAlign: "center",
    marginTop: 80,
  },

  messageBubble: {
    maxWidth: "88%",
    padding: 11,
    borderRadius: 13,
    marginBottom: 8,
  },

  userMessage: {
    backgroundColor: "#DCEFEA",
    alignSelf: "flex-end",
  },

  aiMessage: {
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
  },

  humanSupport: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },

  humanTitle: {
    fontWeight: "900",
    fontSize: 16,
  },

  humanText: {
    color: "#667085",
    marginTop: 4,
  },

  adminWarning: {
    backgroundColor: "#FFF4E5",
    borderRadius: 15,
    padding: 14,
    marginBottom: 18,
  },

  adminWarningTitle: {
    fontWeight: "900",
    color: "#7A4D00",
  },

  adminWarningText: {
    color: "#6B5A20",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  adminToggle: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  adminToggleTitle: {
    fontWeight: "800",
  },

  toggle: {
    minWidth: 58,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#D0D5DD",
    alignItems: "center",
    justifyContent: "center",
  },

  toggleOn: {
    backgroundColor: "#004D40",
  },

  toggleText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },

  categoryAdminRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    padding: 13,
    marginBottom: 7,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  categoryAdminText: {
    fontWeight: "800",
  },

  categoryAdminStatus: {
    color: "#004D40",
    fontWeight: "900",
  },

  fieldLabel: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
    color: "#344054",
  },

  photoButtonRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },

  photoButton: {
    flex: 1,
    minHeight: 45,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#004D40",
    alignItems: "center",
    justifyContent: "center",
  },

  photoButtonText: {
    color: "#004D40",
    fontWeight: "800",
  },

  uploadPreview: {
    marginBottom: 12,
  },

  uploadImage: {
    width: 85,
    height: 85,
    borderRadius: 12,
    marginRight: 8,
  },

  removePhoto: {
    position: "absolute",
    right: 12,
    top: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#D32F2F",
    alignItems: "center",
    justifyContent: "center",
  },

  removePhotoText: {
    color: "#FFFFFF",
    fontSize: 18,
    lineHeight: 19,
    fontWeight: "900",
  },

  qrPreview: {
    width: 170,
    height: 170,
    resizeMode: "contain",
    alignSelf: "center",
    marginVertical: 10,
  },

  adminProduct: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 13,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  adminProductName: {
    fontWeight: "900",
    fontSize: 15,
  },

  adminProductText: {
    color: "#667085",
    fontSize: 11,
    marginTop: 3,
  },

  smallAdminButton: {
    paddingHorizontal: 9,
    paddingVertical: 8,
    backgroundColor: "#E8F3F1",
    borderRadius: 9,
  },

  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: "#FDECEC",
    borderRadius: 9,
  },

  deleteButtonText: {
    color: "#D32F2F",
    fontWeight: "800",
    fontSize: 11,
  },

  sellerAdminCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
  },

  approveButton: {
    flex: 1,
    backgroundColor: "#004D40",
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 45,
  },

  approveText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  rejectButton: {
    flex: 1,
    backgroundColor: "#FDECEC",
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 45,
  },

  rejectText: {
    color: "#D32F2F",
    fontWeight: "900",
  },

  loginPrompt: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 16,
    marginTop: 15,
  },

  loginPromptTitle: {
    fontWeight: "900",
    fontSize: 18,
    textAlign: "center",
  },
});
