import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService} from '../services/auth/authentication.service';

@Component({
  selector: 'app-password-change',
  templateUrl: './reset-passwort-with-token.component.html',
  styleUrls: ['./reset-passwort-with-token.component.scss'],
})
export class ResetPasswortWithTokenComponent implements OnInit {
  public message: string;
  public password: string;
  public confirmPassword: string;
  public busy = false;
  public token: string;

  constructor(private authenticationService: AuthenticationService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.params.subscribe((params: any) => {
      if (params && params.token) {
        this.token = params.token;
      }
    });
  }

  public changePassword(password: string): void {
    this.updatePassword(password);
  }

  private updatePassword(values: any) {
    this.busy = true;
    this.authenticationService.resetPasswordWithToken(this.token, values.password).subscribe(done => {
      this.busy = false;
      this.message = 'Passwort konnte erfolgreich geändert werden!';
    }, error => {
      this.busy = false;
      this.message = 'Fehler: Passwort konnte nicht geändert werden. Das Token existiert nicht oder ist abgelaufen!' ;
    });
  }
}
