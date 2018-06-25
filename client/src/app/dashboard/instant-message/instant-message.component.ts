import { Component, OnInit, EventEmitter, Input, Output, ViewEncapsulation, Inject, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { HttpService } from '../.././http.service';
import * as io from 'socket.io-client';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { ScrollToService, ScrollToConfigOptions } from '@nicky-lenaers/ngx-scroll-to'; 
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-instant-message',
  templateUrl: './instant-message.component.html',
  styleUrls: ['./instant-message.component.css']
})

export class InstantMessageComponent implements OnInit, AfterViewChecked {
  @Output() userLogOut = new EventEmitter();
  @Output() chatRoomEnable = new EventEmitter();
  @Output() newMsgAlert = new EventEmitter();
  socket: SocketIOClient.Socket;
  @ViewChild('scrollMessages') private myScrollMessages: ElementRef;
  @ViewChild('emojiSize') private emojiSize: ElementRef;

  isLoggedIn = false;
  user_id: any; user_name: any; profileImage: any;
  friends = []; active_users = []; messages = []; newFriends = [];
  server_error = '';
  friend_id: any; friend_name: any; friend_image: any; friend_active = false;
  room = false;
  newWhen = new Date(Date.now());
  when = this.newWhen.toLocaleDateString() + ' ' + this.newWhen.getHours() + ':' + this.newWhen.getMinutes();
  newMessage = { id: 0, time: this.when, _from: "", content: "" };
  incr_val = 0;
  addFriends_error = "";
  CR_newMessage = { id: 0, from: this.user_name, content: "" };
  seeEmojis = false; showEmojis = false;
  count = 15;
  isEmoji = false;
  emojiList = ['people'];
  offline_messages: any;
  newChat = false; chatFrom = ""; chatID = ""; chatFriendStatus = false;
  newChatRoom = false; chatRoomID = "";

  constructor(
    private _httpService: HttpService,
    private dialog: MatDialog,
    private _scrollToService: ScrollToService,
    private sanitizer: DomSanitizer
  ) {
    this.socket = io.connect();
  }

