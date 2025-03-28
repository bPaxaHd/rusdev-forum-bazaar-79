
export interface User {
  id: string;
  profile: {
    id: string;
    username: string;
    avatar_url: string | null;
    subscription_type: string | null;
    user_tag: string | null;
    is_banned: boolean;
    is_muted: boolean;
    is_frozen: boolean;
    created_at: string;
  };
  roles: string[];
}
