
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

export interface SupportMessage {
  id: string;
  user_id: string;
  content: string;
  is_admin: boolean;
  read: boolean;
  created_at: string;
}

export interface UserWithMessages {
  profile: {
    id: string;
    username: string;
    avatar_url: string | null;
    subscription_type: string | null;
    created_at: string;
    updated_at: string;
  };
  unreadCount: number;
  lastMessage: string | null;
  lastMessageTime: string | null;
}
