import {
  ChatMessage,
  ChatRelayMessage,
  LoginMessage,
  SystemNotice,
  User,
  UserListMessage,
  WsMessage,
} from '@websocket/types';
import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';

let currId = 1;

export class UserManager {
  private sockets = new Map<WebSocket, User>();

  add(socket: WebSocket, request: IncomingMessage) {
    const fullURL = new URL(request.headers.host + request.url);
    const name = fullURL.searchParams.get('name');

    const user: User = {
      name: name,
      id: currId++,
    };

    const systemNotice: SystemNotice = {
      event: 'systemNotice',
      contents: `${name} has joined the chat`,
    };

    this.sendToAll(systemNotice);

    const loginMessage: LoginMessage = {
      event: 'login',
      user: user,
    };

    socket.send(JSON.stringify(loginMessage));
    this.sockets.set(socket, user);
    this.sendUserListToAll();
  }

  remove(socket: WebSocket) {
    const name = this.sockets.get(socket).name;

    const systemNotice: SystemNotice = {
      event: 'systemNotice',
      contents: `${name} has left the chat`,
    };

    this.sendToAll(systemNotice);
    this.sockets.delete(socket);
    this.sendUserListToAll();
  }

  send(socket: WebSocket, message: WsMessage) {
    const data = JSON.stringify(message);
    socket.send(data);
  }

  sendToAll(message: WsMessage) {
    const data = JSON.stringify(message);
    Array.from(this.sockets.keys()).forEach((socket) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(data);
      }
    });
  }

  relayChat(from: WebSocket, chatMsg: ChatMessage) {
    const relayMsg: ChatRelayMessage = {
      event: 'chatRelay',
      contents: chatMsg.contents,
      author: this.sockets.get(from),
    };

    this.sendToAll(relayMsg);
  }

  sendUserListToAll() {
    const message: UserListMessage = {
      event: 'userList',
      users: Array.from(this.sockets.values())
    }

    this.sendToAll(message);
  }
}
