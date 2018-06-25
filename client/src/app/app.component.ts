import { Component, OnInit } from '@angular/core';
import { HttpService } from './http.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent implements OnInit {
  isLoggedIn = false;

  ngOnInit() {
    this.getUser();
  }

  constructor(
    private _httpService: HttpService,
  ) {}

  getUser() {
    //authenticate User login status
    let user = this._httpService.getSession();
    if (user.isLoggedIn && user.user_id) {
      this.isLoggedIn = true;
    }
    else {
      this.isLoggedIn = false;
    }
  }

  userLogIn(eventData){
    this.isLoggedIn = eventData;
  }

  userLogOut(eventData){
    this.isLoggedIn = !eventData;
  }
}
