import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FilterBar from "../browserComponents/filters";
import BrowserCard from "../browserComponents/browserCards";
import ProductModal from "../browserComponents/productModal";
import LoginRequiredModal from "../modals/actionRejection";
import { fetchFurnitureData } from "../ApiServices/getFunctions";
import { getUserFavorites } from "../ApiServices/serverActions";
import { GlobalContext } from "../Contexts/GlobalContext";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;
const CARD_HEIGHT = 280; // Approximate height of each card

export default function Browser({ route }) {
  const preInsertedFilter = route?.params?.filter || "all";
  const [currentFilter, setCurrentFilter] = useState("all");
  const [likedMap, setLikedMap] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [allFurniture, setAllFurniture] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
  const { session } = useContext(GlobalContext);

  useFocusEffect(
    useCallback(() => {
      setCurrentFilter(preInsertedFilter);
    }, [preInsertedFilter]),
  );

  // Fetch furniture data
  useEffect(() => {
    async function getFurniture() {
      try {
        const furniture = await fetchFurnitureData();
        setAllFurniture(furniture || []);
      } catch (error) {
        console.error("Error fetching furniture:", error);
        setAllFurniture([]);
      } finally {
        setIsLoading(false);
      }
    }
    getFurniture();
  }, []);

  // Fetch all favorites at once
  useEffect(() => {
    async function loadAllFavorites() {
      if (session?.user?.email && allFurniture.length > 0) {
        try {
          const result = await getUserFavorites(session.user.email);
          if (result && result.favorites) {
            const map = {};
            result.favorites.forEach((fav) => {
              map[fav.id] = true;
            });
            setLikedMap(map);
          }
        } catch (error) {
          console.error("Error loading favorites:", error);
        } finally {
          setIsLoadingFavorites(false);
        }
      } else {
        setIsLoadingFavorites(false);
      }
    }
    loadAllFavorites();
  }, [session, allFurniture]);

  // Filter products
  const filteredProducts = allFurniture.filter((item) => {
    if (currentFilter === "all") return true;
    const category = item.category?.toLowerCase() || "";
    const filterValue = currentFilter.toLowerCase();

    if (filterValue === "sofas" || filterValue === "sofas & couches") {
      return category.includes("sofa") || category.includes("couch");
    }
    return category === filterValue || category.includes(filterValue);
  });

  const handleCardPress = useCallback((item) => {
    setSelectedProduct({
      id: item.id,
      product_name: item.product_name,
      price: item.price,
      currency: "$",
      dimensions: item.dimensions,
      materials: item.materials,
      description: item.description,
      image_url: item.image_url,
      rating: item.rating,
      review_number: item.review_number,
      category: item.category,
      color: item.color,
    });
    setModalVisible(true);
  }, []);

  const handleLike = useCallback((itemId, newLikedState) => {
    setLikedMap((prev) => ({
      ...prev,
      [itemId]: newLikedState,
    }));
  }, []);

  const handleAddToCart = useCallback(() => {
    console.log("Added to cart:", selectedProduct?.product_name);
    setModalVisible(false);
  }, [selectedProduct]);

  const renderItem = useCallback(
    ({ item }) => (
      <BrowserCard
        item={item}
        onPress={handleCardPress}
        onLike={handleLike}
        isLiked={likedMap[item.id] || false}
        openRejectionModal={setIsVisible}
      />
    ),
    [handleCardPress, handleLike, likedMap],
  );

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  const getItemLayout = useCallback(
    (data, index) => ({
      length: CARD_HEIGHT,
      offset: CARD_HEIGHT * index,
      index,
    }),
    [],
  );

  const ListHeaderComponent = useCallback(
    () => (
      <>
        <FilterBar
          onFilterChange={setCurrentFilter}
          selectedFilter={currentFilter}
        />
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "item" : "items"} found
          </Text>
        </View>
      </>
    ),
    [filteredProducts.length],
  );

  const ListEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={64} color="#CCB7AE" />
        <Text style={styles.emptyText}>No products found</Text>
        <Text style={styles.emptySubtext}>Try a different category</Text>
      </View>
    ),
    [],
  );

  if (isLoading || isLoadingFavorites) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C5A059" />
        <Text style={styles.loadingText}>
          {isLoading ? "Loading furniture..." : "Loading your favorites..."}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        removeClippedSubviews={true}
        initialNumToRender={4}
        maxToRenderPerBatch={6}
        windowSize={5}
        getItemLayout={getItemLayout}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        columnWrapperStyle={styles.columnWrapper}
      />

      <ProductModal
        visible={modalVisible}
        product={selectedProduct}
        onClose={() => setModalVisible(false)}
        onAddToCart={handleAddToCart}
        openRejectionModal={setIsVisible}
        isLiked={
          selectedProduct ? likedMap[selectedProduct.id] || false : false
        }
        onLike={handleLike}
      />
      <LoginRequiredModal visible={isVisible} onClose={setIsVisible} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#5E5768",
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#5E5768",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#CCB7AE",
    fontWeight: "500",
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsText: {
    fontSize: 14,
    color: "#CCB7AE",
    fontWeight: "500",
  },
  flatListContent: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#CCB7AE",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#CCB7AE",
    marginTop: 8,
    opacity: 0.7,
  },
});
