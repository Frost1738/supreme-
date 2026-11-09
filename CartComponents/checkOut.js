// CartComponents/checkOut.js
import React from "react";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CheckoutButton({ onPress, isLoading }) {
  return (
    <TouchableOpacity
      style={styles.checkoutButton}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <>
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  checkoutButton: {
    flexDirection: "row",
    backgroundColor: "#C5A059",
    marginHorizontal: 16,
    marginBottom: 30,
    paddingVertical: 16,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    shadowColor: "#C5A059",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
