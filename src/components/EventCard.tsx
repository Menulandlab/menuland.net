import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import Colors from '../constants/Colors';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Event {
  id: number;
  title: string;
  image_url: string;
  event_date: string;
  category_name: string;
  description: string; // URL bu alanda geliyor
}

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const handlePress = () => {
    router.push({ pathname: '/menu', params: { url: event.description } });
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: event.image_url }}
        style={styles.image}
        contentFit="cover"
        cachePolicy="memory"
        transition={150}
      />
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryText}>{event.category_name}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text numberOfLines={2} style={styles.name}>{event.title}</Text>
        <Text style={styles.dateText}>{formatDate(event.event_date)}</Text>
        <TouchableOpacity style={styles.button} onPress={handlePress}>
          <Text style={styles.buttonText}>Detay</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 180, // Genişlik küçültüldü
    height: 280, // Yükseklik küçültüldü
    borderRadius: 16,
    marginRight: 16,
    backgroundColor: Colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  image: {
    width: 112,
    height: 130,
    alignSelf: 'center',
    marginTop: 12,
    borderRadius: 8,
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between', // Başlık/tarih ve butonu ayırır
  },
  name: {
    fontSize: 15, // Font boyutu ayarlandı
    fontWeight: 'bold',
    color: Colors.text,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default EventCard;