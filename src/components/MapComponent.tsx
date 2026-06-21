import React, { forwardRef } from 'react';
import { StyleSheet, Platform, View, Text } from 'react-native';

// Sadece native platformlarda react-native-maps import et
let MapView: any;
let PROVIDER_GOOGLE: any;

if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
}

interface MapComponentProps {
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  children?: React.ReactNode;
  scrollEnabled?: boolean;
  onMapReady?: () => void;
  showsUserLocation?: boolean;
  onPress?: () => void;
}

const MapComponent = forwardRef<any, MapComponentProps>(({
  initialRegion,
  children,
  scrollEnabled = false,
  onMapReady,
  showsUserLocation = false,
  onPress,
}, ref) => {
  // Web platformunda basit bir placeholder göster
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.map, styles.webPlaceholder]}>
        <Text style={styles.webText}>Harita özelliği sadece mobil uygulamada kullanılabilir</Text>
      </View>
    );
  }

  return (
    <MapView
      ref={ref}
      style={styles.map}
      provider={PROVIDER_GOOGLE}
      initialRegion={initialRegion}
      scrollEnabled={scrollEnabled}
      onMapReady={onMapReady}
      showsUserLocation={showsUserLocation}
      onPress={onPress}
      showsMyLocationButton={false}
      pitchEnabled={false}
      rotateEnabled={false}
      zoomEnabled={true}
      scrollDuringRotateOrZoomEnabled={false}
    >
      {children}
    </MapView>
  );
});

MapComponent.displayName = 'MapComponent';

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
  webPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
});

export default MapComponent;
