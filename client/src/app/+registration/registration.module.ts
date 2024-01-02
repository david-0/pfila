import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MySpinnerModule } from '../my-spinner/my-spinner.module';
import { RestUrlPrefixService } from '../servies/rest-url-prefix.service';
import { GroupRestService } from '../servies/rest/group-rest.service';
import { GroupWithSubgroupsRestService } from '../servies/rest/group-with-subgroups-rest.service';
import { PersonRestService } from '../servies/rest/person-rest.service';
import { PersonWithAllRestService } from '../servies/rest/person-with-all-rest.service';
import { RolesRestService } from '../servies/rest/role-rest.service';
import { SubgroupRestService } from '../servies/rest/subgroup-rest.service';
import { UserWithRolesRestService } from '../servies/rest/user-with-roles-rest.service';
import { WINDOW_PROVIDERS } from '../servies/window-provider';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { RegistrationComponent } from './registration/registration.component';
import { RegistrationRouterModule } from './router/registration-router.module';


@NgModule({
  imports: [
    CommonModule,
    RegistrationRouterModule,
    FormsModule,
    ReactiveFormsModule,
    MySpinnerModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    HttpClientModule,
    MatInputModule,
    MatButtonModule,
  ],
  declarations: [
    RegistrationComponent,
    ConfirmationComponent,
  ],
  exports: [
    RegistrationComponent,
  ],
  providers: [
    GroupRestService,
    GroupWithSubgroupsRestService,
    PersonRestService,
    PersonWithAllRestService,
    RolesRestService,
    SubgroupRestService,
    UserWithRolesRestService,
    RestUrlPrefixService,
    WINDOW_PROVIDERS,
  ],

})
export class RegistrationModule {
}
