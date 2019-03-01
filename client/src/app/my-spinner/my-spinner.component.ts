import {Component, Inject, Input, OnDestroy} from '@angular/core';
import {WINDOW} from '../servies/window-provider';

@Component({
  selector: 'app-my-spinner',
  templateUrl: './my-spinner.component.html',
  styleUrls: ['./my-spinner.component.scss']
})
export class MySpinnerComponent implements OnDestroy {

  private currentTimeout: number;
  public isDelayedRunning = false;

  public constructor(@Inject(WINDOW) private window: Window) {
  }

  @Input()
  public delay = 300;

  @Input()
  public set isRunning(value: boolean) {
    if (!value) {
      this.cancelTimeout();
      this.isDelayedRunning = false;
      return;
    }

    if (this.currentTimeout) {
      return;
    }

    this.currentTimeout = window.setTimeout(() => {
      this.isDelayedRunning = value;
      this.cancelTimeout();
    }, this.delay);
  }

  private cancelTimeout(): void {
    clearTimeout(this.currentTimeout);
    this.currentTimeout = undefined;
  }

  ngOnDestroy(): any {
    this.cancelTimeout();
  }
}
