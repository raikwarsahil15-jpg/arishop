import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ProductCard from '../components/ProductCard';

const HomeScreen = () => {
  const [activeWeeklyUser, setActiveWeeklyUser] = useState(null);
  const [vipProducts, setVipProducts] = useState([]);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>AriShop</Text>
        <TouchableOpacity style={styles.searchBar}>
          <Text style={{color: '#999'}}>Search Mobiles, Fashion, Electronics...</Text>
        </TouchableOpacity>
      </View>

      {/* WEEKLY TOP CUSTOMER DISPLAY (Requirement #20) */}
      {activeWeeklyUser && (
        <View style={styles.topCustomerBanner}>
          <View style={styles.badge}><Text style={styles.badgeText}>WEEKLY TOP CUSTOMER</Text></View>
          <Image source={{ uri: activeWeeklyUser.userPhoto }} style={styles.userAvatar} />
          <Text style={styles.userName}>{activeWeeklyUser.userName}</Text>
          <Text style={styles.expiryDate}>Expires in: {activeWeeklyUser.daysLeft} days</Text>
        </View>
      )}

      {/* FLASH DEALS (Horizontal Scroll) */}
      <SectionHeader title="Flash Deals" showAll />
      <FlatList 
        horizontal
        data={flashDeals}
        renderItem={({item}) => <ProductCard product={item} flash />}
        keyExtractor={item => item.id}
      />

      {/* VIP COLLECTION (Requirement #19) */}
      <View style={styles.vipSection}>
        <SectionHeader title="VIP Collection" titleColor="#FFD700" />
        <FlatList 
          horizontal
          data={vipProducts}
          renderItem={({item}) => <ProductCard product={item} isVIP />}
        />
      </View>
      
      {/* OTHER CATEGORIES... */}
    </ScrollView>
  );
};