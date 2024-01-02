import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { BehaviorSubject } from 'rxjs';
import { GroupWithSubgroupsRestService } from 'src/app/servies/rest/group-with-subgroups-rest.service';
import { IPerson } from '../../entities/person';
import { PersonRestService } from '../../servies/rest/person-rest.service';
import { PersonWithAllRestService } from '../../servies/rest/person-with-all-rest.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { AuthenticationService } from '../services/auth/authentication.service';
import { NotifierService } from '../services/notifier.service';
import { CsvExporter } from './csv-exporter';

@Component({
  selector: 'app-registration-admin',
  templateUrl: './registration-admin.component.html',
  styleUrls: ['./registration-admin.component.scss']
})
export class RegistrationAdminComponent implements OnInit, OnDestroy {
  public selectedPerson: IPerson;
  private allPersons = new BehaviorSubject<IPerson[]>([]);
  private groups = [];
  private filteredPersons = new BehaviorSubject<IPerson[]>([]);
  filterControl = new UntypedFormControl();

  constructor(private http: HttpClient,
    private authenticationService: AuthenticationService,
    public dialog: MatDialog,
    private personWithAllRestService: PersonWithAllRestService,
    private personRestService: PersonRestService,
    private exporter: CsvExporter,
    private notifier: NotifierService,
    private groupRestService: GroupWithSubgroupsRestService) {
  }

  openDialog(id: number, firstname: string, lastname: string) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);
    dialogRef.componentInstance.message = `${firstname} ${lastname} löschen? `;
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'Ja') {
        this.personRestService.del(id).subscribe({
          next: ok => {
            this.updatePersons();
            this.notifier.showNotification("Anmeldung '" + firstname + " " + lastname + "' wurde gelöscht!", "Schliessen", "success");
          },
          error: error => this.notifier.showNotification("Anmeldung '" + + firstname + " " + lastname + "' konnte nicht gelöscht werden!. Error: " + error, "Schliessen", "error")
        });
      }
    });
  }

  ngOnInit() {
    this.updatePersons();
    this.groupRestService.getAll().subscribe({
      next: groups => this.groups = groups,
      error: error => this.notifier.showNotification("Gruppen für den Filter konnten nicht geladen werden!. Error: " + error, "Schliessen", "error")
    })
    this.filterControl.valueChanges.subscribe(value => {
      this.filterPersons();
    });

  }

  private filterPersons(): void {
    if (this.filterControl.value != undefined) {
      this.filteredPersons.next(this.allPersons.getValue().filter(person => person.subgroup.id == this.filterControl.value));
    } else {
      this.filteredPersons.next(this.allPersons.getValue());
    }
  }

  private updatePersons() {
    this.personWithAllRestService.getAll().subscribe({
      next: list => {
        this.allPersons.next(list.sort((a, b) => this.compare(a, b)))
        this.filterPersons();
      },
      error: error => this.notifier.showNotification("Es konnten nicht alle Anmeldungen geladen werden!. Error: " + error, "Schliessen", "error")
    });
  }

  private saveFile() {
    this.exporter.exportAsExcelFile(this.allPersons.getValue(), 'report') //
      .then(n => this.notifier.showNotification("Export erfolgreich!", "Schliessen", "success")) //
      .catch(reason => this.notifier.showNotification("Datei konnte nicht gespeichert werden!", "Schliessen", "error"));
  }

  ngOnDestroy() {
  }

  private showDetails(person: IPerson) {
    this.selectedPerson = person;
  }

  private hideDetails() {
    this.selectedPerson = null;
  }

  private compare(a: IPerson, b: IPerson): number {
    let result = 0;
    if (a.subgroup === null && b.subgroup !== null) {
      return -1;
    }
    if (a.subgroup !== null && b.subgroup === null) {
      return 1;
    }
    if (a.subgroup !== null && b.subgroup !== null) {
      if (a.subgroup.group === null && b.subgroup.group !== null) {
        return -1;
      }
      if (a.subgroup.group !== null && b.subgroup.group === null) {
        return 1;
      }
      if (a.subgroup.group !== null && b.subgroup.group !== null) {
        result = a.subgroup.group.name.localeCompare(b.subgroup.group.name);
        if (result !== 0) {
          return result;
        }
        result = a.subgroup.name.localeCompare(b.subgroup.name);
        if (result !== 0) {
          return result;
        }
      }
    }
    result = a.lastname.localeCompare(b.lastname);
    if (result !== 0) {
      return result;
    }
    result = a.firstname.localeCompare(b.firstname);
    if (result !== 0) {
      return result;
    }
  }
}


