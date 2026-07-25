import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import HomeScreen from './src/screens/HomeScreen';
import CatalogScreen from './src/screens/CatalogScreen';
import ResultScreen from './src/screens/ResultScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: theme.headerBg },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'QuickG76',
            headerRight: () => (
              <TouchableOpacity onPress={toggleTheme} style={styles.themeBtn}>
                <Text style={{ fontSize: 18 }}>{isDark ? '☀️' : '🌙'}</Text>
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="Catalog"
          component={CatalogScreen}
          options={{ title: 'Katalog Ulir' }}
        />
        <Stack.Screen
          name="Result"
          component={ResultScreen}
          options={{ title: 'Hasil G-Code' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  themeBtn: { paddingHorizontal: 8, paddingVertical: 4 },
});
