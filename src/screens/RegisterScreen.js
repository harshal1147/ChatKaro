import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default function RegisterScreen({ onBack }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const uid = userCredential.user.uid;

      await firestore().collection('users').doc(uid).set({
        uid,
        name,
        email,
        photo: null,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert("Success", "Account created!");
      onBack(); // go back to login

    } catch (error) {
      Alert.alert("Register Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        placeholder="Name"
        placeholderTextColor="#94a3b8"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder="Email"
        placeholderTextColor="#94a3b8"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#94a3b8"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onBack}>
        <Text style={styles.backText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0f172a', justifyContent:'center', padding:20 },
  title: { color:'#f8fafc', fontSize:24, fontWeight:'bold', marginBottom:30, textAlign:'center' },
  input: {
    backgroundColor:'#1e293b',
    padding:15,
    borderRadius:10,
    color:'#fff',
    marginBottom:15
  },
  button:{
    backgroundColor:'#38bdf8',
    padding:15,
    borderRadius:10,
    alignItems:'center'
  },
  buttonText:{ color:'#020617', fontWeight:'bold' },
  backText:{ color:'#38bdf8', marginTop:15, textAlign:'center' }
});