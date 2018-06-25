import { Component, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import * as io from 'socket.io-client';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class DashboardComponent implements OnInit {

  socket: SocketIOClient.Socket;
  @Output() userLogOut = new EventEmitter();

  isLoggedIn = false;
  IM = true;
  CR = false;
  active_users = [];
  newMsg = {from: '', from_name: ''};

  constructor() {
    this.socket = io.connect();
  }

  ngOnInit() {
  }

  newMsgAlert(eventData){
    this.newMsg = eventData;
  }

  userLogOutGB(eventData){
    this.userLogOut.emit(eventData);
  }

  chatRoomEnable(eventData){
    this.IM = !eventData.active;
    this.CR = eventData.active;
    this.active_users = eventData.active_users;
  }

  chatRoomDisable(eventData){
    this.IM = !eventData.active;
    this.CR = eventData.active;
  }
}