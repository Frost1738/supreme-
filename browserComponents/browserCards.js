import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useTransition,
  useEffect,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  Animated,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlobalContext } from "../Contexts/GlobalContext";
import { addToFavorites } from "../ApiServices/serverActions";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");

export default function BrowserCard({
  item,
  onPress,
  isLiked: externalIsLiked,
  onLike,
  openRejectionModal,
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [optimisticLiked, setOptimisticLiked] = useState(false);
  const [actualLiked, setActualLiked] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [hasLiked, setHasLiked] = useState(false); // Track if already liked
  const { session, likedItems, setLikedItems } = useContext(GlobalContext);

  // The displayed liked state (optimistic UI)
  const displayedLiked = isPending ? optimisticLiked : actualLiked;

  // Sync with external isLiked prop (initial load)
  useEffect(() => {
    const initialLikedState = externalIsLiked || false;
    setActualLiked(initialLikedState);
    setOptimisticLiked(initialLikedState);
    setHasLiked(initialLikedState);
  }, [externalIsLiked]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const showSavedToFavoritesMessage = () => {
    setShowSavedMessage(true);
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setShowSavedMessage(false));
  };

  const handleLike = async () => {
    // Check if user is logged in
    if (!session?.user?.email) {
      openRejectionModal(true);
      return;
    }

    // Prevent multiple clicks while pending
    if (isPending) return;

    // Prevent liking if already liked
    if (hasLiked || displayedLiked) return;

    // Optimistic update - change color immediately
    const newLikedState = true; // Can only like, not unlike
    setOptimisticLiked(newLikedState);
    setHasLiked(true);

    // Show saved message
    showSavedToFavoritesMessage();

    // Prepare favorite item object
    const favoriteItem = {
      id: item?.id,
      name: item?.product_name || item?.name,
      product_name: item?.product_name || item?.name,
      price: item?.price,
      image: item?.image_url,
      rating: item?.rating || 4.5,
      reviews: item?.review_number || item?.reviews || 0,
      addedAt: new Date().toISOString(),
    };

    // Start transition for the actual server action
    startTransition(async () => {
      try {
        const result = await addToFavorites(session.user.email, favoriteItem);

        if (result.success) {
          // Server success - update actual state
          setActualLiked(newLikedState);

          // Call the onLike callback
          onLike?.(item.id, newLikedState);

          // Update liked items in context if setLikedItems is available
          if (setLikedItems) {
            setLikedItems((prev) => [...prev, favoriteItem]);
          }

          Toast.show({
            type: "success",
            text1: "Added to Favorites ❤️",
            text2: item?.product_name,
            position: "top",
            visibilityTime: 2000,
            topOffset: 50,
          });
        } else {
          // Server failed - revert optimistic update
          setOptimisticLiked(actualLiked);
          setHasLiked(actualLiked);
          Toast.show({
            type: "error",
            text1: "Error",
            text2: result.error?.message || "Failed to update favorites",
            position: "top",
            visibilityTime: 3000,
            topOffset: 50,
          });
        }
      } catch (error) {
        console.error("Error in handleLike:", error);
        // Revert optimistic update on error
        setOptimisticLiked(actualLiked);
        setHasLiked(actualLiked);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Something went wrong",
          position: "top",
          visibilityTime: 3000,
          topOffset: 50,
        });
      }
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => onPress?.(item)}
    >
      <Animated.View
        style={[styles.itemCard, { transform: [{ scale: scaleAnim }] }]}
      >
        <View style={styles.card}>
          <TouchableOpacity
            onPress={handleLike}
            style={styles.heartButton}
            disabled={isPending || hasLiked || displayedLiked}
          >
            <Ionicons
              name={displayedLiked ? "heart" : "heart-outline"}
              size={20}
              color={displayedLiked ? "#ff7700" : "#9C7B5D"}
            />
          </TouchableOpacity>

          {showSavedMessage && (
            <Animated.View
              style={[styles.messageOverlay, { opacity: fadeAnim }]}
            >
              <View style={styles.savedMessageContainer}>
                <Text style={styles.messageText}>♥️ Saved</Text>
              </View>
            </Animated.View>
          )}

          <ImageBackground
            source={{ uri: item.image_url }}
            resizeMode="cover"
            style={styles.bgImage}
            imageStyle={{ borderRadius: 12 }}
          />
        </View>
        <Text style={styles.mainText} numberOfLines={1}>
          {item.product_name}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>${item.price}</Text>
          <Text style={styles.strikeThroughPrice}>${item.price + 200}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  itemCard: {
    height: 250,
    width: width * 0.45,
    marginHorizontal: 6,
    marginVertical: 8,
    alignItems: "flex-start",
  },
  card: {
    width: "100%",
    height: 200,
    overflow: "hidden",
    borderRadius: 12,
    position: "relative",
  },
  bgImage: {
    height: "100%",
    width: "100%",
  },
  heartButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 2,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 20,
    padding: 4,
  },
  messageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    zIndex: 10,
  },
  savedMessageContainer: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 40,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  messageText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d2d2d",
  },
  mainText: {
    marginLeft: 8,
    marginTop: 8,
    fontWeight: "500",
    fontSize: 14,
    color: "#CCCCCC",
  },
  priceContainer: {
    flexDirection: "row",
    marginLeft: 8,
    marginTop: 4,
    gap: 8,
    alignItems: "center",
  },
  currentPrice: {
    color: "#A98A4C",
    fontSize: 14,
    fontWeight: "600",
  },
  strikeThroughPrice: {
    color: "#999",
    fontSize: 12,
    textDecorationLine: "line-through",
  },
});
