import React from "react";
import { View, StyleSheet, Text } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function CategoriesSection() {
  const navigation = useNavigation();

  function handleNavigation(filter) {
    navigation.navigate("browse", { filter: filter });
  }
  return (
    <TouchableOpacity style={styles.categoriesContainer} activeOpacity={0.7}>
      <Text style={styles.heading}>Browse by category</Text>
      <View style={styles.categoryContainer}>
        <TouchableOpacity
          style={styles.categoryLink}
          onPress={() => handleNavigation("sofas & couches")}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="sofa-outline"
              size={17}
              color="black"
            />
          </View>
          <Text
            style={styles.actualLabels}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            sofas & couches
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.categoryLink}
          onPress={() => handleNavigation("Armchairs")}
        >
          <View style={styles.iconContainer}>
            <MaterialIcons name="chair" size={15} color="black" />
          </View>
          <Text
            style={styles.actualLabels}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            Armchairs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.categoryLink}
          onPress={() => handleNavigation("Dining")}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="food-turkey"
              size={24}
              color="black"
            />
          </View>
          <Text style={styles.actualLabels}>Dining</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.categoryLink}
          onPress={() => handleNavigation("Tables")}
        >
          <View style={styles.iconContainer}>
            <MaterialIcons name="table-bar" size={19} color="black" />
          </View>
          <Text style={styles.actualLabels}>Tables</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  categoriesContainer: {
    justifyContent: "space-around",
    alignItems: "center",
    height: 160,
    width: "95%",

    paddingVertical: 20,
    borderRadius: 10,

    marginVertical: 13,
  },
  heading: {
    alignSelf: "center",
    color: "#D7CEB2",
    fontSize: 24,
    fontFamily: "Agbalumo_400Regular",
    marginBottom: 25,
  },
  categoryContainer: {
    justifyContent: "space-around",
    alignItems: "center",
    height: 100,
    flexDirection: "row",
    width: "100%",
  },
  categoryLink: {
    height: 100,
    justifyContent: "center",
    width: 70,

    alignItems: "center",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    width: 50,
    borderRadius: 10,
    backgroundColor: "#DCE0D9",
    borderRadius: 30,
  },

  actualLabels: {
    color: "#FAE3C6",
    marginTop: 10,
    fontSize: 12,
    textOverflow: "elipsis",
    whiteSpace: "no-wrap",
    textOverflow: "hidden",
  },
});

//    backgroundColor: "#826843",
