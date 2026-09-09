import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

import {
  initializeApp,
  getApps,
} from "firebase/app";

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";

/* =========================================================
   FIREBASE
   ========================================================= */

const firebaseConfig = {
  apiKey: "AIzaSyCZLI1bDuzFUNT-bZxea8dwas2alZWrciw",
  authDomain: "player97-60613.firebaseapp.com",
  databaseURL: "https://player97-60613-default-rtdb.firebaseio.com",
  projectId: "player97-60613",
  storageBucket: "player97-60613.firebasestorage.app",
  messagingSenderId: "807432199847",
  appId: "1:807432199847:web:fcaf00b4df60e355ce0582",
  measurementId: "G-24R56NHBSS",
};

const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

/* =========================================================
   APP CONFIG
   ========================================================= */

const APP_NAME = "Arishop";

const ADMIN_EMAIL = "sahil.admin@arishop.com";

const DEFAULT_SUPPORT_NUMBERS = [
  "920501360",
];

const CATEGORIES = [
  { id: "all", name: "All", icon: "🛍️" },
  { id: "electronics", name: "Electronics", icon: "📱" },
  { id: "men", name: "Men", icon: "👕" },
  { id: "women", name: "Women", icon: "👗" },
  { id: "tshirts", name: "T-Shirts", icon: "👕" },
  { id: "shirts", name: "Shirts", icon: "👔" },
  { id: "pants", name: "Pants", icon: "👖" },
  { id: "anime", name: "Anime", icon: "🎌" },
  { id: "shoes", name: "Shoes", icon: "👟" },
  { id: "accessories", name: "Accessories", icon: "⌚" },
  { id: "other", name: "Other", icon: "📦" },
];

const DEFAULT_MASTER = {
  electronics: true,
  men: true,
  women: true,
  tshirts: true,
  shirts: true,
  pants: true,
  anime: true,
  shoes: true,
  accessories: true,
  other: true,

  weeklyTopCustomer: true,
  premiumLuxury: true,

  ads: true,
  coins: true,
  reviews: true,

  cancellation: true,
  refunds: true,

  sellerSystem: false,

  cod: true,
  upi: true,

  aiCustomerCare: true,

  standardDelivery: true,
  fastDelivery: true,
};

const EMPTY_PRODUCT = {
  name: "",
  description: "",
  price: "",
  mrp: "",
  discount: "",
  category: "tshirts",
  stock: "10",
  colors: "",
  sizes: "",
  pickupLocation: "",
  sellerName: "Arishop",
  qrImage: "",
  images: [],
  premiumOnly: false,
};

const EMPTY_AD = {
  title: "",
  subtitle: "",
  image: "",
  active: true,
};

/* =========================================================
   HELPERS
   ========================================================= */

function money(value) {
  const n = Number(value || 0);
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

function safeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function discountPercent(mrp, price) {
  const m = safeNumber(mrp);
  const p = safeNumber(price);

  if (!m || !p || p >= m) return 0;

  return Math.round(((m - p) / m) * 100);
}

function categoryEnabled(category, master) {
  if (!category) return true;
  if (category === "all") return true;

  return master[category] !== false;
}

function productIsVisible(product, master, user) {
  if (!product) return false;

  if (product.active === false) return false;

  if (!categoryEnabled(product.category, master)) {
    return false;
  }

  if (product.premiumOnly) {
    const spend = safeNumber(user?.eligibleSpend);

    if (!master.premiumLuxury) {
      return false;
    }

    if (spend < 5000) {
      return false;
    }
  }

  return true;
}

async function saveLocal(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.log("Local save error:", e);
  }
}

async function loadLocal(key, fallback) {
  try {
    const value = await AsyncStorage.getItem(key);

    if (!value) return fallback;

    return JSON.parse(value);
  } catch (e) {
    return fallback;
  }
}

/* =========================================================
   MAIN APP
   ========================================================= */

