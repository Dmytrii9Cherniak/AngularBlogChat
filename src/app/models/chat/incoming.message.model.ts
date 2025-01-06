export interface IncomingMessageModel {
  type: string;
  message_id?: number;
  chat_id?: number;
  sender_id?: number;
  username: string;
  sender_username?: string;
  message_content?: string;
  messages?: string;
  new_content?: string;
  pin_owner_id?: number;
  pin_owner_username?: string;
  to_chat_id?: number;
  reply_to?: number;
  message: string;
  timestamp?: string;
}
