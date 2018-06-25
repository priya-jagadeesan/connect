import { Inject, InjectionToken, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SESSION_STORAGE, StorageService } from 'angular-webstorage-service';

export const SERVICE_STORAGE =
    new InjectionToken<StorageService>('SERVICE_STORAGE');

@Injectable()
export class HttpService {
  users = [];

  constructor(
    private _http: HttpClient, 
    @Inject(SERVICE_STORAGE) private storage: StorageService
  ) { }

  setSession(user_id, user_name, image, isLoggedIn){
    this.storage.set('user_id', user_id);
    this.storage.set('user_name', user_name);
    this.storage.set('isLoggedIn', isLoggedIn)
    this.storage.set('image', image)
  }

  getSession(){
    const user_id : String = this.storage.get('user_id');
    const user_name : String = this.storage.get('user_name');
    const isLoggedIn : boolean = this.storage.get('isLoggedIn');
    const image = this.storage.get('image');
    return { 'user_id' : user_id , 'isLoggedIn' : isLoggedIn, 'user_name': user_name, image: image }
  }

  validateUser(user) {
    return this._http.post("/user", user);
  }
  
  createUser(user){
    return this._http.post("/users", user);
  }

  getUsers() {
    return this._http.get("/users");
  }

  getUserFriends(user_id) {
    return this._http.get("/users/" + user_id);
  }

  getUserNotFriends(user_id) {
    return this._http.get("/friends/" + user_id);
  }

  addUserNewFriend(user_id, friend_id){
    return this._http.put("/users/" + user_id, {friend_id: friend_id});
  }

  addUserProfileImage(user_id, formData){
    return this._http.post("/users/image/" + user_id, formData);
  }

  getUserFriendHistory(user_id, friend_id){
    return this._http.post("/chats/" + user_id, {friend_id: friend_id});
  }

  addUserFriendHistory(user_id, friend_id, history, incr_val){
    return this._http.put("/chats/" + user_id, {friend_id: friend_id, history: history, incr_val: incr_val});
  }

  getChatRoomHistory(){
    return this._http.get("/chatroom");
  }

  addChatRoomHistory(from, content){
    return this._http.put("/chatroom", {from: from, content: content});
  }
}