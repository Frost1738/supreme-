import React, { useState, useRef, useContext } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlobalContext } from "../Contexts/GlobalContext";

const { width, height } = Dimensions.get("window");
const CARD_HEIGHT = height * 0.42;
const CARD_WIDTH = width * 0.6;

const FurnitureCard = ({ item }) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [imageLoading, setImageLoading] = useState(true);
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const [showAlreadyInCartMessage, setShowAlreadyInCartMessage] =
    useState(false);
  const slideAnim = useRef(new Animated.Value(CARD_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const alreadyInCartAnim = useRef(new Animated.Value(0)).current;
  const { cartItems, setCartItems } = useContext(GlobalContext);

  const existsInCart = cartItems.some((cartItem) => cartItem.id === item?.id);

  const toggleOverlay = () => {
    if (showOverlay) {
      Animated.timing(slideAnim, {
        toValue: CARD_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowOverlay(false));
    } else {
      setQuantity(1);
      setShowOverlay(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }
  };

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const showAddedToCartMessage = () => {
    setShowAddedMessage(true);
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setShowAddedMessage(false));
  };

  const showAlreadyInCartNotification = () => {
    setShowAlreadyInCartMessage(true);
    Animated.sequence([
      Animated.timing(alreadyInCartAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(alreadyInCartAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setShowAlreadyInCartMessage(false));
  };

  const handleAddToCart = () => {
    // If already in cart, show notification and don't add
    if (existsInCart) {
      console.log("Item already in cart:", product.name);
      showAlreadyInCartNotification();
      return;
    }

    // Create cart item using the product object with quantity from state
    const cartItem = {
      id: item?.id,
      name: product.name,
      price: product.price,
      currency: product.currency,
      dimensions: product.dimensions,
      color: product.color,
      materials: product.materials,
      description: product.description,
      image_url: product.imageUrl,
      quantity: quantity,
    };

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (cartItem) => cartItem.id === item?.id,
      );

      if (existingIndex !== -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + quantity,
        };
        console.log(
          `Updated quantity: +${quantity}, new total: ${updatedItems[existingIndex].quantity}`,
        );
        return updatedItems;
      } else {
        console.log(`Added new item with quantity: ${quantity}`);
        return [...prevItems, cartItem];
      }
    });

    showAddedToCartMessage();

    setTimeout(() => {
      if (showOverlay) {
        toggleOverlay();
      }
    }, 1800);
  };

  // Default fallback data if item props are missing
  const product = {
    id: item?.id,
    name: item?.name || item?.product_name || "L‑Shaped Sofa",
    price: item?.price || 899,
    currency: item?.currency || "$",
    dimensions: item?.dimensions || "260 x 180 x 85 cm",
    color: item?.color || "Charcoal Grey",
    materials:
      item?.materials || item?.description || "Premium quality materials",
    description: item?.description || "Beautiful piece of furniture",
    imageUrl:
      item?.imageUrl ||
      item?.image_url ||
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop",
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <TouchableWithoutFeedback onPress={toggleOverlay}>
          <View style={styles.imageSection}>
            {imageLoading && (
              <View style={styles.loaderOverlay}>
                <ActivityIndicator size="large" color="#C5A059" />
              </View>
            )}
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.image}
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              resizeMode="cover"
            />
          </View>
        </TouchableWithoutFeedback>

        {/* Success Message Overlay */}
        {showAddedMessage && (
          <Animated.View style={[styles.messageOverlay, { opacity: fadeAnim }]}>
            <View style={styles.successMessageContainer}>
              <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
              <Text style={styles.messageText}>Added to Cart!</Text>
            </View>
          </Animated.View>
        )}

        {/* Already in Cart Message Overlay */}
        {showAlreadyInCartMessage && (
          <Animated.View
            style={[styles.messageOverlay, { opacity: alreadyInCartAnim }]}
          >
            <View style={styles.warningMessageContainer}>
              <Ionicons name="alert-circle" size={28} color="#FF9800" />
              <Text style={styles.messageText}>Already in Cart!</Text>
            </View>
          </Animated.View>
        )}

        {showOverlay && (
          <Animated.View
            style={[
              styles.overlay,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContentContainer}
              showsVerticalScrollIndicator={true}
              bounces={true}
              nestedScrollEnabled={true}
            >
              <View style={styles.overlayContent}>
                <Text style={styles.detailName}>{product.name}</Text>

                <View style={styles.priceRow}>
                  <Text style={styles.detailPrice}>
                    {product.currency}
                    {product.price}
                  </Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>In Stock</Text>
                  </View>
                </View>

                {/* Already in cart indicator in overlay */}
                {existsInCart && (
                  <View style={styles.cartIndicator}>
                    <Ionicons name="cart" size={14} color="#C5A059" />
                    <Text style={styles.cartIndicatorText}>
                      Already in cart
                    </Text>
                  </View>
                )}

                <View style={styles.materialsContainer}>
                  <Ionicons name="leaf-outline" size={14} color="#C5A059" />
                  <Text style={styles.materialsText}>{product.materials}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.specsGrid}>
                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>Dimensions</Text>
                    <Text style={styles.specValue}>{product.dimensions}</Text>
                  </View>
                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>Color</Text>
                    <Text style={styles.specValue}>{product.color}</Text>
                  </View>
                </View>

                <Text style={styles.description}>{product.description}</Text>

                <View style={styles.quantitySection}>
                  <Text style={styles.quantityLabel}>Quantity</Text>
                  <View style={styles.quantityRow}>
                    <TouchableOpacity
                      onPress={decreaseQuantity}
                      style={styles.qtyBtn}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.qtyBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyValue}>{quantity}</Text>
                    <TouchableOpacity
                      onPress={increaseQuantity}
                      style={styles.qtyBtn}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleAddToCart}
                  style={[
                    styles.cartBtn,
                    existsInCart && styles.cartBtnDisabled,
                  ]}
                  activeOpacity={0.85}
                  disabled={existsInCart}
                >
                  <Text style={styles.cartBtnText}>
                    {existsInCart ? "Already in Cart" : "Add to Cart"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={toggleOverlay}
                  style={styles.closeBtn}
                >
                  <Text style={styles.closeBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    position: "relative",
  },
  imageSection: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  messageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  successMessageContainer: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 40,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  warningMessageContainer: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 40,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  messageText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d2d2d",
  },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    width: CARD_WIDTH * 0.95,
    height: CARD_HEIGHT,
    backgroundColor: "rgba(0, 0, 0, 0.82)",
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: -5, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 30,
  },
  overlayContent: {},
  detailName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailPrice: {
    fontSize: 22,
    fontWeight: "800",
    color: "#C5A059",
  },
  badge: {
    backgroundColor: "rgba(46, 125, 50, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(46, 125, 50, 0.4)",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#81C784",
  },
  cartIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(197, 160, 89, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
    gap: 6,
  },
  cartIndicatorText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#C5A059",
  },
  materialsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  materialsText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#E0E0E0",
    flex: 1,
    lineHeight: 15,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 12,
  },
  specsGrid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  specItem: {
    flex: 1,
  },
  specLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.5)",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  specValue: {
    fontSize: 11,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  description: {
    fontSize: 11,
    lineHeight: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 16,
  },
  quantitySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#C5A059",
  },
  qtyValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    minWidth: 30,
    textAlign: "center",
  },
  cartBtn: {
    backgroundColor: "#C5A059",
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: "center",
    marginBottom: 10,
  },
  cartBtnDisabled: {
    backgroundColor: "#8a8a8a",
  },
  cartBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  closeBtn: {
    paddingVertical: 8,
    alignItems: "center",
  },
  closeBtnText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
    fontWeight: "500",
  },
});

export default FurnitureCard;
