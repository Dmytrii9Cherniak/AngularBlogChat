import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BroadcastChannelService {
  private broadcastChannel: BroadcastChannel;

  constructor() {
    this.broadcastChannel = new BroadcastChannel('auth-channel');
  }

  postMessage(type: string, data: any = null): void {
    this.broadcastChannel.postMessage({ type, data });
  }

  onMessage(callback: (message: any) => void): void {
    this.broadcastChannel.onmessage = (event) => {
      callback(event.data);
    };
  }
}
