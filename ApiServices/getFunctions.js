import { supabase } from "../lib/supabase";

export async function fetchData() {
  const { data, error } = await supabase.from("furniture_details").select("*");

  if (error) {
    console.error("Fetch error:", error.message);
    return error.message;
  } else {
    console.log("Fetched data:", data);
    return data;
  }

  setLoading(false);
}

export async function fetchFurnitureData() {
  try {
    const { data, error } = await supabase
      .from("furniture_details")
      .select("*");

    if (error) {
      throw error("Fetch error:", error.message);
    } else {
      return data;
    }
  } catch (error) {
    return { error: error.message };
  }
}

export async function fetchLiked() {
  const { data, error } = await supabase
    .from("user_tracking")
    .select("favorites");

  if (error) {
    console.error("Fetch error:", error.message);
    return error.message;
  } else {
    console.log("Fetched data:", data);
    return data;
  }
}
