import React from 'react';
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';
import { View } from 'react-native';
import Colors from '../constants/Colors';

const RestaurantCardSkeleton = () => {
  return (
    <View style={{ marginRight: 16 }}>
      <Skeleton
        colorMode="light"
        width={160}
        height={200}
        radius={12}
        backgroundColor={Colors.backgroundLight}
      />
    </View>
  );
};

export default RestaurantCardSkeleton;