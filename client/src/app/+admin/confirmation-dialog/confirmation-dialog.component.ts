import { Component } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: 'confirmation-dialog.component.html',
})
export class ConfirmationDialogComponent {
  message: string;
  button1: string;
  button2: string;

  constructor(public dialogRef: MatDialogRef<ConfirmationDialogComponent>) {
    this.button1 = 'Nein';
    this.button2 = 'Ja';
  }
}
