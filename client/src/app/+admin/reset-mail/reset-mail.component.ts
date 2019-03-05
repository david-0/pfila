import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService} from '../services/auth/authentication.service';

@Component({
  selector: 'app-reset-mail',
  templateUrl: './reset-mail.component.html',
  styleUrls: ['./reset-mail.component.scss']
})
export class ResetMailComponent implements OnInit {

  public busy = false;
  public email: string;

  constructor(private authenticationService: AuthenticationService,
              private router: Router,
              private route: ActivatedRoute) { }

  ngOnInit() {
  }

  public sendEmail(values: any): void {
    this.busy = true;
    this.authenticationService.sendResetEmail(values.email).subscribe(() => {
      this.busy = false;
      this.router.navigate(['../resetMailConfirmation'], {relativeTo: this.route});
    }, error => {
      this.busy = false;
      this.router.navigate(['../resetMailConfirmation'], {relativeTo: this.route});
    });

  }

}
