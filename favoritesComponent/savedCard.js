import React, {
  useRef,
  useState,
  useEffect,
  useContext,
  useTransition,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Animated,
  PanResponder,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { GlobalContext } from "../Contexts/GlobalContext";
import { removeFromFavorites } from "../ApiServices/serverActions";
import Toast from "react-native-toast-message";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.88;
const SWIPE_THRESHOLD = -CARD_WIDTH * 0.35;

export default function FavoritesCard({ item, onPress, onRemove }) {
  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [shouldRender, setShouldRender] = useState(true);
  const { session } = useContext(GlobalContext);

  // If should not render, don't render the card
  if (!shouldRender) {
    return null;
  }

  // 3D Tilt on press in/out
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
    Animated.spring(rotateAnim, {
      toValue: 0.5,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
    Animated.spring(rotateAnim, {
      toValue: 0,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const showToastAndRemove = () => {
    Toast.show({
      type: "success",
      text1: "Removed from Favorites",
      text2: `${item.product_name || item.name} has been removed`,
      position: "top",
      visibilityTime: 2500,
      topOffset: 60,
    });

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Then remove the card
    setShouldRender(false);

    // Trigger parent update
    onRemove?.(item.id);
  };

  const handleRemove = () => {
    if (!session?.user?.email) {
      Toast.show({
        type: "error",
        text1: "Login Required",
        text2: "You must be logged in to remove favorites",
        position: "top",
        visibilityTime: 3000,
        topOffset: 60,
      });
      return;
    }

    // Show toast and remove card immediately
    showToastAndRemove();

    // Background server action
    startTransition(async () => {
      const itemToRemove = {
        id: item.id,
        name: item.product_name || item.name,
        image: item.image_url,
        price: item.price,
        rating: item.rating || 4.5,
      };

      try {
        await removeFromFavorites(session.user.email, itemToRemove);
      } catch (error) {
        console.error("Error removing from favorites:", error);
      }
    });
  };

  // PanResponder for swipe to remove
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 10,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dx < 0 && !isPending && shouldRender) {
          translateX.setValue(gesture.dx);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx < SWIPE_THRESHOLD && !isPending && shouldRender) {
          translateX.stopAnimation();
          handleRemove();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  // Card rotation interpolation
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["0deg", "1.5deg", "0deg"],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: scaleAnim },
            { rotate: rotateInterpolate },
            { translateX },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Glassmorphic card background */}
      {Platform.OS === "ios" ? (
        <BlurView intensity={80} tint="light" style={styles.blur}>
          <View style={styles.innerCard} />
        </BlurView>
      ) : (
        <View
          style={[
            styles.innerCard,
            { backgroundColor: "rgba(255,255,255,0.85)" },
          ]}
        />
      )}

      {/* Content container */}
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress?.(item)}
        style={styles.touchable}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: item.image_url }}
            style={styles.image}
            onLoadEnd={() => setImageLoaded(true)}
            resizeMode="cover"
          />
          {/* New badge */}
          {item.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newText}>✦ NEW ✦</Text>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.product_name}
          </Text>
          <Text style={styles.price}>${item.price}</Text>
          {/* Mini rating */}
          <View style={styles.rating}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name="star"
                size={12}
                color={star <= 4 ? "#FFB800" : "#E0E0E0"}
              />
            ))}
            <Text style={styles.reviews}>({item.reviews || 128})</Text>
          </View>
        </View>

        {/* Swipe hint */}
        <View style={styles.swipeHint}>
          <Text style={styles.swipeText}>← swipe to remove</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginVertical: 12,
    alignSelf: "center",
    borderRadius: 32,
    overflow: "hidden",
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    overflow: "hidden",
  },
  innerCard: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 32,
  },
  touchable: {
    width: "100%",
  },
  imageWrapper: {
    height: CARD_WIDTH * 0.7,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#f0f0f0",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  newBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "#C5A059",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
    zIndex: 2,
  },
  newText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  info: {
    padding: 20,
    paddingBottom: 24,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e1e2a",
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: "800",
    color: "#C5A059",
    marginBottom: 8,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  reviews: {
    fontSize: 11,
    color: "#8a8595",
    marginLeft: 8,
  },
  swipeHint: {
    position: "absolute",
    left: 20,
    bottom: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  swipeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "500",
  },
});
