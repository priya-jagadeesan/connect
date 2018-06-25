// addFriends1() {
//   if (this.add) {
//     this.add = false;
//   } else {
//     let observable = this._httpService.getUserNotFriends(this.user_id)
//     observable.subscribe(data => {
//       if (data['message'] == 'success') {
//         this.add = true;
//         this.newFriends = data['data'];
//         if (this.newFriends.length == 0) {
//           this.newFriends = [{ name: "0", email: "Users" }]
//         }
//         // console.log("not friends", this.newFriends);
//       } else {
//         console.log("not friends error", data['data']);
//       }
//     })
//   }
// }

// openDialog(chat) {
//   const newMessageDialogConfig = new MatDialogConfig();
//   newMessageDialogConfig.height = "350px";
//   newMessageDialogConfig.width = "250px";
//   newMessageDialogConfig.role = "alertdialog";
//   newMessageDialogConfig.position = { top: '50px', left: '50px' };
//   newMessageDialogConfig.data = { name: chat['name'] };

//   const dialogRef = this.dialog.open(NewMessageDialogContent, newMessageDialogConfig);

//   dialogRef.afterClosed().subscribe(result => {
//     if (result) {
//       let obs = this._httpService.getUserFriends(chat.id);
//       obs.subscribe(data => {
//         if (data['message'] == 'success') {
//           this.showMessages({ _id: data['data']['_id'], name: data['data']['name'] });
//         }
//       })
//     }
//   });
// }
// // "../node_modules/ngx-odinvt-emoji-mart/picker.css"
// newMessages(friend_id) {
//   this.add = true;
//   var newList = this.friends;
//   this.friends = [];
//   for (let friend of newList) {
//     if (newList.indexOf(friend['_id']) == friend_id) {
//       if (friend['NEW']) {
//         friend['NEW'] += 1;
//       } else {
//         friend['NEW'] = 1;
//       }
//     }
//   }
//   this.friends = newList;
//   this.add = false;
// }