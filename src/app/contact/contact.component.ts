import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactService } from '../services/contact.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [MatFormFieldModule,
      MatInputModule,
      MatButtonModule,
      MatCardModule,MatIconModule,ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  contactForm: FormGroup;

  constructor(private fb: FormBuilder, private contactService: ContactService, private snackBar: MatSnackBar) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
  }

  send() {
    if (this.contactForm.valid) {
      this.contactService.sendMessage(this.contactForm.value).subscribe({
        next: (message) => {
          // Affiche le message renvoyé par le backend (ex: "Message envoyé !")
          this.snackBar.open('✅ ' + message, 'Fermer', { duration: 3000 });
          this.contactForm.reset({
            name: '',
            email: '',
            message: ''
          });
          this.contactForm.markAsPristine();
this.contactForm.markAsUntouched();

                  },
        error: (err) => {
          console.error('Erreur d’envoi :', err);
          this.snackBar.open('❌ Échec de l’envoi du message.', 'Fermer', { duration: 3000 });
        }
      });
    }
  }
  
}