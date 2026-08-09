import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import Colors from '../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

interface Place {
  id: number;
  name: string;
  image_url: string | null;
}

interface PlaceCardProps {
  place: Place;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place }) => {
  const router = useRouter();

  const handlePress = () => {
    // Rota yolu, (details) grubu altında olduğu için /place/ ile başlar.
    router.push(`/(details)/place/${place.id}`);
  };

  const CardContent = () => (
    <>
      <LinearGradient
        colors={place.image_url ? ['transparent', 'rgba(0,0,0,0.8)'] : ['#ff8c5a', Colors.primary]}
        style={styles.gradient}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{place.name}</Text>
        <View style={styles.button}>
          <Text style={styles.buttonText}>DETAY</Text>
        </View>
      </View>
    </>
  );

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      {place.image_url ? (
        <ImageBackground
          source={{ uri: place.image_url }}
          style={styles.image}
          imageStyle={{ borderRadius: 16 }}
        >
          <CardContent />
        </ImageBackground>
      ) : (
        <View style={[styles.image, { backgroundColor: Colors.primary }]}>
          <CardContent />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    backgroundColor: Colors.white, // Shadow performansı için solid background color eklendi
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    flex: 1,
    justifyContent: 'flex-end',
    borderRadius: 16,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
    borderRadius: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 16,
    zIndex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    flex: 1,
    marginRight: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backdropFilter: 'blur(10px)',
  },
  buttonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2
  },
});

export default PlaceCard;
