import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatIconModule,RouterLink,CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  activeTab: string = 'video';
  activeIndex: number = 1;

  constructor(private router: Router) {}

  setActive(index: number, route: string) {
    this.activeIndex = index;
    this.router.navigate([route]);
  }

  getBulletIconClass(index: number): string {
    switch (index) {
      case 1: return 'fa-house';
      case 2: return 'fa-video';
      case 3: return 'fa-message';
      case 4: return 'fa-user';
      default: return 'fa-circle';
    }
  }
}
