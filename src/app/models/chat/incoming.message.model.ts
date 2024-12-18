export interface IncomingMessageModel {
  type: string;
  sender_id: number;
  username: string;
  message: string;
  chat_id: number;
  timestamp: string;
}
