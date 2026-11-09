import { supabase } from "../lib/supabase";

/** * Register a new user with email and password */
export async function registerUser(email, password, userMetadata = {}) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userMetadata.full_name || "",
          avatar_url: userMetadata.avatar_url || "",
          ...userMetadata, // This will include phone number and any other fields
        },
      },
    });

    if (error) {
      console.error("Registration error:", error.message);
      return { user: null, session: null, error };
    }

    console.log("Registration successful:", data.user?.email);
    return { user: data.user, session: data.session, error: null };
  } catch (error) {
    console.error("Unexpected error during registration:", error);
    return { user: null, session: null, error };
  }
}

/**
 * Login user with email and password

 */
export async function loginUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error("Login error:", error.message);
      return { user: null, session: null, error };
    }

    console.log("Login successful:", data.user?.email);
    return { user: data.user, session: data.session, error: null };
  } catch (error) {
    return { user: null, session: null, error };
  }
}

/**
 * Logout the current user
 *
 */
export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error("Logout error:", error.message);
      return { error };
    }

    console.log("Logout successful");
    return { error: null };
  } catch (error) {
    return { error };
  }
}

/**

 */
export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;

    return { user, error: null };
  } catch (error) {
    return { user: null, error };
  }
}

/**
 * Send password reset email*/
export async function resetPassword(email) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "yourapp://reset-password", // Replace with your deep link
    });

    if (error) {
      throw error("Reset password error:", error.message);
      return { error };
    }

    console.log("Password reset email sent to:", email);
    return { error: null };
  } catch (error) {
    return { error };
  }
}

/**
 * Update user's password (after reset)

 */
export async function updatePassword(newPassword) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw error("Update password error:", error.message);
      return { error };
    }

    console.log("Password updated successfully");
    return { error: null };
  } catch (error) {
    return { error };
  }
}

/**
 * Update user profile metadata
 */
export async function updateUserProfile(updates) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });

    if (error) {
      console.error("Update profile error:", error.message);
      return { user: null, error };
    }

    console.log("Profile updated successfully");
    return { user: data.user, error: null };
  } catch (error) {
    console.error("Unexpected update profile error:", error);
    return { user: null, error };
  }
}
export async function addToFavorites(email, newItem) {
  try {
    // First, get current favorites
    const { data: currentData, error: fetchError } = await supabase
      .from("user_tracking")
      .select("favorites")
      .eq("email_address", email)
      .maybeSingle(); // Use maybeSingle to avoid PGRST116 error

    if (fetchError) throw fetchError;

    let currentFavorites = currentData?.favorites || [];

    // Check if item already exists (deep comparison for objects)
    const exists = currentFavorites.some(
      (item) => JSON.stringify(item) === JSON.stringify(newItem),
    );

    if (exists) {
      return {
        success: true,
        favorites: currentFavorites,
        message: "Item already in favorites",
        error: null,
      };
    }

    // Add new item to array
    const updatedFavorites = [...currentFavorites, newItem];

    // Update the database - specify email_address as the conflict target
    const { data, error } = await supabase
      .from("user_tracking")
      .upsert(
        {
          email_address: email,
          favorites: updatedFavorites,
        },
        {
          onConflict: "email_address", // This tells upsert which column to check for matching
          ignoreDuplicates: false, // false = update existing, true = skip if exists
        },
      )
      .select("favorites")
      .single();

    if (error) throw error;

    return { success: true, favorites: data.favorites, error: null };
  } catch (error) {
    return { success: false, favorites: null, error };
  }
}

export async function getUserFavorites(email) {
  try {
    if (!email) {
      console.log("No email provided to getUserFavorites");
      return { favorites: [], error: null };
    }

    const { data, error } = await supabase
      .from("user_tracking")
      .select("favorites")
      .eq("email_address", email);

    if (error) throw error;

    const favorites = data && data.length > 0 ? data[0].favorites : [];

    return { favorites: favorites, error: null };
  } catch (error) {
    console.error("Error in getUserFavorites:", error);
    return { favorites: [], error };
  }
}
/**
 * Add an item to favorites (prevents duplicates)

 */
/**
 * Remove an item from favorites

 */ export async function removeFromFavorites(email, itemToRemove) {
  try {
    const { data: currentData, error: fetchError } = await supabase
      .from("user_tracking")
      .select("favorites")
      .eq("email_address", email)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    let currentFavorites = currentData?.favorites || [];

    // Filter out the item to remove - compare by name or id instead of JSON stringify
    const updatedFavorites = currentFavorites.filter(
      (item) => item.name !== itemToRemove.name && item.id !== itemToRemove.id,
    );

    // If nothing changed, return early
    if (currentFavorites.length === updatedFavorites.length) {
      return {
        success: true,
        favorites: currentFavorites,
        message: "Item not found in favorites",
        error: null,
      };
    }

    // Update the database - FIXED: use 'email' not 'userId'
    const { data, error } = await supabase
      .from("user_tracking")
      .update({
        favorites: updatedFavorites,
      })
      .eq("email_address", email) // ← FIXED: was 'userId', should be 'email'
      .select("favorites")
      .single();

    if (error) {
      throw error;
    }

    return { success: true, favorites: data.favorites, error: null };
  } catch (error) {
    return { success: false, favorites: null, error };
  }
}

export async function confirmBooking(email, products, number) {
  try {
    const { data, error } = await supabase
      .from("client_bookings")
      .insert({
        phone_number: number,
        user_email: email,
        products: products,
      })
      .select(); // Add .select() to return the inserted data

    if (error) {
      throw error("Booking error:", error);
      throw error;
    }

    console.log("Booking successful:", data);
    return { success: true, data: data, error: null }; // Return success flag
  } catch (error) {
    return { success: false, error: error.message }; // Return error object with success flag
  }
}
