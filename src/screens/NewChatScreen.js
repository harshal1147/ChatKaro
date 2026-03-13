import React, { useEffect, useState } from 'react';
import { scale, fontScale } from './responsive';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  BackHandler,
  StatusBar,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function NewChatScreen({ onBack, onSelectUser, onProfile }) {

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  const currentUser = auth().currentUser;
  const currentUid = currentUser ? currentUser.uid : null;

  // ✅ BACK BUTTON
  useEffect(() => {
    const backAction = () => {
      onBack();
      return true;
    };

    const backHandler =
      BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [onBack]);

  // ✅ REALTIME USERS
  useEffect(() => {
    if (!currentUid) return;

    const unsubscribe = firestore()
      .collection('users')
      .onSnapshot(snapshot => {
        const list = snapshot.docs
          .map(doc => doc.data())
          .filter(user => user.uid !== currentUid);

        setUsers(list);
      });

    return () => unsubscribe();
  }, [currentUid]);

  // ✅ SAFE FILTER (ERROR FIX)
  const filteredUsers = users.filter(user =>
    (user.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (user.name?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>

      <StatusBar
        barStyle="light-content"
        backgroundColor="#0D0D12"
      />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backTouch}>
          <Ionicons name="arrow-back" size={scale(24)} color="#5865F2" />
        </TouchableOpacity>

        <Text style={styles.headerText}>NEW MESSAGE</Text>

        <View style={{ width: scale(40) }} />
      </View>

      {/* SEARCH AREA */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={scale(18)} color="#555" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="SEARCH FRIENDS..."
            placeholderTextColor="#555"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* USERS LIST */}
      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.uid}
        contentContainerStyle={{ paddingBottom: scale(150), paddingTop: scale(10) }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userCard}
            onPress={() => onSelectUser(item)}
          >
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {item.email?.[0]?.toUpperCase()}
              </Text>
            </View>

            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {item.name || (item.email ? item.email.split('@')[0] : 'User')}
              </Text>

              <Text style={styles.userEmail}> 
                {item.email}
              </Text>
            </View>

            <Ionicons name="add-circle-outline" size={scale(24)} color="#5865F2" />
          </TouchableOpacity>
        )}
      />

      {/* ✅ BOTTOM NAV */}
      <View style={styles.bottomNav}>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={onBack}
        >
          <Ionicons name="chatbubbles-outline" size={scale(22)} color="#555" />
          <Text style={styles.navLabel}>CHATS</Text>
        </TouchableOpacity>

        <View style={styles.actionBtn}>
          <View style={styles.actionBtnInner}>
            <Ionicons name="add" size={scale(30)} color="#FFF" style={{ transform: [{ rotate: '-45deg' }] }} />
          </View>
        </View>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => onProfile?.()}
        >
          <Ionicons name="person" size={scale(22)} color="#5865F2" />
          <Text style={[styles.navLabel, { color: '#5865F2' }]}>PROFILE</Text>
        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D12',
  },
  header: {
    paddingTop: scale(20),
    paddingHorizontal: scale(20),
    paddingBottom: scale(15),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backTouch: { padding: 5 },
  headerText: {
    color: '#FFF',
    fontSize: fontScale(18),
    fontWeight: '900',
    letterSpacing: 1,
  },
  searchWrapper: {
    paddingHorizontal: scale(20),
    marginBottom: scale(10),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16171B',
    paddingHorizontal: scale(12),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#2A2B2F',
  },
  searchInput: {
    flex: 1,
    height: scale(45),
    color: '#FFF',
    fontSize: fontScale(13),
    fontWeight: '600',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scale(12),
    paddingHorizontal: scale(20),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  avatarPlaceholder: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(15),
    backgroundColor: '#1E1F22',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  avatarInitial: {
    color: '#5865F2',
    fontSize: fontScale(20),
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
    marginLeft: scale(15),
  },
  userName: {
    color: '#FFF',
    fontSize: fontScale(16),
    fontWeight: '700',
  },
  userEmail: {
    color: '#666',
    fontSize: fontScale(12),
    marginTop: 2,
  },
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
  navBtn: {
    alignItems: 'center',
    width: scale(60),
  },
  navLabel: {
    fontSize: fontScale(10),
    color: '#555',
    fontWeight: '900',
    marginTop: 4,
  },
  actionBtn: {
    marginTop: -scale(40),
  },
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