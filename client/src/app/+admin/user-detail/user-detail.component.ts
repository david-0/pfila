import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {IUser} from '../../entities/user';
import {UserWithRolesAndAuditRestService} from '../../servies/rest/user-with-roles-and-audit-rest.service';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit {
  private user: IUser;

  constructor(private route: ActivatedRoute, private rest: UserWithRolesAndAuditRestService) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.rest.get(+params.id).subscribe(u => {
        this.user = u;
      });
    });
  }
}
