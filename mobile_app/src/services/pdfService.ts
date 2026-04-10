import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from './supabaseClient';
import { DocumentItem, UploadResult } from '../types/document';

type SupabaseDocumentRow = {
  id: string;
  title: string;
  modified_at: string;
  storage_path?: string;
  tenant_id: string;
};

export class PdfService {
  constructor(private tenantId?: string) {}

  async listDocuments(tenantId: string): Promise<DocumentItem[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('id, title, modified_at, storage_path')
      .eq('tenant_id', tenantId)
      .order('modified_at', { ascending: false })
      .limit(50);

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to load documents');
    }

    return (data as SupabaseDocumentRow[]).map((item) => ({
      id: item.id,
      title: item.title,
      modifiedAt: item.modified_at,
    }));
  }

  async getDocumentUrl(documentId: string): Promise<string> {
    const { data, error } = await supabase
      .from('documents')
      .select('id, storage_path')
      .eq('id', documentId)
      .single();

    if (error || !data || !(data as SupabaseDocumentRow).storage_path) {
      return '';
    }

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('documents')
      .createSignedUrl((data as SupabaseDocumentRow).storage_path!, 300);

    return signedUrlError || !signedUrlData?.signedUrl ? '' : signedUrlData.signedUrl;
  }

  async uploadDocument(): Promise<UploadResult> {
    if (!this.tenantId) {
      return { success: false, message: 'Tenant não selecionado.' };
    }

    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.length) {
      return { success: false, message: 'Nenhum arquivo selecionado.' };
    }

    const asset = result.assets[0];
    const fileInfo = await FileSystem.getInfoAsync(asset.uri);
    if (!fileInfo.exists) {
      return { success: false, message: 'Arquivo não encontrado.' };
    }

    const fileName = asset.name ?? `documento-${Date.now()}.pdf`;
    const storagePath = `documents/${this.tenantId}/${Date.now()}-${fileName}`;

    const base64 = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const { error: storageError } = await supabase.storage
      .from('documents')
      .upload(storagePath, decode(base64), {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (storageError) {
      return { success: false, message: storageError.message };
    }

    const { data: inserted, error: dbError } = await supabase
      .from('documents')
      .insert({
        tenant_id: this.tenantId,
        title: fileName,
        modified_at: new Date().toISOString().split('T')[0],
        storage_path: storagePath,
      })
      .select('id')
      .single();

    if (dbError) {
      return { success: false, message: dbError.message };
    }

    return { success: true, documentId: (inserted as { id: string }).id };
  }
}

/** Decodifica base64 para Uint8Array (necessário para Supabase Storage upload) */
function decode(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
