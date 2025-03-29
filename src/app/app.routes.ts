import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { PrompteurComponent } from './prompteur/prompteur.component';
import { AccueilComponent } from './accueil/accueil.component';
import { VideoListComponent } from './video-list/video-list.component';
import { ContactComponent } from './contact/contact.component';
import { ProfilComponent } from './profil/profil.component';
import { ConnexionComponent } from './connexion/connexion.component';

export const routes: Routes = [
    {
        path: 'accueil',component: AccueilComponent,
      },
      {
        path: 'contact',component: ContactComponent,
      },
      {
        path: 'connexion',component: ConnexionComponent,
      },
      {
        path: 'register',component: RegisterComponent,
      },
      {
        path: 'videolist',component: VideoListComponent,
      },
      {
        path: 'profil',component: ProfilComponent,
      },
      
    {
        path: 'prompteur',component: PrompteurComponent,
      },
    {
        path: 'register',component: RegisterComponent,
      },
      {
        path: '',component: RegisterComponent,
      }
];
