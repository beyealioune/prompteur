import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./navbar/navbar.component";
import { PingService } from './ping.service';
import { CommonModule } from '@angular/common';
import { SessionService } from './services/session.service';

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
  isLogged = false;


  constructor(private pingService: PingService,private sessionService: SessionService) {
    this.sessionService.$isLogged().subscribe(logged => {
      this.isLogged = logged;
    });
  }
  

  ngOnInit() {
    this.pingService.ping().subscribe({
      next: (res) => this.message = res,
      error: (err) => this.message = 'Erreur : ' + err.status
    } );
    console.log(this.message);

  }
}
