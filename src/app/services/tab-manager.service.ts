import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TabManagerService {
  private broadcastChannel: BroadcastChannel;
  private tabId: string;
  private openTabs: Set<string> = new Set();

  constructor() {
    this.broadcastChannel = new BroadcastChannel('tabs');
    this.tabId = Math.random().toString(36).substring(2);

    this.broadcastChannel.postMessage({
      type: 'tab_opened',
      tabId: this.tabId
    });

    this.broadcastChannel.onmessage = (event) => {
      const { type, tabId } = event.data;
      if (type === 'tab_opened') {
        this.openTabs.add(tabId);
      } else if (type === 'tab_closed') {
        this.openTabs.delete(tabId);
      }
    };
    window.addEventListener('beforeunload', () => {
      this.broadcastChannel.postMessage({
        type: 'tab_closed',
        tabId: this.tabId
      });
    });
  }

  isLastTab(): boolean {
    return this.openTabs.size === 1 && this.openTabs.has(this.tabId);
  }

  isMainTab(): boolean {
    return this.openTabs.size === 0 || this.isLastTab();
  }
}
