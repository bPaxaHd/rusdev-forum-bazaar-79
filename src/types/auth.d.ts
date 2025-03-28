
export interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string | null;
  subscription_type?: string | null;
  user_tag?: string | null;
  is_banned?: boolean;
  is_muted?: boolean;
  is_frozen?: boolean;
  bio?: string | null;
  location?: string | null;
  github_url?: string | null;
  twitter_url?: string | null;
  website_url?: string | null;
  company?: string | null;
  skills?: string[] | null;
  experience_years?: number | null;
  specialty?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginAttempt {
  id: string;
  ip_address: string;
  timestamp: string;
  attempts: number;
  is_resolved: boolean;
}

export type SubscriptionLevel = 'free' | 'premium' | 'business' | 'sponsor' | 'admin';
