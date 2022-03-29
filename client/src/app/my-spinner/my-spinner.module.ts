import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MySpinnerComponent} from './my-spinner.component';

@NgModule({
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
  ],
  declarations: [
    MySpinnerComponent,
  ],
  exports: [
    MySpinnerComponent,
  ]
})
export class MySpinnerModule { }
