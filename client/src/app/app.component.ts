import {Component} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(private router: Router) {
  }

  home(): void {
    this.router.navigate(['/home']);
  }

  registration(): void {
    this.router.navigate(['/registration']);
  }

  info(): void {
    this.router.navigate(['/info']);
  }

  team(): void {
    this.router.navigate(['/team']);
  }
}
