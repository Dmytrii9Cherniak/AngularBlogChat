export interface MessageChatModel {
  message_id: number;
  message: string;
  timestamp: string;
  user_id: number;
  username: string;
  'status:'?: 'delivered' | 'read';
  is_pinned?: boolean;
  is_forwarded?: boolean;
  reply_to?: number;
  reply_from_user: number;
}
