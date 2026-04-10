import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTenantContext } from '../context/TenantContext';
import { PdfService } from '../services/pdfService';
import { RootStackParamList } from '../navigation/AppNavigator';
import { DocumentItem } from '../types/document';

const CATEGORY_ICONS: Record<string, string> = {
  contrato: 'ðŸ“„',
  relat: 'ðŸ“Š',
  proposta: 'ðŸ“‹',
  fiscal: 'ðŸ¦',
  financ: 'ðŸ’°',
  default: 'ðŸ“',
};

const getCategoryIcon = (title: string) => {
  const lower = title.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return CATEGORY_ICONS.default;
};

export const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Home'>>();
  const { selectedTenant, logout } = useTenantContext();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploading, setUploading] = useState(false);
  const themeColor = selectedTenant?.themeColor ?? '#005bbf';

  const loadDocuments = useCallback(async () => {
    if (!selectedTenant) return;
    setLoadingDocs(true);
    try {
      const pdfService = new PdfService(selectedTenant.id);
      const docs = await pdfService.listDocuments(selectedTenant.id);
      setDocuments(docs);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os documentos.');
    } finally {
      setLoadingDocs(false);
    }
  }, [selectedTenant]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const filteredDocuments = useMemo(
    () =>
      searchQuery.trim()
        ? documents.filter((d) => d.title.toLowerCase().includes(searchQuery.toLowerCase()))
        : documents,
    [documents, searchQuery],
  );

  const recentDocuments = useMemo(() => filteredDocuments.slice(0, 4), [filteredDocuments]);

  const handleUpload = async () => {
    if (!selectedTenant) return;
    setUploading(true);
    const pdfService = new PdfService(selectedTenant.id);
    const result = await pdfService.uploadDocument();
    setUploading(false);
    if (result.success) {
      Alert.alert('Sucesso', 'Documento enviado com sucesso!');
      loadDocuments();
    } else if (result.message && result.message !== 'Nenhum arquivo selecionado.') {
      Alert.alert('Erro', result.message);
    }
  };

  const navigateToPdf = useCallback(
    (doc: DocumentItem) => {
      navigation.navigate('PdfViewer', { documentId: doc.id, documentTitle: doc.title });
    },
    [navigation],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <View>
          <Text style={[styles.appTitle, { color: themeColor }]}>PDF Guru</Text>
          <Text style={styles.appSubtitle}>{selectedTenant?.name}</Text>
        </View>
        <TouchableOpacity
          style={[styles.uploadButton, { backgroundColor: themeColor }]}
          onPress={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.uploadButtonText}>+ Enviar</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Busca */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>ðŸ”</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar documentos..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearIcon}>âœ•</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Recentes */}
        {!searchQuery && recentDocuments.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recentes</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentRow}
            >
              {recentDocuments.map((doc) => (
                <TouchableOpacity
                  key={doc.id}
                  style={[styles.recentCard, { borderColor: themeColor }]}
                  onPress={() => navigateToPdf(doc)}
                >
                  <View style={[styles.recentImage, { backgroundColor: `${themeColor}22` }]}>
                    <Text style={styles.recentDocIcon}>{getCategoryIcon(doc.title)}</Text>
                  </View>
                  <Text style={styles.recentTitle} numberOfLines={2}>
                    {doc.title}
                  </Text>
                  <Text style={styles.recentMeta}>{doc.modifiedAt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Lista de documentos */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {searchQuery ? `Resultados (${filteredDocuments.length})` : 'Todos os documentos'}
          </Text>
          <Text style={styles.docCount}>{documents.length} total</Text>
        </View>

        {loadingDocs ? (
          <ActivityIndicator style={styles.loader} size="large" color={themeColor} />
        ) : filteredDocuments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>ðŸ“­</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Nenhum documento encontrado.' : 'Nenhum documento disponÃ­vel.'}
            </Text>
          </View>
        ) : (
          <View style={styles.favoriteList}>
            {filteredDocuments.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={styles.favoriteCard}
                onPress={() => navigateToPdf(doc)}
              >
                <View style={styles.favoriteCardLeft}>
                  <Text style={styles.docIcon}>{getCategoryIcon(doc.title)}</Text>
                  <View style={styles.favoriteCardText}>
                    <Text style={styles.favoriteTitle} numberOfLines={1}>
                      {doc.title}
                    </Text>
                    <Text style={styles.favoriteMeta}>Atualizado em {doc.modifiedAt}</Text>
                  </View>
                </View>
                <Text style={styles.chevron}>â€º</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: themeColor }]}
          onPress={logout}
        >
          <Text style={[styles.logoutText, { color: themeColor }]}>Sair do tenant</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafb' },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
  },
  appTitle: { fontSize: 26, fontWeight: '800' },
  appSubtitle: { marginTop: 2, fontSize: 13, color: '#64748b' },
  uploadButton: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  uploadButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  searchBox: {
    marginHorizontal: 24,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  searchIcon: { fontSize: 16, color: '#64748b', marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: '#0f172a', padding: 0 },
  clearIcon: { fontSize: 16, color: '#94a3b8', paddingLeft: 8 },
  scrollContent: { paddingBottom: 40 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 14,
    marginTop: 4,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  docCount: { fontSize: 13, color: '#94a3b8' },
  recentRow: { paddingLeft: 24, paddingRight: 12, marginBottom: 20 },
  recentCard: {
    width: 150,
    marginRight: 14,
    borderRadius: 22,
    borderWidth: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  recentImage: {
    width: '100%',
    height: 100,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentDocIcon: { fontSize: 36 },
  recentTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  recentMeta: { marginTop: 6, color: '#64748b', fontSize: 11 },
  favoriteList: { paddingHorizontal: 24, marginBottom: 16 },
  favoriteCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  favoriteCardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  docIcon: { fontSize: 26, marginRight: 14 },
  favoriteCardText: { flex: 1 },
  favoriteTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  favoriteMeta: { marginTop: 4, color: '#64748b', fontSize: 12 },
  chevron: { fontSize: 22, color: '#cbd5e1', marginLeft: 8 },
  loader: { marginTop: 40 },
  emptyState: { alignItems: 'center', marginTop: 48, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 15, color: '#64748b', textAlign: 'center' },
  logoutButton: {
    marginHorizontal: 24,
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: { fontSize: 15, fontWeight: '700' },
});
