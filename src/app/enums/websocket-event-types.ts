export enum WebsocketEventType {
  CHAT_MESSAGE = 'chat_message',
  GET_CHAT_LIST = 'get_chat_list',
  GET_CHAT_MESSAGES = 'get_chat_messages',
  DELETE_CHAT_MESSAGE = 'delete_chat_message',
  UPDATE_CHAT_MESSAGE = 'update_chat_message',
  MESSAGE_DELETED = 'message_deleted',
  MESSAGE_UPDATED = 'message_updated',
  CHAT_LIST = 'chat_list',
  CHAT_MESSAGES = 'chat_messages',
  DELETE_DIFFERENT_CHAT = 'delete_chat'
}
