import { Component, OnInit, OnChanges, EventEmitter, Input, Output, AfterViewChecked, ElementRef, ViewChild, SimpleChanges } from '@angular/core';
import { HttpService } from '../.././http.service';
import * as io from 'socket.io-client';
import { ScrollToService, ScrollToConfigOptions } from '@nicky-lenaers/ngx-scroll-to';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit, OnChanges, AfterViewChecked {
  @Input() active_users: any;
  @Input() newMsgA: any;
  @Output() userLogOut = new EventEmitter();
  @Output() chatRoomDisable = new EventEmitter();
  socket: SocketIOClient.Socket;
  @ViewChild('scrollMessages') private myScrollMessages: ElementRef;
  @ViewChild('emojiSize') private emojiSize: ElementRef;

  isLoggedIn = false;
  user_id: any; user_name: any; profileImage = "./../../assets/user.png";
  chatFrom = ""; chatID = "";
  server_error = '';
  users: any; room = false; CR_messages = [];
  CR_newMessage = { id: 0, from: this.user_name, content: "" };
  seeEmojis = false;
  count = 15;

  constructor(
    private _httpService: HttpService,
    private _scrollToService: ScrollToService,
    private sanitizer: DomSanitizer
  ) {
    this.socket = io.connect();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.newMessage(changes.newMsgA.currentValue);
  }

  newMessage(val) {
    this.chatID = val.from;
    this.chatFrom = val.from_name;
  }

  ngOnInit() {
    this.getUser();
    this.chatRoom();

    // listen for new IM message
    this.socket.on('new_message', (chat: any) => {
      this.chatID = chat.from;
      this.chatFrom = chat.from_name;
    })

    // listen for new chat room message
    this.socket.on('cr_message_alert', (from) => {
      this.chatRoom();
    })

    // listen for online users
    this.socket.on('online_users', (active_users: any) => {
      this.active_users = active_users.online_users;
      this.chatRoom();
    });
  }

  ngAfterViewChecked() {
    this.scrollToMessages();
    this.emojiSizeOnResize();
  }

  getUser() {
    let user = this._httpService.getSession();
    if (user.isLoggedIn && user.user_id) {
      this.isLoggedIn = true;
      this.user_id = user.user_id;
      this.user_name = user.user_name;
      this.profileImage = user.image;
      this.userLogOut.emit(false);
    }
    else {
      this.isLoggedIn = false;
      this.user_id = null;
      this.user_name = null;
      this.userLogOut.emit(true);
    }
  }

  chatRoom() {
    let obs = this._httpService.getUsers();
    obs.subscribe(data => {
      if (data['message'] == 'success') {
        this.users = data['data'];
        for (let user of this.users) {
          if (user['image']) {
            if (user['image']['imageSrc']) {
              user['image'] = this.sanitizer.bypassSecurityTrustResourceUrl(user['image']["imageSrc"]);
            }
          }
          user['active'] = false;
          for (let active_user in this.active_users) {
            if (user['_id'] == active_user) {
              user['active'] = true;
            }
          }
        }
        let obs1 = this._httpService.getChatRoomHistory();
        obs1.subscribe(data => {
          if (data['message'] == 'success') {
            this.CR_messages = data['data'];
          } else {
            this.server_error = data['data'];
          }
        })
      }
      else {
        this.server_error = data['data'];
      }
    })
  }

  goBack() {
    this.chatRoomDisable.emit({ active: false });
  }

  scrollToMessages(): void {
    try {
      this.myScrollMessages.nativeElement.scrollTop = this.myScrollMessages.nativeElement.scrollHeight;
    } catch (err) {
      this.server_error = err;
    }
  }

  sendMessage() {
    this.CR_newMessage.from = this.user_name;
    if (this.CR_newMessage.content != "") {
      let obs1 = this._httpService.addChatRoomHistory(this.CR_newMessage.from, this.CR_newMessage.content);
      obs1.subscribe(data => {
        if (data['message'] == 'success') {
          this.CR_newMessage = { id: 0, from: this.user_name, content: "" };

          let obs2 = this._httpService.getChatRoomHistory();
          obs2.subscribe(data => {
            if (data['message'] == 'success') {
              this.CR_messages = data['data'];

              this.socket.emit('cr_newMessage', {
                from: this.CR_newMessage.from
              })
            } else {
              if (data['data']) {
                this.server_error = data['data'];
              }
            }
          })
        } else {
          if (data['data']) {
            this.server_error = data['data'];
          }
        }
      })
    }
  }

  seeEmoji() {
    this.seeEmojis = !this.seeEmojis;
    const config1: ScrollToConfigOptions = {
      target: '#newMsg'
    };
    this._scrollToService.scrollTo(config1);
  }

  emojiSizeOnResize() {
    // console.log(Number(this.emojiSize.nativeElement.clientWidth) * 2)
    if (Number(this.emojiSize.nativeElement.clientWidth) * 2 > 1200) {
      this.count = 15;
    } else if (Number(this.emojiSize.nativeElement.clientWidth) * 2 < 1200 && Number(this.emojiSize.nativeElement.clientWidth) * 2 > 800) {
      this.count = 10;
    } else if (Number(this.emojiSize.nativeElement.clientWidth) * 2 < 800) {
      this.count = 5;
    }
    this.seeEmojis = !this.seeEmojis;
    this.seeEmojis = !this.seeEmojis;
  }

  appendEmoji(event) {
    this.CR_newMessage.content += event.emoji.native;
  }

  logOut() {
    this._httpService.setSession(null, null, null, false);
    this.userLogOut.emit(true);
    this.socket.emit('user_logout', {
      'loggedOut_user_id': this.user_id, 'loggedOut_user_name': this.user_name
    });
  }
}
