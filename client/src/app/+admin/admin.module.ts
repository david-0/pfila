import {CommonModule, registerLocaleData} from '@angular/common';
import localeCh from '@angular/common/locales/de-CH';
import {LOCALE_ID, NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialogModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatSelectModule
} from '@angular/material';
import {JwtModule} from '@auth0/angular-jwt';
import {SocketIoConfig, SocketIoModule} from 'ngx-socket-io';
import {ValidatorsModule} from 'ngx-validators';
import {RegistrationModule} from '../+registration/registration.module';
import {MySpinnerModule} from '../my-spinner/my-spinner.module';
import {RestUrlPrefixService} from '../servies/rest-url-prefix.service';
import {GroupRestService} from '../servies/rest/group-rest.service';
import {GroupWithSubgroupsRestService} from '../servies/rest/group-with-subgroups-rest.service';
import {PersonRestService} from '../servies/rest/person-rest.service';
import {PersonWithAllRestService} from '../servies/rest/person-with-all-rest.service';
import {RolesRestService} from '../servies/rest/role-rest.service';
import {SubgroupRestService} from '../servies/rest/subgroup-rest.service';
import {UserWithRolesAndAuditRestService} from '../servies/rest/user-with-roles-and-audit-rest.service';
import {UserWithRolesRestService} from '../servies/rest/user-with-roles-rest.service';
import {WINDOW_PROVIDERS} from '../servies/window-provider';
import {ConfirmationDialogComponent} from './confirmation-dialog/confirmation-dialog.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {GroupAdminComponent} from './group-admin/group-admin.component';
import {LoginComponent} from './login/login.component';
import {LogoutComponent} from './logout/logout.component';
import {PasswordChangeConfirmationComponent} from './password-change-confirmation/password-change-confirmation.component';
import {EqualValidator} from './password-change/equals-validator.directives';
import {PasswordChangeComponent} from './password-change/password-change.component';
import {PasswordNotChangeConfirmationComponent} from './password-not-change-confirmation/password-not-change-confirmation.component';
import {CsvExporter} from './registration-admin/csv-exporter';
import {RegistrationAdminComponent} from './registration-admin/registration-admin.component';
import {ResetMailConfirmationComponent} from './reset-mail-confirmation/reset-mail-confirmation.component';
import {ResetMailComponent} from './reset-mail/reset-mail.component';
import {ResetPasswortWithTokenComponent} from './reset-password-with-token/reset-passwort-with-token.component';
import {AdminRouterModule} from './router/admin-router.module';
import {AuthenticationService} from './services/auth/authentication.service';
import {UserAdminComponent} from './user-admin/user-admin.component';
import {UserDetailComponent} from './user-detail/user-detail.component';

registerLocaleData(localeCh);

const host = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port;
const config: SocketIoConfig = {url: host, options: {}};

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AdminRouterModule,
    MySpinnerModule,
    RegistrationModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    ValidatorsModule,
    SocketIoModule.forRoot(config),
    JwtModule.forRoot({
      config: {
        tokenGetter: AuthenticationService.getAccessToken,
        whitelistedDomains: ['localhost:3001', 'uf-und-drvoo.ch:3002', 'uf-und-drvoo.ch']
      }
    }),
  ],
  declarations: [
    LoginComponent,
    DashboardComponent,
    LogoutComponent,
    UserAdminComponent,
    GroupAdminComponent,
    RegistrationAdminComponent,
    PasswordChangeComponent,
    PasswordChangeConfirmationComponent,
    PasswordNotChangeConfirmationComponent,
    EqualValidator,
    ConfirmationDialogComponent,
    ResetPasswortWithTokenComponent,
    ResetMailComponent,
    ResetMailConfirmationComponent,
    UserDetailComponent,
  ],
  providers: [
    AuthenticationService,
    GroupRestService,
    GroupWithSubgroupsRestService,
    PersonRestService,
    PersonWithAllRestService,
    RolesRestService,
    SubgroupRestService,
    UserWithRolesRestService,
    UserWithRolesAndAuditRestService,
    RestUrlPrefixService,
    CsvExporter,
    {provide: LOCALE_ID, useValue: 'de_ch'},
    WINDOW_PROVIDERS,
  ],
  bootstrap: [
    ConfirmationDialogComponent
  ]
})
export class AdminModule {
}


