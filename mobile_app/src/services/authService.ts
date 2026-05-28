import { Tenant } from '../types/tenant';
import { supabase } from './supabaseClient';

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: { email: string; name: string };
}

export interface RefreshResponse {
  token: string;
  refreshToken: string;
}

export class AuthService {
  constructor(private tenant?: Tenant) {}

  async login(email: string, password: string): Promise<LoginResponse | null> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.session || !data.user) {
        return null;
      }

      let profileFullName = '';

      // Validação de Tenant: Verifica se o perfil do usuário corresponde ao tenant selecionado
      if (this.tenant) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('tenant_id, full_name')
          .eq('id', data.user.id)
          .single();

        if (profileError || !profile || profile.tenant_id !== this.tenant.id) {
          // Tentativa de login no tenant incorreto. Deslogar por segurança.
          await supabase.auth.signOut();
          return null;
        }

        profileFullName = profile.full_name ?? '';
      }

      return {
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
        user: {
          email: data.user.email ?? '',
          name: profileFullName || ((data.user.user_metadata?.full_name as string) ?? ''),
        },
      };
    } catch {
      return null;
    }
  }

  async refreshToken(currentRefreshToken: string): Promise<RefreshResponse | null> {
    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: currentRefreshToken,
      });

      if (error || !data.session) {
        return null;
      }

      return {
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
      };
    } catch {
      return null;
    }
  }
}
