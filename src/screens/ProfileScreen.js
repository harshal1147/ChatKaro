import React, { useEffect, useState } from 'react';
import { scale, fontScale } from './responsive'; //
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  StatusBar,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';

export default function ProfileScreen({ onBack, onLogout, onAbout }) {
  const [userData, setUserData] = useState(null);
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentUser = auth().currentUser;
  const uid = currentUser?.uid;

  useEffect(() => {
    if (!uid) return;
    const unsubscribe = firestore()
      .collection('users')
      .doc(uid)
      .onSnapshot(doc => {
        const data = doc.data();
        setUserData(data);
        setName(data?.name || '');
        setPhoto(data?.photo || null);
        setLoading(false);
      });
    return () => unsubscribe();
  }, [uid]);

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.3,
      maxWidth: 400,
      maxHeight: 400,
      includeBase64: true,
    });
    if (result.assets && result.assets.length > 0) {
      if (result.assets[0].base64) setPhoto(result.assets[0].base64);
    }
  };

  const saveProfile = async () => {
    if (!uid) return;
    try {
      const updateData = { name: name || '' };
      if (photo && typeof photo === 'string') updateData.photo = photo;
      await firestore().collection('users').doc(uid).set(updateData, { merge: true });
      Alert.alert('System', 'Profile changes updated.');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (!uid || loading || !userData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#5865F2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* HEADER AREA */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backCircle}>
          <Ionicons name="arrow-back" size={scale(24)} color="#5865F2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* AVATAR BOX WITH GLOW */}
        <View style={styles.avatarContainer}>
          <View style={styles.glowRing}>
            {photo ? (
              <Image source={{ uri: `data:image/jpeg;base64,${photo}` }} style={styles.profileImg} />
            ) : (
              <View style={styles.profileImg}>
                <Text style={styles.initials}>{userData.email?.[0]?.toUpperCase()}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.cameraBtn} onPress={pickImage}>
              <Ionicons name="camera" size={scale(18)} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.statusBadge}>ACTIVE MEMBER</Text>
        </View>

        {/* INPUT SECTION */}
        <View style={styles.formArea}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>FULL NAME</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Enter name"
              placeholderTextColor="#333"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <View style={styles.disabledInput}>
              <Text style={styles.emailText}>{userData.email}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.saveAction} onPress={saveProfile}>
            <Text style={styles.saveText}>Save Profile Changes</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.aboutBtn}
          onPress={() => onAbout?.()}
        >
          <Ionicons name="information-circle-outline" size={20} color="#5865F2" />
          <Text style={styles.aboutText}>About ChatKaro</Text>
        </TouchableOpacity>
        {/* LOGOUT BUTTON */}
        {/* <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutText}>Logout Account</Text>
        </TouchableOpacity> */}
      </View>

      {/* ✅ BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navBtn} onPress={onBack}>
          <Ionicons name="chatbubbles-outline" size={scale(22)} color="#555" />
          <Text style={styles.navLabel}>CHATS</Text>
        </TouchableOpacity>

        <View style={styles.actionBtn}>
          <View style={styles.actionBtnInner}>
            <Ionicons name="person" size={scale(28)} color="#FFF" style={{ transform: [{ rotate: '-45deg' }] }} />
          </View>
        </View>

        <TouchableOpacity style={styles.navBtn} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={scale(22)} color="#FF3B30" />
          <Text style={[styles.navLabel, { color: '#FF3B30' }]}>LOGOUT</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  aboutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 10,
  },
  aboutText: {
    color: '#5865F2',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: fontScale(14),
  },
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    height: scale(80),
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: scale(10),
  },
  backCircle: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { color: '#FFF', fontSize: fontScale(18), fontWeight: '900', letterSpacing: 1 },
  content: { flex: 1, padding: 25 },
  avatarContainer: { alignItems: 'center', marginBottom: 40 },
  glowRing: {
    width: scale(130),
    height: scale(130),
    borderRadius: scale(65),
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5865F2',
    shadowRadius: 20,
    shadowOpacity: 0.5,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(88, 101, 242, 0.3)',
  },
  profileImg: {
    width: scale(115),
    height: scale(115),
    borderRadius: scale(60),
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  initials: { fontSize: 45, color: '#5865F2', fontWeight: 'bold' },
  cameraBtn: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#5865F2',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#000',
  },
  statusBadge: {
    color: '#34C759',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginTop: 15,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  formArea: { width: '100%' },
  inputWrapper: { marginBottom: 25 },
  label: { color: '#555', fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 10 },
  textInput: {
    backgroundColor: '#0A0A0A',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    color: '#FFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  disabledInput: {
    backgroundColor: '#0A0A0A',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#111',
  },
  emailText: { color: '#444', fontSize: 16 },
  saveAction: {
    backgroundColor: '#5865F2',
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#5865F2',
    shadowRadius: 15,
    shadowOpacity: 0.4,
    elevation: 10,
  },
  saveText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  logoutBtn: {
    marginTop: 20,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: scale(80),
  },
  logoutText: { color: '#FF3B30', fontSize: 14, fontWeight: '600' },

  bottomNav: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: scale(80),
    backgroundColor: '#16171B',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#2A2B2F',
    paddingBottom: scale(10),
    zIndex: 999,
  },
  navBtn: { alignItems: 'center', width: scale(60) },
  navLabel: { fontSize: fontScale(10), color: '#555', fontWeight: '900', marginTop: 4 },
  actionBtn: { marginTop: -scale(40) },
  actionBtnInner: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(20),
    backgroundColor: '#5865F2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5865F2',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
    transform: [{ rotate: '45deg' }],
  },
});