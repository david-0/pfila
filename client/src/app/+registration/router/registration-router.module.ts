import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ConfirmationComponent} from '../confirmation/confirmation.component';
import {RegistrationComponent} from '../registration/registration.component';

const routes: Routes = [
  {path: '', component: RegistrationComponent, pathMatch: 'full'},
  {path: 'confirmation', component: ConfirmationComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
})
export class RegistrationRouterModule {
}
