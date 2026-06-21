import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MapComponent = () => {
  return (
    <View style={styles.mapFallback}>
      <Text style={styles.mapFallbackText}>Harita web üzerinde kullanılamıyor.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  mapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Light grey background
  },
  mapFallbackText: {
    color: '#888', // Darker grey text
    fontSize: 16,
  },
});

export default MapComponent;
