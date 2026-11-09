import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  isLoading,
}) {
  // Handle quantity changes
  const handleDecrease = () => {
    if (isLoading) return; // Prevent action while loading
    const newQuantity = (item.quantity || 1) - 1;
    if (newQuantity >= 1) {
      onUpdateQuantity?.(item.id, newQuantity);
    }
  };

  const handleIncrease = () => {
    if (isLoading) return; // Prevent action while loading
    const newQuantity = (item.quantity || 1) + 1;
    onUpdateQuantity?.(item.id, newQuantity);
  };

  const handleRemove = () => {
    if (isLoading) return; // Prevent action while loading
    onRemove?.(item.id);
  };

  // Get material (falls back to materials field)
  const getMaterial = () => {
    return item.material || item.materials || "Premium quality";
  };

  // Get name (falls back to product_name or name)
  const getName = () => {
    return item.name || item.product_name || "Furniture Item";
  };

  // Get image URL
  const getImageUrl = () => {
    return item.image_url || item.image || "https://via.placeholder.com/80";
  };

  // Get price
  const getPrice = () => {
    return item.price || 0;
  };

  // Get quantity
  const getQuantity = () => {
    return item.quantity || 1;
  };

  // Determine if we're loading quantity update or removal
  const isLoadingQuantity = isLoading === "quantity";
  const isLoadingRemove = isLoading === "remove";

  return (
    <View style={[styles.cartItem, isLoading && styles.cartItemLoading]}>
      <Image source={{ uri: getImageUrl() }} style={styles.itemImage} />

      {/* Overlay for loading removal */}
      {isLoadingRemove && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#C5A059" />
          <Text style={styles.loadingText}>Removing...</Text>
        </View>
      )}

      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={1}>
          {getName()}
        </Text>
        <Text style={styles.itemMaterial} numberOfLines={1}>
          {getMaterial()}
        </Text>
        <Text style={styles.itemPrice}>${getPrice().toLocaleString()}</Text>
      </View>

      <View style={styles.itemActions}>
        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={[
              styles.qtyButton,
              (getQuantity() <= 1 || isLoadingQuantity) &&
                styles.qtyButtonDisabled,
            ]}
            onPress={handleDecrease}
            disabled={getQuantity() <= 1 || isLoadingQuantity}
          >
            {isLoadingQuantity ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="remove" size={16} color="#fff" />
            )}
          </TouchableOpacity>

          <Text style={styles.quantity}>{getQuantity()}</Text>

          <TouchableOpacity
            style={[
              styles.qtyButton,
              isLoadingQuantity && styles.qtyButtonDisabled,
            ]}
            onPress={handleIncrease}
            disabled={isLoadingQuantity}
          >
            {isLoadingQuantity ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="add" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.removeButton,
            isLoadingRemove && styles.removeButtonDisabled,
          ]}
          onPress={handleRemove}
          disabled={isLoadingRemove}
        >
          {isLoadingRemove ? (
            <ActivityIndicator size="small" color="#ff6b6b" />
          ) : (
            <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
  },
  cartItemLoading: {
    opacity: 0.7,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: "#C5A059",
    fontWeight: "600",
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d2d2d",
    marginBottom: 4,
  },
  itemMaterial: {
    fontSize: 12,
    color: "#8a8595",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#C5A059",
  },
  itemActions: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f3f7",
    borderRadius: 25,
    marginBottom: 8,
  },
  qtyButton: {
    width: 32,
    height: 32,
    backgroundColor: "#C5A059",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyButtonDisabled: {
    opacity: 0.5,
  },
  quantity: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 12,
    color: "#2d2d2d",
    minWidth: 30,
    textAlign: "center",
  },
  removeButton: {
    padding: 6,
  },
  removeButtonDisabled: {
    opacity: 0.5,
  },
});
