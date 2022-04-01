import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../services/auth/authentication.service';
import { NotifierService } from '../services/notifier.service';

@Component({
  selector: 'app-password-change',
  templateUrl: './reset-passwort-with-token.component.html',
  styleUrls: ['./reset-passwort-with-token.component.scss'],
})
export class ResetPasswortWithTokenComponent implements OnInit {
  public password: string;
  public confirmPassword: string;
  public busy = false;
  public token: string;

  constructor(private authenticationService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute,
    private notifyer: NotifierService) {
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
    this.authenticationService.resetPasswordWithToken(this.token, values.password).subscribe({
      next: done => {
        this.busy = false;
        this.router.navigate([`/admin/login`]);
        this.notifyer.showNotification('Passwort konnte erfolgreich geändert werden!', 'Schliessen', 'success');
      },
      error: error => {
        this.busy = false;
        this.notifyer.showNotification('Fehler: Passwort konnte nicht geändert werden. Das Token existiert nicht oder ist abgelaufen!', 'Schliessen', 'success');
      }
    });
  }
}
