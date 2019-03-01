import {HttpClient} from '@angular/common/http';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {IGroup} from '../../entities/group';
import {ISubgroup} from '../../entities/subgroup';
import {GroupWithSubgroupsRestService} from '../../servies/rest/group-with-subgroups-rest.service';
import {SubgroupRestService} from '../../servies/rest/subgroup-rest.service';
import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-group-admin',
  templateUrl: './group-admin.component.html',
  styleUrls: ['./group-admin.component.scss']
})
export class GroupAdminComponent implements OnInit, OnDestroy {
  public groupEditOpen: boolean;
  private detailHeader: string;
  private groupname: string;
  private groupId: string;


  public subgroupEditOpen: boolean;

  private selectedGroup: IGroup;

  private subgroupId: string;
  private subgroupname: string;
  private subgroupGroupId: string;

  public groups = new BehaviorSubject<IGroup[]>([]);

  constructor(private http: HttpClient,
              public dialog: MatDialog,
              private router: Router,
              private groupRestService: GroupWithSubgroupsRestService,
              private subgroupRestService: SubgroupRestService) {
  }

  openGroupDialog(id: number, groupName: string) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);
    dialogRef.componentInstance.message = `Ortsgruppe ${groupName} löschen?`;
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'Ja') {
        this.groupRestService.del(id).subscribe(ok => {
          this.updateGroups();
        });
        if (this.selectedGroup.id === id) {
          this.selectedGroup = null;
        }
      }
    });
  }

  openSubgroupDialog(id: number, subgroupName: string) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);
    dialogRef.componentInstance.message = `Gruppe ${subgroupName} löschen?`;
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'Ja') {
        this.subgroupRestService.del(id).subscribe(ok => {
          this.updateGroupsAndSelectedGroups();
        });
      }
    });
  }

  ngOnInit() {
    this.updateGroups();
  }

  ngOnDestroy() {
  }

  private updateGroups(): void {
    this.groupRestService.getAll().subscribe(groups => {
      this.groups.next(groups);
    });
  }

  private updateGroupsAndSelectedGroups(): void {
    this.groupRestService.getAll().subscribe(groups => {
      this.groups.next(groups);
      const selectedGroups = groups.filter(g => g.id === this.selectedGroup.id);
      if (selectedGroups.length === 1) {
        this.selectedGroup = selectedGroups[0];
      } else {
        this.selectedGroup = null;
      }
    });
  }

  private editGroup(group: IGroup) {
    this.groupId = group.id;
    this.groupname = group.name;
    this.detailHeader = 'Ortgruppe ändern';
    this.groupEditOpen = true;
  }

  private createGroup() {
    this.groupId = null;
    this.groupname = '';
    this.detailHeader = 'Ortsgruppe erstellen';
    this.groupEditOpen = true;
  }

  private saveGroup(group: IGroup) {
    if (this.groupId) {
      group.id = this.groupId;
      this.updateGroup(group);
    } else {
      this.addGroup(group);
    }
  }

  private updateGroup(group: IGroup) {
    this.groupRestService.update(group).subscribe(ok => {
      this.updateGroups();
    });
    this.groupname = null;
    this.groupId = null;
    this.groupEditOpen = false;
  }

  private addGroup(group: IGroup) {
    this.groupRestService.add(group).subscribe(item => {
      this.updateGroups();
    });
    this.groupEditOpen = false;
    this.groupId = null;
    this.groupname = null;
  }

  private cancel() {
    this.groupEditOpen = false;
    this.subgroupEditOpen = false;
  }

  public showGroupDetails(group: IGroup) {
    this.selectedGroup = group;
  }

  private createSubroup() {
    this.subgroupId = null;
    this.subgroupGroupId = this.selectedGroup.id;
    this.subgroupname = '';
    this.detailHeader = `Gruppe in ${this.selectedGroup.name} erstellen`;
    this.subgroupEditOpen = true;
  }

  private editSubgroup(subgroup: ISubgroup) {
    this.subgroupId = subgroup.id;
    this.subgroupGroupId = this.selectedGroup.id;
    this.subgroupname = subgroup.name;
    this.detailHeader = `Gruppe in ${this.selectedGroup.name} ändern`;
    this.subgroupEditOpen = true;
  }

  private saveSubgroup(subgroup: ISubgroup) {
    subgroup.group = this.selectedGroup;
    if (subgroup.id) {
      this.subgroupRestService.update(subgroup).subscribe(ok => {
        this.updateGroupsAndSelectedGroups();
      });
    } else {
      this.subgroupRestService.add(subgroup).subscribe(item => {
        this.updateGroupsAndSelectedGroups();
      });
    }
    this.subgroupEditOpen = false;
  }

  private updateSubgroup(subgroup: ISubgroup) {
    this.subgroupRestService.update(subgroup).subscribe(ok => {
      this.updateGroupsAndSelectedGroups();
    });
    this.subgroupname = null;
    this.subgroupId = null;
    this.subgroupEditOpen = false;
  }

  private addSubgroup(subgroup: ISubgroup) {
    this.subgroupRestService.add(subgroup).subscribe(item => {
      this.updateGroupsAndSelectedGroups();
    });
    this.subgroupEditOpen = false;
    this.subgroupId = null;
    this.subgroupname = null;
  }
}
