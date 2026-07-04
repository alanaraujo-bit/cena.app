import type { AuthResponse, AuthUser, LoginInput, RegisterInput } from '@cena/shared';
import { api } from '@/lib/api';
import { tokenStore } from '@/lib/secureStore';

export async function registerRequest(input: RegisterInput): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/register', input, { auth: false });
  await tokenStore.set(res.tokens);
  return res;
}

export async function loginRequest(input: LoginInput): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/login', input, { auth: false });
  await tokenStore.set(res.tokens);
  return res;
}

export async function meRequest(): Promise<AuthUser> {
  return api.get<AuthUser>('/auth/me');
}

export async function logoutRequest(): Promise<void> {
  const tokens = await tokenStore.get();
  try {
    if (tokens) {
      await api.post('/auth/logout', { refreshToken: tokens.refreshToken }, { auth: false });
    }
  } finally {
    await tokenStore.clear();
  }
}
