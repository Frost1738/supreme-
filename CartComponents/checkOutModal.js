import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CheckoutModal({ visible, onClose, onPlaceOrder }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Checkout</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#2d2d2d" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Payment Methods */}
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentOptions}>
              <TouchableOpacity style={styles.paymentOption}>
                <Ionicons name="card-outline" size={24} color="#8a8595" />
                <Text style={styles.paymentText}>Credit Card</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.paymentOption}>
                <Ionicons name="logo-paypal" size={24} color="#8a8595" />
                <Text style={styles.paymentText}>PayPal</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.paymentOption}>
                <Ionicons name="logo-apple" size={24} color="#8a8595" />
                <Text style={styles.paymentText}>Apple Pay</Text>
              </TouchableOpacity>
            </View>

            {/* Shipping Address */}
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <View style={styles.addressCard}>
              <Text style={styles.addressName}>John Doe</Text>
              <Text style={styles.addressLine}>123 Main Street</Text>
              <Text style={styles.addressLine}>Apt 4B</Text>
              <Text style={styles.addressLine}>New York, NY 10001</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit Address</Text>
            </TouchableOpacity>

            {/* Order Total */}
            <View style={styles.modalSummary}>
              <Text style={styles.modalSummaryTitle}>Order Total</Text>
              <Text style={styles.modalTotal}>$0.00</Text>
            </View>

            {/* Place Order Button */}
            <TouchableOpacity
              style={styles.placeOrderButton}
              onPress={onPlaceOrder}
            >
              <Text style={styles.placeOrderText}>Place Order</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: "90%",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2d2d2d",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d2d2d",
    marginTop: 20,
    marginBottom: 12,
  },
  paymentOptions: {
    flexDirection: "row",
    gap: 12,
  },
  paymentOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e2e8",
    backgroundColor: "#fff",
  },
  paymentText: {
    fontSize: 14,
    color: "#8a8595",
    fontWeight: "500",
  },
  addressCard: {
    backgroundColor: "#f8f6f2",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d2d2d",
    marginBottom: 4,
  },
  addressLine: {
    fontSize: 14,
    color: "#6a6a7e",
    marginBottom: 2,
  },
  editButton: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  editButtonText: {
    color: "#C5A059",
    fontSize: 14,
    fontWeight: "600",
  },
  modalSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e5e2e8",
    paddingTop: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  modalSummaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d2d2d",
  },
  modalTotal: {
    fontSize: 28,
    fontWeight: "800",
    color: "#C5A059",
  },
  placeOrderButton: {
    backgroundColor: "#C5A059",
    paddingVertical: 16,
    borderRadius: 40,
    alignItems: "center",
    marginBottom: 20,
  },
  placeOrderText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
