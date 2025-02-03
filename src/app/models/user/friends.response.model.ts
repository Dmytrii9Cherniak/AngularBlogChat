import { FriendModel } from './friends.model';

export class FriendsResponseModel {
  friends: FriendModel[];
  received_requests: FriendModel[];
  sent_requests: FriendModel[];

  constructor(data?: Partial<FriendsResponseModel>) {
    this.friends = data?.friends ?? [];
    this.received_requests = data?.received_requests ?? [];
    this.sent_requests = data?.sent_requests ?? [];
  }
}
