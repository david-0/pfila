import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { IGroup } from '../../entities/group';
import { ISubgroup } from '../../entities/subgroup';
import { GroupWithSubgroupsRestService } from '../../servies/rest/group-with-subgroups-rest.service';
import { SubgroupRestService } from '../../servies/rest/subgroup-rest.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { NotifierService } from '../services/notifier.service';

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
    private subgroupRestService: SubgroupRestService,
    private notifier: NotifierService) {
  }

  openGroupDialog(id: number, groupName: string) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);
    dialogRef.componentInstance.message = `Ortsgruppe ${groupName} löschen?`;
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'Ja') {
        this.groupRestService.del(id).subscribe({
          next: ok => {
            this.updateGroups();
            this.notifier.showNotification("Gruppe '" + groupName + "' wurde gelöscht!", "Schliessen", "success");
          },
          error: error => this.notifier.showNotification("Gruppe '" + groupName + "' konnte nicht gelöscht werden!. Error: " + error, "Schliessen", "error")
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
        this.subgroupRestService.del(id).subscribe({
          next: ok => {
            this.updateGroupsAndSelectedGroups();
            this.notifier.showNotification("Untergruppe '" + subgroupName + "' wurde gelöscht!", "Schliessen", "success");
          },
          error: error => this.notifier.showNotification("Untergruppe '" + subgroupName + "' konnte nicht gelöscht werden!. Error: " + error, "Schliessen", "error")
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
    this.groupRestService.getAll().subscribe({
      next: groups => this.groups.next(groups),
      error: error => this.notifier.showNotification("Es konnten nicht alle Gruppen geladen werden!. Error: " + error, "Schliessen", "error")
    });
  }

  private updateGroupsAndSelectedGroups(): void {
    this.groupRestService.getAll().subscribe({
      next: groups => {
        this.groups.next(groups);
        const selectedGroups = groups.filter(g => g.id === this.selectedGroup.id);
        if (selectedGroups.length === 1) {
          this.selectedGroup = selectedGroups[0];
        } else {
          this.selectedGroup = null;
        }
      },
      error: error => this.notifier.showNotification("Es konnten nicht alle Gruppen geladen werden!. Error: " + error, "Schliessen", "error")
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
    this.groupRestService.update(group).subscribe({
      next: ok => {
        this.updateGroups();
        this.notifier.showNotification("Gruppe '" + group.name + "' wurde aktualisiert!", "Schliessen", "success");
      },
      error: error => this.notifier.showNotification("Gruppe '" + group.name + "' konnte nicht aktialisiert werden!. Error: " + error, "Schliessen", "error")
    });
    this.groupname = null;
    this.groupId = null;
    this.groupEditOpen = false;
  }

  private addGroup(group: IGroup) {
    this.groupRestService.add(group).subscribe({
      next: item => {
        this.updateGroups();
        this.notifier.showNotification("Gruppe '" + group.name + "' wurde hinzugefügt!", "Schliessen", "success");
      },
      error: error => this.notifier.showNotification("Gruppe '" + group.name + "' konnte nicht hinzugefügt werden!. Error: " + error, "Schliessen", "error")
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
    if (this.subgroupId) {
      subgroup.id = this.subgroupId;
      this.subgroupRestService.update(subgroup).subscribe({
        next: item => {
          this.updateGroupsAndSelectedGroups();
          this.notifier.showNotification("Untergruppe '" + subgroup.name + "' wurde aktualisiert!", "Schliessen", "success");
        },
        error: error => this.notifier.showNotification("Untergruppe '" + subgroup.name + "'konnte nicht aktualisiert werden!. Error: " + error, "Schliessen", "error")
      });
    } else {
      this.subgroupRestService.add(subgroup).subscribe({
        next: item => {
          this.updateGroupsAndSelectedGroups();
          this.notifier.showNotification("Untergruppe '" + subgroup.name + "' wurde hinzugefügt!", "Schliessen", "success");
        },
        error: error => this.notifier.showNotification("Untergruppe '" + subgroup.name + "'konnte nicht hinzugefügt werden!. Error: " + error, "Schliessen", "error")
      });
    }
    this.subgroupEditOpen = false;
  }
}
