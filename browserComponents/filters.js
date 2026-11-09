import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function FilterBar({
  onFilterChange,
  selectedFilter: externalFilter,
}) {
  const [selectedFilter, setSelectedFilter] = useState(externalFilter || "all");

  const filters = [
    {
      id: "all",
      label: "All",
      icon: "dots-grid",
      iconSet: "MaterialCommunityIcons",
    },
    {
      id: "sofas & couches",
      label: "Sofas",
      icon: "sofa-outline",
      iconSet: "MaterialCommunityIcons",
    },
    {
      id: "Armchairs",
      label: "Armchairs",
      icon: "chair-rolling",
      iconSet: "MaterialCommunityIcons",
    },
    {
      id: "Dining",
      label: "Dining",
      icon: "dinner-dining",
      iconSet: "MaterialIcons",
    },
    {
      id: "Tables",
      label: "Tables",
      icon: "table-furniture",
      iconSet: "MaterialCommunityIcons",
    },
    {
      id: "Storage",
      label: "Storage",
      icon: "cupboard-outline",
      iconSet: "MaterialCommunityIcons",
    },
  ];

  const renderIcon = (filter) => {
    const color = selectedFilter === filter.id ? "#fff" : "#666";
    if (filter.iconSet === "MaterialIcons") {
      return <MaterialIcons name={filter.icon} size={20} color={color} />;
    }
    return (
      <MaterialCommunityIcons name={filter.icon} size={20} color={color} />
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              selectedFilter === filter.id && styles.filterButtonActive,
            ]}
            onPress={() => {
              setSelectedFilter(filter.id);
              onFilterChange?.(filter.id);
            }}
          >
            {renderIcon(filter)}
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.id && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    backgroundColor: "#f5f5f5",
  },
  filterButtonActive: {
    backgroundColor: "#19294D",
  },
  filterText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#fff",
  },
});
