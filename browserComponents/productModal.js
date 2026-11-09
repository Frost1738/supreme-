import React, {
  useRef,
  useEffect,
  useState,
  useContext,
  useTransition,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  Animated,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { GlobalContext } from "../Contexts/GlobalContext";
import { addToFavorites } from "../ApiServices/serverActions";
import Toast from "react-native-toast-message";

const { width, height } = Dimensions.get("window");

export default function ProductModal({
  visible,
  product,
  onClose,
  onAddToCart,
  onLike,
  isLiked: externalIsLiked,
  openRejectionModal,
}) {
  const [optimisticLiked, setOptimisticLiked] = useState(false);
  const [actualLiked, setActualLiked] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();
  const { session, cartItems, setCartItems, setLikedItems } =
    useContext(GlobalContext);

  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(1)).current;

  // The displayed liked state (optimistic UI)
  const displayedLiked = isPending ? optimisticLiked : actualLiked;

  // Sync with external isLiked prop (initial load)
  useEffect(() => {
    if (externalIsLiked !== undefined) {
      setActualLiked(externalIsLiked);
      setOptimisticLiked(externalIsLiked);
    }
  }, [externalIsLiked]);

  // Check if product is already in cart
  const isInCart = cartItems.some((cartItem) => {
    const cartItemId = String(cartItem.id);
    const productId = String(product?.id);
    return cartItemId === productId;
  });

  useEffect(() => {
    if (visible) {
      setQuantity(1);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleAddToCart = () => {
    if (!session?.user?.email) {
      openRejectionModal(true);
      return;
    }

    if (isInCart) {
      Toast.show({
        type: "error",
        text1: "Already in Cart",
        text2: `${product?.product_name} is already in your cart`,
        position: "top",
        visibilityTime: 3000,
        topOffset: 50,
      });
      return;
    }

    const cartItem = {
      id: product?.id,
      name: product?.product_name,
      product_name: product?.product_name,
      price: product?.price,
      currency: "$",
      dimensions: product?.dimensions,
      color: product?.color || "Not specified",
      materials: product?.materials,
      description: product?.description,
      image_url: product?.image_url,
      quantity: quantity,
      addedAt: Date.now(),
    };

    setCartItems((prevItems) => [...prevItems, cartItem]);

    Toast.show({
      type: "success",
      text1: "Added to Cart! 🎉",
      text2: `${quantity} x ${product?.product_name} added to your cart`,
      position: "top",
      visibilityTime: 3000,
      topOffset: 50,
    });

    onAddToCart?.();

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleLike = () => {
    // Check if user is logged in
    if (!session?.user?.email) {
      openRejectionModal(true);
      return;
    }

    // Prevent multiple clicks while pending
    if (isPending) return;

    // Optimistic update - change heart color immediately
    const newLikedState = !displayedLiked;
    setOptimisticLiked(newLikedState);

    // Animate heart
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(heartScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Prepare favorite item object for database
    const favoriteItem = {
      id: product?.id,
      name: product?.product_name,
      product_name: product?.product_name,
      price: product?.price,
      image: product?.image_url,
      rating: product?.rating || 4.5,
      reviews: product?.review_number || product?.reviews || 0,
      addedAt: new Date().toISOString(),
    };

    // Start transition for the actual server action
    startTransition(async () => {
      try {
        const result = await addToFavorites(session.user.email, favoriteItem);

        if (result.success) {
          // Server success - update actual state
          setActualLiked(newLikedState);

          // Update local state via callback
          if (onLike) {
            onLike(product?.id, newLikedState);
          }

          // Update liked items in context if setLikedItems is available
          if (setLikedItems) {
            if (newLikedState) {
              setLikedItems((prev) => [...prev, favoriteItem]);
            } else {
              setLikedItems((prev) =>
                prev.filter((fav) => fav.id !== product?.id),
              );
            }
          }

          Toast.show({
            type: "success",
            text1: newLikedState
              ? "Added to Favorites ❤️"
              : "Removed from Favorites",
            text2: product?.product_name,
            position: "top",
            visibilityTime: 2000,
            topOffset: 50,
          });
        } else {
          // Server failed - revert optimistic update
          setOptimisticLiked(actualLiked);
          Toast.show({
            type: "error",
            text1: "Error",
            text2: result.error?.message || "Failed to update favorites",
            position: "top",
            visibilityTime: 3000,
            topOffset: 50,
          });
        }
      } catch (error) {
        console.error("Error in handleLike:", error);
        // Revert optimistic update on error
        setOptimisticLiked(actualLiked);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Something went wrong",
          position: "top",
          visibilityTime: 3000,
          topOffset: 50,
        });
      }
    });
  };

  if (!visible || !product) return null;

  return (
    <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <Animated.View
        style={[
          styles.modalContent,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Loading Overlay - shows while pending */}
        {isPending && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>♥️ Added to Favorites</Text>
            </View>
          </View>
        )}

        {/* Header with close button (left) and like button (right) */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLike}
            style={styles.likeButton}
            disabled={isPending}
          >
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Ionicons
                name={displayedLiked ? "heart" : "heart-outline"}
                size={24}
                color={displayedLiked ? "#ff4d4d" : "#fff"}
              />
            </Animated.View>
          </TouchableOpacity>

          <View style={styles.headerIndicator} />
        </View>

        {/* Image Section */}
        <View style={styles.imageContainer}>
          <ImageBackground
            source={{ uri: product.image_url }}
            style={styles.modalImage}
            imageStyle={{ borderRadius: 20 }}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
        </View>

        {/* Details Section */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.detailsScroll}
        >
          <View style={styles.modalDetails}>
            <Text style={styles.modalName}>{product.product_name}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.modalPrice}>${product.price}</Text>
              <View style={styles.stockBadge}>
                <Text style={styles.stockText}>In Stock</Text>
              </View>
            </View>

            {/* Already in cart indicator */}
            {isInCart && (
              <View style={styles.cartIndicator}>
                <Ionicons name="cart" size={16} color="#C5A059" />
                <Text style={styles.cartIndicatorText}>
                  Already in your cart
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <MaterialCommunityIcons
                    name="ruler"
                    size={18}
                    color="#C5A059"
                  />
                </View>
                <Text style={styles.infoLabel}>Dimensions:</Text>
                <Text style={styles.infoValue}>{product.dimensions}</Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <MaterialCommunityIcons
                    name="palette"
                    size={18}
                    color="#C5A059"
                  />
                </View>
                <Text style={styles.infoLabel}>Materials:</Text>
                <Text style={styles.infoValue}>{product.materials}</Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <MaterialCommunityIcons
                    name="star"
                    size={18}
                    color="#C5A059"
                  />
                </View>
                <Text style={styles.infoLabel}>Rating:</Text>
                <Text style={styles.infoValue}>
                  {product.rating || 4.5} ★ ({product.review_number || 128}{" "}
                  reviews)
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.descriptionSection}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.modalDescription}>{product.description}</Text>
            </View>

            {/* Quantity Selector - only show if not already in cart */}
            {!isInCart && (
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
            )}

            {/* Add to Cart Button */}
            <TouchableOpacity
              style={[
                styles.modalCartBtn,
                isInCart && styles.modalCartBtnDisabled,
              ]}
              onPress={handleAddToCart}
              activeOpacity={0.8}
              disabled={isInCart}
            >
              <MaterialCommunityIcons name="cart-plus" size={20} color="#fff" />
              <Text style={styles.modalCartText}>
                {isInCart ? "Already in Cart" : "Add to Cart"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: height * 0.85,
    overflow: "hidden",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    borderRadius: 30,
  },
  loadingContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2d2d2d",
  },
  modalHeader: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    left: 16,
    top: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  likeButton: {
    position: "absolute",
    right: 16,
    top: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  headerIndicator: {
    width: 50,
    height: 4,
    backgroundColor: "#C5A059",
    borderRadius: 2,
    marginTop: 12,
  },
  imageContainer: {
    position: "relative",
    height: 280,
  },
  modalImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  detailsScroll: {
    paddingBottom: 30,
  },
  modalDetails: {
    padding: 20,
  },
  modalName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalPrice: {
    fontSize: 28,
    fontWeight: "700",
    color: "#C5A059",
  },
  stockBadge: {
    backgroundColor: "rgba(197, 160, 89, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#C5A059",
  },
  stockText: {
    fontSize: 12,
    color: "#C5A059",
    fontWeight: "500",
  },
  cartIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(197, 160, 89, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  cartIndicatorText: {
    fontSize: 13,
    color: "#C5A059",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#333",
    marginVertical: 16,
  },
  infoSection: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    width: 28,
  },
  infoLabel: {
    fontSize: 14,
    color: "#999",
    width: 85,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#fff",
    flex: 1,
  },
  descriptionSection: {
    marginTop: 8,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: "#ccc",
  },
  quantitySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  qtyBtnText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#C5A059",
  },
  qtyValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    minWidth: 40,
    textAlign: "center",
  },
  modalCartBtn: {
    backgroundColor: "#C5A059",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  modalCartBtnDisabled: {
    backgroundColor: "#555",
  },
  modalCartText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
