import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import { DateTime } from 'luxon';
import { utils, WorkBook, WorkSheet, write } from 'xlsx';
import { IPerson } from '../../entities/person';
import { GroupWithSubgroupsRestService } from '../../servies/rest/group-with-subgroups-rest.service';
import { Field } from './export-model/field';
import { Filter } from './export-model/filter';
import { SummaryEntry } from './export-model/summary-entry';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable()
export class CsvExporter {

  private readonly fields: Field[] = [];

  constructor(private groupRestService: GroupWithSubgroupsRestService) {
    this.fields.push(new Field('Anmeldedatum', (p: IPerson) => DateTime.fromJSDate(new Date(p.createDate)).toFormat('yyyy-LL-dd HH:mm:ss')));
    this.fields.push(new Field('Vorname', (p: IPerson) => p.firstname));
    this.fields.push(new Field('Nachname', (p: IPerson) => p.lastname));
    this.fields.push(new Field('Strasse', (p: IPerson) => p.street));
    this.fields.push(new Field('Hausnummer', (p: IPerson) => p.streetNumber));
    this.fields.push(new Field('PLZ', (p: IPerson) => p.plz));
    this.fields.push(new Field('Ort', (p: IPerson) => p.city));
    this.fields.push(new Field('E-Mail', (p: IPerson) => p.email));
    this.fields.push(new Field('Telefonnummer', (p: IPerson) => p.phoneNumber));
    this.fields.push(new Field('Geburtstag', (p: IPerson) => p.dateOfBirth));
    this.fields.push(new Field('Allergien/Diät', (p: IPerson) => p.allergies));
    this.fields.push(new Field('Bemerkungen', (p: IPerson) => p.comments));
    this.fields.push(new Field('Ortsgruppe', (p: IPerson) => p.subgroup.group.name));
    this.fields.push(new Field('Gruppe', (p: IPerson) => p.subgroup.name));
    this.fields.push(new Field('Leiter', (p: IPerson) => p.leader ? 'Ja' : 'Nein'));
  }

  private convertField(person: IPerson): any {
    const result = {};
    this.fields.forEach(f => result[f.label] = f.valueProvider(person));
    return result;
  }

  private convertData(persons: IPerson[]): any[] {
    const data: any[] = [];
    persons.map(p => this.convertField(p)).forEach(d => data.push(d));
    return data;
  }

  private addSheet(persons: IPerson[], workbook: WorkBook, workbookName: string, filters: Filter[]): SummaryEntry[] {
    const data: any[] = [];
    let count = 0;
    const summaries: SummaryEntry[] = [];
    for (const filter of filters) {
      const filteredData = this.convertData(persons.filter(p => filter.test(p)));
      const summary = new SummaryEntry(filter.name, filteredData.length);
      count += filteredData.length;
      data.push(summary);
      data.push(...filteredData);
      data.push({});
      summaries.push(summary);
    }
    data.push(new SummaryEntry('Total', count));
    this.addWorksheet(data, workbook, workbookName);
    return summaries;
  }

  private addWorksheet(json: any[], workbook: WorkBook, workbookName: string): void {
    const worksheet: WorkSheet = utils.json_to_sheet(json);
    workbook.Sheets[workbookName] = worksheet;
    workbook.SheetNames.push(workbookName);
  }

  public async exportAsExcelFile(persons: IPerson[], excelFileName: string): Promise<void> {
    const summaries: SummaryEntry[] = [];
    const summarySheetName = 'Zusammenfassung';
    const workbook: WorkBook = { Sheets: {}, SheetNames: [summarySheetName] };
    summaries.push(...this.addSheet(persons, workbook, 'alle', [new Filter('alle', (p) => true)]));
    const groups = await this.groupRestService.getAll().toPromise();
    for (const group of groups) {
      const filters: Filter[] = [];
      for (const subgroup of group.subgroups) {
        filters.push(new Filter(`${group.name}-${subgroup.name}`, (p) => p.subgroup.id === subgroup.id && !p.leader));
      }
      for (const subgroup of group.subgroups) {
        filters.push(new Filter(`${group.name}-${subgroup.name}-Leiter`, (p) => p.subgroup.id === subgroup.id && p.leader));
      }
      summaries.push(...this.addSheet(persons, workbook, group.name, filters));
    }
    workbook.Sheets[summarySheetName] = utils.json_to_sheet(summaries);
    const excelBuffer: any = write(workbook, { bookType: 'xlsx', type: 'array' });
    return this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    const date = DateTime.now().toFormat('yyyy-MM-dd HHmmss');
    saveAs(data, fileName + '_' + date + EXCEL_EXTENSION);
  }
}
