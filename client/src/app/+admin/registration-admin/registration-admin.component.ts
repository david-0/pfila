import {HttpClient} from '@angular/common/http';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {BehaviorSubject} from 'rxjs';
import {IPerson} from '../../entities/person';
import {PersonRestService} from '../../servies/rest/person-rest.service';
import {PersonWithAllRestService} from '../../servies/rest/person-with-all-rest.service';
import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';
import {AuthenticationService} from '../services/auth/authentication.service';
import {CsvExporter} from './csv-exporter';

@Component({
  selector: 'app-registration-admin',
  templateUrl: './registration-admin.component.html',
  styleUrls: ['./registration-admin.component.scss']
})
export class RegistrationAdminComponent implements OnInit, OnDestroy {
  public selectedPerson: IPerson;
  private persons = new BehaviorSubject<IPerson[]>([]);

  constructor(private http: HttpClient,
              private authenticationService: AuthenticationService,
              public dialog: MatDialog,
              private personWithAllRestService: PersonWithAllRestService,
              private personRestService: PersonRestService,
              private exporter: CsvExporter) {
  }

  openDialog(id: number, firstname: string, lastname: string) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);
    dialogRef.componentInstance.message = `${firstname} ${lastname} löschen? `;
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'Ja') {
        this.personRestService.del(id).subscribe(ok => {
          this.updatePersons();
        });
      }
    });
  }

  ngOnInit() {
    this.updatePersons();
  }

  private updatePersons() {
    this.personWithAllRestService.getAll().subscribe(list => {
      this.persons.next(list.sort((a, b) => this.compare(a, b)));
    });
  }

  private saveFile() {
    this.exporter.exportAsExcelFile(this.persons.getValue(), 'report');
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


