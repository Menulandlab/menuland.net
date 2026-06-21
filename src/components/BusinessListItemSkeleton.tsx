import React from 'react';
import { View } from 'react-native';
import { Skeleton } from 'moti/skeleton';
import Colors from '../constants/Colors';
import { cardListItemStyle } from '@/src/styles/CardStyles';

const BusinessListItemSkeleton = () => {
  return (
    <Skeleton.Group show={true}>
      <View style={cardListItemStyle.container}>
        <Skeleton colorMode="light" width={100} height={100} radius={8} />
        <View style={{ marginLeft: 15, flex: 1 }}>
          <Skeleton colorMode="light" width="90%" height={20} />
          <View style={{ height: 8 }} />
          <Skeleton colorMode="light" width="60%" height={16} />
          <View style={{ height: 12 }} />
          <Skeleton colorMode="light" width="40%" height={16} />
        </View>
      </View>
    </Skeleton.Group>
  );
};

export default BusinessListItemSkeleton;