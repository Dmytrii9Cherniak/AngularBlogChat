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
  MESSAGE_PINNED = 'pin_chat_message',
  MESSAGE_PINNED_RESPONSE = 'message_pinned',
  FORWARD_MESSAGE = 'forward_chat_message',
  FORWARD_MESSAGE_RESPONSE = 'forward_message',

  INVITE_TO_PROJECT = 'invite',
  REQUEST_TO_PROJECT = 'request',

  INVITE_TO_PROJECT_IS_ACCEPTED = 'invite_accepted',
  INVITE_TO_PROJECT_IS_DECLINED = 'invite_declined',

  REQUEST_TO_PROJECT_IS_ACCEPTED = 'request_accepted',
  REQUEST_TO_PROJECT_IS_DECLINED = 'request_declined',

  REQUEST_TO_FRIEND = 'friend_request',

  REQUEST_TO_FRIEND_IS_ACCEPTED = 'friend_request_accepted',
  REQUEST_TO_FRIEND_IS_DECLINED = 'friend_request_declined'
}
