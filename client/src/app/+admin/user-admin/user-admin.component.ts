import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Role } from '../../entities/role';
import { IUser } from '../../entities/user';
import { RolesRestService } from '../../servies/rest/role-rest.service';
import { UserWithRolesAndAuditRestService } from '../../servies/rest/user-with-roles-and-audit-rest.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { AuthenticationService } from '../services/auth/authentication.service';
import { RolePair } from './RolePair';

@Component({
  selector: 'app-user-admin',
  templateUrl: './user-admin.component.html',
  styleUrls: ['./user-admin.component.scss']
})
export class UserAdminComponent implements OnInit, OnDestroy {
  public roles = new BehaviorSubject<Role[]>([]);
  public userWithRoles = new BehaviorSubject<IUser[]>([]);
  public rolePairs: RolePair[] = [];
  public userDialog: boolean;
  public edit: boolean;
  private user: IUser = { firstname: '', lastname: '', email: '', password: '', notification: false, roles: [] };
  private detailHeader: string;

  constructor(private http: HttpClient,
    private authenticationService: AuthenticationService,
    public dialog: MatDialog,
    public userRestService: UserWithRolesAndAuditRestService,
    public roleRestService: RolesRestService,
    private router: Router,
    private route: ActivatedRoute) {
  }

  openDialog(id: number, firstname: string, lastname: string) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);
    dialogRef.componentInstance.message = `${firstname} ${lastname} löschen? `;
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'Ja') {
        this.userRestService.del(id).subscribe(ok => {
          this.updateUsers();
        });
      }
    });
  }

  ngOnInit() {
    this.updateRoles();
    this.updateUsers();
    this.roles.subscribe(roles => {
      this.updateRolePairs();
    });
    this.userWithRoles.subscribe(roles => {
      this.updateRolePairs();
    });
  }

  ngOnDestroy() {
  }

  public rolesAsString(roles: Role[]): string {
    return '[' + roles.map(r => r.name).join(', ') + ']';
  }

  private updateRolePairs() {
    if (this.userDialog) {
      if (this.edit) {
        this.rolePairs = this.createRolePairs(this.roles.getValue(), this.user.roles);
      } else {
        this.rolePairs = this.createRolePairs(this.roles.getValue(), []);
      }
    }
  }

  private createRolePairs(rolesAvailable: Role[], userRoles: Role[]): RolePair[] {
    return rolesAvailable.map(r => ({ role: r, checked: this.containsRole(userRoles, r) }));
  }

  private containsRole(roles: Role[], roleToFind: Role): boolean {
    return roles.findIndex(role => role.id === roleToFind.id) >= 0;
  }

  private getSelectedRoles(rolePairs: RolePair[]): Role[] {
    return rolePairs.filter(rp => rp.checked).map(rp => rp.role);
  }

  private updateUsers() {
    this.userRestService.getAll().subscribe(users => {
      this.userWithRoles.next(users);
    });
  }

  private updateRoles() {
    this.roleRestService.getAll().subscribe(roles => {
      this.roles.next(roles);
    });
  }

  public editUser(user: IUser) {
    this.user = user;
    this.detailHeader = 'Benutzer ändern';
    this.userDialog = true;
    this.edit = true;
    this.updateRolePairs();
  }

  public showDetails(user: IUser) {
    this.router.navigate([`detail/${user.id}`], { relativeTo: this.route });
  }

  private createUser() {
    this.roleRestService.getRole('guest').subscribe(role => {
      const current = this.user;
      current.roles = [role];
      this.user = current;
    });
    this.detailHeader = 'Benutzer erstellen';
    this.userDialog = true;
    this.edit = false;
    this.updateRolePairs();
  }

  private saveUser(user: IUser, rolePairs: RolePair[]) {
    if (this.userDialog) {
      user.roles = this.getSelectedRoles(rolePairs);
      user.id = this.user.id;
      if (this.edit) {
        this.updateUser(user);
      } else {
        this.addUser(user);
      }
    }
  }

  private updateUser(user: IUser) {
    this.userRestService.update(user).subscribe(ok => {
      this.updateUsers();
    });
    this.user = null;
    this.userDialog = false;
    this.edit = false;
  }

  private addUser(user: IUser) {
    this.userRestService.add(user).subscribe(u => {
      this.updateUsers();
    });
    this.userDialog = false;
    this.edit = false;
  }

  private cancel() {
    this.userDialog = false;
    this.edit = false;
  }
}


