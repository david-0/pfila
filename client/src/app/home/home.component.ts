import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
  }

  onTeam() {
    this.router.navigate(['../team'], {relativeTo: this.route});
  }

  onRegistration() {
    this.router.navigate(['../registration'], {relativeTo: this.route});
  }

  onInfo() {
    this.router.navigate(['../info'], {relativeTo: this.route});
  }

}
