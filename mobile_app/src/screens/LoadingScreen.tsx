import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export const LoadingScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Carregando sua instância segura...</Text>
        <Text style={styles.subtitle}>Aguarde enquanto restauramos o tenant e as credenciais.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafb', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 420, backgroundColor: '#ffffff', borderRadius: 24, padding: 28, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 26, shadowOffset: { width: 0, height: 12 }, elevation: 4 },
  title: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  subtitle: { fontSize: 15, color: '#64748b', lineHeight: 22 },
});
