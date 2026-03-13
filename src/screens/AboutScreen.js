import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, fontScale } from './responsive';

export default function AboutScreen({ onBack }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D12" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backCircle}>
          <Ionicons name="arrow-back" size={scale(24)} color="#5865F2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ABOUT CHATKARO</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>CHAT<Text style={{color: '#5865F2'}}>KARO</Text></Text>
          <Text style={styles.versionText}>v1.0.2 Beta Build</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>OUR MISSION</Text>
          <Text style={styles.description}>
            ChatKaro is a high-speed, encrypted communication platform designed for 
            modern security and futuristic aesthetics. Our goal is to provide a seamless 
            and private chatting experience for everyone.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>KEY FEATURES</Text>
          <Text style={styles.featureText}>• End-to-End Encrypted Messaging</Text>
          <Text style={styles.featureText}>• Real-time Firebase Synchronization</Text>
          <Text style={styles.featureText}>• AI-Powered Chat Assistance (Gemini)</Text>
          <Text style={styles.featureText}>• Ultra-Responsive Cyber Design</Text>
          <Text style={styles.featureText}>• Multi-Device Support & Cloud Sync</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>TECHNOLOGY STACK</Text>
          <Text style={styles.description}>
            Developed using React Native for a smooth cross-platform experience, 
            Firebase Firestore for instant data delivery, and Google's Gemini AI 
            for intelligent communication.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>DEVELOPER</Text>
          <Text style={styles.description}>Designed and Developed with ❤️ by Harshal Sonar.</Text>
          <Text style={styles.locationText}>Chopda, Maharashtra</Text>
        </View>

        <Text style={styles.footerNote}>© 2026 ChatKaro Communications. All Rights Reserved.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D12' },
  header: { height: scale(80), paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backCircle: { width: 45, height: 45, borderRadius: 22, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: fontScale(18), fontWeight: '900', letterSpacing: 1 },
  content: { padding: 25 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoText: { fontSize: fontScale(40), fontWeight: '900', color: '#FFF' },
  versionText: { color: '#555', fontSize: 12, fontWeight: 'bold', marginTop: 5 },
  card: { backgroundColor: '#16171B', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#2A2B2F', marginBottom: 20 },
  sectionTitle: { color: '#5865F2', fontSize: 14, fontWeight: '900', letterSpacing: 1, marginBottom: 10 },
  description: { color: '#999', fontSize: 14, lineHeight: 22 },
  featureText: { color: '#CCC', fontSize: 13, lineHeight: 24, fontWeight: '500' },
  locationText: { color: '#5865F2', fontSize: 11, marginTop: 5, fontWeight: 'bold', letterSpacing: 1 },
  footerNote: { color: '#333', fontSize: 10, textAlign: 'center', marginTop: 10, marginBottom: 30, fontWeight: 'bold' },
});