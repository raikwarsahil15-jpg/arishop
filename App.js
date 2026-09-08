import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
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

import { initializeApp } from "firebase/app";
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
  addDoc,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";

/* =========================================================
   ARISHOP - FIREBASE CONFIG
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

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

/* =========================================================
   APP CONSTANTS
   ========================================================= */

const APP_NAME = "Arishop";
const SUPPORT_PHONE = "9999999999";

const STORAGE = {
  cart: "@arishop/cart/v3",
  profile: "@arishop/profile/v3",
  products: "@arishop/products/v3",
};

const ADMIN_EMAIL = "sahil.admin@arishop.com";

/* =========================================================
   CATEGORIES
   ========================================================= */

const CATEGORIES = [
  {
    id: "all",
    name: "All",
    icon: "🛍️",
  },
  {
    id: "tshirt",
    name: "T-Shirts",
    icon: "👕",
  },
  {
    id: "shirt",
    name: "Shirts",
    icon: "👔",
  },
  {
    id: "pants",
    name: "Pants",
    icon: "👖",
  },
  {
    id: "anime",
    name: "Anime",
    icon: "🎌",
  },
  {
    id: "shoes",
    name: "Shoes",
    icon: "👟",
  },
  {
    id: "accessories",
    name: "Accessories",
    icon: "👜",
  },
  {
    id: "electronics",
    name: "Electronics",
    icon: "📱",
  },
  {
    id: "other",
    name: "Other",
    icon: "📦",
  },
];

/* =========================================================
   DEFAULT PRODUCTS
   ========================================================= */

const SEED_PRODUCTS = [
  {
    id: "seed-tshirt",
    name: "Premium Anime T-Shirt",
    description:
      "Premium printed anime T-Shirt. Different sizes and colors available.",
    price: 499,
    mrp: 699,
    category: "anime",
    images: [],
    colors: [
      {
        name: "Black",
        available: true,
      },
      {
        name: "White",
        available: true,
      },
    ],
    sizes: [
      {
        name: "S",
        available: true,
      },
      {
        name: "M",
        available: true,
      },
      {
        name: "L",
        available: true,
      },
      {
        name: "XL",
        available: true,
      },
    ],
    stock: 10,
    cod: true,
    active: true,
    sellerId: "admin",
    sellerName: "Arishop",
    pickupLocation: "",
    sellerLat: null,
    sellerLng: null,
    qrImage: null,
    rating: 0,
    reviews: 0,
  },
  {
    id: "seed-pants",
    name: "Street Style Pants",
    description: "Comfortable everyday pants.",
    price: 799,
    mrp: 999,
    category: "pants",
    images: [],
    colors: [
      {
        name: "Black",
        available: true,
      },
      {
        name: "Blue",
        available: false,
      },
    ],
    sizes: [
      {
        name: "28",
        available: true,
      },
      {
        name: "30",
        available: true,
      },
      {
        name: "32",
        available: true,
      },
      {
        name: "34",
        available: true,
      },
    ],
    stock: 10,
    cod: true,
    active: true,
    sellerId: "admin",
    sellerName: "Arishop",
    pickupLocation: "",
    sellerLat: null,
    sellerLng: null,
    qrImage: null,
    rating: 0,
    reviews: 0,
  },
];

/* =========================================================
   HELPERS
   ========================================================= */

const money = (value) =>
  `₹${Math.round(Number(value) || 0).toLocaleString("en-IN")}`;

