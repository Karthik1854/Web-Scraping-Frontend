import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  activeNav = signal<string>('COURSES');

  navItems = [
    { label: 'COURSES', link: '#courses', hasBadge: false },
    { label: 'TRY PREMIUM', link: '#try-premium', hasBadge: false },
    { label: 'ABOUT', link: '#about', hasBadge: false },
    { label: 'SHOP', link: '#shop', hasBadge: true, badgeText: 'NEW' },
  ];

  setActive(nav: string, event: MouseEvent): void {
    event.preventDefault();
    this.activeNav.set(nav);
  }
}
