export interface UsersListModel {
  id: number;
  nickname: string;
  username: string;
  friend_info?: FriendInfo | null;
}

export interface FriendInfo {
  offer_code: string;
  status: 'pending' | 'accepted' | 'declined';
}
