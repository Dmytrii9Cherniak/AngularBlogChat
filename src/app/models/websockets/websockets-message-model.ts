import { WebsocketEventType } from '../../enums/websocket-event-types';

export interface WebsocketsMessageModel {
  type: WebsocketEventType;
  [key: string]: any;
}
