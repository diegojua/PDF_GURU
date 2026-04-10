import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTenantContext } from '../context/TenantContext';

export const TenantSelectorScreen = () => {
  const { tenants, setSelectedTenant } = useTenantContext();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>Selecione seu tenant</Text>
        <Text style={styles.subtitle}>
          Gerencie instâncias independentes em Android e iOS sem misturar dados.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {tenants.map((tenant) => (
          <TouchableOpacity
            key={tenant.id}
            style={styles.card}
            onPress={() => setSelectedTenant(tenant)}
          >
            <View style={[styles.badge, { backgroundColor: `${tenant.themeColor}22` }]}>
              <Text style={[styles.badgeText, { color: tenant.themeColor }]}>TENANT</Text>
            </View>
            <Text style={styles.tenantName}>{tenant.name}</Text>
            <Text style={styles.tenantInfo}>{tenant.apiBaseUrl}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafb' },
  hero: { padding: 24, paddingTop: 40 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 10 },
  subtitle: { fontSize: 15, color: '#475569', lineHeight: 22 },
  list: { paddingHorizontal: 24, paddingBottom: 32 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 22,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 16,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  tenantName: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  tenantInfo: { marginTop: 8, color: '#64748b', fontSize: 13 },
});
