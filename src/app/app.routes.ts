import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { PrompteurComponent } from './prompteur/prompteur.component';
import { AccueilComponent } from './accueil/accueil.component';
import { VideoListComponent } from './video-list/video-list.component';

export const routes: Routes = [
    {
        path: 'accueil',component: AccueilComponent,
      },
      {
        path: 'videolist',component: VideoListComponent,
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