  ngOnInit() {
    this.getUser();

    //emit user is active to server
    this.socket.emit('active', {
      'active_user_id': this.user_id, 'active_user_name': this.user_name
    });

    this.socket.on('online_users', (active_users: any) => {
      this.active_users = active_users.online_users;
      //get user friends to show online users
      this.getFriends();
    });

    //listen for offline messages 
    this.socket.on('offline_messages', (offline_messages: any) => {
      //show alert 'While you were away, new messages from' 
      if (offline_messages.offline_messages.length > 0) {
        this.openOfflineDialog(offline_messages.offline_messages);
      }
    });

    //listen for new messages
    this.socket.on('new_message', (chat: any) => {
      if(this.room){
        // console.log('emit new message', this.room)
        this.newMsgAlerthandler(chat);
      }
      if (chat.from != this.friend_id) {
        //show alert to user 'New Message'
        this.showNewMessageAlert(chat.from, chat.from_name, chat.friend_status );
      } else if (this.friend_id) {
        //if already chatting, show messages
        this.showMessages({ _id: this.friend_id, name: this.friend_name, active: chat.friend_status });
      }
    })

    //listen for new chatroom messages
    this.socket.on('cr_message_alert', (from) => {
      this.newChatRoom = true;
      this.chatRoomID = from.from;
    })
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

  getFriends() {
    let observable = this._httpService.getUserFriends(this.user_id)
    observable.subscribe(data => {
      if (data['message'] == 'success') {
        this.user_name = data['data']['name'];
        if(data['data']['image']){
          if(data['data']['image']['imageSrc']){
            this.profileImage = this.sanitizer.bypassSecurityTrustResourceUrl(data['data']['image']["imageSrc"]);
          }
        }
        this.friends = data['data']['friends'];
        for (let friend of this.friends) {
          if(friend['image']){
            if(friend['image']['imageSrc']){
              friend['image'] = this.sanitizer.bypassSecurityTrustResourceUrl(friend['image']["imageSrc"]);
            }
          }
          friend['active'] = false;
          for (let user in this.active_users) {
            if (user == friend['_id']) {
              friend['active'] = true;
            }
          }
        }
      } else {
        if (data['data']) {
          console.log(this.server_error);
          this.server_error = data['data'];
        }
      }
    })
  }

  openOfflineDialog(offline_messages) {
    const offlineMessagesDialogConfig = new MatDialogConfig();
    offlineMessagesDialogConfig.height = "60%";
    offlineMessagesDialogConfig.width = "40%";
    offlineMessagesDialogConfig.role = "alertdialog";
    offlineMessagesDialogConfig.position = { top: '10%', bottom: '10%', left: '30%', right: '10%' };
    offlineMessagesDialogConfig.data = offline_messages;

    const dialogRef = this.dialog.open(offlineMessagesDialogContent, offlineMessagesDialogConfig);

    dialogRef.afterClosed().subscribe(option => {
      if (option != 'Ok') {
        this.showMessages({ _id: option.user_id, name: option.user_name, active: option.user_status });
      }
      this.offline_messages = {};
    });
  }

  showMessages(friend) {
    this.friend_active = false;
    this.friend_id = friend._id;
    this.friend_name = friend.name;
    if(friend['active']){
      this.friend_active = friend['active'];
    }
    if(friend['image']){
      if(friend['image']['changingThisBreaksApplicationSecurity']){
        this.friend_image = this.sanitizer.bypassSecurityTrustResourceUrl(friend['image']["changingThisBreaksApplicationSecurity"]);
      }
    }
    let observable = this._httpService.getUserFriendHistory(this.user_id, this.friend_id);
    observable.subscribe(data => {
      if (data['message'] == 'success') {
        if (data['data'] != 'no history') {
          this.incr_val = data['data']['incr_val'];
          this.messages = data['data']['chats'];
        }
        else {
          this.messages = [];
        }
      } else {
        if (data['data']) {
          this.server_error = data['data'];
        }
      }
    })
  }

  scrollToMessages(): void {
    try {
      this.myScrollMessages.nativeElement.scrollTop = this.myScrollMessages.nativeElement.scrollHeight;
    } catch (err) {
      this.server_error = err;
    }
  }

  changProfileImage() {
    const profileImageDialogConfig = new MatDialogConfig();
    profileImageDialogConfig.height = "60%";
    profileImageDialogConfig.width = "40%";
    profileImageDialogConfig.role = "alertdialog";
    profileImageDialogConfig.position = { top: '10%', bottom: '10%', left: '30%', right: '10%' };
    profileImageDialogConfig.data = { image: this.profileImage, user_id: this.user_id };

    const dialogRef = this.dialog.open(ProfileImageDialogContent, profileImageDialogConfig);

    dialogRef.afterClosed().subscribe(option => {
      if (option != 'cancel') {
        let formData: FormData = new FormData();
        formData.append('profileImage', option);
        let observable = this._httpService.addUserProfileImage(this.user_id, formData)
        observable.subscribe(data => {
          if (data['message'] == 'success') {
            let observable = this._httpService.getUserFriends(this.user_id)
            observable.subscribe(data => {
              if (data['message'] == 'success') {
                if(data['data']['image']){
                  if(data['data']['image']['imageSrc']){
                    data['data']['image'] = this.sanitizer.bypassSecurityTrustResourceUrl(data['data']['image']["imageSrc"]);
                  }
                }
                this._httpService.setSession(this.user_id, this.user_name, data['data']['image'], true);
                this.getUser();
              } else {
                if (data['data']) {
                  this.server_error = data['data'];
                }
              }
            })
          } else {
            if (data['data'].message) {
              this.server_error = data['data'].message;
            }
          }
        })
      }
    });
  }

  addFriends() {
    this.addFriends_error = "";
    let observable = this._httpService.getUserNotFriends(this.user_id)
    observable.subscribe(data => {
      if (data['message'] == 'success') {
        this.newFriends = data['data'];
        for (let friend of this.newFriends) {
          if(friend['image']){
            if(friend['image']['imageSrc']){
              friend['image'] = this.sanitizer.bypassSecurityTrustResourceUrl(friend['image']["imageSrc"]);
            }
          }
        }
        this.openAddDialog(this.newFriends, "");
      } else {
        this.openAddDialog([], this.addFriends_error);
      }
    })
  }

  openAddDialog(addFriends, addFriends_error) {
    const addFriendsDialogConfig = new MatDialogConfig();
    addFriendsDialogConfig.height = "60%";
    addFriendsDialogConfig.width = "40%";
    addFriendsDialogConfig.role = "alertdialog";
    addFriendsDialogConfig.panelClass = "rounded";
    addFriendsDialogConfig.position = { top: '10%', bottom: '10%', left: '30%', right: '10%' };
    addFriendsDialogConfig.data = { addFriends: addFriends, addFriends_error: addFriends_error };

    const dialogRef = this.dialog.open(AddFriendsDialogContent, addFriendsDialogConfig);

    dialogRef.afterClosed().subscribe(option => {
      if (option != 'cancel') {
        let observable = this._httpService.addUserNewFriend(this.user_id, option._id)
        observable.subscribe(data => {
          if (data['message'] == 'success') {
            let observable = this._httpService.getUserFriends(this.user_id)
            observable.subscribe(data => {
              if (data['message'] == 'success') {
                if(data['data']['image']){
                  if(data['data']['image']['imageSrc']){
                    data['data']['image'] = this.sanitizer.bypassSecurityTrustResourceUrl(data['data']['image']["imageSrc"]);
                  }
                }
                this.friends = data['data']['friends'];
                for (let friend of this.friends) {
                  if(friend['image']){
                    if(friend['image']['imageSrc']){
                      friend['image'] = this.sanitizer.bypassSecurityTrustResourceUrl(friend['image']["imageSrc"]);
                    }
                  }
                  friend['active'] = false;
                  for (let user in this.active_users) {
                    if (user == friend['_id']) {
                      friend['active'] = true;
                    }
                  }
                }
              } else {
                if (data['data']) {
                  this.server_error = data['data'];
                }
              }
            })
          } else {
            if (data['data'].message) {
              this.server_error = data['data'].message;
            }
          }
        })
      }
    });
  }

  sendMessage() {
    this.newWhen = new Date(Date.now());
    this.when = this.newWhen.toLocaleDateString() + ' ' + ((this.newWhen.getHours() < 10 ? '0' : '') + this.newWhen.getHours()) + ':' + ((this.newWhen.getMinutes() < 10 ? '0' : '') + this.newWhen.getMinutes());
    this.newMessage.id = this.incr_val + 1;
    this.newMessage._from = this.user_id;
    this.newMessage.time = this.when;
    if (this.newMessage.content != "") {
      this.messages.push(this.newMessage);
      let observable = this._httpService.addUserFriendHistory(this.user_id, this.friend_id, this.messages, this.incr_val + 1);
      observable.subscribe(data => {
        if (data['message'] == 'success') {
          this.incr_val += 1;
          this.messages = data['data']['chats'];
          this.newMessage = { id: 0, time: this.when, _from: "", content: "" };

          let observable = this._httpService.getUserFriendHistory(this.user_id, this.friend_id);
          observable.subscribe(data => {
            if (data['message'] == 'success') {
              if (data['data'] != 'no history') {
                this.incr_val = data['data']['incr_val'];
                this.messages = data['data']['chats'];

                this.socket.emit('user_friend_chat', {
                  'user_id': this.user_id,
                  'user_name': this.user_name,
                  'friend_id': this.friend_id,
                  'friend_status': (Object.keys(this.active_users).indexOf(this.friend_id) > -1)? true : false
                });
              }
              else {
                this.messages = [];
              }
            } else {
              if (data['data'].message) {
                this.server_error = data['data'].message;
              }
            }
          })
        } else {
          if (data['data'].message) {
            this.server_error = data['data'].message;
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
    this.newMessage.content += event.emoji.native;
  }

  showNewMessageAlert(from_id, from_name, friend_status) {
    this.newChat = true;
    this.chatID = from_id;
    this.chatFrom = from_name;
    this.chatFriendStatus = friend_status;
  }

  viewNewMessage(chatID, chatFrom, chatFriendStatus) {
    this.newChat = false;
    this.chatID = null;
    this.chatFrom = null;
    this.chatFriendStatus = false;
    this.showMessages({ _id: chatID, name: chatFrom, active: chatFriendStatus });
  }

  chatRoom() {
    this.room = true;
    this.chatRoomEnable.emit({ active: true, active_users: this.active_users });
  }

  newMsgAlerthandler(chat){
    this.newMsgAlert.emit(chat);
  }

  logOut() {
    this._httpService.setSession(null, null, null, false);
    this.userLogOut.emit(true);
    this.socket.emit('user_logout', {
      'loggedOut_user_id': this.user_id, 'loggedOut_user_name': this.user_name
    });
  }
}

@Component({
  selector: 'add-friends-dialog-content',
  templateUrl: 'add-friends-dialog-content.html',
  encapsulation: ViewEncapsulation.None
})
export class AddFriendsDialogContent {
  constructor(
    public addFriendDialog: MatDialogRef<InstantMessageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }
}

@Component({
  selector: 'offline-messages-dialog-content',
  templateUrl: 'offline-messages-dialog-content.html',
  encapsulation: ViewEncapsulation.None
})
export class offlineMessagesDialogContent {
  constructor(
    public offlineMessagesDialog: MatDialogRef<InstantMessageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }
}

@Component({
  selector: 'profile-image-dialog-content',
  templateUrl: 'profile-image-dialog-content.html',
  encapsulation: ViewEncapsulation.None
})
export class ProfileImageDialogContent {
  imageSrc = '';
  profileImage = '';

  constructor(
    public profileImageDialog: MatDialogRef<InstantMessageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  fileUpload(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      this.profileImage = fileInput.target.files[0];
      var reader = new FileReader();

      reader.onload = ((e) => {
        this.imageSrc = e.target['result'];
      });

      reader.readAsDataURL(fileInput.target.files[0]);
    }
  }
}