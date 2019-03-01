import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../services/auth/authentication.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {

  constructor(public authenticationService: AuthenticationService) {
  }

  ngOnInit() {
  }
}
