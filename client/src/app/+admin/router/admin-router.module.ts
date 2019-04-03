import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RegistrationComponent} from '../../+registration/registration/registration.component';
import {DashboardComponent} from '../dashboard/dashboard.component';
import {GroupAdminComponent} from '../group-admin/group-admin.component';
import {LoginComponent} from '../login/login.component';
import {LogoutComponent} from '../logout/logout.component';
import {PasswordChangeConfirmationComponent} from '../password-change-confirmation/password-change-confirmation.component';
import {PasswordChangeComponent} from '../password-change/password-change.component';
import {PasswordNotChangeConfirmationComponent} from '../password-not-change-confirmation/password-not-change-confirmation.component';
import {RegistrationAdminComponent} from '../registration-admin/registration-admin.component';
import {ResetMailConfirmationComponent} from '../reset-mail-confirmation/reset-mail-confirmation.component';
import {ResetMailComponent} from '../reset-mail/reset-mail.component';
import {ResetPasswortWithTokenComponent} from '../reset-password-with-token/reset-passwort-with-token.component';
import {AdminGuard} from '../services/auth/admin-guard.service';
import {AuthGuard} from '../services/auth/auth-guard.service';
import {UserAdminComponent} from '../user-admin/user-admin.component';
import {UserDetailComponent} from '../user-detail/user-detail.component';

const routes: Routes = [
  {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
  {
    path: 'dashboard', canActivate: [AuthGuard], component: DashboardComponent, children: [
      {path: 'users', canActivate: [AuthGuard], component: UserAdminComponent},
      {path: 'users/detail/:id', canActivate: [AuthGuard], component: UserDetailComponent},
      {path: 'groups', canActivate: [AuthGuard], component: GroupAdminComponent},
      {path: 'registrations', canActivate: [AuthGuard], component: RegistrationAdminComponent},
      {path: 'change-person/:id', canActivate: [AuthGuard], component: RegistrationComponent},
      {path: 'change-password', canActivate: [AuthGuard], component: PasswordChangeComponent},
      {
        path: 'password-confirmation',
        canActivate: [AuthGuard],
        component: PasswordChangeConfirmationComponent,
      },
      {
        path: 'password-not-change-confirmation',
        canActivate: [AuthGuard],
        component: PasswordNotChangeConfirmationComponent,
      },
      {path: '', redirectTo: 'registrations', pathMatch: 'full'},
    ]
  },
  {path: 'login', component: LoginComponent},
  {path: 'logout', canActivate: [AuthGuard], component: LogoutComponent},
  {path: 'resetMail', component: ResetMailComponent},
  {path: 'resetMailConfirmation', component: ResetMailConfirmationComponent},
  {path: 'resetPassword/:token', component: ResetPasswortWithTokenComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes),
  ],
  exports: [RouterModule]
})
export class AdminRouterModule {
}
