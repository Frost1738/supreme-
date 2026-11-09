import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function OrderSummary({ subtotal, discount, total }) {
  return (
    <View style={styles.summaryContainer}>
      <Text style={styles.summaryTitle}>Order Summary</Text>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Subtotal</Text>
        <Text style={styles.summaryValue}>${subtotal}</Text>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>discount</Text>
        <Text style={styles.summaryValue}>
          {discount === 0 ? "Free" : `$${discount}`}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={[styles.summaryRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>${subtotal + discount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryContainer: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d2d2d",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#8a8595",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2d2d2d",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e2e8",
    marginVertical: 12,
  },
  totalRow: {
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2d2d2d",
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#C5A059",
  },
});
