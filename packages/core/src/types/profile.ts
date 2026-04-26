export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  banner_url?: string;
  bio?: string;
  created_at?: string;
  followers?: number;
}
