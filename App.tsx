// // /**
// //  * Sample React Native App
// //  * https://github.com/facebook/react-native
// //  *
// //  * @format
// //  */

// // import { NewAppScreen } from '@react-native/new-app-screen';
// // import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
// // import {
// //   SafeAreaProvider,
// //   useSafeAreaInsets,
// // } from 'react-native-safe-area-context';

// // function App() {
// //   const isDarkMode = useColorScheme() === 'dark';

// //   return (
// //     <SafeAreaProvider>
// //       <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
// //       <AppContent />
// //     </SafeAreaProvider>
// //   );
// // }

// // function AppContent() {
// //   const safeAreaInsets = useSafeAreaInsets();

// //   return (
// //     <View style={styles.container}>
// //       <NewAppScreen
// //         templateFileName="App.tsx"
// //         safeAreaInsets={safeAreaInsets}
// //       />
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //   },
// // });

// // export default App;

// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';

// export default function App() {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>AI ChatBot 💬</Text>
//       <Text style={styles.subtitle}>
//         Your chat bot is ready to use!
//       </Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#0f172a',
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: '#38bdf8',
//   },
//   subtitle: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#e5e7eb',
//   },
// });

import React from 'react';
import AuthScreen from './src/screens/AuthScreen';

export default function App() {
  return <AuthScreen />;
  
}
