import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { AppComponent } from './app.component';

const routes: Routes = [
  // { path: 'home', component: DashboardComponent  },
  { path: '', pathMatch: 'full', redirectTo: '/' },
  { path: '**', pathMatch: 'full', redirectTo: '/' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

// @Pipe({ name: 'safeHtml' })
// export class SafeHtml {
//   constructor(private sanitizer: DomSanitizer) { }

//   transform(html) {
//     return this.sanitizer.bypassSecurityTrustResourceUrl(html);
//   }
// }

export class AppRoutingModule { }
