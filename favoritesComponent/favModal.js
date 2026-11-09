import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { GlobalContext } from "../Contexts/GlobalContext";
import Toast from "react-native-toast-message";

const { width, height } = Dimensions.get("window");

export default function ProductDetailModal({
  visible,
  product,
  onClose,
  onAddToCart,
  openRejectionModal,
}) {
  const [quantity, setQuantity] = useState(1);
  const { session, cartItems, setCartItems } = useContext(GlobalContext);

  // Check if product is already in cart
  const isInCart = cartItems.some(
    (cartItem) => String(cartItem.id) === String(product?.id),
  );

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    // Check if user is logged in
    if (!session?.user?.email) {
      openRejectionModal?.(true);
      return;
    }

    // Check if already in cart
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

    // Create cart item
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

    // Show success toast
    Toast.show({
      type: "success",
      text1: "Added to Cart! 🎉",
      text2: `${quantity} x ${product?.product_name} added to your cart`,
      position: "top",
      visibilityTime: 3000,
      topOffset: 50,
    });

    // Call the optional onAddToCart callback
    onAddToCart?.();

    // Reset quantity and close modal after short delay
    setTimeout(() => {
      setQuantity(1);
      onClose();
    }, 1500);
  };

  if (!product) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header image */}
          <ImageBackground
            source={{ uri: product.image_url }}
            style={styles.modalImage}
            imageStyle={{ borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
          >
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={24} color="#2d2d2d" />
            </TouchableOpacity>
          </ImageBackground>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalContent}>
              <Text style={styles.modalName}>{product.product_name}</Text>
              <Text style={styles.modalPrice}>${product.price}</Text>

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

              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons
                    name="ruler"
                    size={20}
                    color="#C5A059"
                  />
                  <Text style={styles.detailText}>{product.dimensions}</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons
                    name="palette"
                    size={20}
                    color="#C5A059"
                  />
                  <Text style={styles.detailText}>{product.materials}</Text>
                </View>
              </View>

              <Text style={styles.description}>{product.description}</Text>

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
                style={[styles.addButton, isInCart && styles.addButtonDisabled]}
                onPress={handleAddToCart}
                activeOpacity={0.8}
                disabled={isInCart}
              >
                <Text style={styles.addButtonText}>
                  {isInCart ? "Already in Cart" : "Add to Cart"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: "#fff",
    borderRadius: 28,
    overflow: "hidden",
  },
  modalImage: {
    height: 220,
    width: "100%",
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 6,
  },
  modalContent: {
    padding: 24,
  },
  modalName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2d2d2d",
    marginBottom: 4,
  },
  modalPrice: {
    fontSize: 28,
    fontWeight: "800",
    color: "#C5A059",
    marginBottom: 16,
  },
  cartIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(197, 160, 89, 0.1)",
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
    backgroundColor: "#F0EDF2",
    marginVertical: 16,
  },
  detailsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#5a5a6e",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6a6a7e",
    marginBottom: 24,
  },
  quantitySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d2d2d",
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
    backgroundColor: "#f5f3f7",
    justifyContent: "center",
    alignItems: "center",
  },
  qtyBtnText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#C5A059",
  },
  qtyValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d2d2d",
    minWidth: 40,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: "#C5A059",
    paddingVertical: 14,
    borderRadius: 40,
    alignItems: "center",
    marginBottom: 10,
  },
  addButtonDisabled: {
    backgroundColor: "#ccc",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
