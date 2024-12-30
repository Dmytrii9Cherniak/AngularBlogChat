export enum WebsocketEventType {
  CHAT_MESSAGE = 'chat_message',
  ALL_CHATS_LIST = 'chat_list',
  GET_CHAT_LIST = 'get_chat_list',
  GET_CHAT_MESSAGES = 'get_chat_messages',
  DELETE_CHAT_MESSAGE = 'delete_chat_message',
  UPDATE_CHAT_MESSAGE = 'update_chat_message',
  CHAT_DELETED = 'chat_deleted',

  MESSAGE_DELETED = 'message_deleted',
  MESSAGE_UPDATED = 'message_updated',
  CHAT_MESSAGES = 'chat_messages',
  DELETE_DIFFERENT_CHAT = 'delete_chat',
  CHAT_CREATED = 'chat_created',

  MESSAGE_DELIVERED = 'message_delivered',
  MESSAGE_IS_READ = 'message_is_read',
  MESSAGE_PINNED = 'message_pinned',
  FORWARD_MESSAGE = 'forward_message'
}
