import React, { useEffect, useState } from "react";
import {
  FlatList,
  View,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Text,
  ActivityIndicator,
} from "react-native";
import FurnitureCard from "./featuredCard";
import { fetchFurnitureData } from "../ApiServices/getFunctions";

const { width, height } = Dimensions.get("window");
const CARD_HEIGHT = height * 0.38;
const CARD_WIDTH = width * 0.6;
const CARD_SPACING = 32;

const ITEM_WIDTH = CARD_WIDTH + CARD_SPACING;

const HorizontalScroll = () => {
  const [popularItems, setPopularItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getPopularFurniture() {
      try {
        const furniture = await fetchFurnitureData();

        // Filter items where popular is true
        const filteredPopular = furniture.filter(
          (item) => item.popular === true,
        );

        setPopularItems(filteredPopular);
      } catch (error) {
        console.log("Error fetching popular furniture:", error);
      } finally {
        setIsLoading(false);
      }
    }

    getPopularFurniture();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C5A059" />
      </SafeAreaView>
    );
  }

  if (popularItems.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No popular items found</Text>
        <Text style={styles.emptySubtext}>
          Check back soon for featured products!
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={popularItems}
        keyExtractor={(item) => item.id?.toString() || item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        bounces={false}
        contentContainerStyle={styles.flatListContent}
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.cardWrapper,
              index === 0 && { marginLeft: 16 },
              index === popularItems.length - 1 && { marginRight: 16 },
            ]}
          >
            <FurnitureCard
              item={{
                id: item.id,
                name: item.product_name,
                price: item.price,
                currency: "$",
                dimensions: item.dimensions,
                color: item.color,
                description: item.description,
                imageUrl: item.image_url,
                rating: item.rating,
                reviews: item.review_number,
              }}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  flatListContent: {
    alignItems: "center",
    paddingVertical: 20,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_SPACING,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d2d2d",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#8a8595",
  },
});

export default HorizontalScroll;
