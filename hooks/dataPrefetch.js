/*
import { useQueryClient } from "@tanstack/react-query";
import { fetchFurnitureData } from "../ApiServices/getFunctions";

export const usePrefetchData = () => {
  const queryClient = useQueryClient();

  const prefetchAllData = async () => {
    // Prefetch furniture data
    await queryClient.prefetchQuery({
      queryKey: ["furniture"],
      queryFn: fetchFurnitureData,
    });

    // Prefetch popular items
    await queryClient.prefetchQuery({
      queryKey: ["popularItems"],
      queryFn: async () => {
        const furniture = await fetchFurnitureData();
        return furniture.filter((item) => item.popular === true);
      },
    });

    // Prefetch new arrivals
    await queryClient.prefetchQuery({
      queryKey: ["newArrivals"],
      queryFn: async () => {
        const furniture = await fetchFurnitureData();
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        return furniture.filter((item) => {
          if (!item.created_at) return false;
          return new Date(item.created_at) >= twoWeeksAgo;
        });
      },
    });
  };

  return { prefetchAllData };
};*/
