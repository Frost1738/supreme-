import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PromoCode() {
  return (
    <View style={styles.promoContainer}>
      <View style={styles.promoInput}>
        <Ionicons name="pricetag-outline" size={20} color="#C5A059" />
        <Text style={styles.promoPlaceholder}>Enter promo code</Text>
      </View>
      <TouchableOpacity style={styles.applyButton}>
        <Text style={styles.applyButtonText}>Apply</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  promoContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  promoInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    borderRadius: 30,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  promoPlaceholder: {
    fontSize: 14,
    color: "#b0abb8",
  },
  applyButton: {
    backgroundColor: "#C5A059",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    justifyContent: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
