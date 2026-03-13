import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated } from 'react-native';
import { scale, fontScale } from './responsive'; //

export default function SplashScreen({ onFinished }) {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Animation start krr
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true })
    ]).start();

    const timer = setTimeout(() => {
      onFinished();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onFinished]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050508" />
      
      {/* BACKGROUND GLOW */}
      <View style={styles.topGlow} />

      <Animated.View style={[styles.mainContent, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* LOGO BOX WITH NEON BORDER */}
        <View style={styles.logoOuter}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>CK</Text>
          </View>
        </View>

        <Text style={styles.appName}>CHAT<Text style={{color: '#5865F2'}}>KARO</Text></Text>
        <Text style={styles.tagline}>SECURE • FUTURISTIC • FAST</Text>
      </Animated.View>

      {/* LOADING BAR SECTION */}
      <View style={styles.bottomSection}>
        <View style={styles.loaderHeader}>
          <Text style={styles.loaderTitle}>ESTABLISHING CONNECTION</Text>
          <Text style={styles.percentage}>99%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
        <Text style={styles.encryptedText}>
          🔒 END-TO-END ENCRYPTED PROTOCOL
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050508', justifyContent: 'center', alignItems: 'center' },
  
  topGlow: {
    position: 'absolute',
    top: -scale(100),
    width: scale(300),
    height: scale(300),
    backgroundColor: 'rgba(88, 101, 242, 0.15)',
    borderRadius: scale(150),
    blurRadius: 100,
  },

  mainContent: { alignItems: 'center' },

  logoOuter: {
    padding: 2,
    borderRadius: 35,
    backgroundColor: '#5865F2', // Neon Border effect
    shadowColor: '#5865F2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 25,
  },
  logoBox: {
    width: scale(110),
    height: scale(110),
    backgroundColor: '#0D0D12',
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: { color: '#FFF', fontSize: fontScale(45), fontWeight: '900', letterSpacing: -2 },

  appName: { 
    color: '#FFF', 
    fontSize: fontScale(38), 
    fontWeight: '900', 
    marginTop: 25, 
    letterSpacing: 2 
  },
  tagline: { 
    color: '#555', 
    fontSize: fontScale(10), 
    fontWeight: 'bold', 
    marginTop: 8, 
    letterSpacing: 4 
  },

  bottomSection: { position: 'absolute', bottom: scale(60), width: '80%' },
  loaderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  loaderTitle: { color: '#444', fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  percentage: { color: '#5865F2', fontSize: 10, fontWeight: 'bold' },

  progressBar: { 
    width: '100%', 
    height: 3, 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderRadius: 10,
    overflow: 'hidden' 
  },
  progressFill: { 
    width: '99%', 
    height: '100%', 
    backgroundColor: '#5865F2',
    shadowColor: '#5865F2',
    shadowRadius: 10,
    shadowOpacity: 0.8,
  },

  encryptedText: { 
    color: '#222', 
    fontSize: 9, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginTop: 20,
    letterSpacing: 1 
  },
});