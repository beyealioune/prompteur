import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./navbar/navbar.component";
import { PingService } from './ping.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'prompteur';

  message = '';

  constructor(private pingService: PingService) {}

  ngOnInit() {
    this.pingService.ping().subscribe({
      next: (res) => this.message = res,
      error: (err) => this.message = 'Erreur : ' + err.status
    });
  }
}
