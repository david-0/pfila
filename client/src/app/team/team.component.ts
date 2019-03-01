import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['team.component.scss']
})
export class TeamComponent implements OnInit {

  constructor(private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit() {
  }

  onInfo() {
    this.router.navigate(['../info'], {relativeTo: this.route});
  }

  onRegistration() {
    this.router.navigate(['../registration'], {relativeTo: this.route});
  }

  onHome() {
    this.router.navigate(['../home'], {relativeTo: this.route});
  }

}
