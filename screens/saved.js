import React, { useState, useContext, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import FavoritesCard from "../favoritesComponent/savedCard";
import ProductDetailModal from "../favoritesComponent/favModal";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { GlobalContext } from "../Contexts/GlobalContext";
import LoginRequiredModal from "../modals/actionRejection";
import Toast from "react-native-toast-message";
import { getUserFavorites } from "../ApiServices/serverActions";
import { useFocusEffect } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

export default function Saved({ navigation }) {
  const [favorites, setFavorites] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { session, cartItems, setCartItems } = useContext(GlobalContext);

  // Function to load favorites
  const loadFavorites = useCallback(async () => {
    // If no session, just show empty state
    if (!session?.user?.email) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const result = await getUserFavorites(session.user.email);

      if (result && result.favorites && Array.isArray(result.favorites)) {
        // Transform favorites to match the expected format
        const formattedFavorites = result.favorites.map((fav) => ({
          id: fav.id,
          product_name: fav.name || fav.product_name,
          name: fav.name || fav.product_name,
          price: fav.price,
          dimensions: fav.dimensions || "Not specified",
          materials: fav.materials || "Premium quality",
          description: fav.description || "Beautiful piece of furniture",
          image_url: fav.image_url || fav.image,
          rating: fav.rating || 4.5,
          reviews: fav.reviews || 0,
          isNew: fav.isNew || false,
        }));
        setFavorites(formattedFavorites);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.email]);

  // Reload data every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites]),
  );

  const handleCardPress = useCallback((item) => {
    setSelectedProduct(item);
    setModalVisible(true);
  }, []);

  const handleRemove = useCallback((id) => {
    setFavorites((prev) => {
      const newFavorites = prev.filter((item) => item.id !== id);
      Toast.show({
        type: "success",
        text1: "Removed from Favorites",
        text2: "Item has been removed from your favorites",
        position: "top",
        visibilityTime: 2000,
        topOffset: 50,
      });
      return newFavorites;
    });
  }, []);

  const handleAddToCart = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleBack = useCallback(() => navigation?.goBack(), [navigation]);

  const handleOpenRejectionModal = useCallback((visible) => {
    setRejectionModalVisible(visible);
  }, []);

  // Show loading spinner while fetching favorites
  if (isLoading) {
    return (
      <View style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C5A059" />
          <Text style={styles.loadingText}>Loading your favorites...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialCommunityIcons
              name="book-arrow-left"
              size={24}
              color="black"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Favorites</Text>
          <View style={styles.countPill}>
            <Text style={styles.countText}>{favorites.length}</Text>
          </View>
        </View>

        {/* List or empty state */}
        {favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image
              source={{
                uri: "https://cdn-icons-png.flaticon.com/512/1077/1077035.png",
              }}
              style={styles.emptyImage}
            />
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the heart on any product to save it here.
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation?.navigate("browse")}
            >
              <Text style={styles.browseButtonText}>Discover Products</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {favorites.map((item) => (
              <FavoritesCard
                key={item.id}
                item={item}
                onPress={handleCardPress}
                onRemove={handleRemove}
              />
            ))}
          </ScrollView>
        )}

        {/* Full-featured modal with all required props */}
        <ProductDetailModal
          visible={modalVisible}
          product={selectedProduct}
          onClose={() => setModalVisible(false)}
          onAddToCart={handleAddToCart}
          openRejectionModal={handleOpenRejectionModal}
        />

        {/* Login Required Modal */}
        <LoginRequiredModal
          visible={rejectionModalVisible}
          onClose={() => setRejectionModalVisible(false)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F6F2",
    paddingTop: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F6F2",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F6F2",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#8a8595",
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#F8F6F2",
    borderBottomWidth: 1,
    borderBottomColor: "#E9E3D8",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2d2d2d",
  },
  countPill: {
    backgroundColor: "#C5A059",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  countText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  listContent: {
    paddingVertical: 12,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 24,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#2d2d2d",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#8a8595",
    textAlign: "center",
    marginBottom: 32,
  },
  browseButton: {
    backgroundColor: "#C5A059",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 30,
  },
  browseButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
