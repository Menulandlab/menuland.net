import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

export default function LoadingPan() {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../../assets/Fire in pan.json')}
        autoPlay
        loop
        style={{ width: 180, height: 180 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
