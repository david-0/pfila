import {Component, isDevMode, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {first} from 'rxjs/operators';
import {AuthGuard} from '../services/auth/auth-guard.service';
import {AuthenticationService} from '../services/auth/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss']
})
export class LoginComponent implements OnInit {

  public form: UntypedFormGroup;
  private emailControl: UntypedFormControl;
  private passwordControl: UntypedFormControl;
  private returnUrl: string;
  public busy = false;

  public message: string;

  constructor(private fb: UntypedFormBuilder,
              private authenticationService: AuthenticationService,
              private authGuard: AuthGuard,
              private route: ActivatedRoute,
              private router: Router) {
    this.emailControl = new UntypedFormControl('', [Validators.required]);
    this.passwordControl = new UntypedFormControl('', [Validators.required]);
    this.form = fb.group({
      email: this.emailControl,
      password: this.passwordControl,
    });
  }

  ngOnInit() {
    this.authenticationService.logout();
    this.returnUrl = this.route.snapshot.queryParamMap.has('returnUrl')
      ? this.route.snapshot.queryParamMap.get('returnUrl') : '/admin/dashboard';
  }

  public doLogin(data: any, valid: boolean): void {
    this.busy = true;
    this.authenticationService.login(data.email, data.password)
      .pipe(first())
      .subscribe(result => {
        this.busy = false;
        if (result === true) {
          this.router.navigate([this.returnUrl]);
        } else {
          this.message = 'email or password is incorrect';
        }
      }, (error: Response) => {
        this.busy = false;
        if (error.status === 404) {
          this.message = `Anmeldeserver nicht erreichbar! (${error.url})`;
        } else {
          if (isDevMode()) {
            this.message = 'Anmeldung nicht erfolgreich (Benuter/Password falsch)! ' + JSON.stringify(error);
          } else {
            this.message = 'Anmeldung nicht erfolgreich (Benuter/Password falsch)!';
          }
        }
      });
  }

  clearMessage(): void {
    this.message = null;
  }
}
