import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ServiceRequestScreen from './src/screens/ServiceRequestScreen';
import SurveyScreen from './src/screens/SurveyScreen';
import AdminScreen from './src/screens/AdminScreen';

// Database
import { databaseService } from './src/database/DatabaseService';

// Types
import { RootStackParamList } from './src/types';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  useEffect(() => {
    // Initialize database when app starts
    const initDB = async () => {
      try {
        await databaseService.init();
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    initDB();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4F46E5',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ 
            title: '🏠 Sistem Layanan Tamu',
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
          options={{ 
            title: '📝 Pendaftaran Tamu',
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="ServiceRequest" 
          component={ServiceRequestScreen}
          options={{ 
            title: '🙏 Permohonan Layanan',
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="Survey" 
          component={SurveyScreen}
          options={{ 
            title: '⭐ Survei Kepuasan',
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="Admin" 
          component={AdminScreen}
          options={{ 
            title: '🔐 Admin Dashboard',
            headerShown: false,
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