export default function App() {
  const [loading, setLoading] = useState(true);

  const [firebaseUser, setFirebaseUser] = useState(null);

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    email: "",
    role: "customer",
    coins: 0,
    eligibleSpend: 0,
    instagram: "",
    instagramConsent: false,
  });

  const [products, setProducts] = useState([]);

  const [orders, setOrders] = useState([]);

  const [cart, setCart] = useState([]);

  const [master, setMaster] = useState(DEFAULT_MASTER);

  const [ads, setAds] = useState([]);

  const [supportNumbers, setSupportNumbers] = useState(
    DEFAULT_SUPPORT_NUMBERS
  );

  const [weeklyCustomers, setWeeklyCustomers] = useState([]);

  const [screen, setScreen] = useState("home");

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("all");

  const [selectedColor, setSelectedColor] = useState("");

  const [selectedSize, setSelectedSize] = useState("");

  const [quantity, setQuantity] = useState(1);

  const [address, setAddress] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [deliveryMode, setDeliveryMode] = useState("standard");

  const [busy, setBusy] = useState(false);

  const [loginMode, setLoginMode] = useState("login");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [name, setName] = useState("");

  const [phone, setPhone] = useState("");

  const [adminProduct, setAdminProduct] = useState(EMPTY_PRODUCT);

  const [adminImages, setAdminImages] = useState([]);

  const [adminAd, setAdminAd] = useState(EMPTY_AD);

  const [supportInput, setSupportInput] = useState("");

  const [showMaster, setShowMaster] = useState(false);

  /* =======================================================
     AUTH
     ======================================================= */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (!user) {
        setProfile({
          name: "",
          phone: "",
          email: "",
          role: "customer",
          coins: 0,
          eligibleSpend: 0,
          instagram: "",
          instagramConsent: false,
        });

        setLoading(false);
        return;
      }

      await loadUserProfile(user);

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  /* =======================================================
     INITIAL DATA
     ======================================================= */

  useEffect(() => {
    loadProducts();
    loadMaster();
    loadAds();
    loadSupportNumbers();
    loadWeeklyCustomers();
    loadCart();
  }, []);

  useEffect(() => {
    if (firebaseUser) {
      loadOrders();
    }
  }, [firebaseUser]);

  /* =======================================================
     LOAD MASTER
     ======================================================= */

  async function loadMaster() {
    try {
      const ref = doc(db, "appSettings", "master");

      const snap = await getDoc(ref);

      if (snap.exists()) {
        setMaster({
          ...DEFAULT_MASTER,
          ...snap.data(),
        });
      } else {
        setMaster(DEFAULT_MASTER);
      }
    } catch (e) {
      console.log("Master load:", e);

      const local = await loadLocal(
        "arishop_master",
        DEFAULT_MASTER
      );

      setMaster({
        ...DEFAULT_MASTER,
        ...local,
      });
    }
  }

  async function updateMasterControl(key, value) {
    if (!isAdmin()) {
      Alert.alert("Admin only", "यह control केवल Master Admin चला सकता है।");
      return;
    }

    const next = {
      ...master,
      [key]: value,
    };

    setMaster(next);

    await saveLocal("arishop_master", next);

    try {
      await setDoc(
        doc(db, "appSettings", "master"),
        next,
        { merge: true }
      );

      Alert.alert(
        "Live Control",
        `${key} ${value ? "ON" : "OFF"} कर दिया गया।`
      );
    } catch (e) {
      Alert.alert(
        "Firebase error",
        "Master control save नहीं हुआ। Firebase Rules check करें।"
      );
    }
  }

  /* =======================================================
     USERS
     ======================================================= */

  async function loadUserProfile(user) {
    try {
      const ref = doc(db, "users", user.uid);

      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();

        setProfile({
          name: data.name || "",
          phone: data.phone || "",
          email: user.email || data.email || "",
          role:
            user.email === ADMIN_EMAIL
              ? "admin"
              : data.role || "customer",
          coins: safeNumber(data.coins),
          eligibleSpend: safeNumber(data.eligibleSpend),
          instagram: data.instagram || "",
          instagramConsent: data.instagramConsent === true,
        });
      } else {
        const newProfile = {
          name: "",
          phone: "",
          email: user.email || "",
          role: user.email === ADMIN_EMAIL ? "admin" : "customer",
          coins: 0,
          eligibleSpend: 0,
          instagram: "",
          instagramConsent: false,
          createdAt: serverTimestamp(),
        };

        await setDoc(ref, newProfile);

        setProfile({
          ...newProfile,
          createdAt: undefined,
        });
      }
    } catch (e) {
      console.log("Profile error:", e);
    }
  }

  async function saveProfile() {
    if (!firebaseUser) return;

    setBusy(true);

    try {
      const next = {
        ...profile,
        email: firebaseUser.email || profile.email,
      };

      await setDoc(
        doc(db, "users", firebaseUser.uid),
        next,
        { merge: true }
      );

      setProfile(next);

      Alert.alert("Saved", "Profile save हो गई।");
    } catch (e) {
      Alert.alert("Error", "Profile save नहीं हो पाई।");
    } finally {
      setBusy(false);
    }
  }

  function isAdmin() {
    return (
      firebaseUser &&
      (
        firebaseUser.email === ADMIN_EMAIL ||
        profile.role === "admin"
      )
    );
  }

  /* =======================================================
     PRODUCTS
     ======================================================= */

  async function loadProducts() {
    try {
      const snap = await getDocs(collection(db, "products"));

      const list = snap.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setProducts(list);
    } catch (e) {
      console.log("Products error:", e);

      const local = await loadLocal("arishop_products", []);

      setProducts(local);
    }
  }

  async function createProduct() {
    if (!isAdmin()) {
      Alert.alert("Admin only", "Product केवल Admin बना सकता है।");
      return;
    }

    if (!adminProduct.name.trim()) {
      Alert.alert("Product name", "Product का नाम डालो।");
      return;
    }

    if (!adminProduct.price) {
      Alert.alert("Price", "Product की price डालो।");
      return;
    }

    setBusy(true);

    try {
      const mrp = safeNumber(adminProduct.mrp);
      const price = safeNumber(adminProduct.price);

      const product = {
        name: adminProduct.name.trim(),

        description:
          adminProduct.description.trim(),

        price,

        mrp,

        discount:
          adminProduct.discount ||
          discountPercent(mrp, price),

        category: adminProduct.category,

        stock: safeNumber(adminProduct.stock),

        colors: adminProduct.colors
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),

        sizes: adminProduct.sizes
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),

        pickupLocation:
          adminProduct.pickupLocation.trim(),

        sellerName:
          adminProduct.sellerName.trim() ||
          "Arishop",

        images: adminImages,

        qrImage:
          adminProduct.qrImage || "",

        cod: master.cod,

        upi: master.upi,

        active: true,

        premiumOnly:
          adminProduct.premiumOnly === true,

        sellerId:
          firebaseUser.uid,

        createdAt:
          serverTimestamp(),

        rating: 0,

        reviews: 0,
      };

      const ref = await addDoc(
        collection(db, "products"),
        product
      );

      const finalProduct = {
        id: ref.id,
        ...product,
      };

      setProducts((prev) => [
        finalProduct,
        ...prev,
      ]);

      await saveLocal(
        "arishop_products",
        [
          finalProduct,
          ...products,
        ]
      );

      setAdminProduct(EMPTY_PRODUCT);

      setAdminImages([]);

      Alert.alert(
        "Product live",
        "Product Firebase में save हो गया।"
      );
    } catch (e) {
      console.log(e);

      Alert.alert(
        "Product error",
        "Product save नहीं हुआ। Firebase Rules check करें।"
      );
    } finally {
      setBusy(false);
    }
  }

  async function chooseProductImages() {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission",
        "Gallery permission देना जरूरी है।"
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: 10,
        quality: 0.85,
      });

    if (!result.canceled) {
      const uris =
        result.assets.map((item) => item.uri);

      setAdminImages((prev) => [
        ...prev,
        ...uris,
      ].slice(0, 10));
    }
  }

  async function takeProductPhoto() {
    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission",
        "Camera permission देना जरूरी है।"
      );
      return;
    }

    const result =
      await ImagePicker.launchCameraAsync({
        quality: 0.85,
      });

    if (!result.canceled) {
      setAdminImages((prev) => [
        ...prev,
        result.assets[0].uri,
      ].slice(0, 10));
    }
  }

  /* =======================================================
     ADS
     ======================================================= */

  async function loadAds() {
    try {
      const q = query(
        collection(db, "ads"),
        where("active", "==", true),
        limit(10)
      );

      const snap = await getDocs(q);

      const list = snap.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setAds(list);
    } catch (e) {
      const local = await loadLocal(
        "arishop_ads",
        []
      );

      setAds(local);
    }
  }

  async function createAd() {
    if (!isAdmin()) return;

    if (!adminAd.title.trim()) {
      Alert.alert("Ad", "Ad title डालो।");
      return;
    }

    setBusy(true);

    try {
      const ad = {
        ...adminAd,
        title: adminAd.title.trim(),
        subtitle: adminAd.subtitle.trim(),
        createdAt: serverTimestamp(),
        createdBy: firebaseUser.uid,
      };

      const ref = await addDoc(
        collection(db, "ads"),
        ad
      );

      const finalAd = {
        id: ref.id,
        ...ad,
      };

      setAds((prev) => [
        finalAd,
        ...prev,
      ]);

      setAdminAd(EMPTY_AD);

      Alert.alert(
        "Ad live",
        "तुम्हारा advertisement save हो गया।"
      );
    } catch (e) {
      Alert.alert(
        "Ad error",
        "Advertisement save नहीं हुआ।"
      );
    } finally {
      setBusy(false);
    }
  }

  /* =======================================================
     SUPPORT NUMBERS
     ======================================================= */

  async function loadSupportNumbers() {
    try {
      const snap = await getDoc(
        doc(db, "appSettings", "support")
      );

      if (snap.exists()) {
        const nums = snap.data().numbers;

        if (Array.isArray(nums)) {
          setSupportNumbers(nums);
          return;
        }
      }
    } catch (e) {
      console.log(e);
    }

    const local = await loadLocal(
      "arishop_support",
      DEFAULT_SUPPORT_NUMBERS
    );

    setSupportNumbers(local);
  }

  async function addSupportNumber() {
    if (!isAdmin()) return;

    const number =
      supportInput.trim();

    if (!number) {
      Alert.alert(
        "Number",
        "Support number डालो।"
      );
      return;
    }

    const next = [
      ...supportNumbers,
      number,
    ];

    setSupportNumbers(next);

    setSupportInput("");

    await saveLocal(
      "arishop_support",
      next
    );

    try {
      await setDoc(
        doc(db, "appSettings", "support"),
        {
          numbers: next,
        },
        { merge: true }
      );

      Alert.alert(
        "Saved",
        "Support number add हो गया।"
      );
    } catch (e) {
      Alert.alert(
        "Error",
        "Support number Firebase में save नहीं हुआ।"
      );
    }
  }

  async function removeSupportNumber(number) {
    if (!isAdmin()) return;

    const next =
      supportNumbers.filter(
        (item) => item !== number
      );

    setSupportNumbers(next);

    await saveLocal(
      "arishop_support",
      next
    );

    try {
      await setDoc(
        doc(db, "appSettings", "support"),
        {
          numbers: next,
        },
        { merge: true }
      );
    } catch (e) {
      console.log(e);
    }
  }

  /* =======================================================
     WEEKLY TOP CUSTOMER
     ======================================================= */

  async function loadWeeklyCustomers() {
    try {
      const q = query(
        collection(db, "weeklyCustomers"),
        orderBy("eligibleSpend", "desc"),
        limit(20)
      );

      const snap = await getDocs(q);

      const list =
        snap.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

      setWeeklyCustomers(list);
    } catch (e) {
      console.log(
        "Weekly customers:",
        e
      );
    }
  }

  /* =======================================================
     CART
     ======================================================= */

  async function loadCart() {
    const saved =
      await loadLocal(
        "arishop_cart",
        []
      );

    setCart(saved);
  }

  async function saveCart(next) {
    setCart(next);

    await saveLocal(
      "arishop_cart",
      next
    );
  }

  function addToCart(product) {
    if (!productIsVisible(
      product,
      master,
      profile
    )) {
      Alert.alert(
        "Unavailable",
        "यह product अभी available नहीं है।"
      );
      return;
    }

    if (safeNumber(product.stock) <= 0) {
      Alert.alert(
        "Out of stock",
        "यह product अभी stock में नहीं है।"
      );
      return;
    }

    const item = {
      cartId:
        `${product.id}-${selectedColor}-${selectedSize}`,

      productId: product.id,

      name: product.name,

      price: safeNumber(product.price),

      image:
        product.images?.[0] || "",

      color:
        selectedColor || "",

      size:
        selectedSize || "",

      quantity,
    };

    const existingIndex =
      cart.findIndex(
        (x) => x.cartId === item.cartId
      );

    let next;

    if (existingIndex >= 0) {
      next = [...cart];

      next[existingIndex] = {
        ...next[existingIndex],
        quantity:
          next[existingIndex].quantity +
          quantity,
      };
    } else {
      next = [
        ...cart,
        item,
      ];
    }

    saveCart(next);

    Alert.alert(
      "Added",
      "Product cart में add हो गया।"
    );
  }

  function removeFromCart(cartId) {
    const next =
      cart.filter(
        (item) => item.cartId !== cartId
      );

    saveCart(next);
  }

  function changeCartQuantity(cartId, delta) {
    const next =
      cart
        .map((item) => {
          if (item.cartId !== cartId) {
            return item;
          }

          return {
            ...item,
            quantity: Math.max(
              1,
              item.quantity + delta
            ),
          };
        });

    saveCart(next);
  }

  const cartTotal = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total +
        safeNumber(item.price) *
          safeNumber(item.quantity),
      0
    );
  }, [cart]);

  /* =======================================================
     ORDERS
     ======================================================= */

  async function loadOrders() {
    if (!firebaseUser) return;

    try {
      const q = query(
        collection(db, "orders"),
        where(
          "userId",
          "==",
          firebaseUser.uid
        )
      );

      const snap =
        await getDocs(q);

      const list =
        snap.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

      list.sort(
        (a, b) =>
          safeNumber(
            b.createdAt?.seconds
          ) -
          safeNumber(
            a.createdAt?.seconds
          )
      );

      setOrders(list);
    } catch (e) {
      console.log(
        "Orders error:",
        e
      );
    }
  }

  async function placeOrder() {
    if (!firebaseUser) {
      Alert.alert(
        "Login required",
        "Order करने के लिए login करो।"
      );
      setScreen("profile");
      return;
    }

    if (!cart.length) {
      Alert.alert(
        "Cart empty",
        "पहले product cart में डालो।"
      );
      return;
    }

    if (!address.trim()) {
      Alert.alert(
        "Address",
        "Delivery address डालो।"
      );
      return;
    }

    if (
      paymentMethod === "COD" &&
      !master.cod
    ) {
      Alert.alert(
        "COD बंद है",
        "Admin ने Cash on Delivery बंद कर रखा है।"
      );
      return;
    }

    if (
      paymentMethod === "UPI" &&
      !master.upi
    ) {
      Alert.alert(
        "UPI बंद है",
        "Admin ने UPI बंद कर रखा है।"
      );
      return;
    }

    setBusy(true);

    try {
      const deliveryFee =
        deliveryMode === "fast"
          ? 40
          : 0;

      const subtotal =
        cartTotal;

      const total =
        subtotal +
        deliveryFee;

      const order = {
        userId:
          firebaseUser.uid,

        customerName:
          profile.name || "",

        customerPhone:
          profile.phone || "",

        customerEmail:
          firebaseUser.email || "",

        items: cart,

        subtotal,

        deliveryFee,

        total,

        address:
          address.trim(),

        paymentMethod,

        deliveryMode,

        status:
          "PLACED",

        cancellationStatus:
          "NONE",

        refundStatus:
          "NONE",

        trackingStatus:
          "ORDER_PLACED",

        createdAt:
          serverTimestamp(),
      };

      const ref =
        await addDoc(
          collection(db, "orders"),
          order
        );

      const localOrder = {
        id: ref.id,
        ...order,
      };

      setOrders((prev) => [
        localOrder,
        ...prev,
      ]);

      await saveCart([]);

      setAddress("");

      setScreen("orders");

      Alert.alert(
        "Order placed",
        `Order successfully place हो गया।\n\nAmount: ${money(total)}`
      );
    } catch (e) {
      console.log(e);

      Alert.alert(
        "Order error",
        "Order save नहीं हुआ। Firebase Rules check करें।"
      );
    } finally {
      setBusy(false);
    }
  }

  async function requestCancellation(order) {
    if (!firebaseUser) return;

    if (!master.cancellation) {
      Alert.alert(
        "Cancellation बंद है",
        "Cancellation अभी Admin ने बंद किया हुआ है।"
      );
      return;
    }

    try {
      await updateDoc(
        doc(db, "orders", order.id),
        {
          cancellationStatus:
            "REQUESTED",

          cancellationRequestedAt:
            serverTimestamp(),
        }
      );

      setOrders((prev) =>
        prev.map((item) =>
          item.id === order.id
            ? {
                ...item,
                cancellationStatus:
                  "REQUESTED",
              }
            : item
        )
      );

      Alert.alert(
        "Request sent",
        "Cancellation request भेज दी गई है।"
      );
    } catch (e) {
      Alert.alert(
        "Error",
        "Cancellation request नहीं भेजी गई।"
      );
    }
  }

  async function requestRefund(order) {
    if (!firebaseUser) return;

    if (!master.refunds) {
      Alert.alert(
        "Refund बंद है",
        "Refund system अभी Admin ने बंद किया हुआ है।"
      );
      return;
    }

    try {
      await updateDoc(
        doc(db, "orders", order.id),
        {
          refundStatus:
            "REQUESTED",

          refundRequestedAt:
            serverTimestamp(),
        }
      );

      setOrders((prev) =>
        prev.map((item) =>
          item.id === order.id
            ? {
                ...item,
                refundStatus:
                  "REQUESTED",
              }
            : item
        )
      );

      Alert.alert(
        "Refund request",
        "Refund request भेज दी गई है। सामान्य target 24–48 घंटे है; actual bank/payment provider timing अलग हो सकती है।"
      );
    } catch (e) {
      Alert.alert(
        "Error",
        "Refund request नहीं भेजी गई।"
      );
    }
  }

  /* =======================================================
     LOGIN / SIGNUP
     ======================================================= */

  async function loginOrSignup() {
    if (!email.trim()) {
      Alert.alert(
        "Email",
        "Email डालो।"
      );
      return;
    }

    if (!password) {
      Alert.alert(
        "Password",
        "Password डालो।"
      );
      return;
    }

    setBusy(true);

    try {
      let result;

      if (loginMode === "login") {
        result =
          await signInWithEmailAndPassword(
            auth,
            email.trim(),
            password
          );
      } else {
        result =
          await createUserWithEmailAndPassword(
            auth,
            email.trim(),
            password
          );

        const role =
          email.trim().toLowerCase() ===
          ADMIN_EMAIL.toLowerCase()
            ? "admin"
            : "customer";

        await setDoc(
          doc(
            db,
            "users",
            result.user.uid
          ),
          {
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            role,
            coins: 0,
            eligibleSpend: 0,
            instagram: "",
            instagramConsent: false,
            createdAt:
              serverTimestamp(),
          },
          { merge: true }
        );
      }

      setScreen("home");
    } catch (e) {
      console.log(e);

      let message =
        "Login/signup नहीं हुआ।";

      if (
        e.code ===
        "auth/invalid-credential"
      ) {
        message =
          "Email या password गलत है।";
      }

      if (
        e.code ===
        "auth/email-already-in-use"
      ) {
        message =
          "यह email पहले से registered है।";
      }

      if (
        e.code ===
        "auth/weak-password"
      ) {
        message =
          "Password कम से कम 6 characters का रखें।";
      }

      Alert.alert(
        "Authentication",
        message
      );
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      setScreen("home");
    } catch (e) {
      console.log(e);
    }
  }

  /* =======================================================
     FILTERS
     ======================================================= */

  const visibleProducts =
    useMemo(() => {
      const text =
        search.trim().toLowerCase();

      return products.filter(
        (product) => {
          if (
            !productIsVisible(
              product,
              master,
              profile
            )
          ) {
            return false;
          }

          if (
            category !== "all" &&
            product.category !== category
          ) {
            return false;
          }

          if (!text) {
            return true;
          }

          return (
            String(
              product.name || ""
            )
              .toLowerCase()
              .includes(text) ||
            String(
              product.description || ""
            )
              .toLowerCase()
              .includes(text)
          );
        }
      );
    }, [
      products,
      master,
      profile,
      search,
      category,
    ]);

  /* =======================================================
     PRODUCT DETAILS
     ======================================================= */

  function openProduct(product) {
    setSelectedProduct(product);

    setSelectedColor(
      product.colors?.[0] || ""
    );

    setSelectedSize(
      product.sizes?.[0] || ""
    );

    setQuantity(1);

    setScreen("product");
  }

  /* =======================================================
     PREMIUM
     ======================================================= */

  const premiumUnlocked =
    safeNumber(
      profile.eligibleSpend
    ) >= 5000;

  /* =======================================================
     AI SUPPORT
     ======================================================= */

  function openAIHelp() {
    if (!master.aiCustomerCare) {
      Alert.alert(
        "AI Customer Care",
        "AI Customer Care अभी बंद है।"
      );
      return;
    }

    setScreen("ai");
  }

  function getSupportNumber() {
    if (!supportNumbers.length) {
      return null;
    }

    return supportNumbers[0];
  }

  /* =======================================================
     RENDER
     ======================================================= */

  if (loading) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator
          size="large"
        />
        <Text style={styles.loadingText}>
          Arishop loading...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="dark-content"
      />

      <View style={styles.app}>
        {screen === "home" && (
          <HomeScreen
            products={visibleProducts}
            ads={ads}
            master={master}
            category={category}
            setCategory={setCategory}
            search={search}
            setSearch={setSearch}
            openProduct={openProduct}
            profile={profile}
            premiumUnlocked={
              premiumUnlocked
            }
            setScreen={setScreen}
          />
        )}

        {screen === "product" &&
          selectedProduct && (
            <ProductScreen
              product={
                selectedProduct
              }
              master={master}
              selectedColor={
                selectedColor
              }
              setSelectedColor={
                setSelectedColor
              }
              selectedSize={
                selectedSize
              }
              setSelectedSize={
                setSelectedSize
              }
              quantity={quantity}
              setQuantity={setQuantity}
              addToCart={() =>
                addToCart(
                  selectedProduct
                )
              }
              goBack={() =>
                setScreen("home")
              }
            />
          )}

        {screen === "cart" && (
          <CartScreen
            cart={cart}
            cartTotal={cartTotal}
            removeFromCart={
              removeFromCart
            }
            changeCartQuantity={
              changeCartQuantity
            }
            goBack={() =>
              setScreen("home")
            }
            checkout={() =>
              setScreen("checkout")
            }
          />
        )}

        {screen === "checkout" && (
          <CheckoutScreen
            cartTotal={cartTotal}
            address={address}
            setAddress={setAddress}
            paymentMethod={
              paymentMethod
            }
            setPaymentMethod={
              setPaymentMethod
            }
            deliveryMode={
              deliveryMode
            }
            setDeliveryMode={
              setDeliveryMode
            }
            master={master}
            placeOrder={
              placeOrder
            }
            busy={busy}
            goBack={() =>
              setScreen("cart")
            }
          />
        )}

        {screen === "orders" && (
          <OrdersScreen
            orders={orders}
            master={master}
            requestCancellation={
              requestCancellation
            }
            requestRefund={
              requestRefund
            }
            goBack={() =>
              setScreen("home")
            }
          />
        )}

        {screen === "profile" && (
          <ProfileScreen
            firebaseUser={
              firebaseUser
            }
            profile={profile}
            setProfile={setProfile}
            loginMode={loginMode}
            setLoginMode={
              setLoginMode
            }
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={
              setPassword
            }
            name={name}
            setName={setName}
            phone={phone}
            setPhone={setPhone}
            loginOrSignup={
              loginOrSignup
            }
            logout={logout}
            saveProfile={
              saveProfile
            }
            busy={busy}
            setScreen={setScreen}
            isAdmin={isAdmin}
            openAIHelp={
              openAIHelp
            }
          />
        )}

        {screen === "weekly" && (
          <WeeklyCustomerScreen
            customers={
              weeklyCustomers
            }
            master={master}
            goBack={() =>
              setScreen("home")
            }
          />
        )}

        {screen === "premium" && (
          <PremiumScreen
            products={products.filter(
              (item) =>
                item.premiumOnly
            )}
            unlocked={
              premiumUnlocked
            }
            master={master}
            openProduct={
              openProduct
            }
            goBack={() =>
              setScreen("home")
            }
          />
        )}

        {screen === "ai" && (
          <AICustomerCare
            supportNumbers={
              supportNumbers
            }
            master={master}
            goBack={() =>
              setScreen("profile")
            }
          />
        )}

        {screen === "admin" &&
          isAdmin() && (
            <AdminScreen
              master={master}
              updateMasterControl={
                updateMasterControl
              }
              product={
                adminProduct
              }
              setProduct={
                setAdminProduct
              }
              images={
                adminImages
              }
              chooseImages={
                chooseProductImages
              }
              takePhoto={
                takeProductPhoto
              }
              createProduct={
                createProduct
              }
              ad={adminAd}
              setAd={setAdminAd}
              createAd={createAd}
              supportNumbers={
                supportNumbers
              }
              supportInput={
                supportInput
              }
              setSupportInput={
                setSupportInput
              }
              addSupportNumber={
                addSupportNumber
              }
              removeSupportNumber={
                removeSupportNumber
              }
              goBack={() =>
                setScreen("profile")
              }
              busy={busy}
         />
            )}
      </View>

      <BottomNavigation
        screen={screen}
        setScreen={setScreen}
        cartCount={cart.length}
        isAdmin={isAdmin()}
      />

      {showMaster && (
        <Modal
          visible={showMaster}
          animationType="slide"
          onRequestClose={() =>
            setShowMaster(false)
          }
        >
          <SafeAreaView
            style={styles.safe}
          >
            <AdminScreen
              master={master}
              updateMasterControl={
                updateMasterControl
              }
              product={
                adminProduct
              }
              setProduct={
                setAdminProduct
              }
              images={
                adminImages
              }
              chooseImages={
                chooseProductImages
              }
              takePhoto={
                takeProductPhoto
              }
              createProduct={
                createProduct
              }
              ad={adminAd}
              setAd={setAdminAd}
              createAd={createAd}
              supportNumbers={
                supportNumbers
              }
              supportInput={
                supportInput
              }
              setSupportInput={
                setSupportInput
              }
              addSupportNumber={
                addSupportNumber
              }
              removeSupportNumber={
                removeSupportNumber
              }
              goBack={() =>
                setShowMaster(false)
              }
              busy={busy}
            />
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

/* =========================================================
   HOME SCREEN
   ========================================================= */

function HomeScreen({
  products,
  ads,
  master,
  category,
  setCategory,
  search,
  setSearch,
  openProduct,
  profile,
  premiumUnlocked,
  setScreen,
}) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.content
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>
            Arishop
          </Text>

          <Text
            style={
              styles.headerSubtitle
            }
          >
            Shop smart. Shop easy.
          </Text>
        </View>

        <Pressable
          style={styles.headerCart}
          onPress={() =>
            setScreen("cart")
          }
        >
          🛒
        </Pressable>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search products..."
        placeholderTextColor="#777"
        value={search}
        onChangeText={setSearch}
      />

      {master.ads &&
        ads.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            style={styles.adScroller}
          >
            {ads.map((ad) => (
              <View
                key={ad.id}
                style={styles.adCard}
              >
                {ad.image ? (
                  <Image
                    source={{
                      uri: ad.image,
                    }}
                    style={
                      styles.adImage
                    }
                  />
                ) : (
                  <View
                    style={
                      styles.adImagePlaceholder
                    }
                  >
                    <Text
                      style={
                        styles.adEmoji
                      }
                    >
                      🛍️
                    </Text>
                  </View>
                )}

                <View
                  style={
                    styles.adTextBox
                  }
                >
                  <Text
                    style={
                      styles.adTitle
                    }
                  >
                    {ad.title}
                  </Text>

                  <Text
                    style={
                      styles.adSubtitle
                    }
                  >
                    {ad.subtitle}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

      <Text style={styles.sectionTitle}>
        Categories
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
      >
        {CATEGORIES.map((item) => {
          const enabled =
            categoryEnabled(
              item.id,
              master
            );

          if (
            item.id !== "all" &&
            !enabled
          ) {
            return null;
          }

          return (
            <Pressable
              key={item.id}
              onPress={() =>
                setCategory(
                  item.id
                )
              }
              style={[
                styles.categoryButton,
                category ===
                  item.id &&
                  styles.categoryButtonActive,
              ]}
            >
              <Text
                style={
                  styles.categoryIcon
                }
              >
                {item.icon}
              </Text>

              <Text
                style={
                  styles.categoryName
                }
              >
                {item.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View
        style={
          styles.specialRow
        }
      >
        {master.weeklyTopCustomer && (
          <Pressable
            style={
              styles.specialCard
            }
            onPress={() =>
              setScreen(
                "weekly"
              )
            }
          >
            <Text style={styles.specialEmoji}>
              🏆
            </Text>

            <Text
              style={
                styles.specialTitle
              }
            >
              Weekly Top Customer
            </Text>

            <Text
              style={
                styles.specialSmall
              }
            >
              ₹2,500+ eligible shopping
            </Text>
          </Pressable>
        )}

        {master.premiumLuxury && (
          <Pressable
            style={
              styles.specialCard
            }
            onPress={() =>
              setScreen(
                "premium"
              )
            }
          >
            <Text style={styles.specialEmoji}>
              👑
            </Text>

            <Text
              style={
                styles.specialTitle
              }
            >
              Premium Luxury
            </Text>

            <Text
              style={
                styles.specialSmall
              }
            >
              ₹5,000 eligible spend
            </Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.sectionTitle}>
        {category === "all"
          ? "All Products"
          : `${
              CATEGORIES.find(
                (x) =>
                  x.id ===
                  category
              )?.name || "Products"
            }`}
      </Text>

      {products.length === 0 ? (
        <View
          style={
            styles.emptyBox
          }
        >
          <Text
            style={
              styles.emptyEmoji
            }
          >
            📦
          </Text>

          <Text
            style={
              styles.emptyTitle
            }
          >
            अभी कोई product नहीं है
          </Text>

          <Text
            style={
              styles.emptyText
            }
          >
            Admin पहले product add करेगा।
          </Text>
        </View>
      ) : (
        <View
          style={
            styles.productGrid
          }
        >
          {products.map(
            (product) => (
              <ProductCard
                key={product.id}
                product={product}
                openProduct={
                  openProduct
                }
              />
            )
          )}
        </View>
      )}
    </ScrollView>
  );
}

/* =========================================================
   PRODUCT CARD
   ========================================================= */

function ProductCard({
  product,
  openProduct,
}) {
  const image =
    product.images?.[0];

  const discount =
    discountPercent(
      product.mrp,
      product.price
    );

  return (
    <Pressable
      style={styles.productCard}
      onPress={() =>
        openProduct(product)
      }
    >
      {image ? (
        <Image
          source={{
            uri: image,
          }}
          style={
            styles.productImage
          }
        />
      ) : (
        <View
          style={
            styles.productPlaceholder
          }
        >
          <Text
            style={
              styles.productPlaceholderEmoji
            }
          >
            🛍️
          </Text>
        </View>
      )}

      <View
        style={
          styles.productInfo
        }
      >
        <Text
          style={
            styles.productName
          }
          numberOfLines={2}
        >
          {product.name}
        </Text>

        <View
          style={
            styles.priceRow
          }
        >
          <Text
            style={
              styles.price
            }
          >
            {money(
              product.price
            )}
          </Text>

          {product.mrp > product.price && (
            <Text
              style={
                styles.mrp
              }
            >
              {money(
                product.mrp
              )}
            </Text>
          )}
        </View>

        {discount > 0 && (
          <Text
            style={
              styles.discount
            }
          >
            {discount}% OFF
          </Text>
        )}

        <Text
          style={
            styles.stock
          }
        >
          {safeNumber(
            product.stock
          ) > 0
            ? "In stock"
            : "Out of stock"}
        </Text>
      </View>
    </Pressable>
  );
}

/* =========================================================
   PRODUCT SCREEN
   ========================================================= */

function ProductScreen({
  product,
  master,
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
  quantity,
  setQuantity,
  addToCart,
  goBack,
}) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.content
      }
    >
      <Pressable
        style={styles.backButton}
        onPress={goBack}
      >
        ← Back
      </Pressable>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={
          false
      }
      >
        {(product.images?.length
          ? product.images
          : [""])
          .map(
            (image, index) => (
              <View
                key={index}
                style={
                  styles.detailImageBox
                }
              >
                {image ? (
                  <Image
                    source={{
                      uri: image,
                    }}
                    style={
                      styles.detailImage
                    }
                  />
                ) : (
                  <Text
                    style={
                      styles.detailPlaceholder
                    }
                  >
                    🛍️
                  </Text>
                )}
              </View>
            )
          )}
      </ScrollView>

      <Text
        style={
          styles.detailTitle
        }
      >
        {product.name}
      </Text>

      <Text
        style={
          styles.detailDescription
        }
      >
        {product.description}
      </Text>

      <View
        style={
          styles.detailPriceRow
        }
      >
        <Text
          style={
            styles.detailPrice
          }
        >
          {money(product.price)}
        </Text>

        {product.mrp > product.price && (
          <Text
            style={
              styles.detailMrp
            }
          >
            {money(product.mrp)}
          </Text>
        )}
      </View>

      {product.colors?.length > 0 && (
        <>
          <Text
            style={
              styles.optionTitle
            }
          >
            Color
          </Text>

          <View
            style={
              styles.optionRow
            }
          >
            {product.colors.map(
              (color) => (
                <Pressable
                  key={color}
                  onPress={() =>
                    setSelectedColor(
                      color
                    )
                  }
                  style={[
                    styles.option,
                    selectedColor ===
                      color &&
                      styles.optionActive,
                  ]}
                >
                  <Text>
                    {color}
                  </Text>
                </Pressable>
              )
            )}
          </View>
        </>
      )}

      {product.sizes?.length > 0 && (
        <>
          <Text
            style={
              styles.optionTitle
            }
          >
            Size
          </Text>

          <View
            style={
              styles.optionRow
            }
          >
            {product.sizes.map(
              (size) => (
                <Pressable
                  key={size}
                  onPress={() =>
                    setSelectedSize(
                      size
                    )
                  }
                  style={[
                    styles.option,
                    selectedSize ===
                      size &&
                      styles.optionActive,
                  ]}
                >
                  <Text>
                    {size}
                  </Text>
                </Pressable>
              )
            )}
          </View>
        </>
      )}

      <Text
        style={
          styles.optionTitle
        }
      >
        Quantity
      </Text>

      <View
        style={
          styles.quantityRow
        }
      >
        <Pressable
          style={
            styles.quantityButton
          }
          onPress={() =>
            setQuantity(
              Math.max(
                1,
                quantity - 1
              )
            )
          }
        >
          −
        </Pressable>

        <Text
          style={
            styles.quantityText
          }
        >
          {quantity}
        </Text>

        <Pressable
          style={
            styles.quantityButton
          }
          onPress={() =>
            setQuantity(
              quantity + 1
            )
          }
        >
          +
        </Pressable>
      </View>

      <View
        style={
          styles.deliveryInfo
        }
      >
        {master.standardDelivery && (
          <Text>
            🚚 Standard Delivery: 1–7 days
          </Text>
        )}

        {master.fastDelivery && (
          <Text>
            ⚡ Fast Delivery: 1–3 days, +₹40
          </Text>
        )}

        {master.cod && (
          <Text>
            💵 Cash on Delivery available
          </Text>
        )}

        {master.upi && (
          <Text>
            📲 UPI payment available
          </Text>
        )}
      </View>

      <Pressable
        style={
          styles.primaryButton
        }
        onPress={addToCart}
      >
        <Text
          style={
            styles.primaryButtonText
          }
        >
          Add to Cart
        </Text>
      </Pressable>
    </ScrollView>
  );
}

/* =========================================================
   CART SCREEN
   ========================================================= */

function CartScreen({
  cart,
  cartTotal,
  removeFromCart,
  changeCartQuantity,
  checkout,
  goBack,
}) {
  return (
    <View
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        <Pressable
          style={styles.backButton}
          onPress={goBack}
        >
          ← Home
        </Pressable>

        <Text
          style={
            styles.pageTitle
          }
        >
          My Cart
        </Text>

        {cart.length === 0 ? (
          <View
            style={
              styles.emptyBox
            }
          >
            <Text
              style={
                styles.emptyEmoji
              }
            >
              🛒
            </Text>

            <Text
              style={
                styles.emptyTitle
              }
            >
              Cart खाली है
            </Text>
          </View>
        ) : (
          <>
            {cart.map(
              (item) => (
                <View
                  key={
                    item.cartId
                  }
                  style={
                    styles.cartItem
                  }
                >
                  {item.image ? (
                    <Image
                      source={{
                        uri: item.image,
                      }}
                      style={
                        styles.cartImage
                      }
                    />
                  ) : (
                    <View
                      style={
                        styles.cartImagePlaceholder
                      }
                    >
                      🛍️
                    </View>
                  )}

                  <View
                    style={
                      styles.cartMiddle
                    }
                  >
                    <Text
                      style={
                        styles.cartName
                      }
                    >
                      {item.name}
                    </Text>

                    <Text>
                      {money(
                        item.price
                      )}
                    </Text>

                    {item.color && (
                      <Text>
                        Color: {item.color}
                      </Text>
                    )}

                    {item.size && (
                      <Text>
                        Size: {item.size}
                      </Text>
                    )}

                    <View
                      style={
                        styles.cartQuantity
                      }
                    >
                      <Pressable
                        onPress={() =>
                          changeCartQuantity(
                            item.cartId,
                            -1
                          )
                        }
                      >
                        −
                      </Pressable>

                      <Text>
                        {item.quantity}
                      </Text>

                      <Pressable
                        onPress={() =>
                          changeCartQuantity(
                            item.cartId,
                            1
                          )
                        }
                      >
                        +
                      </Pressable>
                    </View>
                  </View>

                  <Pressable
                    onPress={() =>
                      removeFromCart(
                        item.cartId
                      )
                    }
                  >
                    <Text
                      style={
                        styles.deleteText
                      }
                    >
                      Delete
                    </Text>
                  </Pressable>
                </View>
              )
            )}

            <View
              style={
                styles.totalBox
              }
            >
              <Text
                style={
                  styles.totalLabel
                }
              >
                Subtotal
              </Text>

              <Text
                style={
                  styles.totalValue
                }
              >
                {money(cartTotal)}
              </Text>
            </View>

            <Pressable
              style={
                styles.primaryButton
              }
              onPress={checkout}
            >
              <Text
                style={
                  styles.primaryButtonText
                }
              >
                Checkout
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

/* =========================================================
   CHECKOUT
   ========================================================= */

function CheckoutScreen({
  cartTotal,
  address,
  setAddress,
  paymentMethod,
  setPaymentMethod,
  deliveryMode,
  setDeliveryMode,
  master,
  placeOrder,
  busy,
  goBack,
}) {
  const deliveryFee =
    deliveryMode === "fast"
      ? 40
      : 0;

  const total =
    cartTotal +
    deliveryFee;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={
        Platform.OS ===
        "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        <Pressable
          style={styles.backButton}
          onPress={goBack}
        >
          ← Cart
        </Pressable>

        <Text
          style={
            styles.pageTitle
          }
        >
          Checkout
        </Text>

        <Text
          style={
            styles.optionTitle
          }
        >
          Delivery Address
        </Text>

        <TextInput
          style={
            styles.largeInput
          }
          placeholder="पूरा delivery address"
          multiline
          value={address}
          onChangeText={
            setAddress
          }
        />

        <Text
          style={
            styles.optionTitle
          }
        >
          Delivery
        </Text>

        {master.standardDelivery && (
          <Pressable
            style={[
              styles.selectRow,
              deliveryMode ===
                "standard" &&
                styles.selectActive,
            ]}
            onPress={() =>
              setDeliveryMode(
                "standard"
              )
            }
          >
            <Text>
              🚚 Standard — 1–7 days
            </Text>

            <Text>
              FREE
            </Text>
          </Pressable>
        )}

        {master.fastDelivery && (
          <Pressable
            style={[
              styles.selectRow,
              deliveryMode ===
                "fast" &&
                styles.selectActive,
            ]}
            onPress={() =>
              setDeliveryMode(
                "fast"
              )
            }
          >
            <Text>
              ⚡ Fast — 1–3 days
            </Text>

            <Text>
              +₹40
            </Text>
          </Pressable>
        )}

        <Text
          style={
            styles.optionTitle
          }
        >
          Payment
        </Text>

        {master.cod && (
          <Pressable
            style={[
              styles.selectRow,
              paymentMethod ===
                "COD" &&
                styles.selectActive,
            ]}
            onPress={() =>
              setPaymentMethod(
                "COD"
              )
            }
          >
            <Text>
              💵 Cash on Delivery
            </Text>
          </Pressable>
        )}

        {master.upi && (
          <Pressable
            style={[
              styles.selectRow,
              paymentMethod ===
                "UPI" &&
                styles.selectActive,
            ]}
            onPress={() =>
              setPaymentMethod(
                "UPI"
              )
            }
          >
            <Text>
              📲 UPI
            </Text>
          </Pressable>
        )}

        <View
          style={
            styles.totalBox
          }
        >
          <Text
            style={
              styles.totalLabel
            }
          >
            Total
          </Text>

          <Text
            style={
              styles.totalValue
            }
          >
            {money(total)}
          </Text>
        </View>

        <Pressable
          style={[
            styles.primaryButton,
            busy &&
              styles.disabledButton,
          ]}
          disabled={busy}
          onPress={placeOrder}
        >
          <Text
            style={
              styles.primaryButtonText
            }
          >
            {busy
              ? "Placing..."
              : "Place Order"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* =========================================================
   ORDERS
   ========================================================= */

function OrdersScreen({
  orders,
  master,
  requestCancellation,
  requestRefund,
  goBack,
}) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.content
      }
    >
      <Pressable
        style={styles.backButton}
        onPress={goBack}
      >
        ← Home
      </Pressable>

      <Text
        style={
          styles.pageTitle
        }
      >
        My Orders
      </Text>

      {orders.length === 0 ? (
        <View
          style={
            styles.emptyBox
          }
        >
          <Text
            style={
              styles.emptyEmoji
            }
          >
            📦
          </Text>

          <Text
            style={
              styles.emptyTitle
            }
          >
            अभी कोई order नहीं है
          </Text>
        </View>
      ) : (
        orders.map(
          (order) => (
            <View
              key={order.id}
              style={
                styles.orderCard
              }
            >
              <Text
                style={
                  styles.orderId
                }
              >
                Order #{order.id.slice(
                  0,
                  8
                )}
              </Text>

              <Text>
                Status:{" "}
                {order.status ||
                  "PLACED"}
              </Text>

              <Text>
                Tracking:{" "}
                {order.trackingStatus ||
                  "ORDER_PLACED"}
              </Text>

              <Text>
                Payment:{" "}
                {order.paymentMethod}
              </Text>

              <Text
                style={
                  styles.orderAmount
                }
              >
                {money(
                  order.total
                )}
              </Text>

              <Text>
                Delivery:{" "}
                {order.deliveryMode ===
                "fast"
                  ? "1–3 days"
                  : "1–7 days"}
              </Text>

              {order.cancellationStatus ===
              "REQUESTED" && (
                <Text
                  style={
                    styles.warningText
                  }
                >
                  Cancellation requested
                </Text>
              )}

              {order.refundStatus ===
              "REQUESTED" && (
                <Text
                  style={
                    styles.warningText
                  }
                >
                  Refund requested
                </Text>
              )}

              {master.cancellation &&
                order.status ===
                  "PLACED" &&
                order.cancellationStatus !==
                  "REQUESTED" && (
                  <Pressable
                    style={
                      styles.secondaryButton
                    }
                    onPress={() =>
                      requestCancellation(
                        order
                      )
                    }
                  >
                    <Text>
                      Request Cancellation
                    </Text>
                  </Pressable>
                )}

              {master.refunds &&
                order.status ===
                  "DELIVERED" &&
                order.refundStatus !==
                  "REQUESTED" && (
                  <Pressable
                    style={
                      styles.secondaryButton
                    }
                    onPress={() =>
                      requestRefund(
                        order
                      )
                    }
                  >
                    <Text>
                      Request Refund
                    </Text>
                  </Pressable>
                )}
            </View>
          )
        )
      )}
    </ScrollView>
  );
}

/* =========================================================
   PROFILE
   ========================================================= */

function ProfileScreen({
  firebaseUser,
  profile,
  setProfile,
  loginMode,
  setLoginMode,
  email,
  setEmail,
  password,
  setPassword,
  name,
  setName,
  phone,
  setPhone,
  loginOrSignup,
  logout,
  saveProfile,
  busy,
  setScreen,
  isAdmin,
  openAIHelp,
}) {
  if (!firebaseUser) {
    return (
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={
          Platform.OS ===
          "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.content
          }
        >
          <Text
            style={
              styles.pageTitle
            }
          >
            {loginMode ===
            "login"
              ? "Login"
              : "Create Account"}
          </Text>

          {loginMode ===
            "signup" && (
            <>
              <TextInput
                style={
                  styles.input
                }
                placeholder="Name"
                value={name}
                onChangeText={
                  setName
                }
              />

              <TextInput
                style={
                  styles.input
                }
                placeholder="Phone"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={
                  setPhone
                }
              />
            </>
          )}

          <TextInput
            style={
              styles.input
            }
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={
              setEmail
            }
          />

          <TextInput
            style={
              styles.input
            }
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={
              setPassword
            }
          />

          <Pressable
            style={
              styles.primaryButton
            }
            onPress={
              loginOrSignup
            }
          >
            <Text
              style={
                styles.primaryButtonText
              }
            >
              {busy
                ? "Please wait..."
                : loginMode ===
                  "login"
                ? "Login"
                : "Create Account"}
            </Text>
          </Pressable>

          <Pressable
            style={
              styles.secondaryButton
            }
            onPress={() =>
              setLoginMode(
                loginMode ===
                  "login"
                  ? "signup"
                  : "login"
              )
            }
          >
            <Text>
              {loginMode ===
              "login"
                ? "Create new account"
                : "Already have an account? Login"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.content
      }
    >
      <Text
        style={
          styles.pageTitle
        }
      >
        Profile
      </Text>

      <View
        style={
          styles.profileCard
        }
      >
        <Text
          style={
            styles.profileAvatar
          }
        >
          👤
        </Text>

        <Text
          style={
            styles.profileEmail
          }
        >
          {firebaseUser.email}
        </Text>

        <Text>
          Role:{" "}
          {isAdmin()
            ? "Master Admin"
            : "Customer"}
        </Text>
      </View>

      <Text
        style={
          styles.optionTitle
        }
      >
        Name
      </Text>

      <TextInput
        style={
          styles.input
        }
        value={profile.name}
        onChangeText={(value) =>
          setProfile({
            ...profile,
            name: value,
          })
        }
      />

      <Text
        style={
          styles.optionTitle
        }
      >
        Phone
      </Text>

      <TextInput
        style={
          styles.input
        }
        value={profile.phone}
        onChangeText={(value) =>
          setProfile({
            ...profile,
            phone: value,
          })
        }
      />

      <View
        style={
          styles.profileStats
        }
      >
        <View
          style={
            styles.statCard
          }
        >
          <Text style={styles.statEmoji}>
            🪙
          </Text>

          <Text
            style={
              styles.statValue
            }
          >
            {profile.coins || 0}
          </Text>

          <Text>
            Coins
          </Text>
        </View>

        <View
          style={
            styles.statCard
          }
        >
          <Text style={styles.statEmoji}>
            💰
          </Text>

          <Text
            style={
              styles.statValue
            }
          >
            {money(
              profile.eligibleSpend
            )}
          </Text>

          <Text>
            Eligible Spend
          </Text>
        </View>
      </View>

      <Pressable
        style={
          styles.primaryButton
        }
        onPress={
          saveProfile
        }
      >
        <Text
          style={
            styles.primaryButtonText
          }
        >
          Save Profile
        </Text>
      </Pressable>

      <Pressable
        style={
          styles.menuButton
        }
        onPress={() =>
          setScreen(
            "orders"
          )
        }
      >
        📦 My Orders
      </Pressable>

      <Pressable
        style={
          styles.menuButton
        }
        onPress={() =>
          setScreen(
            "weekly"
          )
        }
      >
        🏆 Weekly Top Customer
      </Pressable>

      <Pressable
        style={
          styles.menuButton
        }
        onPress={() =>
          setScreen(
            "premium"
          )
        }
      >
        👑 Premium Luxury
      </Pressable>

      <Pressable
        style={
          styles.menuButton
        }
        onPress={
          openAIHelp
        }
      >
        🤖 AI Customer Care
      </Pressable>

      {isAdmin() && (
        <Pressable
          style={
            styles.adminButton
          }
          onPress={() =>
            setScreen(
              "admin"
            )
          }
        >
          ⚙️ Master Control / Admin
        </Pressable>
      )}

      <Pressable
        style={
          styles.logoutButton
        }
        onPress={logout}
      >
        Logout
      </Pressable>
    </ScrollView>
  );
}

/* =========================================================
   WEEKLY CUSTOMER
   ========================================================= */

function WeeklyCustomerScreen({
  customers,
  master,
  goBack,
}) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.content
      }
    >
      <Pressable
        style={styles.backButton}
        onPress={goBack}
      >
        ← Home
      </Pressable>

      <Text
        style={
          styles.pageTitle
        }
      >
        🏆 Weekly Top Customer
      </Text>

      <Text
        style={
          styles.descriptionBox
        }
      >
        ₹2,500 या उससे अधिक eligible shopping वाले customers इस section के लिए eligible हो सकते हैं। Refund/cancellation पूरी तरह समाप्त होने के बाद ही final eligibility तय करनी चाहिए।
      </Text>

      {!master.weeklyTopCustomer ? (
        <View
          style={
            styles.emptyBox
          }
        >
          <Text>
            Weekly Top Customer अभी बंद है।
          </Text>
        </View>
      ) : customers.length ===
        0 ? (
        <View
          style={
            styles.emptyBox
          }
        >
          <Text
            style={
              styles.emptyTitle
            }
          >
            अभी weekly customer data नहीं है।
          </Text>
        </View>
      ) : (
        customers.map(
          (customer, index) => (
            <View
              key={
                customer.id
              }
              style={
                styles.customerCard
              }
            >
              <Text
                style={
                  styles.rank
                }
              >
                #{index + 1}
              </Text>

              <View
                style={
                  styles.customerInfo
                }
              >
                {customer.photo ? (
                  <Image
                    source={{
                      uri: customer.photo,
                    }}
                    style={
                      styles.customerPhoto
                    }
                  />
                ) : (
                  <View
                    style={
                      styles.customerPhotoPlaceholder
                    }
                  >
                    👤
                  </View>
                )}

                <View>
                  <Text
                    style={
                      styles.customerName
                    }
                  >
                    {customer.name ||
                      "Customer"}
                  </Text>

                  <Text>
                    Eligible spend:{" "}
                    {money(
                      customer.eligibleSpend
                    )}
                  </Text>

                  {customer.instagramConsent &&
                    customer.instagram && (
                      <Text>
                        Instagram:{" "}
                        {customer.instagram}
                      </Text>
                    )}
                </View>
              </View>
            </View>
          )
        )
      )}
    </ScrollView>
  );
}

/* =========================================================
   PREMIUM
   ========================================================= */

function PremiumScreen({
  products,
  unlocked,
  master,
  openProduct,
  goBack,
}) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.content
      }
    >
      <Pressable
        style={styles.backButton}
        onPress={goBack}
      >
        ← Home
      </Pressable>

      <Text
        style={
          styles.pageTitle
        }
      >
        👑 Premium Luxury
      </Text>

      {!master.premiumLuxury ? (
        <View
          style={
            styles.emptyBox
          }
        >
          <Text>
            Premium Luxury अभी Master Control से OFF है।
          </Text>
        </View>
      ) : !unlocked ? (
        <View
          style={
            styles.premiumLock
          }
        >
          <Text
            style={
              styles.premiumLockEmoji
            }
          >
            🔒
          </Text>

          <Text
            style={
              styles.premiumLockTitle
            }
          >
            Premium Locked
          </Text>

          <Text
            style={
              styles.premiumLockText
            }
          >
            ₹5,000 eligible spend पूरा होने पर Premium Luxury unlock होगा।
          </Text>
        </View>
      ) : products.length ===
        0 ? (
        <View
          style={
            styles.emptyBox
          }
        >
          <Text>
            अभी Premium products नहीं हैं।
          </Text>
        </View>
      ) : (
        <View
          style={
            styles.productGrid
          }
        >
          {products.map(
            (product) => (
              <ProductCard
                key={product.id}
                product={product}
                openProduct={
                  openProduct
                }
              />
            )
          )}
        </View>
      )}
    </ScrollView>
  );
}

/* =========================================================
   AI CUSTOMER CARE
   ========================================================= */

function AICustomerCare({
  supportNumbers,
  master,
  goBack,
}) {
  const [problem, setProblem] =
    useState("");

  const [solved, setSolved] =
    useState(false);

  const [needsHuman, setNeedsHuman] =
    useState(false);

  function solveProblem() {
    const text =
      problem.trim().toLowerCase();

    if (!text) {
      Alert.alert(
        "Problem",
        "अपनी समस्या लिखो।"
      );
      return;
    }

    setSolved(true);

    if (
      text.includes("refund") ||
      text.includes("रिफंड")
    ) {
      Alert.alert(
        "AI Customer Care",
        "Refund request Orders section से भेज सकते हैं। सामान्य target 24–48 घंटे है; actual provider/bank timing अलग हो सकती है।"
      );
    } else if (
      text.includes("cancel") ||
      text.includes("cancellation") ||
      text.includes("कैंसल")
    ) {
      Alert.alert(
        "AI Customer Care",
        "अगर cancellation enabled है और order eligible है, Orders section में cancellation request भेजें।"
      );
    } else if (
      text.includes("order") ||
      text.includes("ऑर्डर")
    ) {
      Alert.alert(
        "AI Customer Care",
        "Orders section में जाकर order status और tracking status देख सकते हैं।"
      );
    } else if (
      text.includes("payment") ||
      text.includes("पेमेंट")
    ) {
      Alert.alert(
        "AI Customer Care",
        "Payment method checkout में दिखाई देगा, जो Admin ने ON रखा होगा।"
      );
    } else {
      Alert.alert(
        "AI Customer Care",
        "मैंने आपकी समस्या समझने की कोशिश की। अगर यह समाधान नहीं हुआ तो Human Customer Care विकल्प इस्तेमाल करें।"
      );
    }
  }

  function contactHuman() {
    if (!master.aiCustomerCare) {
      return;
    }

    setNeedsHuman(true);
  }

  const number =
    supportNumbers?.[0];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.content
      }
    >
      <Pressable
        style={styles.backButton}
        onPress={goBack}
      >
        ← Profile
      </Pressable>

      <Text
        style={
          styles.pageTitle
        }
      >
        🤖 AI Customer Care
      </Text>

      <Text
        style={
          styles.descriptionBox
        }
      >
        पहले अपनी समस्या AI को बताइए। Human support number तभी दिखाया जाएगा जब AI solution पर्याप्त न हो।
      </Text>

      <TextInput
        style={
          styles.largeInput
        }
        placeholder="अपनी समस्या यहाँ लिखें..."
        multiline
        value={problem}
        onChangeText={
          setProblem
        }
      />

      <Pressable
        style={
          styles.primaryButton
        }
        onPress={
          solveProblem
        }
      >
        <Text
          style={
            styles.primaryButtonText
          }
        >
          AI से पूछें
        </Text>
      </Pressable>

      {solved && (
        <Pressable
          style={
            styles.secondaryButton
          }
          onPress={
            contactHuman
          }
        >
          <Text>
            समस्या अभी भी हल नहीं हुई — Human Support
          </Text>
        </Pressable>
      )}

      {needsHuman && (
        <View
          style={
            styles.supportBox
          }
        >
          <Text
            style={
              styles.supportTitle
            }
          >
            Human Customer Care
          </Text>

          {number ? (
            <Text
              style={
                styles.supportNumber
              }
            >
              📞 {number}
            </Text>
          ) : (
            <Text>
              अभी कोई support number configured नहीं है।
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

/* =========================================================
   ADMIN / MASTER CONTROL
   ========================================================= */

function AdminScreen({
  master,
  updateMasterControl,
  product,
  setProduct,
  images,
  chooseImages,
  takePhoto,
  createProduct,
  ad,
  setAd,
  createAd,
  supportNumbers,
  supportInput,
  setSupportInput,
  addSupportNumber,
  removeSupportNumber,
  goBack,
  busy,
}) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.content
      }
    >
      <Pressable
        style={styles.backButton}
        onPress={goBack}
      >
        ← Back
      </Pressable>

      <Text
        style={
          styles.adminTitle
        }
      >
        ⚙️ Master Control
      </Text>

      <Text
        style={
          styles.descriptionBox
        }
      >
        यहाँ से पूरा Arishop system ON/OFF किया जा सकता है। OFF करने पर app में वह feature/category दिखाई नहीं जाएगी।
      </Text>

      <Text
        style={
          styles.sectionTitle
        }
      >
        Category Controls
      </Text>

      {[
        "electronics",
        "men",
        "women",
        "tshirts",
        "shirts",
        "pants",
        "anime",
        "shoes",
        "accessories",
        "other",
      ].map((key) => (
        <ControlRow
          key={key}
          title={
            CATEGORIES.find(
              (item) =>
                item.id === key
            )?.name || key
          }
          icon={
            CATEGORIES.find(
              (item) =>
                item.id === key
            )?.icon || "📦"
          }
          value={
            master[key] !== false
          }
          onChange={(value) =>
            updateMasterControl(
              key,
              value
            )
          }
        />
      ))}

      <Text
        style={
          styles.sectionTitle
        }
      >
        Special Sections
      </Text>

      <ControlRow
        title="Weekly Top Customer"
        icon="🏆"
        value={
          master.weeklyTopCustomer
        }
        onChange={(value) =>
          updateMasterControl(
            "weeklyTopCustomer",
            value
          )
        }
      />

      <ControlRow
        title="Premium Luxury"
        icon="👑"
        value={
          master.premiumLuxury
        }
        onChange={(value) =>
          updateMasterControl(
            "premiumLuxury",
            value
          )
        }
      />

      <ControlRow
        title="Ads / Banners"
        icon="📢"
        value={master.ads}
        onChange={(value) =>
          updateMasterControl(
            "ads",
            value
          )
        }
      />

      <ControlRow
        title="Coins"
        icon="🪙"
        value={master.coins}
        onChange={(value) =>
          updateMasterControl(
            "coins",
            value
          )
        }
      />

      <ControlRow
        title="Reviews"
        icon="⭐"
        value={master.reviews}
        onChange={(value) =>
          updateMasterControl(
            "reviews",
            value
          )
        }
      />

      <ControlRow
        title="Cancellation"
        icon="❌"
        value={
          master.cancellation
        }
        onChange={(value) =>
          updateMasterControl(
            "cancellation",
            value
          )
        }
      />

      <ControlRow
        title="Refunds"
        icon="💸"
        value={master.refunds}
        onChange={(value) =>
          updateMasterControl(
            "refunds",
            value
          )
        }
      />

      <ControlRow
        title="Seller System"
        icon="🏪"
        value={
          master.sellerSystem
        }
        onChange={(value) =>
          updateMasterControl(
            "sellerSystem",
            value
          )
        }
      />

      <ControlRow
        title="Cash on Delivery"
        icon="💵"
        value={master.cod}
        onChange={(value) =>
          updateMasterControl(
            "cod",
            value
          )
        }
      />

      <ControlRow
        title="UPI"
        icon="📲"
        value={master.upi}
        onChange={(value) =>
          updateMasterControl(
            "upi",
            value
          )
        }
      />

      <ControlRow
        title="AI Customer Care"
        icon="🤖"
        value={
          master.aiCustomerCare
        }
        onChange={(value) =>
          updateMasterControl(
            "aiCustomerCare",
            value
          )
        }
      />

      <ControlRow
        title="Standard Delivery"
        icon="🚚"
        value={
          master.standardDelivery
        }
        onChange={(value) =>
          updateMasterControl(
            "standardDelivery",
            value
          )
        }
      />

      <ControlRow
        title="Fast Delivery"
        icon="⚡"
        value={
          master.fastDelivery
        }
        onChange={(value) =>
          updateMasterControl(
            "fastDelivery",
            value
          )
        }
      />

      <Text
        style={
          styles.sectionTitle
        }
      >
        Add Product
      </Text>

      <TextInput
        style={
          styles.input
        }
        placeholder="Product name"
        value={product.name}
        onChangeText={(value) =>
          setProduct({
            ...product,
            name: value,
          })
        }
      />

      <TextInput
        style={
          styles.largeInput
        }
        placeholder="Description"
        multiline
        value={
          product.description
        }
        onChangeText={(value) =>
          setProduct({
            ...product,
            description:
              value,
          })
        }
      />

      <TextInput
        style={
          styles.input
        }
        placeholder="Price"
        keyboardType="numeric"
        value={product.price}
        onChangeText={(value) =>
          setProduct({
            ...product,
            price: value,
          })
        }
      />

      <TextInput
        style={
          styles.input
        }
        placeholder="MRP"
        keyboardType="numeric"
        value={product.mrp}
        onChangeText={(value) =>
          setProduct({
            ...product,
            mrp: value,
          })
        }
      />

      <TextInput
        style={
          styles.input
        }
        placeholder="Discount % (optional)"
        keyboardType="numeric"
        value={
          String(
            product.discount ||
              ""
          )
        }
        onChangeText={(value) =>
          setProduct({
            ...product,
            discount: value,
          })
        }
      />

      <Text
        style={
          styles.optionTitle
        }
      >
        Category
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
      >
        {CATEGORIES.filter(
          (x) =>
            x.id !== "all"
        ).map((item) => (
          <Pressable
            key={item.id}
            style={[
              styles.option,
              product.category ===
                item.id &&
                styles.optionActive,
            ]}
            onPress={() =>
              setProduct({
                ...product,
                category:
                  item.id,
              })
            }
          >
            <Text>
              {item.icon}{" "}
              {item.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <TextInput
        style={
          styles.input
        }
        placeholder="Stock quantity"
        keyboardType="numeric"
        value={
          String(
            product.stock
          )
        }
        onChangeText={(value) =>
          setProduct({
            ...product,
            stock: value,
          })
        }
      />

      <TextInput
        style={
          styles.input
        }
        placeholder="Colors: Black, White, Red"
        value={
          product.colors
        }
        onChangeText={(value) =>
          setProduct({
            ...product,
            colors: value,
          })
        }
      />

      <TextInput
        style={
          styles.input
        }
        placeholder="Sizes: S, M, L, XL, XXL"
        value={
          product.sizes
        }
        onChangeText={(value) =>
          setProduct({
            ...product,
            sizes: value,
          })
        }
      />

      <TextInput
        style={
          styles.input
        }
        placeholder="Pickup location"
        value={
          product.pickupLocation
        }
        onChangeText={(value) =>
          setProduct({
            ...product,
            pickupLocation:
              value,
          })
        }
      />

      <TextInput
        style={
          styles.input
        }
        placeholder="Seller name"
        value={
          product.sellerName
        }
        onChangeText={(value) =>
          setProduct({
            ...product,
            sellerName:
              value,
          })
        }
      />

      <TextInput
        style={
          styles.input
        }
        placeholder="Your QR image URL (optional)"
        value={
          product.qrImage
        }
        onChangeText={(value) =>
          setProduct({
            ...product,
            qrImage: value,
          })
        }
      />

      <ControlRow
        title="Premium Luxury Product"
        icon="👑"
        value={
          product.premiumOnly
        }
        onChange={(value) =>
          setProduct({
            ...product,
            premiumOnly: value,
          })
        }
      />

      <Text
        style={
          styles.optionTitle
        }
      >
        Product Photos
      </Text>

      <View
        style={
          styles.photoButtonRow
        }
      >
        <Pressable
          style={
            styles.secondaryButton
          }
          onPress={
            chooseImages
          }
        >
          📱 Gallery
        </Pressable>

        <Pressable
          style={
            styles.secondaryButton
          }
          onPress={
            takePhoto
          }
        >
          📷 Camera
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
      >
        {images.map(
          (uri, index) => (
            <Image
              key={`${uri}-${index}`}
              source={{
                uri,
              }}
              style={
                styles.adminPhoto
              }
            />
          )
        )}
      </ScrollView>

      <Pressable
        style={
          styles.primaryButton
        }
        onPress={
          createProduct
        }
      >
        <Text
          style={
            styles.primaryButtonText
          }
        >
          {busy
            ? "Saving..."
            : "Publish Product"}
        </Text>
      </Pressable>

      <Text
        style={
          styles.sectionTitle
        }
      >
        Add Your Advertisement
      </Text>

      <TextInput
        style={
          styles.input
        }
        placeholder="Ad title"
        value={ad.title}
        onChangeText={(value) =>
          setAd({
            ...ad,
            title: value,
          })
        }
      />

      <TextInput
        style={
          styles.input
        }
        placeholder="Ad subtitle"
        value={ad.subtitle}
        onChangeText={(value) =>
          setAd({
            ...ad,
            subtitle:
              value,
          })
        }
      />

      <TextInput
        style={
          styles.input
        }
        placeholder="Ad image URL"
        value={ad.image}
        onChangeText={(value) =>
          setAd({
            ...ad,
            image: value,
          })
        }
      />

      <ControlRow
        title="Advertisement Active"
        icon="📢"
        value={ad.active}
        onChange={(value) =>
          setAd({
            ...ad,
            active: value,
          })
        }
      />

      <Pressable
        style={
          styles.primaryButton
        }
        onPress={
          createAd
        }
      >
        <Text
          style={
            styles.primaryButtonText
          }
        >
          Publish Advertisement
        </Text>
      </Pressable>

      <Text
        style={
          styles.sectionTitle
        }
      >
        AI Customer Care Numbers
      </Text>

      <Text
        style={
          styles.descriptionBox
        }
      >
        AI पहले customer की समस्या handle करेगा। Human support की जरूरत होने पर यहाँ दिए numbers में से number दिखाया जा सकता है।
      </Text>

      {supportNumbers.map(
        (number) => (
          <View
            key={number}
            style={
              styles.supportNumberRow
            }
          >
            <Text>
              📞 {number}
            </Text>

            <Pressable
              onPress={() =>
                removeSupportNumber(
                  number
                )
              }
            >
              <Text
                style={
                  styles.deleteText
                }
              >
                Remove
              </Text>
            </Pressable>
          </View>
        )
      )}

      <TextInput
        style={
          styles.input
        }
        placeholder="New support number"
        keyboardType="phone-pad"
        value={
          supportInput
        }
        onChangeText={
          setSupportInput
        }
      />

      <Pressable
        style={
          styles.secondaryButton
        }
        onPress={
          addSupportNumber
        }
      >
        <Text>
          + Add Support Number
        </Text>
      </Pressable>

      <View
        style={
          styles.warningBox
        }
      >
        <Text
          style={
            styles.warningTitle
          }
        >
          Important
        </Text>

        <Text>
          Master controls को Firestore Rules से भी secure करना जरूरी है। केवल UI में Admin button छिपाना security नहीं है।
        </Text>
      </View>
    </ScrollView>
  );
}

/* =========================================================
   CONTROL ROW
   ========================================================= */

function ControlRow({
  title,
  icon,
  value,
  onChange,
}) {
  return (
    <View
      style={
        styles.controlRow
      }
    >
      <View
        style={
          styles.controlLeft
        }
      >
        <Text
          style={
            styles.controlIcon
          }
        >
          {icon}
        </Text>

        <Text
          style={
            styles.controlTitle
          }
        >
          {title}
        </Text>
      </View>

      <Pressable
        onPress={() =>
          onChange(!value)
        }
        style={[
          styles.switch,
          value &&
            styles.switchOn,
        ]}
      >
        <View
          style={[
            styles.switchDot,
            value &&
              styles.switchDotOn,
          ]}
        />

        <Text
          style={
            styles.switchText
          }
        >
          {value
            ? "ON"
            : "OFF"}
        </Text>
      </Pressable>
    </View>
  );
}

/* =========================================================
   BOTTOM NAVIGATION
   ========================================================= */

function BottomNavigation({
  screen,
  setScreen,
  cartCount,
  isAdmin,
}) {
  return (
    <View
      style={
        styles.bottomNav
      }
    >
      <NavButton
        icon="🏠"
        label="Home"
        active={
          screen === "home"
        }
        onPress={() =>
          setScreen("home")
        }
      />

      <NavButton
        icon="🛒"
        label={`Cart${
          cartCount
            ? ` (${cartCount})`
            : ""
        }`}
        active={
          screen === "cart"
        }
        onPress={() =>
          setScreen("cart")
        }
      />

      <NavButton
        icon="📦"
        label="Orders"
        active={
          screen === "orders"
        }
        onPress={() =>
          setScreen("orders")
        }
      />

      <NavButton
        icon="👤"
        label="Profile"
        active={
          screen === "profile"
        }
        onPress={() =>
          setScreen("profile")
        }
      />

      {isAdmin && (
        <NavButton
          icon="⚙️"
          label="Master"
          active={
            screen === "admin"
          }
          onPress={() =>
            setScreen("admin")
          }
        />
      )}
    </View>
  );
}

function NavButton({
  icon,
  label,
  active,
  onPress,
}) {
  return (
    <Pressable
      style={[
        styles.navButton,
        active &&
          styles.navButtonActive,
      ]}
      onPress={onPress}
    >
      <Text
        style={
          styles.navIcon
        }
      >
        {icon}
      </Text>

      <Text
        style={
          styles.navLabel
        }
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* =========================================================
   STYLES
   ========================================================= */

const styles =
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor:
        "#F7F0E3",
    },

    app: {
      flex: 1,
    },

    screen: {
      flex: 1,
      backgroundColor:
        "#F7F0E3",
    },

    content: {
      padding: 16,
      paddingBottom: 40,
    },

    loading: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#F7F0E3",
    },

    loadingText: {
      marginTop: 10,
      fontSize: 16,
    },

    header: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      marginBottom: 14,
    },

    brand: {
      fontSize: 30,
      fontWeight: "900",
      color: "#222",
    },

    headerSubtitle: {
      color: "#777",
      marginTop: 2,
    },

    headerCart: {
      fontSize: 28,
      padding: 10,
    },

    search: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 13,
      fontSize: 15,
      borderWidth: 1,
      borderColor:
        "#E3D8C8",
      marginBottom: 18,
    },

    adScroller: {
      marginBottom: 18,
    },

    adCard: {
      width: 320,
      height: 155,
      borderRadius: 18,
      backgroundColor:
        "#FFFFFF",
      overflow: "hidden",
      marginRight: 12,
      borderWidth: 1,
      borderColor:
        "#E3D8C8",
    },

    adImage: {
      width: "100%",
      height: "100%",
      position:
        "absolute",
    },

    adImagePlaceholder: {
      width: "100%",
      height: "100%",
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#E9DDCB",
    },

    adEmoji: {
      fontSize: 50,
    },

    adTextBox: {
      position:
        "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      padding: 14,
      backgroundColor:
        "rgba(0,0,0,0.55)",
    },

    adTitle: {
      color: "#FFFFFF",
      fontSize: 20,
      fontWeight: "800",
    },

    adSubtitle: {
      color: "#FFFFFF",
      marginTop: 3,
    },

    sectionTitle: {
      fontSize: 21,
      fontWeight: "800",
      marginTop: 8,
      marginBottom: 12,
      color: "#262626",
    },

    categoryButton: {
      minWidth: 76,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#FFFFFF",
      borderRadius: 14,
      paddingVertical: 10,
      paddingHorizontal: 8,
      marginRight: 9,
      borderWidth: 1,
      borderColor:
        "#E3D8C8",
    },

    categoryButtonActive: {
      backgroundColor:
        "#E8D2B3",
      borderColor:
        "#C79B64",
    },

    categoryIcon: {
      fontSize: 24,
      marginBottom: 4,
    },

    categoryName: {
      fontSize: 12,
      fontWeight: "700",
    },

    specialRow: {
      flexDirection:
        "row",
      gap: 10,
      marginTop: 20,
    },

    specialCard: {
      flex: 1,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor:
        "#E3D8C8",
    },

    specialEmoji: {
      fontSize: 30,
      marginBottom: 7,
    },

    specialTitle: {
      fontSize: 15,
      fontWeight: "800",
    },

    specialSmall: {
      fontSize: 11,
      color: "#666",
      marginTop: 5,
    },

    productGrid: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      justifyContent:
        "space-between",
    },

    productCard: {
      width: "48%",
      backgroundColor:
        "#FFFFFF",
      borderRadius: 16,
      marginBottom: 14,
      overflow: "hidden",
      borderWidth: 1,
      borderColor:
        "#E3D8C8",
    },

    productImage: {
      width: "100%",
      height: 170,
      backgroundColor:
        "#EDE5D9",
    },

    productPlaceholder: {
      width: "100%",
      height: 170,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#EDE5D9",
    },

    productPlaceholderEmoji: {
      fontSize: 45,
    },

    productInfo: {
      padding: 10,
    },

    productName: {
      fontSize: 14,
      fontWeight: "700",
      minHeight: 38,
    },

    priceRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      marginTop: 6,
      gap: 7,
    },

    price: {
      fontSize: 18,
      fontWeight: "900",
    },

    mrp: {
      textDecorationLine:
        "line-through",
      color: "#888",
      fontSize: 12,
    },

    discount: {
      marginTop: 3,
      fontSize: 12,
      fontWeight: "800",
    },

    stock: {
      marginTop: 5,
      fontSize: 11,
      color: "#555",
    },

    backButton: {
      alignSelf:
        "flex-start",
      paddingVertical: 8,
      marginBottom: 10,
      fontWeight: "700",
    },

    pageTitle: {
      fontSize: 27,
      fontWeight: "900",
      marginBottom: 18,
    },

    detailImageBox: {
      width: 340,
      height: 340,
      backgroundColor:
        "#EDE5D9",
      borderRadius: 18,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 12,
      overflow: "hidden",
    },

    detailImage: {
      width: "100%",
      height: "100%",
    },

    detailPlaceholder: {
      fontSize: 80,
    },

    detailTitle: {
      fontSize: 27,
      fontWeight: "900",
      marginTop: 18,
    },

    detailDescription: {
      fontSize: 15,
      color: "#555",
      lineHeight: 22,
      marginTop: 8,
    },

    detailPriceRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 10,
      marginTop: 14,
    },

    detailPrice: {
      fontSize: 28,
      fontWeight: "900",
    },

    detailMrp: {
      textDecorationLine:
        "line-through",
      color: "#888",
      fontSize: 16,
    },

    optionTitle: {
      fontSize: 17,
      fontWeight: "800",
      marginTop: 18,
      marginBottom: 9,
    },

    optionRow: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 8,
    },

    option: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#D8CBB9",
      marginRight: 7,
      marginBottom: 7,
    },

    optionActive: {
      backgroundColor:
        "#E8D2B3",
      borderColor:
        "#B9874E",
    },

    quantityRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 18,
    },

    quantityButton: {
      width: 42,
      height: 42,
      borderRadius: 12,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#D8CBB9",
      fontSize: 24,
    },

    quantityText: {
      fontSize: 18,
      fontWeight: "800",
    },

    deliveryInfo: {
      backgroundColor:
        "#FFFFFF",
      padding: 15,
      borderRadius: 15,
      marginTop: 18,
      gap: 7,
      borderWidth: 1,
      borderColor:
        "#E3D8C8",
    },

    primaryButton: {
      backgroundColor:
        "#222222",
      paddingVertical: 15,
      borderRadius: 13,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginTop: 18,
    },

    primaryButtonText: {
      color: "#FFFFFF",
      fontWeight: "900",
      fontSize: 16,
    },

    disabledButton: {
      opacity: 0.5,
    },

    secondaryButton: {
      backgroundColor:
        "#FFFFFF",
      paddingVertical: 13,
      paddingHorizontal: 15,
      borderRadius: 12,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginTop: 10,
      borderWidth: 1,
      borderColor:
        "#D8CBB9",
    },

    cartItem: {
      flexDirection:
        "row",
      alignItems:
        "center",
      backgroundColor:
        "#FFFFFF",
      padding: 12,
      borderRadius: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor:
        "#E3D8C8",
    },

    cartImage: {
      width: 72,
      height: 72,
      borderRadius: 10,
    },

    cartImagePlaceholder: {
      width: 72,
      height: 72,
      borderRadius: 10,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#EDE5D9",
      fontSize: 30,
    },

    cartMiddle: {
      flex: 1,
      paddingHorizontal: 10,
    },

    cartName: {
      fontWeight: "800",
      marginBottom: 4,
    },

    cartQuantity: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 15,
      marginTop: 7,
    },

    deleteText: {
      fontWeight: "800",
    },

    totalBox: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
      backgroundColor:
        "#FFFFFF",
      padding: 16,
      borderRadius: 14,
      marginTop: 15,
      borderWidth: 1,
      borderColor:
        "#E3D8C8",
    },

    totalLabel: {
      fontSize: 17,
      fontWeight: "700",
    },

    totalValue: {
      fontSize: 22,
      fontWeight: "900",
    },

    largeInput: {
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#D8CBB9",
      borderRadius: 12,
      padding: 14,
      minHeight: 110,
      textAlignVertical:
        "top",
      fontSize: 15,
    },

    input: {
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#D8CBB9",
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      marginBottom: 9,
    },

    selectRow: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
      backgroundColor:
        "#FFFFFF",
      padding: 15,
      borderRadius: 12,
      borderWidth: 1,
      borderColor:
        "#D8CBB9",
      marginBottom: 9,
    },

    selectActive: {
      backgroundColor:
        "#E8D2B3",
      borderColor:
        "#B9874E",
    },

    orderCard: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 16,
      padding: 15,
      marginBottom: 12,
      borderWidth: 1,
      borderColor:
        "#E3D8C8",
      gap: 6,
    },

    orderId: {
      fontWeight: "900",
      fontSize: 16,
    },

    orderAmount: {
      fontSize: 21,
      fontWeight: "900",
      marginTop: 4,
    },

    warningText: {
      fontWeight: "800",
      marginTop: 5,
    },

    profileCard: {
      backgroundColor:
        "#FFFFFF",
      padding: 20,
      borderRadius: 18,
      alignItems:
        "center",
      marginBottom: 15,
      borderWidth: 1,
      borderColor:
        "#E3D8C8",
    },

    profileAvatar: {
      fontSize: 55,
    },

    profileEmail: {
      fontSize: 16,
      fontWeight: "800",
      marginVertical: 7,
    },

    profileStats: {
      flexDirection:
        "row",
      gap: 10,
      marginTop: 15,
    },

    statCard: {
      flex: 1,
      backgroundColor:
        "#FFFFFF",
      padding: 14,
      borderRadius: 14,
      alignItems:
        "center",
      borderWidth: 1,
      borderColor:
        "#E3D8C8",
    },

    statEmoji: {
      fontSize: 28,
    },

    statValue: {
      fontSize: 18,
      fontWeight: "900",
      marginTop: 4,
    },

    menuButton: {
      backgroundColor:
        "#FFFFFF",
      padding: 16,
      borderRadius: 13,
      marginTop: 10,
      fontSize: 16,
      borderWidth: 1,
      borderColor:
        "#E3D8C8",
    },

    adminButton: {
      backgroundColor:
        "#E7D0AA",
      padding: 17,
      borderRadius: 13,
      marginTop: 15,
      fontWeight: "900",
    },

    logoutButton: {
      backgroundColor:
        "#FFFFFF",
      padding: 16,
      borderRadius: 13,
      marginTop: 20,
      borderWidth: 1,
      borderColor:
        "#CFC1AE",
      alignItems:
        "center",
    },

    premiumLock: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 20,
      padding: 30,
      alignItems:
        "center",
      borderWidth: 1,
      borderColor:
        "#D8CBB9",
    },

    premiumLockEmoji: {
      fontSize: 65,
    },

    premiumLockTitle: {
      fontSize: 24,
      fontWeight: "900",
      marginTop: 10,
    },

    premiumLockText: {
      textAlign:
        "center",
      marginTop: 10,
      color: "#666",
      lineHeight: 21,
    },

    customerCard: {
      flexDirection:
        "row",
      alignItems:
        "center",
      backgroundColor:
        "#FFFFFF",
      borderRadius: 16,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor:
        "#E3D8C8",
    },

    rank: {
      width: 40,
      fontSize: 18,
      fontWeight: "900",
    },

    customerInfo: {
      flex: 1,
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    customerPhoto: {
      width: 55,
      height: 55,
      borderRadius: 30,
      marginRight: 12,
    },

    customerPhotoPlaceholder: {
      width: 55,
      height: 55,
      borderRadius: 30,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#EDE5D9",
      fontSize: 25,
      marginRight: 12,
    },

    customerName: {
      fontSize: 16,
      fontWeight: "800",
    },

    descriptionBox: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 14,
      padding: 15,
      lineHeight: 21,
      marginBottom: 15,
      borderWidth: 1,
      borderColor:
        "#E3D8C8",
    },

    supportBox: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 16,
      padding: 18,
      marginTop: 18,
      borderWidth: 1,
      borderColor:
        "#D8CBB9",
    },

    supportTitle: {
      fontSize: 18,
      fontWeight: "900",
      marginBottom: 8,
    },

    supportNumber: {
      fontSize: 22,
      fontWeight: "900",
    },

    adminTitle: {
      fontSize: 29,
      fontWeight: "900",
      marginBottom: 8,
    },

    controlRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      backgroundColor:
        "#FFFFFF",
      padding: 14,
      borderRadius: 13,
      marginBottom: 8,
      borderWidth: 1,
      borderColor:
        "#E3D8C8",
    },

    controlLeft: {
      flexDirection:
        "row",
      alignItems:
        "center",
      flex: 1,
    },

    controlIcon: {
      fontSize: 23,
      marginRight: 10,
    },

    controlTitle: {
      fontSize: 15,
      fontWeight: "700",
    },

    switch: {
      minWidth: 74,
      height: 36,
      borderRadius: 20,
      backgroundColor:
        "#D7D0C6",
      flexDirection:
        "row",
      alignItems:
        "center",
      paddingHorizontal: 6,
      justifyContent:
        "space-between",
    },

    switchOn: {
      backgroundColor:
        "#C4A36F",
    },

    switchDot: {
      width: 25,
      height: 25,
      borderRadius: 13,
      backgroundColor:
        "#FFFFFF",
    },

    switchDotOn: {
      marginLeft: 37,
    },

    switchText: {
      fontSize: 10,
      fontWeight: "900",
    },

    photoButtonRow: {
      flexDirection:
        "row",
      gap: 8,
      marginBottom: 10,
    },

    adminPhoto: {
      width: 90,
      height: 90,
      borderRadius: 12,
      marginRight: 8,
      backgroundColor:
        "#EDE5D9",
    },

    supportNumberRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      backgroundColor:
        "#FFFFFF",
      padding: 14,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor:
        "#E3D8C8",
    },

    warningBox: {
      backgroundColor:
        "#FFF1D6",
      padding: 15,
      borderRadius: 14,
      marginTop: 20,
      borderWidth: 1,
      borderColor:
        "#E5C88F",
    },

    warningTitle: {
      fontWeight: "900",
      marginBottom: 5,
    },

    emptyBox: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 18,
      padding: 30,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginTop: 15,
      borderWidth: 1,
      borderColor:
        "#E3D8C8",
    },

    emptyEmoji: {
      fontSize: 55,
      marginBottom: 10,
    },

    emptyTitle: {
      fontSize: 18,
      fontWeight: "800",
    },

    emptyText: {
      color: "#777",
      marginTop: 5,
    },

    bottomNav: {
      height: 68,
      backgroundColor:
        "#FFFFFF",
      borderTopWidth: 1,
      borderTopColor:
        "#DED3C4",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-around",
    },

    navButton: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
      height: "100%",
    },

    navButtonActive: {
      backgroundColor:
        "#F1E5D4",
    },

    navIcon: {
      fontSize: 21,
    },

    navLabel: {
      fontSize: 10,
      fontWeight: "700",
      marginTop: 2,
    },
  });
