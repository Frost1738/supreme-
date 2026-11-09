import React, { useContext, useState } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import CartHeader from "../CartComponents/cartHeader";
import CartItem from "../CartComponents/cartItem";
import OrderSummary from "../CartComponents/orderSummary";
import PromoCode from "../CartComponents/promoCode";
import CheckoutButton from "../CartComponents/checkOut";
import EmptyCart from "../CartComponents/emptyCart";
import { GlobalContext } from "../Contexts/GlobalContext";
import { confirmBooking } from "../ApiServices/serverActions";
import Toast from "react-native-toast-message";

export default function Cart({ navigation }) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [loadingItems, setLoadingItems] = useState({});
  const { cartItems, setCartItems, session } = useContext(GlobalContext);

  const totalPrice = cartItems.reduce((accum, item) => accum + item.price, 0);

  // Filter out items with undefined IDs
  const validCartItems = cartItems.filter(
    (item) => item.id !== undefined && item.id !== null,
  );

  const hasItems = validCartItems.length > 0;

  // Calculate subtotal correctly with quantity
  const subtotal = validCartItems.reduce((sum, item) => {
    const price = item.price || 0;
    const quantity = item.quantity || 1;
    return sum + price * quantity;
  }, 0);

  const shipping = subtotal > 500 ? 0 : 15;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  // Prepare products array for booking
  const prepareProductsArray = () => {
    return validCartItems.map((item) => ({
      id: item.id,
      name: item.product_name || item.name,
      price: item.price,
      quantity: item.quantity || 1,
      dimensions: item.dimensions,
      materials: item.materials,
      image_url: item.image_url,
    }));
  };

  // UPDATE QUANTITY FUNCTION WITH LOADING STATE
  const updateQuantity = async (itemId, newQuantity) => {
    setLoadingItems((prev) => ({ ...prev, [itemId]: "quantity" }));

    await new Promise((resolve) => setTimeout(resolve, 300));

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item,
      ),
    );

    setLoadingItems((prev) => ({ ...prev, [itemId]: null }));
  };

  // REMOVE ITEM FUNCTION WITH LOADING STATE
  const removeItem = async (itemId) => {
    setLoadingItems((prev) => ({ ...prev, [itemId]: "remove" }));

    await new Promise((resolve) => setTimeout(resolve, 300));

    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));

    Toast.show({
      type: "success",
      text1: "Item Removed",
      text2: "Item has been removed from your cart",
      position: "top",
      visibilityTime: 2000,
      topOffset: 50,
    });

    setLoadingItems((prev) => {
      const newState = { ...prev };
      delete newState[itemId];
      return newState;
    });
  };

  const handleCheckout = async () => {
    // Check if user is logged in
    if (!session?.user?.email) {
      Toast.show({
        type: "error",
        text1: "Login Required",
        text2: "Please login to complete your purchase",
        position: "top",
        visibilityTime: 3000,
        topOffset: 50,
      });
      navigation?.navigate("Auth");
      return;
    }

    // Check if cart is not empty
    if (validCartItems.length === 0) {
      Toast.show({
        type: "error",
        text1: "Cart Empty",
        text2: "Add some items to your cart before checking out",
        position: "top",
        visibilityTime: 3000,
        topOffset: 50,
      });
      return;
    }

    setIsCheckingOut(true);

    try {
      const productsArray = prepareProductsArray();

      // You can add a phone number input modal here if needed
      // For now using a placeholder or get from user context
      const phoneNumber = session?.user?.phone || "Not provided";

      const result = await confirmBooking(
        session.user.email,
        productsArray,
        phoneNumber,
      );

      if (result.success) {
        Toast.show({
          type: "success",
          text1: "Order Placed! 🎉",
          text2: "Your booking has been confirmed",
          position: "top",
          visibilityTime: 3000,
          topOffset: 50,
        });

        // Clear cart after successful booking
        setCartItems([]);

        // Navigate to home or orders screen
        navigation?.navigate("Home");
      } else {
        Toast.show({
          type: "error",
          text1: "Booking Failed",
          text2: result.error || "Something went wrong. Please try again.",
          position: "top",
          visibilityTime: 3000,
          topOffset: 50,
        });
      }
    } catch (error) {
      console.error("Checkout error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to process your order. Please try again.",
        position: "top",
        visibilityTime: 3000,
        topOffset: 50,
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!hasItems) {
    return <EmptyCart onBrowsePress={() => navigation?.navigate("browse")} />;
  }

  return (
    <View style={styles.container}>
      <CartHeader
        itemCount={validCartItems.length}
        onBack={() => navigation?.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {validCartItems.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
            isLoading={loadingItems[item.id]}
          />
        ))}

        <OrderSummary subtotal={total.toFixed(2)} discount="-0" />
        <PromoCode />

        {/* Checkout Button with loading state */}
        <CheckoutButton onPress={handleCheckout} isLoading={isCheckingOut} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f6f2",
  },
});
