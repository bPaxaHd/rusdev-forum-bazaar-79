
import { UserProfile } from "@/types/auth";

export interface User {
  id: string;
  email: string;
  created_at: string;
  profile: UserProfile;
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
  profile: UserProfile;
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
}
