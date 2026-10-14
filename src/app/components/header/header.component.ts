import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  menuOpen = false;

  toggle(): void {
    this.menuOpen = !this.menuOpen;
  }

  close(): void {
    this.menuOpen = false;
  }
}
