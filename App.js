import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

/**
 * Arishop — production-oriented single-file frontend foundation.
 *
 * IMPORTANT:
 * - This file deliberately DOES NOT fake Firebase OTP, Razorpay, Shiprocket,
 *   GPS, refunds, or cloud sync.
 * - Connect the service functions to your real backend before production.
 * - Never put payment gateway secret keys in this file.
 *
 * Required packages:
 *   npx expo install @react-native-async-storage/async-storage expo-image-picker
 *
 * Recommended production architecture:
 *   Firebase Auth + Firestore/Storage + Cloud Functions/your API
 *   Payment gateway from a server-created order + server verification
 *   Shipping provider API from your server
 */

const APP_NAME = "Arishop";
const SUPPORT_PHONE = "9205013660";
const ADMIN_EMAIL = "sahil.admin@arishop.com";
const ADMIN_ROLE = "admin";

const STORAGE = {
  session: "@arishop/session/v2",
  cart: "@arishop/cart/v2",
  orders: "@arishop/orders/v2",
  products: "@arishop/products/v2",
  profile: "@arishop/profile/v2",
};

const SEED_PRODUCTS = [
  {
    id: "p1",
    title: "Men Stylish Winter Jacket & Shoes Combo",
    category: "Fashion",
    price: 1499,
    mrp: 1799,
    discountPercent: 17,
    description: "Premium winter wear and sports shoes combo for men.",
    images: [
      "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=900",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900",
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 25,
    cod: true,
    rating: 4.5,
    reviews: 128,
    sellerName: "Arishop",
  },
  {
    id: "p2",
    title: "Latest 5G Smartphone & Gadgets",
    category: "Mobiles",
    price: 18999,
    mrp: 20999,
    discountPercent: 10,
    description:
      "High-performance smartphone with large battery and AMOLED display.",
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900",
    ],
    sizes: ["128GB", "256GB"],
    stock: 12,
    cod: false,
    rating: 4.8,
    reviews: 340,
    sellerName: "Arishop",
  },
];

const CATEGORIES = [
  [
    "All",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150",
  ],
  [
    "Electronics",
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=150",
  ],
  [
    "Fashion",
    "https://images.unsplash.com/photo-1445205170230-053b83016050?w=150",
  ],
  [
    "Mobiles",
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150",
  ],
  [
    "Home",
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=150",
  ],
  [
    "Beauty",
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=150",
  ],
  [
    "Grocery",
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=150",
  ],
  [
    "Sports",
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=150",
  ],
];

