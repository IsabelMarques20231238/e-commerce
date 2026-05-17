import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavbarComponent, RouterOutlet],
  template: `
    @if (showNavbar) {
      <app-navbar></app-navbar>
    }
    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('mini-ecommerce-frontend');

  constructor(private router: Router) {}

  get showNavbar() {
    return !['/login', '/register'].includes(this.router.url.split('?')[0]);
  }
}
