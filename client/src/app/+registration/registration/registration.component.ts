import {HttpClient} from '@angular/common/http';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {filter, map, switchMap} from 'rxjs/operators';
import {IGroup} from '../../entities/group';
import {IPerson} from '../../entities/person';
import {ISubgroup} from '../../entities/subgroup';
import {GroupWithSubgroupsRestService} from '../../servies/rest/group-with-subgroups-rest.service';
import {PersonWithAllRestService} from '../../servies/rest/person-with-all-rest.service';
import {Container} from './api3model/Container';

@Component({
  selector: 'app-registration',
  templateUrl: 'registration.component.html',
  styleUrls: ['registration.component.scss']
})
export class RegistrationComponent implements OnInit, OnDestroy {

  public groups = new BehaviorSubject<IGroup[]>([]);
  public subgroups: ISubgroup[] = [];
  public busy = false;

  public plzControl: FormControl = new FormControl();
  public cityControl: FormControl = new FormControl();
  public subgroupControl: FormControl = new FormControl();
  public sub: Subscription;

  public edit: boolean;
  public person: IPerson;
  public group: IGroup;
  public subgroup: ISubgroup;

  constructor(private router: Router,
              private http: HttpClient,
              private route: ActivatedRoute,
              private personRestService: PersonWithAllRestService,
              private groupRestService: GroupWithSubgroupsRestService) {
    const valueChanges1 = this.plzControl.valueChanges
      .pipe(this.getPlzObservable)
      .pipe((o) => this.getCityObservable(o, http))
      .subscribe(city => this.cityControl.setValue(city));
  }


  private static extractCity(label: string): string {
    const results = /^<b>[0-9]{4} - (.*) \([A-Z,]*\)<\/b>$/g.exec(label);
    return (results && results.length > 0) ? results[1] : '';
  }

  ngOnInit() {
    this.groupRestService.getAll().subscribe(groups => {
      this.groups.next(groups);
    });
    this.sub = this.route.params.subscribe((params: any) => {
      if (params && params.id) {
        this.personRestService.get(+params.id).subscribe(person => {
          this.edit = true;
          this.person = person;
          if (person.subgroup) {
            this.subgroupControl.setValue(person.subgroup.id);
          }
          this.plzControl.setValue(person.plz);
          this.cityControl.setValue(person.city);
          if (person.subgroup) {
            this.group = person.subgroup.group;
          }
          this.subgroup = person.subgroup;
        });
      }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  private getPlzObservable(input: Observable<string>): Observable<string> {
    return input.pipe(
      filter(text => text && text.length > 3),
      filter(text => !text.startsWith('DE-')),
      map(text => (text.startsWith('CH-')) ? text.substr(3) : text),
      filter(text => text.length === 4));
  }

  private getCityObservable(input: Observable<string>, http: HttpClient): Observable<string> {
    return input.pipe(
      map(text => `https://api3.geo.admin.ch/rest/services/api/SearchServer?type=locations&origins=zipcode&limit=2&searchText=${text}`),
      switchMap(url => http.get<Container>(url).pipe(
        filter(r => r.results.length > 0),
        map(c => c.results[0]),
        filter(result => result.attrs !== null),
        map(result => result.attrs),
        filter(attrs => attrs.label !== null),
        map(attrs => attrs.label),
        map(RegistrationComponent.extractCity),
        filter(city => city.length > 0))));
  }

  public updateSubgroup(group: IGroup) {
    if (group) {
      this.subgroupControl.reset();
      this.subgroups = group.subgroups;
    }
  }

  public save(data: any, valid: boolean) {
    const person: IPerson = {
      id: data.id,
      firstname: data.firstname,
      lastname: data.lastname,
      street: data.street,
      streetNumber: data.streetNumber,
      plz: this.plzControl.value,
      city: this.cityControl.value,
      email: data.email,
      phoneNumber: data.phoneNumber,
      dateOfBirth: data.dateOfBirth,
      allergies: data.allergies,
      comments: data.comments,
      notification: data.notification,
      subgroup: this.findSubgroup(this.subgroupControl.value),
      leader: !!data.leader,
    };
    console.log(person);
    if (!this.edit) {
      person.createDate = new Date();
      this.busy = true;
      this.personRestService.add(person).subscribe((p: IPerson) => {
        this.busy = false;
        this.router.navigate(['registration/confirmation']);
      }, (err: any) => {
        this.busy = false;
        this.router.navigate(['error']);
      });
    } else {
      person.createDate = this.person.createDate;
      person.id = this.person.id;
      this.busy = true;
      this.personRestService.update(person).subscribe((success: boolean) => {
        this.busy = false;
        this.router.navigate(['/admin/dashboard/registrations']);
      }, (err: any) => {
        this.busy = false;
        this.router.navigate(['error']);
      });
    }
  }


  private findSubgroup(subgroupId: number): ISubgroup | undefined {
    const groups = this.groups.getValue();
    groups.forEach(g => {
      g.subgroups.forEach(s => {
        if (s.id === subgroupId) {
          s.group = {id: g.id, name: g.name, subgroups: []};
          return s;
        }
      });
    });
    return undefined;
  }

  onTeam() {
    this.router.navigate(['../team'], {relativeTo: this.route});
  }

  onHome() {
    this.router.navigate(['../home'], {relativeTo: this.route});
  }

  onInfo() {
    this.router.navigate(['../info'], {relativeTo: this.route});
  }
}
