import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BroadcastService {
  private broadcastChannel = new BroadcastChannel('tabs');
  private tabCount = 0;

  constructor() {
    this.broadcastChannel.onmessage = (event) => {
      if (event.data === 'tab_opened') {
        this.tabCount++;
      } else if (event.data === 'tab_closed') {
        this.tabCount = Math.max(0, this.tabCount - 1);
      }
    };

    window.addEventListener('beforeunload', () => {
      this.broadcastChannel.postMessage('tab_closed');
    });

    this.broadcastChannel.postMessage('tab_opened');
  }

  isLastTab(): boolean {
    return this.tabCount === 1;
  }
}
