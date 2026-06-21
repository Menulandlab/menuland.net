// JWT Debug Component - Test için kullanın
// Bu component'i business panel'de bir yerde çağırarak JWT durumunu test edebilirsiniz

import React, { useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { businessOwnerService } from '../api/businessOwnerService';
import { testJWTToken } from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function JWTDebugPanel() {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const runTokenTest = async () => {
    setLoading(true);
    try {
      console.log('🧪 Starting JWT Debug Test...');
      
      // 1. Token varlığı kontrolü
      const token = await AsyncStorage.getItem('@authToken');
      console.log('Token exists:', !!token);
      console.log('Token length:', token?.length);
      
      if (!token) {
        setTestResult('❌ No token found. Please login first.');
        Alert.alert('No Token', 'Please login first to test JWT token.');
        return;
      }

      // 2. Token format kontrolü
      const parts = token.split('.');
      console.log('Token parts:', parts.length);
      
      if (parts.length !== 3) {
        setTestResult(`❌ Invalid JWT format. Expected 3 parts, got ${parts.length}`);
        return;
      }

      // 3. Business service token test
      const result = await businessOwnerService.testJWTToken();
      
      if (result.success) {
        setTestResult(`✅ Token is valid!\n${result.message}`);
        Alert.alert('Success', 'JWT token is working correctly!');
      } else {
        setTestResult(`❌ Token test failed:\n${result.message}`);
        Alert.alert('Token Test Failed', result.message);
      }

      console.log('Full test result:', result);

    } catch (error: any) {
      const errorMsg = `❌ Test error: ${error.message}`;
      setTestResult(errorMsg);
      console.error('JWT Debug test error:', error);
      Alert.alert('Test Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearToken = async () => {
    await AsyncStorage.removeItem('@authToken');
    setTestResult('🗑️ Token cleared from storage');
    Alert.alert('Token Cleared', 'Auth token has been removed.');
  };

  const showTokenInfo = async () => {
    const token = await AsyncStorage.getItem('@authToken');
    if (token) {
      const parts = token.split('.');
      const info = `
Token Info:
- Length: ${token.length}
- Parts: ${parts.length}
- Header: ${parts[0]?.substring(0, 20)}...
- Payload: ${parts[1]?.substring(0, 20)}...
- Signature: ${parts[2]?.substring(0, 20)}...
      `;
      setTestResult(info);
      Alert.alert('Token Info', info);
    } else {
      setTestResult('No token found');
      Alert.alert('No Token', 'No auth token found in storage.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>JWT Debug Panel</Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title={loading ? "Testing..." : "Test JWT Token"} 
          onPress={runTokenTest}
          disabled={loading}
        />
        
        <Button 
          title="Show Token Info" 
          onPress={showTokenInfo}
          color="#007AFF"
        />
        
        <Button 
          title="Clear Token" 
          onPress={clearToken}
          color="#FF3B30"
        />
      </View>

      {testResult ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Test Result:</Text>
          <Text style={styles.resultText}>{testResult}</Text>
        </View>
      ) : null}

      <Text style={styles.note}>
        Note: Check React Native debugger console for detailed logs
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    margin: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 15,
  },
  resultContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  resultTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultText: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  note: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

// KULLANIM:
// Bu component'i işletme panel sayfasında import edin:
// import JWTDebugPanel from './path/to/JWTDebugPanel';
// 
// Sonra JSX'de kullanın:
// <JWTDebugPanel />
//
// Bu sayede token durumunu gerçek zamanlı test edebilirsiniz.
