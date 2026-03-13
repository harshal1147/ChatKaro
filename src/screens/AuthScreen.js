import ChatListScreen from './ChatListScreen';
import ChatScreen from './ChatScreen';
import AboutScreen from './AboutScreen';
import NewChatScreen from './NewChatScreen';
import ProfileScreen from './ProfileScreen';
import SplashScreen from './SplashScreen';
import { scale, fontScale } from './responsive';
import React, { useState, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import auth from '@react-native-firebase/auth';

export default function AuthScreen() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 🔥 login / register
  const [currentScreen, setCurrentScreen] = useState('list');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showSplash, setShowSplash] = React.useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged(user => {
      if (user) {
        setLoggedIn(true);
        setCurrentScreen('list');
      } else {
        setLoggedIn(false);
      }
    });

    const unsubscribeMsg = messaging().onMessage(async remoteMessage => {
      if (remoteMessage?.notification) {
        alert(
          remoteMessage.notification.title +
          '\n' +
          remoteMessage.notification.body
        );
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeMsg();
    };
  }, []);

  const login = async () => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
      const token = await messaging().getToken();
      const uid = auth().currentUser.uid;

      await firestore()
        .collection('users')
        .doc(uid)
        .set({ fcmToken: token }, { merge: true });
    } catch (error) {
      alert(error.message);
    }
  };

  const signup = async () => {
    try {
      const res = await auth().createUserWithEmailAndPassword(
        email,
        password
      );

      const token = await messaging().getToken();

      await firestore()
        .collection('users')
        .doc(res.user.uid)
        .set({
          uid: res.user.uid,
          email: email,
          name: name,
          photo: null,
          fcmToken: token,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      setAuthMode('login'); // 🔥 back to login
      alert('Account created successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  const logout = async () => {
    await auth().signOut();
    setSelectedUser(null);
    setCurrentScreen('list');
  };

  // --------- AFTER LOGIN SCREENS ---------


  if (loggedIn && currentScreen === 'list')
    return (
      <ChatListScreen
        onOpenChat={u => {
          setSelectedUser(u);
          setCurrentScreen('chat');
        }}
        onLogout={logout}
        onNewChat={() => setCurrentScreen('newchat')}
        onProfile={() => setCurrentScreen('profile')}
      />
    );

  if (loggedIn && currentScreen === 'chat')
    return (
      <ChatScreen
        user={selectedUser}
        onBack={() => {
          setCurrentScreen('list');
          setSelectedUser(null);
        }}
      />
    );

  if (loggedIn && currentScreen === 'newchat')
    return (
      <NewChatScreen
        onBack={() => setCurrentScreen('list')}
        onSelectUser={u => {
          setSelectedUser(u);
          setCurrentScreen('chat');
        }}
        onProfile={() => setCurrentScreen('profile')}
      />
    );

  if (loggedIn && currentScreen === 'profile')
    return (
      <ProfileScreen
        onBack={() => setCurrentScreen('list')}
        onLogout={logout}
        onAbout={() => setCurrentScreen('about')} // ✅ Correct Prop
      />
    );

  if (loggedIn && currentScreen === 'about')
    return (
      <AboutScreen onBack={() => setCurrentScreen('profile')} />
    );
 
  if (showSplash) {
    return <SplashScreen onFinished={() => setShowSplash(false)} />;
  }
  // --------- AUTH UI ---------

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0D0D12" />

      <View style={styles.content}>
        <View style={styles.headerArea}>
          <Text style={styles.mainLogo}>
            CHAT<Text style={{ color: '#5865F2' }}>KARO</Text>
          </Text>

          <View style={styles.neonLine} />
          <Text style={styles.tagline}>
            ENCRYPTED • SECURE • FAST
          </Text>
        </View>

        <View style={styles.glassCard}>
          {authMode === 'register' && (
            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>DISPLAY NAME</Text>
              <TextInput
                placeholder="Your Name"
                placeholderTextColor="#555"
                style={styles.textInput}
                onChangeText={setName}
                value={name}
              />
            </View>
          )}

          <View style={styles.inputBox}>
            <Text style={styles.inputLabel}>EMAIL</Text>
            <TextInput
              placeholder="id@cybernet.com"
              placeholderTextColor="#555"
              style={styles.textInput}
              onChangeText={setEmail}
              value={email}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputBox}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#555"
              style={styles.textInput}
              secureTextEntry
              onChangeText={setPassword}
              value={password}
            />
          </View>

          {authMode === 'login' ? (
            <>
              <TouchableOpacity
                style={styles.glowButton}
                onPress={login}
              >
                <Text style={styles.glowButtonText}>
                  AUTHENTICATE
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.ghostButton}
                onPress={() => setAuthMode('register')}
              >
                <Text style={styles.ghostButtonText}>
                  GENERATE NEW ID
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.glowButton}
                onPress={signup}
              >
                <Text style={styles.glowButtonText}>
                  CREATE ACCOUNT
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.ghostButton}
                onPress={() => setAuthMode('login')}
              >
                <Text style={styles.ghostButtonText}>
                  BACK TO LOGIN
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D12' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: scale(30) },
  headerArea: { alignItems: 'center', marginBottom: scale(40) },
  mainLogo: {
    fontSize: fontScale(48),
    fontWeight: '900',
    color: '#FFF',
  },
  neonLine: {
    width: scale(100),
    height: 3,
    backgroundColor: '#FEE75C',
    marginVertical: scale(10),
  },
  tagline: {
    color: '#888',
    fontSize: fontScale(10),
    letterSpacing: 3,
  },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: scale(30),
    padding: scale(25),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  inputBox: { marginBottom: scale(20) },
  inputLabel: {
    color: '#5865F2',
    fontSize: fontScale(10),
    fontWeight: '900',
    marginBottom: scale(8),
  },
  textInput: {
    backgroundColor: '#16171B',
    borderRadius: scale(12),
    paddingVertical: scale(15),
    paddingHorizontal: scale(20),
    color: '#FFF',
    borderWidth: 1,
    borderColor: '#2A2B2F',
  },
  glowButton: {
    backgroundColor: '#5865F2',
    paddingVertical: scale(18),
    borderRadius: scale(15),
    alignItems: 'center',
    marginTop: scale(10),
  },
  glowButtonText: {
    color: '#FFF',
    fontSize: fontScale(16),
    fontWeight: '900',
  },
  ghostButton: {
    marginTop: scale(15),
    paddingVertical: scale(12),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: scale(15),
  },
  ghostButtonText: {
    color: '#FEE75C',
    fontSize: fontScale(12),
    fontWeight: 'bold',
  },
});