import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { HttpService, SERVICE_STORAGE } from './http.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; 
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SESSION_STORAGE, StorageServiceModule } from 'angular-webstorage-service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core'
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { InstantMessageComponent, AddFriendsDialogContent, offlineMessagesDialogContent, ProfileImageDialogContent} from './dashboard/instant-message/instant-message.component';
import { ChatRoomComponent } from './dashboard/chat-room/chat-room.component';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { PickerModule } from '@ctrl/ngx-emoji-mart';

// Add an icon to the library for convenient access in other components
library.add(far);
library.add(fas);

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    InstantMessageComponent,
    AddFriendsDialogContent,
    offlineMessagesDialogContent,
    ProfileImageDialogContent,
    ChatRoomComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    FontAwesomeModule,
    StorageServiceModule,
    MatDialogModule,
    BrowserAnimationsModule,
    PickerModule,
    ScrollToModule.forRoot(),
  ],
  providers: [
    { provide: SERVICE_STORAGE, useExisting: SESSION_STORAGE },
    {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: true}},
    HttpService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    AddFriendsDialogContent,
    offlineMessagesDialogContent,
    ProfileImageDialogContent
  ]
})
export class AppModule { }
