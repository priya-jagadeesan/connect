import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { HttpService } from '.././http.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  
  isLoggedIn = false;

  @Output() userLogIn = new EventEmitter();

  title = 'connect';
  joinOrLogin = false;
  user = { name: "", email: "", password: "" }
  user_errors = { name: "", email: "", password: "" }
  login_errors = "";

  constructor(
    private _httpService: HttpService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.getUser();
  }

  getUser() {
    let user = this._httpService.getSession();
    if (user.isLoggedIn && user.user_id) {
      this.isLoggedIn = true;
      this.userLogIn.emit(true);
    }
    else {
      this.isLoggedIn = false;
      this.userLogIn.emit(false);
    }
  }

  login() {
    //shows register or login form
    this.joinOrLogin = !this.joinOrLogin;
    this.login_errors = "";
    this.user_errors = { name: "", email: "", password: "" }
  }

  onSubmit(User, type) {
    this.login_errors = "";
    this.user_errors = { name: "", email: "", password: "" }
    //register functionality
    if (type == 'join') {
      let user_validity = this._httpService.createUser(User.value);
      user_validity.subscribe(valid => {
        if (valid["message"] == 'error') {
          if (valid['data'].errors.name) {
            this.user_errors.name = valid['data'].errors.name.message;
          }
          if (valid['data'].errors.email) {
            this.user_errors.email = valid['data'].errors.email.message;
          }
          if (valid['data'].errors.password) {
            this.user_errors.password = valid['data'].errors.password.message;
          }
        } else if (valid["message"] == 'success'){
          if(valid['data']['image']){
            if(valid['data']['image']['imageSrc']){
              valid['data']['image'] = this.sanitizer.bypassSecurityTrustResourceUrl(valid['data']['image']["imageSrc"]);
            }
          }
          this._httpService.setSession(valid['data']["_id"], valid['data']["name"], valid['data']['image'], true);
          this.getUser();
        }
      })
    } else if (type = 'login') {
      let user_validity = this._httpService.validateUser(User.value);
      user_validity.subscribe(user => {
        if (user["message"] == 'error') {
          this.login_errors = user['data'].errors.message;
        }
        else {
          if(user['data']['image']){
            if(user['data']['image']['imageSrc']){
              user['data']['image'] = this.sanitizer.bypassSecurityTrustResourceUrl(user['data']['image']["imageSrc"]);
            }
          }
          this._httpService.setSession(user['data']["_id"], user['data']["name"], user['data']['image'], true);
          this.getUser();
        }
      })
    }
  }
}
