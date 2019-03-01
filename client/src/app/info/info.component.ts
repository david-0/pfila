import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['info.component.scss']
})
export class InfoComponent implements OnInit {

  constructor(private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit() {
  }

  onTeam() {
    this.router.navigate(['../team'], {relativeTo: this.route});
  }

  onRegistration() {
    this.router.navigate(['../registration'], {relativeTo: this.route});
  }

  onHome() {
    this.router.navigate(['../home'], {relativeTo: this.route});
  }
}
