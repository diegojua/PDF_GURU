import React, { useEffect, useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useTenantContext } from '../context/TenantContext';
import { PdfService } from '../services/pdfService';
import { RootStackParamList } from '../navigation/AppNavigator';

type PdfViewerRouteProp = RouteProp<{ PdfViewer: { documentId: string; documentTitle?: string } }, 'PdfViewer'>;

export const PdfViewerScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'PdfViewer'>>();
  const route = useRoute<PdfViewerRouteProp>();
  const { selectedTenant } = useTenantContext();
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const themeColor = selectedTenant?.themeColor ?? '#005bbf';

  const documentTitle = route.params.documentTitle ?? 'Documento';

  useEffect(() => {
    const loadDocument = async () => {
      if (!selectedTenant) return;
      setLoading(true);
      setError(null);
      const pdfService = new PdfService();
      const url = await pdfService.getDocumentUrl(route.params.documentId);
      if (!url) {
        setError('NÃ£o foi possÃ­vel carregar o documento. Verifique sua conexÃ£o.');
        setLoading(false);
        return;
      }
      setDocumentUrl(url);
    };
    loadDocument();
  }, [selectedTenant, route.params.documentId, retryCount]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>â†</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>{documentTitle}</Text>
        <View style={styles.spacer} />
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>âš ï¸</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: themeColor }]}
            onPress={() => { setError(null); setRetryCount(c => c + 1); }}
          >
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : documentUrl ? (
        <View style={styles.webviewContainer}>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={themeColor} />
              <Text style={styles.loadingText}>Carregando documentoâ€¦</Text>
            </View>
          )}
          <WebView
            source={{ uri: documentUrl }}
            style={styles.webview}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={() => setError('Erro ao renderizar o documento.')}
            allowsInlineMediaPlayback
            allowsFullscreenVideo={false}
            startInLoadingState={false}
          />
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColor} />
          <Text style={styles.loadingText}>Obtendo documento seguroâ€¦</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafb' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 14,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  backText: { fontSize: 22, color: '#0f172a' },
  topTitle: { flex: 1, marginHorizontal: 12, fontSize: 16, fontWeight: '700', color: '#0f172a' },
  spacer: { width: 44 },
  webviewContainer: { flex: 1 },
  webview: { flex: 1, backgroundColor: '#f8fafb' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f8fafb',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748b' },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  errorIcon: { fontSize: 48, marginBottom: 16 },
  errorText: { fontSize: 15, color: '#64748b', textAlign: 'center', marginBottom: 24 },
  retryButton: { borderRadius: 14, paddingVertical: 12, paddingHorizontal: 28 },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});