import React, { useEffect, useState, useRef } from 'react';
import { scale, fontScale } from './responsive';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  BackHandler,
  ActivityIndicator,
  Image,
  Modal,
  StatusBar,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { launchImageLibrary } from 'react-native-image-picker';

const GEMINI_API_KEY = 'AIzaSyDV5sv0UV9poJOGD06cJeFDqd7dnrm1-4E';
const AI_EMAIL = 'AI_CHATTER';

export default function ChatScreen({ user, onBack }) {
  const currentUser = auth().currentUser;
  const currentUid = currentUser?.uid;

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [fullImage, setFullImage] = useState(null);

  const flatListRef = useRef(null);

  if (!user || !currentUid) return null;

  const isAI = user.email === AI_EMAIL;
  const chatId = [currentUid, user.uid].sort().join('_');

  useEffect(() => {
    const backAction = () => { onBack(); return true; };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .onSnapshot(snapshot => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMessages(list);
      });
    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.5,
      maxWidth: 512,
      maxHeight: 512,
      includeBase64: true,
    });
    if (result.assets && result.assets.length > 0) setSelectedImage(result.assets[0]);
  };

  const sendMessage = async () => {
    if (!message.trim() && !selectedImage) return;
    const userMsg = message;
    const userImg = selectedImage;
    setMessage('');
    setSelectedImage(null);

    let msgData = {
      text: userMsg,
      senderId: currentUid,
      createdAt: firestore.FieldValue.serverTimestamp(),
    };

    if (userImg) {
      msgData.image = userImg.base64;
      msgData.messageType = 'image';
    }

    await firestore().collection('chats').doc(chatId).collection('messages').add(msgData);
    await firestore().collection('chats').doc(chatId).set({
      participants: [currentUid, user.uid],
      lastMessage: userImg ? '📷 Photo' : userMsg,
      lastTime: firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    if (isAI) fetchAIResponse(userMsg, userImg);
  };

  const fetchAIResponse = async (userText, userImg) => {
    setIsTyping(true);
    try {
      let requestBody = { contents: [{ parts: [{ text: userText || 'Analyze' }] }] };
      if (userImg) {
        requestBody.contents[0].parts.push({
          inline_data: { mime_type: 'image/jpeg', data: userImg.base64 },
        });
      }
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();
      const aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Error.";
      await firestore().collection('chats').doc(chatId).collection('messages').add({
        text: aiReply,
        senderId: user.uid,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) { alert(error.message); } finally { setIsTyping(false); }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0B" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBox}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.userName}>{isAI ? 'ChatKaro AI' : (user.name || 'User')}</Text>
          <View style={styles.statusRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.statusLabel}>Online</Text>
          </View>
        </View>
      </View>

      {/* MESSAGES */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatScroll}
        renderItem={({ item }) => (
          <View style={[
            styles.messageWrapper,
            item.senderId === currentUid ? styles.myWrapper : styles.otherWrapper
          ]}>
            <View style={[
              styles.bubble,
              item.senderId === currentUid ? styles.myBubble : styles.otherBubble
            ]}>
              {item.messageType === 'image' && (
                <TouchableOpacity onPress={() => setFullImage(`data:image/jpeg;base64,${item.image}`)}>
                  <Image source={{ uri: `data:image/jpeg;base64,${item.image}` }} style={styles.bubbleImg} />
                </TouchableOpacity>
              )}
              {item.text && <Text style={styles.bubbleText}>{item.text}</Text>}
            </View>
          </View>
        )}
        ListFooterComponent={isTyping && (
          <View style={styles.typingBox}>
             <ActivityIndicator size="small" color="#5865F2" />
             <Text style={styles.typingText}>Thinking...</Text>
          </View>
        )}
      />

      {/* BOTTOM INPUT */}
      <View style={styles.footer}>
        {selectedImage && (
          <View style={styles.previewBox}>
            <Image source={{ uri: selectedImage.uri }} style={styles.thumb} />
            <TouchableOpacity onPress={() => setSelectedImage(null)} style={styles.removeBtn}><Text style={{color:'#FFF', fontSize:10}}>✕</Text></TouchableOpacity>
          </View>
        )}
        <View style={styles.inputBar}>
          <TouchableOpacity onPress={pickImage} style={styles.addBtn}><Text style={styles.addIcon}>+</Text></TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder="Write message..."
            placeholderTextColor="#555"
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MODAL */}
      <Modal visible={!!fullImage} transparent>
        <View style={styles.modalBg}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setFullImage(null)}><Text style={{color:'#FFF', fontSize:30}}>✕</Text></TouchableOpacity>
          <Image source={{ uri: fullImage }} style={styles.modalImg} resizeMode="contain" />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D12' },
  header: { 
    height: scale(70), 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderColor: '#222'
  },
  backBox: { padding: 10 },
  backArrow: { color: '#5865F2', fontSize: 24, fontWeight: 'bold' },
  headerContent: { marginLeft: 10 },
  userName: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#34C759', marginRight: 6 },
  statusLabel: { color: '#999', fontSize: 12 },

  chatScroll: { padding: 15 },
  messageWrapper: { marginBottom: 15 },
  myWrapper: { alignItems: 'flex-end' },
  otherWrapper: { alignItems: 'flex-start' },

  bubble: { 
    padding: 12, 
    borderRadius: 20, 
    maxWidth: '85%',
  },
  myBubble: { 
    backgroundColor: '#5865F2', 
    borderBottomRightRadius: 2,
  },
  otherBubble: { 
    backgroundColor: '#1E1F22', 
    borderBottomLeftRadius: 2,
  },
  bubbleText: { color: '#FFF', fontSize: 16 },
  bubbleImg: { width: 220, height: 220, borderRadius: 12, marginBottom: 5 },

  typingBox: { flexDirection: 'row', padding: 10, alignItems: 'center' },
  typingText: { color: '#5865F2', marginLeft: 10, fontWeight: 'bold' },

  footer: { padding: 12, backgroundColor: '#0D0D12' },
  inputBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#1E1F22', 
    borderRadius: 25, 
    paddingHorizontal: 15,
    minHeight: 50
  },
  addBtn: { marginRight: 10 },
  addIcon: { color: '#5865F2', fontSize: 26 },
  textInput: { flex: 1, color: '#FFF', fontSize: 16 },
  sendBtn: { marginLeft: 10 },
  sendIcon: { color: '#5865F2', fontSize: 24 },

  previewBox: { marginBottom: 10, flexDirection: 'row' },
  thumb: { width: 60, height: 60, borderRadius: 10 },
  removeBtn: { position: 'absolute', top: -5, right: -5, backgroundColor: 'red', borderRadius: 10, padding: 3 },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center' },
  modalImg: { width: '100%', height: '80%' },
  modalClose: { position: 'absolute', top: 50, right: 30 }
});