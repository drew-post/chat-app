import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChatRelayMessage, SystemNotice, User } from '@websocket/types';
import { AppService } from './app.service';

@Component({
  selector: 'websocket-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'webapp';

  messages: ChatRelayMessage[] = [];
  currentUser: User;

  constructor(private appService: AppService, private snackbar: MatSnackBar) {}

  ngOnInit() {
    this.appService.chatMessage$.subscribe(msg => this.messages = [...this.messages, msg]);
    this.appService.user$.subscribe(user => this.currentUser = user);
    this.appService.systemNotice$.subscribe(notice => this.onSystemNotice(notice));
  }

  connect(userNameInput: HTMLInputElement) {
    const name = userNameInput.value;

    console.log(`Connecting as ${name}`);
    this.appService.connect(name);
  }

  send(chatInput: HTMLInputElement) {
    const contents = chatInput.value;

    console.log(`Sending '${contents}'`);
    this.appService.send(contents);
    chatInput.value = '';
  }

  onSystemNotice(notice: SystemNotice) {
    this.snackbar.open(notice.contents, undefined, { duration: 5000 });
  }
}
