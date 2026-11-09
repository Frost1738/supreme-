import { useFocusEffect } from "@react-navigation/native";
import React, { useContext, useCallback, useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ImageSlider from "../homeComponents/imageSlider";
import FeaturedHeader from "../homeComponents/featuredHeader";
import HorizontalScroll from "../homeComponents/featuredScroll";
import CategoriesSection from "../homeComponents/categoriesSelection";
import NewArrivalsList from "../homeComponents/newArrivalsList";
import NewArrivalsHeader from "../homeComponents/newArrivalsHeader";
import LoginRequiredModal from "../modals/actionRejection";
import { getCurrentUser, getUserFavorites } from "../ApiServices/serverActions";
import { GlobalContext } from "../Contexts/GlobalContext";

const SESSION_STORAGE_KEY = "@user_session";

export const Home = () => {
  const [isVisble, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { setSession, session, setLikedItems } = useContext(GlobalContext);

  // Function to get fresh session from Supabase
  const fetchFreshSession = useCallback(async () => {
    try {
      const { user, error } = await getCurrentUser();

      if (error || !user) {
        setSession(null);
        await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
        return null;
      }

      const sessionData = { user };
      setSession(sessionData);
      await AsyncStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify(sessionData),
      );
      console.log("✅ Fresh session stored for user:", user.email);
      return sessionData;
    } catch (error) {
      console.log("Error fetching fresh session:", error);
      return null;
    }
  }, [setSession]);

  // Load session from AsyncStorage (instant, no network call)
  const loadStoredSession = useCallback(async () => {
    try {
      const storedSession = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
      if (storedSession) {
        const parsedSession = JSON.parse(storedSession);
        // Set session first (this will trigger a re-render)
        setSession(parsedSession);
        console.log(
          "📦 Loaded session from storage:",
          parsedSession?.user?.email,
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error loading stored session:", error);
      return false;
    }
  }, [setSession]);

  // Initial load - storage first, then API fallback (if needed)
  useEffect(() => {
    let isMounted = true;
    let didFetchFromAPI = false;

    async function initializeSession() {
      setIsLoading(true);

      // STEP 1: Try to load from storage (instant)
      const hasStored = await loadStoredSession();

      // STEP 2: If no stored session, fetch fresh from server
      if (!hasStored && isMounted && !didFetchFromAPI) {
        didFetchFromAPI = true;
        await fetchFreshSession();
      }

      // Wait a bit for the context to update (async nature)
      // This gives React time to process the setSession calls
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (isMounted) {
        setIsLoading(false);
      }
    }

    initializeSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Use focus effect to refresh session ONLY when screen focuses
  // This runs after the initial useEffect has completed
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function refreshSession() {
        // Only refresh if we already have a session
        if (session?.user?.email) {
          console.log("🔄 Refreshing session for:", session.user.email);

          try {
            const { user, error } = await getCurrentUser();

            if (!error && user && isMounted) {
              // Only update if session changed (prevents unnecessary re-renders)
              if (session.user.id !== user.id) {
                setSession({ user });
                await AsyncStorage.setItem(
                  SESSION_STORAGE_KEY,
                  JSON.stringify({ user }),
                );
              }
            } else if (error && isMounted) {
              // Session is invalid - clear it
              setSession(null);
              await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
            }
          } catch (error) {
            console.log("Error refreshing session:", error);
          }
        }
      }

      refreshSession();

      return () => {
        isMounted = false;
      };
    }, [session?.user?.email, session?.user?.id]),
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C5A059" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={["#5D4037", "#C5A059"]} style={styles.gradient}>
        <ImageSlider />
        <View style={styles.categoryContainer}>
          <CategoriesSection />
        </View>

        <FeaturedHeader />
        <HorizontalScroll />
        <NewArrivalsHeader />
        <NewArrivalsList openModal={setIsVisible} />
      </LinearGradient>
      <LoginRequiredModal visible={isVisble} onClose={setIsVisible} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    borderRadius: 10,
  },
  categoryContainer: {
    width: "100%",
    height: "auto",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f6f2",
  },
});
