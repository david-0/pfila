import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {InfoComponent} from './info/info.component';
import {TeamComponent} from './team/team.component';

const routes: Routes = [
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {path: 'info', component: InfoComponent},
  {path: 'team', component: TeamComponent},
  {path: 'registration', loadChildren: './+registration/registration.module#RegistrationModule'},
  {path: 'admin', loadChildren: './+admin/admin.module#AdminModule'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
