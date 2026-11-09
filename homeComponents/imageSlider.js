import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  Dimensions,
  Animated,
  FlatList,
  ImageBackground,
  Image,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";

const { width, height } = Dimensions.get("window");
const SLIDER_HEIGHT = height * 0.33;

const IMAGES = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "2",
    url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop",
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1918&auto=format&fit=crop",
  },
  {
    id: "4",
    url: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8ZnVybml0dXJlfGVufDB8fDB8fHww",
  },
  {
    id: "5",
    url: "https://images.unsplash.com/photo-1519643381401-22c77e60520e?w=600&auto=format&fit=crop",
  },
  {
    id: "6",
    url: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600&auto=format&fit=crop",
  },
];

const ImageSlider = () => {
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(0.8)).current;
  const [imagesReady, setImagesReady] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const animationRef = useRef(null);
  const isScrolling = useRef(false);

  // Preload all images
  useEffect(() => {
    IMAGES.forEach(async (image) => {
      try {
        await Image.prefetch(image.url);
        setImagesReady((prev) => ({ ...prev, [image.id]: true }));
      } catch (error) {
        console.warn(`Failed to preload image: ${image.id}`, error);
        setImagesReady((prev) => ({ ...prev, [image.id]: false }));
      }
    });
  }, []);

  // BUTTERY SMOOTH CUSTOM SCROLL ANIMATION
  const smoothScrollToIndex = (targetIndex, duration = 1500) => {
    if (!flatListRef.current || isScrolling.current) return;

    isScrolling.current = true;
    const startIndex = currentIndex;
    const delta = targetIndex - startIndex;

    // Handle wrap-around
    let adjustedDelta = delta;
    if (Math.abs(delta) > IMAGES.length / 2) {
      adjustedDelta = delta > 0 ? delta - IMAGES.length : delta + IMAGES.length;
    }

    const startOffset = startIndex * width;
    const targetOffset = targetIndex * width;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      let progress = Math.min(1, elapsed / duration);

      // Easing function for buttery smoothness
      const easeInOutCubic =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const currentOffset =
        startOffset + (targetOffset - startOffset) * easeInOutCubic;

      flatListRef.current.scrollToOffset({
        offset: currentOffset,
        animated: false,
      });

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCurrentIndex(targetIndex);
        isScrolling.current = false;
        animationRef.current = null;
      }
    };

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(animate);
  };

  // Auto-slide with buttery smooth custom animation
  useEffect(() => {
    if (Object.keys(imagesReady).length === 0) return;

    const interval = setInterval(() => {
      if (isScrolling.current) return;
      const nextIndex = (currentIndex + 1) % IMAGES.length;
      smoothScrollToIndex(nextIndex, 1200); // 1.2 second transition
    }, 5000);

    return () => {
      clearInterval(interval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentIndex, imagesReady]);

  // Update current index on manual scroll end
  const onMomentumScrollEnd = (event) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(newIndex);
    isScrolling.current = false;
  };

  // Start manual scroll
  const onScrollBeginDrag = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    isScrolling.current = false;
  };

  useEffect(() => {
    textOpacity.setValue(1);
    textScale.setValue(1);

    const timeout = setTimeout(() => {
      Animated.timing(textOpacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }, 3000);

    // Cleanup: stop animation and clear timeout on unmount
    return () => {
      clearTimeout(timeout);
      // Optionally stop ongoing animation
      textOpacity.stopAnimation();
      // Reset values to avoid flicker on remount
      textOpacity.setValue(1);
      textScale.setValue(0.8);
    };
  }, []);

  const renderItem = ({ item }) => (
    <ImageBackground
      source={{ uri: item.url }}
      style={styles.imageBackground}
      resizeMode="cover"
    >
      {!imagesReady[item.id] && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#B8B0A0" />
        </View>
      )}
      <View style={styles.overlay} />
    </ImageBackground>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={IMAGES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        bounces={false}
        pagingEnabled={false}
        snapToInterval={width}
        snapToAlignment="center"
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollBeginDrag={onScrollBeginDrag}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews={false}
        decelerationRate={0.98}
      />

      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textOpacity,
            transform: [{ scale: textScale }],
          },
        ]}
        pointerEvents="none"
      >
        <Text style={styles.mainTitle}>Supreme Furniture</Text>
        <Text style={styles.subTitle}>luxury you can afford</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: SLIDER_HEIGHT,
    width: width,
    position: "relative",
    backgroundColor: "#1a1a1a",
  },
  imageBackground: {
    width: width,
    height: SLIDER_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  loaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
  },
  textContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    zIndex: 10,
  },
  mainTitle: {
    fontFamily: "serif",
    fontSize: 42,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#B8B0A0",
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
    textAlign: "center",
    paddingHorizontal: 20,
    backgroundColor: "transparent",
  },
  subTitle: {
    fontFamily: "sans-serif-light",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 1.5,
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 6,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 20,
    backgroundColor: "rgba(93, 64, 55, 0.4)",
    paddingVertical: 6,
    borderRadius: 25,
    overflow: "hidden",
  },
});

export default ImageSlider;
