export interface IExportPerson {
  createDate?: Date;
  firstname: string;
  lastname: string;
  street: string;
  streetNumber?: string;
  plz: string;
  city: string;
  email?: string;
  phoneNumber: string;
  dateOfBirth: string;
  allergies?: string;
  comments?: string;
  notification: string;
  groupName: string;
  subgroupName: string;
  leader: string;
}