const generateId = (prefix = "id") =>
  `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

const loadJSON = async (key, fallback) => {
  try {
    const raw = await AsyncStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const saveJSON = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

const categoryName = (id) => {
  const item = CATEGORIES.find((x) => x.id === id);

  return item ? item.name : "Other";
};

/* =========================================================
   APP
   ========================================================= */

export default function App() {
  const [loading, setLoading] = useState(true);

  const [firebaseUser, setFirebaseUser] = useState(null);

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    email: "",
    role: "buyer",
    coins: 0,
  });

  const [products, setProducts] = useState(SEED_PRODUCTS);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  const [screen, setScreen] = useState("home");

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

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    mrp: "",
    category: "tshirt",
    stock: "10",
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

  const [loginMode, setLoginMode] = useState("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginName, setLoginName] = useState("");

  const [busy, setBusy] = useState(false);

  /* =======================================================
     FIREBASE AUTH LISTENER
     ======================================================= */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        setFirebaseUser(currentUser);

        if (currentUser) {
          await loadProfile(currentUser);
        }

        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  /* =======================================================
     LOCAL STORAGE
     ======================================================= */

  useEffect(() => {
    if (!loading) {
      saveJSON(STORAGE.cart, cart);
    }
  }, [cart, loading]);

  useEffect(() => {
    if (!loading) {
      saveJSON(STORAGE.profile, profile);
    }
  }, [profile, loading]);

  /* =======================================================
     LOAD LOCAL DATA
     ======================================================= */

  useEffect(() => {
    if (!firebaseUser) {
      return;
    }

    loadLocalData();
  }, [firebaseUser]);

  const loadLocalData = async () => {
    const savedCart = await loadJSON(STORAGE.cart, []);
    const savedProfile = await loadJSON(
      STORAGE.profile,
      {
        name: "",
        phone: "",
        email: firebaseUser?.email || "",
        role: "buyer",
        coins: 0,
      }
    );

    setCart(savedCart);
    setProfile(savedProfile);

    await loadProductsFromFirebase();
    await loadOrdersFromFirebase();
  };

  /* =======================================================
     FIRESTORE PROFILE
     ======================================================= */

  const loadProfile = async (user) => {
    try {
      const profileRef = doc(db, "users", user.uid);

      const profileData = {
        email: user.email || "",
        name: user.displayName || "",
        role:
          user.email &&
          user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
            ? "admin"
            : "buyer",
        coins: 0,
      };

      await setDoc(
        profileRef,
        {
          ...profileData,
          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      setProfile((old) => ({
        ...old,
        ...profileData,
      }));
    } catch (error) {
      console.log("Profile load error:", error);
    }
  };

  /* =======================================================
     LOAD PRODUCTS
     ======================================================= */

  const loadProductsFromFirebase = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "products")
      );

      const cloudProducts = snapshot.docs
        .map((item) => ({
          id: item.id,
          ...item.data(),
        }))
        .filter((item) => item.active !== false);

      if (cloudProducts.length > 0) {
        setProducts(cloudProducts);
      } else {
        const localProducts = await loadJSON(
          STORAGE.products,
          SEED_PRODUCTS
        );

        setProducts(
          localProducts?.length
            ? localProducts
            : SEED_PRODUCTS
        );
      }
    } catch (error) {
      console.log("Product load error:", error);

      const localProducts = await loadJSON(
        STORAGE.products,
        SEED_PRODUCTS
      );

      setProducts(
        localProducts?.length
          ? localProducts
          : SEED_PRODUCTS
      );
    }
  };

  /* =======================================================
     LOAD ORDERS
     ======================================================= */

  const loadOrdersFromFirebase = async () => {
    if (!firebaseUser) {
      return;
    }

    try {
      const ordersQuery = query(
        collection(db, "orders"),
        where("userId", "==", firebaseUser.uid)
      );

      const snapshot = await getDocs(ordersQuery);

      const cloudOrders = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setOrders(cloudOrders);
    } catch (error) {
      console.log("Order load error:", error);

      setOrders([]);
    }
  };

  /* =======================================================
     LOGIN / SIGNUP
     ======================================================= */

  const submitAuth = async () => {
    const email = loginEmail.trim().toLowerCase();
    const password = loginPassword;

    if (!email) {
      Alert.alert("Email", "Email डालें।");
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Password",
        "Password कम से कम 6 characters का होना चाहिए।"
      );
      return;
    }

    if (
      loginMode === "signup" &&
      !loginName.trim()
    ) {
      Alert.alert("Name", "अपना नाम डालें।");
      return;
    }

    try {
      setBusy(true);

      if (loginMode === "login") {
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      } else {
        const result =
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

        const role =
          email === ADMIN_EMAIL
            ? "admin"
            : "buyer";

        await setDoc(
          doc(db, "users", result.user.uid),
          {
            email,
            name: loginName.trim(),
            role,
            coins: 0,
            createdAt: serverTimestamp(),
          },
          {
            merge: true,
          }
        );

        setProfile({
          name: loginName.trim(),
          phone: "",
          email,
          role,
          coins: 0,
        });
      }
    } catch (error) {
      console.log("Auth error:", error);

      let message =
        "Login/Signup नहीं हो पाया।";

      if (
        error.code ===
        "auth/invalid-credential"
      ) {
        message =
          "Email या Password गलत है।";
      }

      if (
        error.code ===
        "auth/email-already-in-use"
      ) {
        message =
          "यह Email पहले से registered है। Login करें।";
      }

      if (
        error.code ===
        "auth/invalid-email"
      ) {
        message =
          "Email सही format में डालें।";
      }

      if (
        error.code ===
        "auth/weak-password"
      ) {
        message =
          "Password कम से कम 6 characters का रखें।";
      }

      Alert.alert(APP_NAME, message);
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);

      setFirebaseUser(null);
      setScreen("home");
      setSelectedProduct(null);
    } catch (error) {
      Alert.alert(
        "Logout",
        "Logout नहीं हो पाया।"
      );
    }
  };

  /* =======================================================
     PRODUCT FILTER
     ======================================================= */

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    return products.filter((product) => {
      if (product.active === false) {
        return false;
      }

      if (
        category !== "all" &&
        product.category !== category
      ) {
        return false;
      }

      if (!q) {
        return true;
      }

      return (
        String(product.name || "")
          .toLowerCase()
          .includes(q) ||
        String(product.description || "")
          .toLowerCase()
          .includes(q) ||
        String(
          categoryName(product.category)
        )
          .toLowerCase()
          .includes(q)
      );
    });
  }, [
    products,
    search,
    category,
  ]);

  /* =======================================================
     CART
     ======================================================= */

  const cartDetailed = useMemo(() => {
    return cart
      .map((item) => {
        const product = products.find(
          (p) => p.id === item.productId
        );

        if (!product) {
          return null;
        }

        return {
          ...item,
          product,
        };
      })
      .filter(Boolean);
  }, [cart, products]);

  const cartCount = cart.reduce(
    (sum, item) =>
      sum + Number(item.qty || 0),
    0
  );

  const cartTotal = cartDetailed.reduce(
    (sum, item) =>
      sum +
      Number(item.product.price || 0) *
        Number(item.qty || 0),
    0
  );

  const addToCart = (
    product,
    color = "",
    size = ""
  ) => {
    if (!product) {
      return;
    }

    if (Number(product.stock || 0) <= 0) {
      Alert.alert(
        "Out of Stock",
        "यह product अभी available नहीं है।"
      );
      return;
    }

    const availableColors =
      (product.colors || []).filter(
        (item) => item.available !== false
      );

    const availableSizes =
      (product.sizes || []).filter(
        (item) => item.available !== false
      );

    if (
      availableColors.length > 0 &&
      !color
    ) {
      Alert.alert(
        "Color चुनें",
        "Available color चुनें।"
      );
      return;
    }

    if (
      availableSizes.length > 0 &&
      !size
    ) {
      Alert.alert(
        "Size चुनें",
        "Available size चुनें।"
      );
      return;
    }

    setCart((current) => {
      const index = current.findIndex(
        (item) =>
          item.productId === product.id &&
          item.color === color &&
          item.size === size
      );

      if (index >= 0) {
        const copy = [...current];

        copy[index] = {
          ...copy[index],
          qty:
            Number(copy[index].qty || 0) + 1,
        };

        return copy;
      }

      return [
        ...current,
        {
          id: generateId("cart"),
          productId: product.id,
          name: product.name,
          price: Number(product.price || 0),
          image:
            product.images?.[0] || null,
          color,
          size,
          qty: 1,
        },
      ];
    });

    Alert.alert(
      "Cart",
      "Product cart में add हो गया।"
    );
  };

  const changeCartQty = (
    cartId,
    amount
  ) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === cartId
            ? {
                ...item,
                qty:
                  Number(item.qty || 0) +
                  amount,
              }
            : item
        )
        .filter(
          (item) => Number(item.qty) > 0
        )
    );
  };

  /* =======================================================
     PRODUCT IMAGE PICKER
     ======================================================= */

  const pickGalleryImages = async () => {
    if (newImages.length >= 10) {
      Alert.alert(
        "Maximum Photos",
        "एक product में maximum 10 photos रख सकते हैं।"
      );
      return;
    }

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission",
        "Gallery permission allow करें।"
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync(
        {
          mediaTypes:
            ImagePicker.MediaTypeOptions.Images,
          allowsMultipleSelection: true,
          selectionLimit:
            10 - newImages.length,
          quality: 0.85,
        }
      );

    if (!result.canceled) {
      const images =
        result.assets.map(
          (asset) => asset.uri
        );

      setNewImages((old) =>
        [...old, ...images].slice(0, 10)
      );
    }
  };

  const takeProductPhoto = async () => {
    if (newImages.length >= 10) {
      Alert.alert(
        "Maximum Photos",
        "एक product में maximum 10 photos रख सकते हैं।"
      );
      return;
    }

    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Camera Permission",
        "Camera permission allow करें।"
      );
      return;
    }

    const result =
      await ImagePicker.launchCameraAsync({
        mediaTypes:
          ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
      });

    if (
      !result.canceled &&
      result.assets?.[0]?.uri
    ) {
      setNewImages((old) =>
        [...old, result.assets[0].uri].slice(
          0,
          10
        )
      );
    }
  };

  const pickQRImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission",
        "Gallery permission allow करें।"
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync(
        {
          mediaTypes:
            ImagePicker.MediaTypeOptions.Images,
          quality: 1,
        }
      );

    if (
      !result.canceled &&
      result.assets?.[0]?.uri
    ) {
      setNewQR(
        result.assets[0].uri
      );
    }
  };

  /* =======================================================
     ADD PRODUCT TO FIRESTORE
     ======================================================= */

  const addProduct = async () => {
    if (profile.role !== "admin") {
      Alert.alert(
        "Admin Only",
        "Product publish करने के लिए authorized admin account चाहिए।"
      );
      return;
    }

    if (!newProduct.name.trim()) {
      Alert.alert(
        "Product Name",
        "Product name डालें।"
      );
      return;
    }

    const price = Number(
      newProduct.price
    );

    const mrp =
      Number(newProduct.mrp) || price;

    const stock =
      Number(newProduct.stock) || 0;

    if (!Number.isFinite(price) || price <= 0) {
      Alert.alert(
        "Price",
        "Valid price डालें।"
      );
      return;
    }

    const colors =
      newProduct.colors
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);

    const unavailableColors =
      newProduct.unavailableColors
        .split(",")
        .map((x) =>
          x.trim().toLowerCase()
        )
        .filter(Boolean);

    const sizes =
      newProduct.sizes
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);

    const product = {
      name: newProduct.name.trim(),

      description:
        newProduct.description.trim() ||
        "Quality product from Arishop.",

      price,

      mrp,

      discountPercent:
        mrp > price
          ? Math.round(
              ((mrp - price) / mrp) *
                100
            )
          : 0,

      category:
        newProduct.category,

      images: newImages,

      colors: colors.map(
        (name) => ({
          name,
          available:
            !unavailableColors.includes(
              name.toLowerCase()
            ),
        })
      ),

      sizes: sizes.map(
        (name) => ({
          name,
          available: true,
        })
      ),

      stock,

      cod: true,

      active: true,

      sellerId:
        firebaseUser?.uid || "admin",

      sellerName:
        newProduct.sellerName ||
        "Arishop",

      pickupLocation:
        newProduct.pickupLocation,

      sellerLat:
        newProduct.sellerLat
          ? Number(
              newProduct.sellerLat
            )
          : null,

      sellerLng:
        newProduct.sellerLng
          ? Number(
              newProduct.sellerLng
            )
          : null,

      qrImage: newQR,

      rating: 0,

      reviews: 0,

      createdAt:
        serverTimestamp(),
    };

    try {
      setBusy(true);

      const document =
        await addDoc(
          collection(db, "products"),
          product
        );

      const localProduct = {
        id: document.id,
        ...product,
        createdAt:
          new Date().toISOString(),
      };

      setProducts((old) => [
        localProduct,
        ...old,
      ]);

      setNewProduct({
        name: "",
        description: "",
        price: "",
        mrp: "",
        category: "tshirt",
        stock: "10",
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
        "Product Firestore में save हो गया।"
      );
    } catch (error) {
      console.log(
        "Add product error:",
        error
      );

      Alert.alert(
        "Product Error",
        "Product save नहीं हुआ। Firestore Rules और Firebase connection check करें।"
      );
    } finally {
      setBusy(false);
    }
  };

  /* =======================================================
     PLACE COD ORDER
     ======================================================= */

  const placeCODOrder = async () => {
    if (!firebaseUser) {
      Alert.alert(
        "Login Required",
        "पहले login करें।"
      );
      return;
    }

    if (!cartDetailed.length) {
      Alert.alert(
        "Cart Empty",
        "Cart में कोई product नहीं है।"
      );
      return;
    }

    if (
      !address.name.trim() ||
      !address.phone.trim() ||
      !address.address.trim() ||
      !address.pincode.trim()
    ) {
      Alert.alert(
        "Delivery Address",
        "नाम, phone, address और pincode भरें।"
      );
      return;
    }

    if (
      !/^\d{10}$/.test(
        address.phone.trim()
      )
    ) {
      Alert.alert(
        "Phone",
        "10 digit mobile number डालें।"
      );
      return;
    }

    if (
      !/^\d{6}$/.test(
        address.pincode.trim()
      )
    ) {
      Alert.alert(
        "Pincode",
        "6 digit pincode डालें।"
      );
      return;
    }

    const deliveryFee =
      deliveryMode === "fast"
        ? 40
        : 0;

    const subtotal = cartTotal;

    const total =
      subtotal + deliveryFee;

    const order = {
      userId:
        firebaseUser.uid,

      items: cartDetailed.map(
        (item) => ({
          productId:
            item.product.id,
          name:
            item.product.name,
          price:
            Number(
              item.product.price || 0
            ),
          qty:
            Number(item.qty || 0),
          color:
            item.color || "",
          size:
            item.size || "",
          image:
            item.product.images?.[0] ||
            null,
        })
      ),

      subtotal,

      deliveryFee,

      total,

      deliveryMode,

      paymentMode: "COD",

      paymentStatus: "COD",

      status: "PLACED",

      address: {
        ...address,
      },

      createdAt:
        serverTimestamp(),
    };

    try {
      setBusy(true);

      const document =
        await addDoc(
          collection(db, "orders"),
          order
        );

      setOrders((old) => [
        {
          id: document.id,
          ...order,
          createdAt:
            new Date().toISOString(),
        },
        ...old,
      ]);

      setCart([]);

      setScreen("orders");

      Alert.alert(
        "Order Placed",
        `आपका COD order ${document.id} create हो गया है।`
      );
    } catch (error) {
      console.log(
        "Order error:",
        error
      );

      Alert.alert(
        "Order Error",
        "Order save नहीं हुआ। Firestore Rules check करें।"
      );
    } finally {
      setBusy(false);
    }
  };

  /* =======================================================
     SELECT PRODUCT
     ======================================================= */

  const openProduct = (
    product
  ) => {
    setSelectedProduct(product);

    const firstColor =
      (product.colors || [])
        .find(
          (item) =>
            item.available !== false
        )?.name || "";

    const firstSize =
      (product.sizes || [])
        .find(
          (item) =>
            item.available !== false
        )?.name || "";

    setSelectedColor(firstColor);
    setSelectedSize(firstSize);
    setDeliveryMode("standard");

    setScreen("product");
  };

  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <SafeAreaView
        style={styles.center}
      >
        <ActivityIndicator
          size="large"
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Arishop शुरू हो रहा है...
        </Text>
      </SafeAreaView>
    );
  }

  /* =======================================================
     AUTH SCREEN
     ======================================================= */

  if (!firebaseUser) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={
            styles.loginContainer
          }
        >
          <Text
            style={styles.bigLogo}
          >
            Ari
            <Text
              style={
                styles.logoAccent
              }
            >
              shop
            </Text>
          </Text>

          <Text
            style={styles.subtitle}
          >
            Shopping made simple
          </Text>

          <View
            style={styles.card}
          >
            <Text
              style={styles.h1}
            >
              {loginMode === "login"
                ? "Login"
                : "Create Account"}
            </Text>

            {loginMode ===
              "signup" && (
              <>
                <Text
                  style={styles.label}
                >
                  Name
                </Text>

                <TextInput
                  style={styles.input}
                  value={loginName}
                  onChangeText={
                    setLoginName
                  }
                  placeholder="अपना नाम"
                />
              </>
            )}

            <Text
              style={styles.label}
            >
              Email
            </Text>

            <TextInput
              style={styles.input}
              value={loginEmail}
              onChangeText={
                setLoginEmail
              }
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text
              style={styles.label}
            >
              Password
            </Text>

            <TextInput
              style={styles.input}
              value={loginPassword}
              onChangeText={
                setLoginPassword
              }
              placeholder="कम से कम 6 characters"
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.primary}
              onPress={submitAuth}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator
                  color="#fff"
                />
              ) : (
                <Text
                  style={
                    styles.primaryText
                  }
                >
                  {loginMode ===
                  "login"
                    ? "Login"
                    : "Create Account"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() =>
                setLoginMode(
                  loginMode ===
                    "login"
                    ? "signup"
                    : "login"
                )
              }
            >
              <Text
                style={
                  styles.switchText
                }
              >
                {loginMode ===
                "login"
                  ? "नया account बनाएं → Sign Up"
                  : "पहले से account है → Login"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* =======================================================
     HEADER
     ======================================================= */

  const Header = () => (
    <View
      style={styles.header}
    >
      <TouchableOpacity
        onPress={() =>
          setScreen("home")
        }
      >
        <Text
          style={styles.logo}
        >
          Ari
          <Text
            style={
              styles.logoAccent
            }
          >
            shop
          </Text>
        </Text>
      </TouchableOpacity>

      <View
        style={
          styles.headerActions
        }
      >
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() =>
            setScreen("cart")
          }
        >
          <Text>
            🛒 {cartCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() =>
            setScreen("profile")
          }
        >
          <Text>👤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /* =======================================================
     BOTTOM NAVIGATION
     ======================================================= */

  const BottomNav = () => (
    <View
      style={styles.bottomNav}
    >
      <TouchableOpacity
        style={styles.navItem}
        onPress={() =>
          setScreen("home")
        }
      >
        <Text>🏠</Text>
        <Text>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() =>
          setScreen("cart")
        }
      >
        <Text>🛒</Text>
        <Text>Cart</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() =>
          setScreen("orders")
        }
      >
        <Text>📦</Text>
        <Text>Orders</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() =>
          setScreen("profile")
        }
      >
        <Text>👤</Text>
        <Text>You</Text>
      </TouchableOpacity>
    </View>
  );

  /* =======================================================
     HOME
     ======================================================= */

  const HomeScreen = () => (
    <SafeAreaView
      style={styles.container}
    >
      <Header />

      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        <TextInput
          style={styles.search}
          value={search}
          onChangeText={setSearch}
          placeholder="🔍 Search products"
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          style={{
            marginBottom: 15,
          }}
        >
          {CATEGORIES.map(
            (item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() =>
                  setCategory(
                    item.id
                  )
                }
                style={[
                  styles.category,
                  category ===
                    item.id &&
                    styles.categoryActive,
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
                    styles.categoryText
                  }
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>

        <View
          style={styles.hero}
        >
          <Text
            style={styles.heroTitle}
          >
            Arishop Mega Deals
          </Text>

          <Text
            style={styles.heroSub}
          >
            Fashion • Anime • Pants • Shoes • Electronics
          </Text>

          <Text
            style={styles.heroSmall}
          >
            Standard delivery 1–7 days
          </Text>

          <Text
            style={styles.heroSmall}
          >
            Fast delivery, where eligible: 1–3 days +₹40
          </Text>
        </View>

        <View
          style={styles.sectionRow}
        >
          <Text
            style={styles.h2}
          >
            Products
          </Text>

          <Text
            style={styles.muted}
          >
            {filteredProducts.length} items
          </Text>
        </View>

        <View
          style={styles.grid}
        >
          {filteredProducts.map(
            (product) => (
              <View
                key={product.id}
                style={
                  styles.productCard
                }
              >
                <TouchableOpacity
                  onPress={() =>
                    openProduct(
                      product
                    )
                  }
                >
                  {product.images?.[0] ? (
                    <Image
                      source={{
                        uri: product
                          .images[0],
                      }}
                      style={
                        styles.productImage
                      }
                    />
                  ) : (
                    <View
                      style={
                        styles.placeholderImage
                      }
                    >
                      <Text
                        style={{
                          fontSize: 45,
                        }}
                      >
                        🛍️
                      </Text>
                    </View>
                  )}

                  <View
                    style={{
                      padding: 10,
                    }}
                  >
                    <Text
                      numberOfLines={2}
                      style={
                        styles.productTitle
                      }
                    >
                      {product.name}
                    </Text>

                    <Text
                      numberOfLines={2}
                      style={
                        styles.muted
                      }
                    >
                      {
                        product.description
                      }
                    </Text>

                    <Text
                      style={
                        styles.rating
                      }
                    >
                      ⭐{" "}
                      {product.rating ||
                        "New"}
                    </Text>

                    <Text
                      style={
                        styles.price
                      }
                    >
                      {money(
                        product.price
                      )}
                    </Text>

                    {Number(
                      product.mrp
                    ) >
                      Number(
                        product.price
                      ) && (
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

                    <Text
                      style={
                        styles.stock
                      }
                    >
                      {Number(
                        product.stock
                      ) > 0
                        ? `${product.stock} available`
                        : "Out of stock"}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.primary,
                    Number(
                      product.stock
                    ) <= 0 &&
                      styles.disabled,
                  ]}
                  disabled={
                    Number(
                      product.stock
                    ) <= 0
                  }
                  onPress={() =>
                    openProduct(
                      product
                    )
                  }
                >
                  <Text
                    style={
                      styles.primaryText
                    }
                  >
                    View Product
                  </Text>
                </TouchableOpacity>
              </View>
            )
          )}
        </View>
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );

  /* =======================================================
     PRODUCT SCREEN
     ======================================================= */

  const ProductScreen = () => {
    if (!selectedProduct) {
      return <HomeScreen />;
    }

    const fastFee =
      deliveryMode ===
      "fast"
        ? 40
        : 0;

    const total =
      Number(
        selectedProduct.price ||
          0
      ) + fastFee;

    const colors =
      selectedProduct.colors ||
      [];

    const sizes =
      selectedProduct.sizes ||
      [];

    return (
      <SafeAreaView
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={
            styles.content
          }
        >
          <TouchableOpacity
            onPress={() =>
              setScreen("home")
            }
          >
            <Text
              style={styles.back}
            >
              ← Back
            </Text>
          </TouchableOpacity>

          {selectedProduct
            .images?.[0] ? (
            <Image
              source={{
                uri: selectedProduct
                  .images[0],
              }}
              style={
                styles.detailImage
              }
            />
          ) : (
            <View
              style={
                styles.detailPlaceholder
              }
            >
              <Text
                style={{
                  fontSize: 80,
                }}
              >
                🛍️
              </Text>
            </View>
          )}

          <Text
            style={styles.h1}
          >
            {
              selectedProduct.name
            }
          </Text>

          <Text
            style={styles.rating}
          >
            ⭐{" "}
            {selectedProduct.rating ||
              "New"}
          </Text>

          <Text
            style={styles.price}
          >
            {money(
              selectedProduct.price
            )}
          </Text>

          {Number(
            selectedProduct.mrp
          ) >
            Number(
              selectedProduct.price
            ) && (
            <Text
              style={styles.mrp}
            >
              {money(
                selectedProduct.mrp
              )}
            </Text>
          )}

          <Text
            style={
              styles.description
            }
          >
            {
              selectedProduct.description
            }
          </Text>

          {colors.length > 0 && (
            <>
              <Text
                style={styles.h2}
              >
                Color
              </Text>

              <View
                style={styles.chips}
              >
                {colors.map(
                  (color) => (
                    <TouchableOpacity
                      key={
                        color.name
                      }
                      disabled={
                        color.available ===
                        false
                      }
                      onPress={() =>
                        setSelectedColor(
                          color.name
                        )
                      }
                      style={[
                        styles.chip,
                        selectedColor ===
                          color.name &&
                          styles.chipActive,
                        color.available ===
                          false &&
                          styles.chipDisabled,
                      ]}
                    >
                      <Text
                        style={
                          selectedColor ===
                            color.name &&
                          color.available !==
                            false
                            ? styles.chipActiveText
                            : styles.chipText
                        }
                      >
                        {color.name}
                        {color.available ===
                          false
                          ? " ❌"
                          : ""}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </>
          )}

          {sizes.length > 0 && (
            <>
              <Text
                style={styles.h2}
              >
                Size
              </Text>

              <View
                style={styles.chips}
              >
                {sizes.map(
                  (size) => (
                    <TouchableOpacity
                      key={
                        size.name
                      }
                      disabled={
                        size.available ===
                        false
                      }
                      onPress={() =>
                        setSelectedSize(
                          size.name
                        )
                      }
                      style={[
                        styles.chip,
                        selectedSize ===
                          size.name &&
                          styles.chipActive,
                      ]}
                    >
                      <Text
                        style={
                          selectedSize ===
                            size.name &&
                          size.available !==
                            false
                            ? styles.chipActiveText
                            : styles.chipText
                        }
                      >
                        {size.name}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </>
          )}

          <Text
            style={styles.h2}
          >
            Delivery
          </Text>

          <TouchableOpacity
            style={[
              styles.option,
              deliveryMode ===
                "standard" &&
                styles.optionActive,
            ]}
            onPress={() =>
              setDeliveryMode(
                "standard"
              )
            }
          >
            <Text>
              📦 Standard delivery • 1–7 days • Free
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.option,
              deliveryMode ===
                "fast" &&
                styles.optionActive,
            ]}
            onPress={() =>
              setDeliveryMode("fast")
            }
          >
            <Text>
              ⚡ Fast delivery • 1–3 days • +₹40
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              styles.secondary
            }
            onPress={() =>
              addToCart(
                selectedProduct,
                selectedColor,
                selectedSize
              )
            }
          >
            <Text
              style={
                styles.secondaryText
              }
            >
              🛒 Add to Cart
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primary}
            onPress={() => {
              addToCart(
                selectedProduct,
                selectedColor,
                selectedSize
              );

              setScreen("cart");
            }}
          >
            <Text
              style={
                styles.primaryText
              }
            >
              Buy Now • {money(total)}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  };

  /* =======================================================
     CART SCREEN
     ======================================================= */

  const CartScreen = () => (
    <SafeAreaView
      style={styles.container}
    >
      <Header />

      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        <Text
          style={styles.h1}
        >
          Your Cart
        </Text>

        {!cartDetailed.length ? (
          <View
            style={styles.empty}
          >
            <Text
              style={
                styles.emptyIcon
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

            <TouchableOpacity
              style={styles.primary}
              onPress={() =>
                setScreen("home")
              }
            >
              <Text
                style={
                  styles.primaryText
                }
              >
                Shopping शुरू करें
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {cartDetailed.map(
              (item) => (
                <View
                  key={item.id}
                  style={
                    styles.cartRow
                  }
                >
                  {item.product
                    .images?.[0] ? (
                    <Image
                      source={{
                        uri: item.product
                          .images[0],
                      }}
                      style={
                        styles.cartImage
                      }
                    />
                  ) : (
                    <View
                      style={
                        styles.cartPlaceholder
                      }
                    >
                      <Text>🛍️</Text>
                    </View>
                  )}

                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <Text
                      style={
                        styles.productTitle
                      }
                    >
                      {
                        item.product
                          .name
                      }
                    </Text>

                    <Text
                      style={
                        styles.muted
                      }
                    >
                      {item.color
                        ? `Color: ${item.color}`
                        : ""}
                    </Text>

                    <Text
                      style={
                        styles.muted
                      }
                    >
                      {item.size
                        ? `Size: ${item.size}`
                        : ""}
                    </Text>

                    <Text
                      style={styles.price}
                    >
                      {money(
                        item.product
                          .price
                      )}
                    </Text>

                    <View
                      style={
                        styles.qtyRow
                      }
                    >
                      <TouchableOpacity
                        style={
                          styles.qtyButton
                        }
                        onPress={() =>
                          changeCartQty(
                            item.id,
                            -1
                          )
                        }
                      >
                        <Text>
                          −
                        </Text>
                      </TouchableOpacity>

                      <Text
                        style={
                          styles.qtyText
                        }
                      >
                        {item.qty}
                      </Text>

                      <TouchableOpacity
                        style={
                          styles.qtyButton
                        }
                        onPress={() =>
                          changeCartQty(
                            item.id,
                            1
                          )
                        }
                      >
                        <Text>
                          +
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )
            )}

            <View
              style={
                styles.totalBox
              }
            >
              <Text
                style={styles.h2}
              >
                Total
              </Text>

              <Text
                style={styles.price}
              >
                {money(cartTotal)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primary}
              onPress={() =>
                setScreen(
                  "checkout"
                )
              }
            >
              <Text
                style={
                  styles.primaryText
                }
              >
                Proceed to Checkout
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );

  /* =======================================================
     CHECKOUT
     ======================================================= */

  const CheckoutScreen = () => {
    const deliveryFee =
      deliveryMode ===
      "fast"
        ? 40
        : 0;

    const total =
      cartTotal +
      deliveryFee;

    return (
      <SafeAreaView
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={
            styles.content
          }
        >
          <TouchableOpacity
            onPress={() =>
              setScreen("cart")
            }
          >
            <Text
              style={styles.back}
            >
              ← Cart
            </Text>
          </TouchableOpacity>

          <Text
            style={styles.h1}
          >
            Checkout
          </Text>

          <View
            style={styles.card}
          >
            <Text
              style={styles.h2}
            >
              Order Summary
            </Text>

            <Text
              style={styles.muted}
            >
              Products:{" "}
              {money(cartTotal)}
            </Text>

            <Text
              style={styles.muted}
            >
              Delivery:{" "}
              {money(deliveryFee)}
            </Text>

            <Text
              style={styles.price}
            >
              Total:{" "}
              {money(total)}
            </Text>
          </View>

          <Text
            style={styles.h2}
          >
            Delivery Address
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Full name"
            value={address.name}
            onChangeText={(value) =>
              setAddress((old) => ({
                ...old,
                name: value,
              }))
            }
          />

          <TextInput
            style={styles.input}
            placeholder="10-digit phone"
            keyboardType="phone-pad"
            maxLength={10}
            value={address.phone}
            onChangeText={(value) =>
              setAddress((old) => ({
                ...old,
                phone: value,
              }))
            }
          />

          <TextInput
            style={styles.input}
            placeholder="House / Street / Area"
            multiline
            value={address.address}
            onChangeText={(value) =>
              setAddress((old) => ({
                ...old,
                address: value,
              }))
            }
          />

          <TextInput
            style={styles.input}
            placeholder="City"
            value={address.city}
            onChangeText={(value) =>
              setAddress((old) => ({
                ...old,
                city: value,
              }))
            }
          />

          <TextInput
            style={styles.input}
            placeholder="6-digit Pincode"
            keyboardType="numeric"
            maxLength={6}
            value={address.pincode}
            onChangeText={(value) =>
              setAddress((old) => ({
                ...old,
                pincode: value,
              }))
            }
          />

          <Text
            style={styles.h2}
          >
            Delivery
          </Text>

          <TouchableOpacity
            style={[
              styles.option,
              deliveryMode ===
                "standard" &&
                styles.optionActive,
            ]}
            onPress={() =>
              setDeliveryMode(
                "standard"
              )
            }
          >
            <Text>
              📦 Standard • 1–7 days • Free
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.option,
              deliveryMode ===
                "fast" &&
                styles.optionActive,
            ]}
            onPress={() =>
              setDeliveryMode("fast")
            }
          >
            <Text>
              ⚡ Fast • 1–3 days • +₹40
            </Text>
          </TouchableOpacity>

          <Text
            style={styles.h2}
          >
            Payment
          </Text>

          <TouchableOpacity
            style={styles.primary}
            onPress={
              placeCODOrder
            }
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator
                color="#fff"
              />
            ) : (
              <Text
                style={
                  styles.primaryText
                }
              >
                Cash on Delivery •{" "}
                {money(total)}
              </Text>
            )}
          </TouchableOpacity>

          <View
            style={styles.warning}
          >
            <Text
              style={{
                color: "#92400e",
              }}
            >
              Online payment अभी बंद है। Real payment gateway और server-side verification जोड़ने के बाद ही online payment enable करेंगे।
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };

  /* =======================================================
     ORDERS
     ======================================================= */

  const OrdersScreen = () => (
    <SafeAreaView
      style={styles.container}
    >
      <Header />

      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        <Text
          style={styles.h1}
        >
          My Orders
        </Text>

        {!orders.length ? (
          <View
            style={styles.empty}
          >
            <Text
              style={
                styles.emptyIcon
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
                style={styles.card}
              >
                <Text
                  style={
                    styles.productTitle
                  }
                >
                  Order #{order.id}
                </Text>

                <Text
                  style={styles.muted}
                >
                  Status:{" "}
                  {order.status ||
                    "PLACED"}
                </Text>

                <Text
                  style={styles.muted}
                >
                  Payment:{" "}
                  {order.paymentMode ||
                    "COD"}
                </Text>

                <Text
                  style={styles.price}
                >
                  {money(
                    order.total
                  )}
                </Text>

                <TouchableOpacity
                  style={
                    styles.secondary
                  }
                  onPress={() =>
                    Alert.alert(
                      "Refund / Cancellation",
                      "Refund/cancellation को अभी backend workflow से connect करना बाकी है। App झूठा success नहीं दिखाएगा।"
                    )
                  }
                >
                  <Text
                    style={
                      styles.secondaryText
                    }
                  >
                    Request Cancellation / Refund
                  </Text>
                </TouchableOpacity>
              </View>
            )
          )
        )}
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );

  /* =======================================================
     PROFILE
     ======================================================= */

  const ProfileScreen = () => (
    <SafeAreaView
      style={styles.container}
    >
      <Header />

      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        <Text
          style={styles.h1}
        >
          My Account
        </Text>

        <View
          style={styles.card}
        >
          <Text
            style={styles.h2}
          >
            {profile.name ||
              "Arishop User"}
          </Text>

          <Text
            style={styles.muted}
          >
            {firebaseUser.email}
          </Text>

          <Text
            style={styles.muted}
          >
            Role:{" "}
            {profile.role}
          </Text>

          <Text
            style={styles.muted}
          >
            Coins:{" "}
            {profile.coins || 0}
          </Text>
        </View>

        {profile.role ===
          "admin" && (
          <TouchableOpacity
            style={styles.primary}
            onPress={() =>
              setScreen("admin")
            }
          >
            <Text
              style={
                styles.primaryText
              }
            >
              ⚙️ Admin Dashboard
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.option}
          onPress={() =>
            setScreen("orders")
          }
        >
          <Text>
            📦 My Orders
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() =>
            Linking.openURL(
              `tel:${SUPPORT_PHONE}`
            )
          }
        >
          <Text>
            📞 Customer Support
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() =>
            Alert.alert(
              "Privacy Policy",
              "Production launch से पहले official Privacy Policy URL जोड़ना जरूरी है।"
            )
          }
        >
          <Text>
            🔒 Privacy Policy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={logout}
        >
          <Text
            style={{
              color: "#dc2626",
              fontWeight: "800",
            }}
          >
            Log Out
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );

  /* =======================================================
     ADMIN
     ======================================================= */

  const AdminScreen = () => (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        <TouchableOpacity
          onPress={() =>
            setScreen("home")
          }
        >
          <Text
            style={styles.back}
          >
            ← Home
          </Text>
        </TouchableOpacity>

        <Text
          style={styles.h1}
        >
          Admin Dashboard
        </Text>

        <View
          style={styles.warning}
        >
          <Text
            style={{
              color: "#92400e",
            }}
          >
            यह UI admin access दिखाती है, लेकिन production security के लिए Firestore Security Rules में admin authorization लगाना जरूरी है।
          </Text>
        </View>

        <View
          style={styles.card}
        >
          <Text
            style={styles.h2}
          >
            Add Product
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Product name"
            value={newProduct.name}
            onChangeText={(value) =>
              setNewProduct((old) => ({
                ...old,
                name: value,
              }))
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Selling price"
            keyboardType="numeric"
            value={newProduct.price}
            onChangeText={(value) =>
              setNewProduct((old) => ({
                ...old,
                price: value,
              }))
            }
          />

          <TextInput
            style={styles.input}
            placeholder="MRP"
            keyboardType="numeric"
            value={newProduct.mrp}
            onChangeText={(value) =>
              setNewProduct((old) => ({
                ...old,
                mrp: value,
              }))
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Stock quantity"
            keyboardType="numeric"
            value={newProduct.stock}
            onChangeText={(value) =>
              setNewProduct((old) => ({
                ...old,
                stock: value,
              }))
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Description"
            multiline
            value={
              newProduct.description
            }
            onChangeText={(value) =>
              setNewProduct((old) => ({
                ...old,
                description: value,
              }))
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Colors: Black, White, Blue"
            value={
              newProduct.colors
            }
            onChangeText={(value) =>
              setNewProduct((old) => ({
                ...old,
                colors: value,
              }))
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Unavailable colors: Blue, Red"
            value={
              newProduct.unavailableColors
            }
            onChangeText={(value) =>
              setNewProduct((old) => ({
                ...old,
                unavailableColors:
                  value,
              }))
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Sizes: S, M, L, XL"
            value={
              newProduct.sizes
            }
            onChangeText={(value) =>
              setNewProduct((old) => ({
                ...old,
                sizes: value,
              }))
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Pickup location"
            value={
              newProduct.pickupLocation
            }
            onChangeText={(value) =>
              setNewProduct((old) => ({
                ...old,
                pickupLocation:
                  value,
              }))
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Seller name"
            value={
              newProduct.sellerName
            }
            onChangeText={(value) =>
              setNewProduct((old) => ({
                ...old,
                sellerName: value,
              }))
            }
          />

          <Text
            style={styles.label}
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
              (item) =>
                item.id !== "all"
            ).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.chip,
                  newProduct.category ===
                    item.id &&
                    styles.chipActive,
                ]}
                onPress={() =>
                  setNewProduct(
                    (old) => ({
                      ...old,
                      category:
                        item.id,
                    })
                  )
                }
              >
                <Text
                  style={
                    newProduct.category ===
                    item.id
                      ? styles.chipActiveText
                      : styles.chipText
                  }
                >
                  {item.icon}{" "}
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.secondary}
            onPress={
              takeProductPhoto
            }
          >
            <Text
              style={
                styles.secondaryText
              }
            >
              📷 Camera से Photo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondary}
            onPress={
              pickGalleryImages
            }
          >
            <Text
              style={
                styles.secondaryText
              }
            >
              🖼️ Gallery से Photos
            </Text>
          </TouchableOpacity>

          {newImages.length >
            0 && (
            <Text
              style={styles.muted}
            >
              {newImages.length} photos selected
            </Text>
          )}

          <TouchableOpacity
            style={styles.secondary}
            onPress={
              pickQRImage
            }
          >
            <Text
              style={
                styles.secondaryText
              }
            >
              🔳 Own UPI QR Photo
            </Text>
          </TouchableOpacity>

          {newQR && (
            <Text
              style={styles.muted}
            >
              QR image selected
            </Text>
          )}

          <TouchableOpacity
            style={styles.primary}
            onPress={addProduct}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator
                color="#fff"
              />
            ) : (
              <Text
                style={
                  styles.primaryText
                }
              >
                Publish Product
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  /* =======================================================
     SCREEN ROUTER
     ======================================================= */

  if (screen === "product") {
    return (
      <ProductScreen />
    );
  }

  if (screen === "cart") {
    return <CartScreen />;
  }

  if (screen === "checkout") {
    return (
      <CheckoutScreen />
    );
  }

  if (screen === "orders") {
    return <OrdersScreen />;
  }

  if (screen === "profile") {
    return (
      <ProfileScreen />
    );
  }

  if (screen === "admin") {
    return <AdminScreen />;
  }

  return <HomeScreen />;
}

/* =========================================================
   STYLES
   ========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f7fb",
    padding: 20,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },

  loginContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },

  bigLogo: {
    fontSize: 44,
    fontWeight: "900",
    textAlign: "center",
    color: "#111827",
  },

  logo: {
    fontSize: 27,
    fontWeight: "900",
    color: "#111827",
  },

  logoAccent: {
    color: "#1463ff",
  },

  subtitle: {
    textAlign: "center",
    color: "#64748b",
    marginTop: 5,
    marginBottom: 25,
  },

  header: {
    height: 62,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  headerActions: {
    flexDirection: "row",
    gap: 8,
  },

  iconButton: {
    backgroundColor: "#eef2ff",
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 10,
  },

  content: {
    padding: 15,
    paddingBottom: 100,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  h1: {
    fontSize: 25,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 14,
  },

  h2: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
  },

  label: {
    fontSize: 12,
    color: "#475569",
    marginTop: 8,
    marginBottom: 5,
  },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dbe2ea",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 9,
    color: "#111827",
  },

  primary: {
    backgroundColor: "#1463ff",
    borderRadius: 11,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 8,
  },

  primaryText: {
    color: "#fff",
    fontWeight: "800",
  },

  secondary: {
    backgroundColor: "#fff",
    borderRadius: 11,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1463ff",
    marginTop: 8,
  },

  secondaryText: {
    color: "#1463ff",
    fontWeight: "800",
  },

  switchButton: {
    padding: 15,
    alignItems: "center",
  },

  switchText: {
    color: "#1463ff",
    fontWeight: "700",
  },

  search: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  },

  category: {
    width: 82,
    alignItems: "center",
    marginRight: 8,
    padding: 8,
    borderRadius: 12,
  },

  categoryActive: {
    backgroundColor: "#e8efff",
  },

  categoryIcon: {
    fontSize: 28,
    marginBottom: 4,
  },

  categoryText: {
    fontSize: 11,
    color: "#334155",
    textAlign: "center",
  },

  hero: {
    backgroundColor: "#1463ff",
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
  },

  heroTitle: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "900",
  },

  heroSub: {
    color: "#dbeafe",
    marginTop: 5,
  },

  heroSmall: {
    color: "#dbeafe",
    fontSize: 12,
    marginTop: 8,
  },

  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  muted: {
    color: "#64748b",
    fontSize: 12,
    marginBottom: 4,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  productCard: {
    width: "48.5%",
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
    paddingBottom: 8,
  },

  productImage: {
    width: "100%",
    height: 145,
    backgroundColor: "#e2e8f0",
  },

  placeholderImage: {
    width: "100%",
    height: 145,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },

  detailImage: {
    width: "100%",
    height: 320,
    borderRadius: 16,
    backgroundColor: "#e2e8f0",
    marginBottom: 14,
  },

  detailPlaceholder: {
    width: "100%",
    height: 320,
    borderRadius: 16,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  productTitle: {
    color: "#111827",
    fontWeight: "800",
    fontSize: 14,
    marginBottom: 4,
  },

  description: {
    color: "#475569",
    lineHeight: 21,
    marginVertical: 12,
  },

  rating: {
    color: "#d97706",
    fontSize: 12,
    marginVertical: 4,
  },

  price: {
    color: "#1463ff",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 4,
  },

  mrp: {
    color: "#94a3b8",
    textDecorationLine: "line-through",
    fontSize: 12,
    marginTop: 2,
  },

  stock: {
    color: "#16a34a",
    fontSize: 11,
    marginTop: 4,
  },

  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },

  chip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 9,
    marginRight: 7,
    marginBottom: 7,
  },

  chipActive: {
    backgroundColor: "#1463ff",
    borderColor: "#1463ff",
  },

  chipDisabled: {
    backgroundColor: "#f1f5f9",
    borderColor: "#cbd5e1",
  },

  chipText: {
    color: "#334155",
    fontWeight: "700",
    fontSize: 12,
  },

  chipActiveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },

  option: {
    backgroundColor: "#fff",
    padding: 14,
    borderWidth: 1,
    borderColor: "#dbe2ea",
    borderRadius: 11,
    marginBottom: 8,
  },

  optionActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#1463ff",
  },

  back: {
    color: "#1463ff",
    fontWeight: "800",
    marginBottom: 12,
  },

  cartRow: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 10,
    flexDirection: "row",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  cartImage: {
    width: 82,
    height: 82,
    borderRadius: 10,
    marginRight: 10,
  },

  cartPlaceholder: {
    width: 82,
    height: 82,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  qtyButton: {
    width: 32,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef2ff",
    borderRadius: 7,
  },

  qtyText: {
    marginHorizontal: 12,
    fontWeight: "800",
  },

  totalBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },

  warning: {
    color: "#92400e",
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
  },

  disabled: {
    backgroundColor: "#94a3b8",
  },

  empty: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#fff",
    borderRadius: 16,
  },

  emptyIcon: {
    fontSize: 50,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 10,
  },

  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 66,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    flexDirection: "row",
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
