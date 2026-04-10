import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTenantContext } from '../context/TenantContext';

export const LoginScreen = () => {
  const { selectedTenant, login, logout } = useTenantContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!selectedTenant) return;
    const success = await login(email, password);
    if (!success) {
      setError('Falha na autenticação. Verifique os dados.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Entrar em</Text>
        <Text style={styles.tenantName}>{selectedTenant?.name}</Text>
        <Text style={styles.subtitle}>
          Autenticação segura por tenant com armazenamento protegido.
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Continuar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Mudar tenant</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafb', paddingHorizontal: 24 },
  header: { marginTop: 40, marginBottom: 36 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  tenantName: { fontSize: 28, fontWeight: '800', color: '#005bbf', marginTop: 2 },
  subtitle: { marginTop: 12, fontSize: 15, color: '#64748b', lineHeight: 22 },
  form: { marginTop: 20 },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  button: {
    backgroundColor: '#005bbf',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  logoutButton: { marginTop: 18, alignItems: 'center' },
  logoutText: { color: '#64748b', fontSize: 14, fontWeight: '700' },
  errorText: { color: '#b91c1c', marginBottom: 10, fontSize: 13 },
});
