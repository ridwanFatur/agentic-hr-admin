export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  profile_picture?: string | null;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: AuthUser;
}
