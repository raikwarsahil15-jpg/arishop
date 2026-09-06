import React from 'react';
import { ScrollView, View, Text, StyleSheet, FlatList, Image } from 'react-native';
import ProductCard from '../components/ProductCard';
import CategoryChip from '../components/CategoryChip';

const HomeScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      {/* Header & Search */}
      <View style={styles.header}>
        <Text style={styles.logo}>AriShop</Text>
        <View style={styles.searchBar}><Text>Search products...</Text></View>
      </View>

      {/* Banner */}
      <Image source={{uri: 'banner_url'}} style={styles.banner} />

      {/* VIP Section - Server side authorized */}
      <SectionTitle title="VIP Collection" isVIP />
      <FlatList 
        horizontal 
        data={vipProducts} 
        renderItem={({item}) => <ProductCard product={item} isVIP />}
      />

      {/* Flash Deals */}
      <SectionTitle title="Flash Deals" />
      <FlatList 
        horizontal 
        data={flashDeals} 
        renderItem={({item}) => <ProductCard product={item} showDiscount />}
      />

      {/* Weekly Top Customer */}
      <View style={styles.topCustomerCard}>
        <Text>Weekly Top Customer: Aman Singh</Text>
        <Text>Status: VIP Member</Text>
      </View>
    </ScrollView>
  );
};