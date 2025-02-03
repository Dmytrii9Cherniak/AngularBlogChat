export interface BlacklistUsersListModel {
  blocked_user: {
    id: number;
    nickname: string;
    username: string;
  };
  expires_at: string;
}
