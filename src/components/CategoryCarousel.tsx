import React from 'react';
import { FlatList, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../constants/Colors';

interface Category {
  id: number;
  name: string;
  image_url: string;
}

interface CategoryItemProps {
  item: Category;
  onCategoryPress: (category: Category) => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ item, onCategoryPress }) => {
  return (
    <TouchableOpacity 
      style={styles.categoryItemContainer} 
      onPress={() => onCategoryPress(item)}
    >
      {item.image_url ? (
        <ImageBackground source={{ uri: item.image_url }} style={styles.imageBackground} imageStyle={{ borderRadius: 12 }}>
          <View style={styles.overlay} />
          <Text style={styles.categoryText}>{item.name}</Text>
        </ImageBackground>
      ) : (
        // Resim yoksa koyu gri arka plan
        <View style={[styles.imageBackground, styles.noImageBackground]}>
          <Text style={styles.categoryText}>{item.name}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

interface CategoryCarouselProps {
  categories: Category[];
  onCategoryPress: (category: Category) => void;
}

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({ categories, onCategoryPress }) => {
  if (categories.length === 0) {
    return null;
  }

  return (
    <FlatList
      data={categories}
      renderItem={({ item }) => <CategoryItem item={item} onCategoryPress={onCategoryPress} />}
      keyExtractor={(item) => item.id.toString()}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  loaderContainer: { height: 90, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 16, paddingVertical: 10 },
  categoryItemContainer: { 
    width: 140, 
    height: 90, 
    borderRadius: 12, 
    marginRight: 12, 
    elevation: 5, 
    shadowColor: Colors.black, 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 4, 
    overflow: 'hidden', // Gradient için gerekli
  },
  imageBackground: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noImageBackground: {
    backgroundColor: '#2C2C2C', // Koyu gri, siyaha yakın
  },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 12 },
  categoryText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: Colors.white,
    textAlign: 'center',
    paddingHorizontal: 8,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    zIndex: 1,
  },
});

export default CategoryCarousel;