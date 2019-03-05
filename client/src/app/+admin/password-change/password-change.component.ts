import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService} from '../services/auth/authentication.service';

@Component({
  selector: 'app-password-change',
  templateUrl: './password-change.component.html',
  styleUrls: ['./password-change.component.scss'],
})
export class PasswordChangeComponent {
  public message: string;
  public currentPassword: string;
  public password: string;
  public confirmPassword: string;
  public busy = false;

  constructor(private authenticationService: AuthenticationService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  public changePassword(values: any): void {
    this.busy = true;
    this.authenticationService.changeMyPassword(values.currentPassword, values.password).subscribe(done => {
      this.busy = false;
      this.router.navigate(['../password-confirmation'], {relativeTo: this.route});
    }, error => {
      this.busy = false;
      this.router.navigate(['../password-not-change-confirmation'], {relativeTo: this.route});
      console.log(`Fehler beim Passwot ändern, ${error}`);
    });
  }
}
