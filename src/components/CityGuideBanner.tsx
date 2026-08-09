import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useLocation } from '../context/LocationContext';

import * as WebBrowser from 'expo-web-browser';

const { width } = Dimensions.get('window');

const CityGuideBanner: React.FC = () => {
    const { location } = useLocation();

    // Sadece ORDU (52) seçiliyken göster
    if (Number(location.cityId) !== 52) {
        return null;
    }

    const handlePress = async () => {
        await WebBrowser.openBrowserAsync('https://geziyordu.com', {
            toolbarColor: Colors.primary,
            controlsColor: Colors.white,
        });
    };

    return (
        <TouchableOpacity activeOpacity={0.9} onPress={handlePress} style={styles.container}>
            <View style={styles.contentContainer}>
                <View style={styles.textContainer}>
                    <View style={styles.badgeContainer}>
                        <Ionicons name="map" size={12} color={Colors.white} />
                        <Text style={styles.badgeText}>Şehir Rehberi</Text>
                    </View>
                    <Text style={styles.title}>Ordu'yu Keşfet</Text>
                    <Text style={styles.subtitle}>GeziyOrdu ile şehrin en güzel rotalarını inceleyin.</Text>

                    <View style={styles.button}>
                        <Text style={styles.buttonText}>Rehbere Git</Text>
                        <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
                    </View>
                </View>
                <View style={styles.iconContainer}>
                    <Ionicons name="earth" size={80} color="rgba(255,255,255,0.2)" />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginBottom: 24,
        borderRadius: 16,
        backgroundColor: Colors.primary,
        overflow: 'hidden',
        // Shadow
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        position: 'relative',
    },
    textContainer: {
        flex: 1,
        zIndex: 2,
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 8,
        gap: 4,
    },
    badgeText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.white,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 16,
        lineHeight: 20,
    },
    iconContainer: {
        position: 'absolute',
        right: -20,
        bottom: -20,
        zIndex: 1,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        alignSelf: 'flex-start',
        gap: 6,
    },
    buttonText: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default CityGuideBanner;
