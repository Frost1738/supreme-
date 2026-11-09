import React, {
  useContext,
  useEffect,
  useState,
  useTransition,
  useRef,
} from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  ActivityIndicator,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { GlobalContext } from "../Contexts/GlobalContext";
import { getUserFavorites, addToFavorites } from "../ApiServices/serverActions";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.85;

const NewArrivalsCard = ({ item, onPress, onLike, onAddToCart, openModal }) => {
  const [optimisticLiked, setOptimisticLiked] = useState(false);
  const [actualLiked, setActualLiked] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const [showAlreadyInCartMessage, setShowAlreadyInCartMessage] =
    useState(false);

  // ✅ FIX: Use useRef for Animated values instead of useState
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const alreadyInCartAnim = useRef(new Animated.Value(0)).current;

  const { setLikedItems, likedItems, session, setCartItems, cartItems } =
    useContext(GlobalContext);

  // Check if item is already in cart
  const isInCart = cartItems.some((cartItem) => cartItem.id === item?.id);

  // The displayed liked state (optimistic UI)
  const displayedLiked = isPending ? optimisticLiked : actualLiked;

  // Load liked status from server when component mounts or session changes
  useEffect(() => {
    async function getLikedProducts() {
      if (session?.user?.email && item?.id) {
        const favorites = await getUserFavorites(session?.user?.email);
        if (favorites && favorites.favorites) {
          const isItemLiked = favorites.favorites.some(
            (fav) => fav.id === item?.id,
          );
          setActualLiked(isItemLiked);
          setOptimisticLiked(isItemLiked);
        }
      }
    }
    getLikedProducts();
  }, [session, item?.id]);

  // ✅ FIX: Cleanup animations on unmount
  useEffect(() => {
    return () => {
      // Stop all animations when component unmounts
      fadeAnim.stopAnimation();
      alreadyInCartAnim.stopAnimation();
    };
  }, [fadeAnim, alreadyInCartAnim]);

  const handleLike = async () => {
    if (!session?.user?.email) {
      openModal(true);
      return;
    }

    // Optimistic update - change color immediately
    const newLikedState = !displayedLiked;
    setOptimisticLiked(newLikedState);

    // Prepare favorite item object
    const favoriteItem = {
      id: item?.id,
      name: item?.product_name || item?.name,
      product_name: item?.product_name || item?.name,
      price: item?.price,
      image: item?.image_url || item?.imageUrl || item?.image,
      rating: item?.rating || 4.5,
      reviews: item?.review_number || item?.reviews || 0,
      addedAt: new Date().toISOString(),
    };

    // Start transition for the actual server action
    startTransition(async () => {
      try {
        const result = await addToFavorites(session.user.email, favoriteItem);

        if (result.success) {
          setActualLiked(newLikedState);
          onLike?.(item, newLikedState);

          if (setLikedItems) {
            if (newLikedState) {
              setLikedItems((prev) => [...prev, favoriteItem]);
            } else {
              setLikedItems((prev) =>
                prev.filter((fav) => fav.id !== item?.id),
              );
            }
          }

          Toast.show({
            type: "success",
            text1: newLikedState
              ? "Added to Favorites ❤️"
              : "Removed from Favorites",
            text2: item?.product_name || item?.name,
            position: "top",
            visibilityTime: 2000,
            topOffset: 50,
          });
        } else {
          setOptimisticLiked(actualLiked);
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
        setOptimisticLiked(actualLiked);
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

  const handlePress = () => {
    onPress?.(item);
  };

  // ✅ FIX: Proper animation with cleanup
  const showSuccessMessage = () => {
    setShowAddedMessage(true);
    // Reset animation value first
    fadeAnim.setValue(0);
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
    ]).start(() => {
      setShowAddedMessage(false);
      fadeAnim.setValue(0);
    });
  };

  // ✅ FIX: Proper animation with cleanup
  const showAlreadyInCartNotification = () => {
    setShowAlreadyInCartMessage(true);
    alreadyInCartAnim.setValue(0);
    Animated.sequence([
      Animated.timing(alreadyInCartAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(alreadyInCartAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowAlreadyInCartMessage(false);
      alreadyInCartAnim.setValue(0);
    });
  };

  const handleAddToCart = () => {
    if (isInCart) {
      console.log("Item already in cart:", item?.product_name || item?.name);
      showAlreadyInCartNotification();
      return;
    }

    const cartItem = {
      id: item?.id,
      name: item?.product_name || item?.name,
      product_name: item?.product_name || item?.name,
      price: item?.price,
      currency: item?.currency || "$",
      dimensions: item?.dimensions,
      color: item?.color,
      materials: item?.materials,
      description: item?.description,
      image_url: item?.image_url || item?.imageUrl || item?.image,
      quantity: 1,
      addedAt: Date.now(),
    };

    console.log(`Adding ${cartItem.name} to cart`);

    setCartItems((prevItems) => [...prevItems, cartItem]);
    showSuccessMessage();
    onAddToCart?.(item);
  };

  const getImageUrl = () => {
    return item.imageUrl || item.image_url || item.image;
  };

  const getProductName = () => {
    return item.product_name || item.name;
  };

  const getPrice = () => {
    return item.price || 0;
  };

  const getCurrency = () => {
    return item.currency || "$";
  };

  const getDimensions = () => {
    return item.dimensions || "Not specified";
  };

  const getColor = () => {
    return item.color || "#ddd";
  };

  const getDescription = () => {
    return item.description || "";
  };

  const getMaterials = () => {
    return item.materials || "";
  };

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getImageUrl() }}
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.likeButton}
            onPress={handleLike}
            disabled={isPending}
          >
            <MaterialCommunityIcons
              name={displayedLiked ? "heart" : "heart-outline"}
              size={22}
              color={displayedLiked ? "#C5A059" : "#fff"}
            />
          </TouchableOpacity>
          {isPending && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color="#C5A059" />
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {getProductName()}
          </Text>
          <Text style={styles.price}>
            {getCurrency()}
            {getPrice()}
          </Text>

          <View style={styles.detailsRow}>
            <Text style={styles.detailText} numberOfLines={1}>
              📏 {getDimensions()}
            </Text>
            <View style={[styles.colorDot, { backgroundColor: getColor() }]} />
          </View>

          {getDescription() && (
            <Text style={styles.description} numberOfLines={2}>
              {getDescription()}
            </Text>
          )}

          {getMaterials() && (
            <View style={styles.materialsContainer}>
              <MaterialCommunityIcons
                name="material-design"
                size={12}
                color="#888"
              />
              <Text style={styles.materialsText} numberOfLines={1}>
                {getMaterials()}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.cartButton}
            onPress={handleAddToCart}
            activeOpacity={0.7}
          >
            <Text style={styles.cartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {showAddedMessage && (
        <Animated.View style={[styles.messageOverlay, { opacity: fadeAnim }]}>
          <View style={styles.successMessageContainer}>
            <MaterialCommunityIcons
              name="check-circle"
              size={24}
              color="#4CAF50"
            />
            <Text style={styles.successMessageText}>Added to Cart!</Text>
          </View>
        </Animated.View>
      )}

      {showAlreadyInCartMessage && (
        <Animated.View
          style={[styles.messageOverlay, { opacity: alreadyInCartAnim }]}
        >
          <View style={styles.warningMessageContainer}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={24}
              color="#FF9800"
            />
            <Text style={styles.warningMessageText}>Already in Cart!</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    position: "relative",
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginVertical: 8,
    marginHorizontal: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    height: CARD_WIDTH * 0.9,
    backgroundColor: "#f5f5f5",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  likeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    padding: 6,
    zIndex: 2,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    zIndex: 3,
  },
  infoContainer: {
    padding: 14,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e1e2a",
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#C5A059",
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  detailText: {
    fontSize: 12,
    color: "#888",
    flex: 1,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 0.5,
    borderColor: "#ddd",
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    color: "#666",
    marginBottom: 8,
  },
  materialsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 6,
  },
  materialsText: {
    fontSize: 11,
    color: "#888",
    flex: 1,
  },
  cartButton: {
    backgroundColor: "#C5A059",
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: "center",
  },
  cartText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
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
    borderRadius: 20,
    zIndex: 20,
  },
  successMessageContainer: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  successMessageText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2d2d2d",
  },
  warningMessageContainer: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  warningMessageText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2d2d2d",
  },
});

export default NewArrivalsCard;
