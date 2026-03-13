import React, { useEffect, useState } from 'react';
import { scale, fontScale } from './responsive';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function ChatListScreen({
  onOpenChat,
  onLogout,
  onNewChat,
  onProfile,
}) {
  const [chats, setChats] = useState([]);
  const [search, setSearch] = useState('');
  const currentUid = auth().currentUser?.uid;

  useEffect(() => {
    if (!currentUid) return;

    // चॅट्सची लिस्ट मिळवण्यासाठी लिस्नर
    const unsubscribeChats = firestore()
      .collection('chats')
      .where('participants', 'array-contains', currentUid)
      .onSnapshot(snapshot => {
        if (!snapshot) return;

        const chatPromises = snapshot.docs.map(async (doc) => {
          const chatData = doc.data();
          const otherUid = chatData.participants.find(uid => uid !== currentUid);

          // समोरच्या युजरची माहिती मिळवण्यासाठी
          const userDoc = await firestore().collection('users').doc(otherUid).get();
          
          return {
            id: doc.id,
            ...chatData,
            user: userDoc.exists ? userDoc.data() : { email: 'Unknown', name: 'User' },
          };
        });

        Promise.all(chatPromises).then(results => {
          setChats(results);
        });
      }, (error) => console.log("Chat fetch error:", error));

    return () => unsubscribeChats();
  }, [currentUid]);

  // ✅ SORTING: शेवटच्या मेसेजच्या वेळेनुसार (Latest First)
  // ✅ FILTERING: सर्च बॉक्सनुसार
  const filteredChats = chats
    .filter(chat =>
      chat.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      chat.user?.name?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const timeA = a.lastTime?.toMillis() || 0;
      const timeB = b.lastTime?.toMillis() || 0;
      return timeB - timeA;
    });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D12" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>CHAT<Text style={{color: '#5865F2'}}>KARO</Text></Text>
          <Text style={styles.headerSubtitle}>COMMUNICATIONS ACTIVE</Text>
        </View>
        <TouchableOpacity onPress={onProfile} style={styles.headerAvatar}>
           <Ionicons name="person-circle-outline" size={scale(28)} color="#5865F2" />
        </TouchableOpacity>
      </View>

      {/* SEARCH AREA */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={scale(18)} color="#555" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="SEARCH MESSAGES..."
            placeholderTextColor="#555"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* CHAT LIST */}
      <FlatList
        data={filteredChats}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: scale(120), paddingTop: scale(10) }}
        renderItem={({ item }) => {
          // जर शेवटचा मेसेज दुसऱ्याने पाठवला असेल, तरच 'New' दाखवा
          const isNew = item.lastSenderId && item.lastSenderId !== currentUid;

          return (
            <TouchableOpacity
              style={[styles.chatCard, isNew && styles.newChatBg]}
              onPress={() => onOpenChat(item.user)}
            >
              <View style={styles.avatarContainer}>
                {item.user?.photo ? (
                  <Image
                    source={{ uri: `data:image/jpeg;base64,${item.user.photo}` }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitial}>
                      {item.user?.email?.[0]?.toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.onlineIndicator} />
              </View>

              <View style={styles.chatDetails}>
                <View style={styles.nameRow}>
                  <Text style={[styles.userName, isNew && styles.unreadText]} numberOfLines={1}>
                    {item.user?.name || item.user?.email?.split('@')[0]}
                  </Text>
                  <Text style={[styles.chatTime, isNew && {color: '#5865F2'}]}>
                    {item.lastTime ? item.lastTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </Text>
                </View>
                <View style={styles.msgRow}>
                   <Text style={[styles.lastMessage, isNew && styles.unreadMsg]} numberOfLines={1}>
                    {item.lastMessage || 'ENCRYPTED DATA...'}
                  </Text>
                  {isNew && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.newLabel}>NEW</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.accentLine} />
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>NO ACTIVE FREQUENCIES</Text>
          </View>
        }
      />

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navBtn}>
          <Ionicons name="chatbubbles" size={scale(24)} color="#5865F2" />
          <Text style={[styles.navLabel, {color: '#5865F2'}]}>CHATS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onNewChat}>
          <View style={styles.actionBtnInner}>
            <Ionicons name="add" size={scale(30)} color="#FFF" style={{ transform: [{ rotate: '-45deg' }] }} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navBtn} onPress={onProfile}>
          <Ionicons name="person-outline" size={scale(24)} color="#555" />
          <Text style={styles.navLabel}>PROFILE</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D12' },
  header: {
    paddingTop: scale(20),
    paddingHorizontal: scale(20),
    paddingBottom: scale(15),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: fontScale(26),
    fontWeight: '900',
    letterSpacing: -1,
  },
  headerSubtitle: {
    color: '#5865F2',
    fontSize: fontScale(9),
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  headerAvatar: {
    width: scale(42),
    height: scale(42),
    borderRadius: scale(12),
    backgroundColor: '#16171B',
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
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
  chatCard: {
    flexDirection: 'row',
    paddingVertical: scale(16),
    paddingHorizontal: scale(20),
    alignItems: 'center',
    position: 'relative',
  },
  newChatBg: {
    backgroundColor: 'rgba(88, 101, 242, 0.05)',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    width: scale(55),
    height: scale(55),
    borderRadius: scale(18),
    borderWidth: 2,
    borderColor: '#2A2B2F',
  },
  avatarPlaceholder: {
    width: scale(55),
    height: scale(55),
    borderRadius: scale(18),
    backgroundColor: '#1E1F22',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2A2B2F',
  },
  avatarInitial: {
    color: '#5865F2',
    fontSize: fontScale(22),
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: scale(14),
    height: scale(14),
    borderRadius: scale(7),
    backgroundColor: '#34C759',
    borderWidth: 2,
    borderColor: '#0D0D12',
  },
  chatDetails: { 
    flex: 1, 
    marginLeft: scale(15),
    justifyContent: 'center'
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(4),
  },
  userName: {
    color: '#FFF',
    fontSize: fontScale(17),
    fontWeight: '700',
  },
  unreadText: {
    color: '#FFF',
    fontWeight: '900',
  },
  chatTime: {
    color: '#555',
    fontSize: fontScale(11),
    fontWeight: '600',
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  lastMessage: {
    color: '#888',
    fontSize: fontScale(13),
    flex: 1,
  },
  unreadMsg: {
    color: '#CCC',
    fontWeight: '700',
  },
  unreadBadge: {
    backgroundColor: '#5865F2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 10,
    shadowColor: '#5865F2',
    shadowRadius: 10,
    shadowOpacity: 0.5,
    elevation: 5,
  },
  newLabel: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '900',
  },
  accentLine: {
    position: 'absolute',
    left: scale(20),
    bottom: 0,
    right: scale(20),
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
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
    marginTop: scale(4),
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
  emptyBox: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    color: '#333',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  }
});