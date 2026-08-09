import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Linking } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

interface SimpleMapViewProps {
  latitude: number;
  longitude: number;
  name: string;
}

const SimpleMapView: React.FC<SimpleMapViewProps> = ({ latitude, longitude, name }) => {
  const openInMaps = () => {
    const scheme = `maps:0,0?q=`;
    const latLng = `${latitude},${longitude}`;
    const label = name;
    const url = `${scheme}${label}@${latLng}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title={name}
        >
          <View style={styles.customMarker}>
            <Ionicons name="location" size={32} color={Colors.primary} />
          </View>
        </Marker>
      </MapView>
      
      <TouchableOpacity style={styles.mapButton} onPress={openInMaps}>
        <Ionicons name="map-outline" size={20} color="#fff" />
        <Text style={styles.mapButtonText}>Haritada Aç</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  map: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  customMarker: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 4,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  mapButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  mapButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 14,
  },
});

export default SimpleMapView;
