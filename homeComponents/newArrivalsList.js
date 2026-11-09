import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import NewArrivalsCard from "./newArrivals";
import { fetchFurnitureData } from "../ApiServices/getFunctions";

const NewArrivalsList = ({ openModal }) => {
  const [newArrivals, setNewArrivals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getNewArrivals() {
      try {
        const items = await fetchFurnitureData();

        // Calculate date 2 weeks ago
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        // Filter items created within the last 2 weeks
        const filteredItems = items.filter((item) => {
          if (!item.created_at) return false;
          const createdDate = new Date(item.created_at);
          return createdDate >= twoWeeksAgo;
        });

        // Sort by created_at date (newest first)
        const sortedItems = filteredItems.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });

        setNewArrivals(sortedItems);
      } catch (error) {
        console.error("Error fetching new arrivals:", error);
      } finally {
        setIsLoading(false);
      }
    }

    getNewArrivals();
  }, []);

  const handlePress = (item) => {
    console.log("Pressed:", item.product_name);
  };

  const handleLike = (item, liked) => {
    console.log(`${liked ? "Liked" : "Unliked"}: ${item.product_name}`);
  };

  const handleAddToCart = (item) => {
    console.log(`Added to cart: ${item.product_name}`);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C5A059" />
      </View>
    );
  }

  if (newArrivals.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No new arrivals this week</Text>
        <Text style={styles.emptySubtext}>
          Check back soon for fresh items!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {newArrivals.map((item, index) => (
          <View key={item.id} style={styles.cardWrapper}>
            <NewArrivalsCard
              item={{
                id: item.id,
                product_name: item.product_name,
                name: item.product_name,
                price: item.price,
                currency: "$",
                dimensions: item.dimensions,
                color: item.color,
                description: item.description,
                materials: item.materials,
                image_url: item.image_url,
                rating: item.rating,
                reviews: item.review_number,
                isNew: true,
              }}
              onPress={handlePress}
              onLike={handleLike}
              onAddToCart={handleAddToCart}
              openModal={openModal}
            />
            {index < newArrivals.length - 1 && <View style={styles.spacer} />}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: 14,
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  cardWrapper: {
    marginBottom: 0,
  },
  spacer: {
    height: 45,
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

export default NewArrivalsList;
