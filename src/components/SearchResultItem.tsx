// Dosya: src/components/SearchResultItem.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import Colors from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Business } from '../types';

interface SearchResultItemProps {
  item: Business;
  onPress: (item: Business) => void;
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  image: { width: 50, height: 50, borderRadius: 8, marginRight: 16 },
  infoContainer: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  category: { fontSize: 14, color: Colors.textLight, marginTop: 4 },
});

const SearchResultItem: React.FC<SearchResultItemProps> = React.memo(({ item, onPress }) => (
  <TouchableOpacity style={styles.container} onPress={() => onPress(item)}>
    <Image
      source={{ uri: item.image_url_thumb || item.image_url_1 }}
      style={styles.image}
      contentFit="cover"
      cachePolicy="memory"
      transition={150}
    />
    <View style={styles.infoContainer}>
      <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.category} numberOfLines={1}>{item.category_text}</Text>
    </View>
    <Ionicons name="chevron-forward" size={24} color={Colors.textLight} />
  </TouchableOpacity>
));

SearchResultItem.displayName = "SearchResultItem";

export default SearchResultItem;
