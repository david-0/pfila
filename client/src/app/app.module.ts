import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {MatButtonModule, MatCardModule, MatIconModule, MatListModule, MatSidenavModule, MatToolbarModule} from '@angular/material';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AuthenticationService} from './+admin/services/auth/authentication.service';
import {DebugPipe} from './+registration/registration/debug.pipe';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HomeComponent} from './home/home.component';
import {InfoComponent} from './info/info.component';
import {RestUrlPrefixService} from './servies/rest-url-prefix.service';
import {WINDOW_PROVIDERS} from './servies/window-provider';
import {TeamComponent} from './team/team.component';

@NgModule({
  declarations: [
    AppComponent,
    InfoComponent,
    TeamComponent,
    HomeComponent,
    DebugPipe,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    MatIconModule,
    MatSidenavModule,
    MatToolbarModule,
    MatCardModule,
    BrowserAnimationsModule,
    MatButtonModule,
    HttpClientModule,
    MatListModule,
  ],
  providers: [
    AuthenticationService,
    RestUrlPrefixService,
    WINDOW_PROVIDERS,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