const money = (n) =>
  `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

async function loadJSON(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

async function saveJSON(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/**
 * Replace these with your real backend calls.
 * The app never claims that an operation succeeded until these functions
 * return success.
 */
const api = {
  async createPaymentOrder({ amount, orderId }) {
    // TODO: POST to your backend. Backend creates the gateway order.
    // NEVER create/verify gateway orders with a secret key inside the app.
    return {
      ok: false,
      error: "PAYMENT_BACKEND_NOT_CONFIGURED",
    };
  },

  async verifyPayment(payload) {
    // TODO: POST gateway response/signature to your backend.
    return {
      ok: false,
      error: "PAYMENT_BACKEND_NOT_CONFIGURED",
    };
  },

  async createShippingOrder(order) {
    // TODO: POST to your backend; backend talks to Shiprocket/Delhivery.
    return {
      ok: false,
      error: "SHIPPING_BACKEND_NOT_CONFIGURED",
    };
  },

  async requestRefund(orderId) {
    // TODO: POST refund request to your backend.
    return {
      ok: false,
      error: "REFUND_BACKEND_NOT_CONFIGURED",
    };
  },

  async uploadProductImage(uri) {
    // TODO: upload to Firebase Storage/S3/Cloudinary from a secure architecture.
    return {
      ok: false,
      error: "IMAGE_STORAGE_NOT_CONFIGURED",
      uri,
    };
  },
};

export default function App() {
  const [loading, setLoading] = useState(true);

  const [session, setSession] = useState(null);

  const [products, setProducts] = useState(SEED_PRODUCTS);

  const [cart, setCart] = useState([]);

  const [orders, setOrders] = useState([]);

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    email: "",
    role: "buyer",
  });

  const [screen, setScreen] = useState("home");

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("All");

  const [selected, setSelected] = useState(null);

  const [selectedVariant, setSelectedVariant] = useState("");

  const [fastDelivery, setFastDelivery] = useState(false);

  const [showAdmin, setShowAdmin] = useState(false);

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    pincode: "",
    line1: "",
    landmark: "",
  });

  const [newProduct, setNewProduct] = useState({
    title: "",
    price: "",
    mrp: "",
    category: "Fashion",
    description: "",
    stock: "10",
    cod: true,
  });

  const [newImages, setNewImages] = useState([]);

  const [loginPhone, setLoginPhone] = useState("");

  const [loginName, setLoginName] = useState("");

  const [loginCode, setLoginCode] = useState("");

  const [loginStep, setLoginStep] = useState("phone");

  const [modal, setModal] = useState(null);

  useEffect(() => {
    (async () => {
      const [s, c, o, p, prod] = await Promise.all([
        loadJSON(STORAGE.session, null),
        loadJSON(STORAGE.cart, []),
        loadJSON(STORAGE.orders, []),
        loadJSON(STORAGE.profile, {
          name: "",
          phone: "",
          email: "",
          role: "buyer",
        }),
        loadJSON(STORAGE.products, SEED_PRODUCTS),
      ]);

      setSession(s);
      setCart(c);
      setOrders(o);
      setProfile(p);
      setProducts(prod?.length ? prod : SEED_PRODUCTS);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    saveJSON(STORAGE.cart, cart);
  }, [cart]);

  useEffect(() => {
    saveJSON(STORAGE.orders, orders);
  }, [orders]);

  useEffect(() => {
    saveJSON(STORAGE.products, products);
  }, [products]);

  useEffect(() => {
    saveJSON(STORAGE.profile, profile);
  }, [profile]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return products.filter((p) => {
      const catOK = category === "All" || p.category === category;

      if (!catOK) return false;

      if (!q) return true;

      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [products, search, category]);

  const cartCount = cart.reduce((n, x) => n + x.qty, 0);

  const cartTotal = cart.reduce(
    (n, x) => n + x.price * x.qty,
    0
  );

  const addToCart = useCallback((product, variant = "") => {
    if (product.stock <= 0) {
      Alert.alert(
        "Out of stock",
        "यह product अभी उपलब्ध नहीं है।"
      );

      return;
    }

    setCart((prev) => {
      const idx = prev.findIndex(
        (x) =>
          x.productId === product.id &&
          x.variant === variant
      );

      if (idx >= 0) {
        const copy = [...prev];

        if (copy[idx].qty >= product.stock) {
          return copy;
        }

        copy[idx] = {
          ...copy[idx],
          qty: copy[idx].qty + 1,
        };

        return copy;
      }

      return [
        ...prev,
        {
          productId: product.id,
          title: product.title,
          price: product.price,
          image: product.images?.[0],
          variant,
          qty: 1,
        },
      ];
    });

    Alert.alert(
      "Cart",
      "Product cart में जोड़ दिया गया।"
    );
  }, []);

  const changeQty = (index, delta) => {
    setCart((prev) => {
      const copy = [...prev];

      const item = copy[index];

      const product = products.find(
        (p) => p.id === item.productId
      );

      const next = item.qty + delta;

      if (next <= 0) {
        copy.splice(index, 1);
      } else if (
        !product ||
        next <= product.stock
      ) {
        copy[index] = {
          ...item,
          qty: next,
        };
      }

      return copy;
    });
  };

  const startLogin = () => {
    if (!/^\d{10}$/.test(loginPhone)) {
      Alert.alert(
        "गलत नंबर",
        "10 अंकों का मोबाइल नंबर डालें।"
      );

      return;
    }

    // Demo-only local login.
    // Replace with Firebase Auth before production.
    setLoginStep("code");

    Alert.alert(
      "Development login",
      "यह स्क्रीन अभी demo mode में है। Production में Firebase Phone Auth जोड़ना जरूरी है।"
    );
  };

  const finishLogin = () => {
    if (!loginName.trim()) {
      Alert.alert(
        "नाम जरूरी है",
        "अपना नाम डालें।"
      );

      return;
    }

    if (loginCode.length < 4) {
      Alert.alert(
        "OTP",
        "Demo OTP डालें। Production में असली Firebase SMS OTP इस्तेमाल करें।"
      );

      return;
    }

    const user = {
      uid: `local_${Date.now()}`,
      name: loginName.trim(),
      phone: loginPhone,
      role: "buyer",
    };

    setSession(user);

    setProfile((p) => ({
      ...p,
      name: user.name,
      phone: user.phone,
      role: user.role,
    }));

    setScreen("home");
  };

  const logout = async () => {
    await AsyncStorage.removeItem(
      STORAGE.session
    );

    setSession(null);

    setLoginStep("phone");

    setLoginCode("");

    setLoginName("");
  };

  const validateAddress = () => {
    if (
      !address.name.trim() ||
      !/^\d{10}$/.test(address.phone)
    ) {
      return false;
    }

    if (!/^\d{6}$/.test(address.pincode)) {
      return false;
    }

    if (!address.line1.trim()) {
      return false;
    }

    return true;
  };

  const placeOrder = async (paymentMode) => {
    if (!selected) return;

    if (!validateAddress()) {
      Alert.alert(
        "Delivery details",
        "नाम, 10-digit फोन, 6-digit pincode और पूरा address भरें।"
      );

      return;
    }

    if (
      !selectedVariant &&
      selected.sizes?.length
    ) {
      Alert.alert(
        "Variant चुनें",
        "Size/Storage चुनना जरूरी है।"
      );

      return;
    }

    const deliveryFee = fastDelivery ? 40 : 0;

    const total =
      selected.price + deliveryFee;

    const orderId = `AR-${Date.now()}`;

    if (paymentMode === "online") {
      const result =
        await api.createPaymentOrder({
          amount: total,
          orderId,
        });

      if (!result.ok) {
        Alert.alert(
          "Online payment अभी configured नहीं है",
          "पहले backend में Razorpay/PhonePe order creation और verification जोड़ें।"
        );

        return;
      }

      // TODO:
      // Open the gateway SDK here and then call api.verifyPayment().

      Alert.alert(
        "Payment",
        "Gateway SDK integration point तैयार है।"
      );

      return;
    }

    const order = {
      id: orderId,
      userId: session?.uid,
      productId: selected.id,
      title: selected.title,
      image: selected.images?.[0],
      variant: selectedVariant,
      amount: total,
      payment: "COD",
      status: "PLACED",
      createdAt: new Date().toISOString(),
      address: {
        ...address,
      },
      trackingId: null,
      courier: null,
    };

    setOrders((prev) => [
      order,
      ...prev,
    ]);

    setProducts((prev) =>
      prev.map((p) =>
        p.id === selected.id
          ? {
              ...p,
              stock: Math.max(
                0,
                p.stock - 1
              ),
            }
          : p
      )
    );

    setSelected(null);

    setSelectedVariant("");

    setFastDelivery(false);

    setScreen("orders");

    // Shipping provider integration happens on backend.
    await api.createShippingOrder(order);

    Alert.alert(
      "Order placed",
      `Order ${orderId} successfully placed.`
    );
  };

  const pickProductImages = async () => {
    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        quality: 0.85,
        selectionLimit: 5,
      });

    if (!result.canceled) {
      setNewImages(
        result.assets
          .map((x) => x.uri)
          .slice(0, 5)
      );
    }
  };

  const addProduct = () => {
    if (profile.role !== ADMIN_ROLE) {
      Alert.alert(
        "Admin only",
        "Product publishing केवल authorized admin account से करें।"
      );

      return;
    }

    if (
      !newProduct.title.trim() ||
      !newProduct.price.trim()
    ) {
      Alert.alert(
        "Product details",
        "Product name और price भरें।"
      );

      return;
    }

    const price = Number(
      newProduct.price
    );

    const mrp =
      Number(newProduct.mrp) || price;

    const stock = Math.max(
      0,
      Number(newProduct.stock) || 0
    );

    if (
      !Number.isFinite(price) ||
      price <= 0
    ) {
      Alert.alert(
        "Price",
        "Valid price डालें।"
      );

      return;
    }

    const p = {
      id: `p_${Date.now()}`,
      title: newProduct.title.trim(),
      category: newProduct.category,
      price,
      mrp,
      discountPercent: Math.max(
        0,
        Math.round(
          ((mrp - price) / mrp) * 100
        )
      ),
      description:
        newProduct.description.trim() ||
        "Quality product from Arishop.",
      images: newImages.length
        ? newImages
        : [
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900",
          ],
      sizes:
        newProduct.category === "Fashion"
          ? ["S", "M", "L", "XL"]
          : [],
      stock,
      cod: !!newProduct.cod,
      rating: 0,
      reviews: 0,
      sellerName: "Arishop",
    };

    setProducts((prev) => [
      p,
      ...prev,
    ]);

    setNewProduct({
      title: "",
      price: "",
      mrp: "",
      category: "Fashion",
      description: "",
      stock: "10",
      cod: true,
    });

    setNewImages([]);

    Alert.alert(
      "Published",
      "Product local catalog में जोड़ दिया गया। Production में इसे Firestore/API पर save करें।"
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#1463ff"
        />

        <Text style={styles.muted}>
          Arishop loading…
        </Text>
      </SafeAreaView>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  if (screen === "product") {
    return <ProductScreen />;
  }

  if (screen === "cart") {
    return <CartScreen />;
  }

  if (screen === "checkout") {
    return <CheckoutScreen />;
  }

  if (screen === "orders") {
    return <OrdersScreen />;
  }

  if (screen === "profile") {
    return <ProfileScreen />;
  }

  if (screen === "admin") {
    return <AdminScreen />;
  }

  return <HomeScreen />;

  function Header() {
    return (
      <View style={styles.header}>
        <Text style={styles.logo}>
          Ari
          <Text style={styles.logoAccent}>
            shop
          </Text>
        </Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() =>
              setScreen("cart")
            }
            style={styles.iconBtn}
          >
            <Text>
              🛒 {cartCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              setScreen("profile")
            }
            style={styles.iconBtn}
          >
            <Text>👤</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function BottomNav() {
    return (
      <View style={styles.bottomNav}>
        <Nav
          label={"🏠\nHome"}
          active={screen === "home"}
          onPress={() =>
            setScreen("home")
          }
        />

        <Nav
          label={"🛒\nCart"}
          active={screen === "cart"}
          onPress={() =>
            setScreen("cart")
          }
        />

        <Nav
          label={"📦\nOrders"}
          active={screen === "orders"}
          onPress={() =>
            setScreen("orders")
          }
        />

        <Nav
          label={"👤\nYou"}
          active={screen === "profile"}
          onPress={() =>
            setScreen("profile")
          }
        />
      </View>
    );
  }

  function Nav({
    label,
    active,
    onPress,
  }) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={styles.navItem}
      >
        <Text
          style={[
            styles.navText,
            active &&
              styles.navActive,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  function LoginScreen() {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={
            styles.loginWrap
          }
        >
          <Text
            style={styles.bigLogo}
          >
            Arishop 🛍️
          </Text>

          <Text
            style={styles.subtitle}
          >
            Online marketplace foundation
          </Text>

          <View style={styles.card}>
            <Text style={styles.h2}>
              Login / Create account
            </Text>

            <Text style={styles.label}>
              Full name
            </Text>

            <TextInput
              style={styles.input}
              value={loginName}
              onChangeText={
                setLoginName
              }
              placeholder="Your full name"
            />

            <Text style={styles.label}>
              Mobile number
            </Text>

            <TextInput
              style={styles.input}
              value={loginPhone}
              onChangeText={
                setLoginPhone
              }
              keyboardType="phone-pad"
              maxLength={10}
              placeholder="10-digit mobile"
            />

            {loginStep ===
              "code" && (
              <>
                <Text
                  style={
                    styles.warning
                  }
                >
                  Demo mode: this OTP is NOT a real SMS. Connect Firebase Phone Auth before publishing.
                </Text>

                <Text
                  style={
                    styles.label
                  }
                >
                  Verification code
                </Text>

                <TextInput
                  style={
                    styles.input
                  }
                  value={loginCode}
                  onChangeText={
                    setLoginCode
                  }
                  keyboardType="numeric"
                  maxLength={6}
                  placeholder="OTP"
                />
              </>
            )}

            <TouchableOpacity
              style={styles.primary}
              onPress={
                loginStep ===
                "phone"
                  ? startLogin
                  : finishLogin
              }
            >
              <Text
                style={
                  styles.primaryText
                }
              >
                {loginStep ===
                "phone"
                  ? "Continue"
                  : "Verify & Login"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  function HomeScreen() {
    return (
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
            placeholder="🔍 Search products, brands and categories"
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            style={{
              marginBottom: 14,
            }}
          >
            {CATEGORIES.map(
              ([name, image]) => (
                <TouchableOpacity
                  key={name}
                  onPress={() =>
                    setCategory(
                      name
                    )
                  }
                  style={[
                    styles.category,
                    category ===
                      name &&
                      styles.categoryActive,
                  ]}
                >
                  <Image
                    source={{
                      uri: image,
                    }}
                    style={
                      styles.categoryImg
                    }
                  />

                  <Text
                    style={
                      styles.categoryText
                    }
                  >
                    {name}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>

          <View style={styles.hero}>
            <Text
              style={styles.heroTitle}
            >
              AriShop Mega Deals
            </Text>

            <Text
              style={styles.heroSub}
            >
              Fashion • Mobiles • Electronics • Home
            </Text>

            <Text
              style={styles.heroSmall}
            >
              Real payment, shipping and cloud sync must be connected before launch.
            </Text>
          </View>

          <View
            style={
              styles.sectionRow
            }
          >
            <Text style={styles.h2}>
              Products
            </Text>

            <Text
              style={styles.muted}
            >
              {filtered.length} items
            </Text>
          </View>

          <View style={styles.grid}>
            {filtered.map((p) => (
              <View
                style={styles.product}
                key={p.id}
              >
                <TouchableOpacity
                  onPress={() => {
                    setSelected(p);
                    setScreen(
                      "product"
                    );
                  }}
                >
                  <Image
                    source={{
                      uri: p.images?.[0],
                    }}
                    style={
                      styles.productImg
                    }
                  />

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
                      {p.title}
                    </Text>

                    <Text
                      numberOfLines={2}
                      style={
                        styles.muted
                      }
                    >
                      {p.description}
                    </Text>

                    <Text
                      style={
                        styles.rating
                      }
                    >
                      ⭐{" "}
                      {p.rating ||
                        "New"}{" "}
                      {p.reviews
                        ? `(${p.reviews})`
                        : ""}
                    </Text>

                    <Text
                      style={
                        styles.price
                      }
                    >
                      {money(p.price)}
                    </Text>

                    {p.mrp >
                      p.price && (
                      <Text
                        style={
                          styles.mrp
                        }
                      >
                        {money(
                          p.mrp
                        )}
                      </Text>
                    )}

                    <Text
                      style={
                        styles.stock
                      }
                    >
                      {p.stock > 0
                        ? `${p.stock} left`
                        : "Out of stock"}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={
                    p.stock <= 0
                  }
                  style={[
                    styles.primary,
                    p.stock <= 0 &&
                      styles.disabled,
                  ]}
                  onPress={() =>
                    addToCart(
                      p,
                      p.sizes?.[0] ||
                        ""
                    )
                  }
                >
                  <Text
                    style={
                      styles.primaryText
                    }
                  >
                    Add to Cart
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {profile.role ===
            ADMIN_ROLE && (
            <TouchableOpacity
              style={
                styles.adminBtn
              }
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
        </ScrollView>

        <BottomNav />
      </SafeAreaView>
    );
  }

  function ProductScreen() {
    if (!selected) {
      return <HomeScreen />;
    }

    const final =
      selected.price +
      (fastDelivery ? 40 : 0);

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
            <Text style={styles.back}>
              ← Back
            </Text>
          </TouchableOpacity>

          <Image
            source={{
              uri: selected.images?.[0],
            }}
            style={
              styles.detailImg
            }
          />

          <Text style={styles.h1}>
            {selected.title}
          </Text>

          <Text
            style={styles.rating}
          >
            ⭐{" "}
            {selected.rating ||
              "New"}{" "}
            {selected.reviews
              ? `(${selected.reviews} reviews)`
              : ""}
          </Text>

          <Text
            style={styles.price}
          >
            {money(
              selected.price
            )}
          </Text>

          {selected.mrp >
            selected.price && (
            <Text
              style={styles.mrp}
            >
              {money(
                selected.mrp
              )}
            </Text>
          )}

          <Text
            style={
              styles.description
            }
          >
            {selected.description}
          </Text>

          {!!selected.sizes
            ?.length && (
            <>
              <Text
                style={styles.h2}
              >
                Choose size / storage
              </Text>

              <View
                style={styles.chips}
              >
                {selected.sizes.map(
                  (s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() =>
                        setSelectedVariant(
                          s
                        )
                      }
                      style={[
                        styles.chip,
                        selectedVariant ===
                          s &&
                          styles.chipActive,
                      ]}
                    >
                      <Text
                        style={
                          selectedVariant ===
                          s
                            ? styles.chipActiveText
                            : styles.chipText
                        }
                      >
                        {s}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </>
          )}

          <TouchableOpacity
            style={
              styles.secondary
            }
            onPress={() =>
              addToCart(
                selected,
                selectedVariant
              )
            }
          >
            <Text
              style={
                styles.secondaryText
              }
            >
              Add to Cart
            </Text>
          </TouchableOpacity>

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
              Buy Now •{" "}
              {money(final)}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  function CartScreen() {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <Header />

        <ScrollView
          contentContainerStyle={
            styles.content
          }
        >
          <Text style={styles.h1}>
            Your Cart
          </Text>

          {!cart.length ? (
            <Text
              style={styles.muted}
            >
              Cart is empty.
            </Text>
          ) : (
            <>
              {cart.map(
                (item, i) => (
                  <View
                    style={
                      styles.cartRow
                    }
                    key={`${item.productId}-${item.variant}`}
                  >
                    <Image
                      source={{
                        uri: item.image,
                      }}
                      style={
                        styles.cartImg
                      }
                    />

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
                        {item.title}
                      </Text>

                      <Text
                        style={
                          styles.muted
                        }
                      >
                        {item.variant ||
                          "Standard"}
                      </Text>

                      <Text
                        style={
                          styles.price
                        }
                      >
                        {money(
                          item.price
                        )}
                      </Text>

                      <View
                        style={
                          styles.qtyRow
                        }
                      >
                        <TouchableOpacity
                          style={
                            styles.qty
                          }
                          onPress={() =>
                            changeQty(
                              i,
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
                            styles.qty
                          }
                          onPress={() =>
                            changeQty(
                              i,
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
                  style={
                    styles.price
                  }
                >
                  {money(
                    cartTotal
                  )}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.primary}
                onPress={() => {
                  const first =
                    products.find(
                      (p) =>
                        p.id ===
                        cart[0]
                          .productId
                    );

                  if (!first)
                    return;

                  setSelected(
                    first
                  );

                  setSelectedVariant(
                    cart[0]
                      .variant ||
                      ""
                  );

                  setScreen(
                    "checkout"
                  );
                }}
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
  }

  function CheckoutScreen() {
    if (!selected) {
      return <CartScreen />;
    }

    const delivery =
      fastDelivery ? 40 : 0;

    const total =
      selected.price +
      delivery;

    return (
      <SafeAreaView
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={
            styles.content
          }
        >
          <Text style={styles.h1}>
            Checkout
          </Text>

          <View
            style={styles.card}
          >
            <Text
              style={
                styles.productTitle
              }
            >
              {selected.title}
            </Text>

            <Text
              style={styles.price}
            >
              {money(
                selected.price
              )}
            </Text>
          </View>

          <Text style={styles.h2}>
            Delivery address
          </Text>

          {[
            [
              "name",
              "Full name",
              "default",
            ],
            [
              "phone",
              "10-digit phone",
              "phone-pad",
            ],
            [
              "pincode",
              "6-digit pincode",
              "numeric",
            ],
            [
              "line1",
              "House, street, city",
              "default",
            ],
            [
              "landmark",
              "Landmark (optional)",
              "default",
            ],
          ].map(
            ([
              key,
              placeholder,
              keyboardType,
            ]) => (
              <TextInput
                key={key}
                style={[
                  styles.input,
                  key ===
                    "line1" && {
                    minHeight: 70,
                  },
                ]}
                multiline={
                  key === "line1"
                }
                keyboardType={
                  keyboardType
                }
                maxLength={
                  key === "phone"
                    ? 10
                    : key ===
                      "pincode"
                    ? 6
                    : undefined
                }
                placeholder={
                  placeholder
                }
                value={
                  address[key]
                }
                onChangeText={(
                  v
                ) =>
                  setAddress(
                    (a) => ({
                      ...a,
                      [key]: v,
                    })
                  )
                }
              />
            )
          )}

          <Text style={styles.h2}>
            Delivery
          </Text>

          <TouchableOpacity
            onPress={() =>
              setFastDelivery(
                false
              )
            }
            style={[
              styles.option,
              !fastDelivery &&
                styles.optionActive,
            ]}
          >
            <Text>
              📦 Standard delivery • Free
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              setFastDelivery(
                true
              )
            }
            style={[
              styles.option,
              fastDelivery &&
                styles.optionActive,
            ]}
          >
            <Text>
              ⚡ Express delivery • +₹40
            </Text>
          </TouchableOpacity>

          <Text style={styles.h2}>
            Payment
          </Text>

          <TouchableOpacity
            style={styles.primary}
            onPress={() =>
              placeOrder(
                "online"
              )
            }
          >
            <Text
              style={
                styles.primaryText
              }
            >
              Pay Online •{" "}
              {money(total)}
            </Text>
          </TouchableOpacity>

          {selected.cod && (
            <TouchableOpacity
              style={
                styles.secondary
              }
              onPress={() =>
                placeOrder("cod")
              }
            >
              <Text
                style={
                  styles.secondaryText
                }
              >
                Cash on Delivery •{" "}
                {money(total)}
              </Text>
            </TouchableOpacity>
          )}

          <Text
            style={styles.warning}
          >
            Online payment is intentionally blocked until a real backend + gateway verification is configured.
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  function OrdersScreen() {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <Header />

        <ScrollView
          contentContainerStyle={
            styles.content
          }
        >
          <Text style={styles.h1}>
            Your Orders
          </Text>

          {!orders.length ? (
            <Text
              style={styles.muted}
            >
              No orders yet.
            </Text>
          ) : null}

          {orders.map((o) => (
            <View
              style={styles.card}
              key={o.id}
            >
              <Text
                style={
                  styles.productTitle
                }
              >
                {o.title}
              </Text>

              <Text
                style={styles.muted}
              >
                Order ID: {o.id}
              </Text>

              <Text
                style={styles.status}
              >
                ● {o.status}
              </Text>

              <Text
                style={styles.price}
              >
                {money(o.amount)}
              </Text>

              <Text
                style={styles.muted}
              >
                {new Date(
                  o.createdAt
                ).toLocaleString(
                  "en-IN"
                )}
              </Text>

              <Text
                style={styles.muted}
              >
                Payment:{" "}
                {o.payment}
              </Text>

              <TouchableOpacity
                style={
                  styles.secondary
                }
                onPress={() =>
                  Alert.alert(
                    "Cancellation",
                    "Cancellation/refund will be processed by your backend after payment and shipping integration is configured."
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
          ))}
        </ScrollView>

        <BottomNav />
      </SafeAreaView>
    );
  }

  function ProfileScreen() {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <Header />

        <ScrollView
          contentContainerStyle={
            styles.content
          }
        >
          <Text style={styles.h1}>
            Account
          </Text>

          <View
            style={styles.card}
          >
            <Text
              style={styles.h2}
            >
              {profile.name ||
                "User"}
            </Text>

            <Text
              style={styles.muted}
            >
              +91-{profile.phone}
            </Text>

            <Text
              style={styles.muted}
            >
              {profile.role}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.option}
            onPress={() =>
              setScreen("orders")
            }
          >
            <Text>
              📦 Orders
            </Text>
          </TouchableOpacity>

          {profile.role ===
            ADMIN_ROLE && (
            <TouchableOpacity
              style={styles.option}
              onPress={() =>
                setScreen("admin")
              }
            >
              <Text>
                ⚙️ Admin dashboard
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.option}
            onPress={() =>
              Linking.openURL(
                `tel:${SUPPORT_PHONE}`
              )
            }
          >
            <Text>
              📞 Customer support
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() =>
              Alert.alert(
                "Privacy Policy",
                "Add your public Privacy Policy URL before production."
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
                fontWeight: "700",
              }}
            >
              Log out
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <BottomNav />
      </SafeAreaView>
    );
  }

  function AdminScreen() {
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
            <Text style={styles.back}>
              ← Home
            </Text>
          </TouchableOpacity>

          <Text style={styles.h1}>
            Admin Dashboard
          </Text>

          <Text
            style={styles.warning}
          >
            Admin access MUST be enforced by your backend security rules. Hiding this screen in the app is not security.
          </Text>

          <View
            style={styles.card}
          >
            <Text style={styles.h2}>
              Add product
            </Text>

            {[
              [
                "title",
                "Product name",
              ],
              [
                "price",
                "Selling price",
              ],
              ["mrp", "MRP"],
              [
                "stock",
                "Stock quantity",
              ],
              [
                "description",
                "Description",
              ],
            ].map(
              ([key, placeholder]) => (
                <TextInput
                  key={key}
                  style={[
                    styles.input,
                    key ===
                      "description" && {
                      minHeight: 80,
                    },
                  ]}
                  multiline={
                    key ===
                    "description"
                  }
                  keyboardType={[
                    "price",
                    "mrp",
                    "stock",
                  ].includes(key)
                    ? "numeric"
                    : "default"}
                  placeholder={
                    placeholder
                  }
                  value={
                    newProduct[key]
                  }
                  onChangeText={(
                    v
                  ) =>
                    setNewProduct(
                      (p) => ({
                        ...p,
                        [key]: v,
                      })
                    )
                  }
                />
              )
            )}

            <Text style={styles.label}>
              Category
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
            >
              {CATEGORIES.slice(
                1
              ).map(([c]) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.chip,
                    newProduct.category ===
                      c &&
                      styles.chipActive,
                  ]}
                  onPress={() =>
                    setNewProduct(
                      (p) => ({
                        ...p,
                        category:
                          c,
                      })
                    )
                  }
                >
                  <Text
                    style={
                      newProduct.category ===
                      c
                        ? styles.chipActiveText
                        : styles.chipText
                    }
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={
                styles.secondary
              }
              onPress={
                pickProductImages
              }
            >
              <Text
                style={
                  styles.secondaryText
                }
              >
                📷 Select product images
              </Text>
            </TouchableOpacity>

            {!!newImages.length && (
              <Text
                style={styles.muted}
              >
                {newImages.length} image(s) selected
              </Text>
            )}

            <TouchableOpacity
              style={styles.primary}
              onPress={
                addProduct
              }
            >
              <Text
                style={
                  styles.primaryText
                }
              >
                Publish Product
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

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
  },

  content: {
    padding: 16,
    paddingBottom: 100,
  },

  loginWrap: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 18,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  logo: {
    fontSize: 26,
    fontWeight: "900",
    color: "#111827",
  },

  logoAccent: {
    color: "#1463ff",
  },

  bigLogo: {
    fontSize: 34,
    fontWeight: "900",
    color: "#1463ff",
    textAlign: "center",
  },

  subtitle: {
    textAlign: "center",
    color: "#64748b",
    marginBottom: 22,
  },

  headerActions: {
    flexDirection: "row",
    gap: 8,
  },

  iconBtn: {
    backgroundColor: "#eef2ff",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
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
    width: 76,
    alignItems: "center",
    marginRight: 10,
    padding: 6,
    borderRadius: 12,
  },

  categoryActive: {
    backgroundColor: "#e8efff",
  },

  categoryImg: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
    marginTop: 4,
  },

  heroSmall: {
    color: "#dbeafe",
    fontSize: 11,
    marginTop: 12,
    lineHeight: 16,
  },

  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  h1: {
    fontSize: 25,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 14,
  },

  h2: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  label: {
    fontSize: 12,
    color: "#475569",
    marginTop: 10,
    marginBottom: 5,
  },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dbe2ea",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: "#111827",
    marginBottom: 8,
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

  disabled: {
    backgroundColor: "#94a3b8",
  },

  muted: {
    color: "#64748b",
    fontSize: 12,
  },

  warning: {
    color: "#92400e",
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
    fontSize: 12,
    lineHeight: 17,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  product: {
    width: "48.5%",
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
    paddingBottom: 8,
  },

  productImg: {
    width: "100%",
    height: 145,
    backgroundColor: "#e2e8f0",
  },

  detailImg: {
    width: "100%",
    height: 300,
    borderRadius: 16,
    backgroundColor: "#e2e8f0",
    marginBottom: 14,
  },

  productTitle: {
    color: "#111827",
    fontWeight: "800",
    fontSize: 13,
  },

  description: {
    color: "#475569",
    lineHeight: 20,
    marginVertical: 12,
  },

  rating: {
    color: "#d97706",
    fontSize: 11,
    marginVertical: 4,
  },

  price: {
    color: "#1463ff",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 4,
  },

  mrp: {
    color: "#94a3b8",
    textDecorationLine: "line-through",
    fontSize: 12,
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
    padding: 13,
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

  cartImg: {
    width: 78,
    height: 78,
    borderRadius: 10,
    marginRight: 10,
  },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  qty: {
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

  status: {
    color: "#16a34a",
    fontWeight: "800",
    marginVertical: 5,
  },

  adminBtn: {
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 10,
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

  navText: {
    color: "#64748b",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
  },

  navActive: {
    color: "#1463ff",
    fontWeight: "900",
  },
});
