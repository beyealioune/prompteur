import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { PrompteurComponent } from './prompteur/prompteur.component';
import { AccueilComponent } from './accueil/accueil.component';
import { VideoListComponent } from './video-list/video-list.component';
import { ContactComponent } from './contact/contact.component';
import { ProfilComponent } from './profil/profil.component';
import { ConnexionComponent } from './connexion/connexion.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AuthGuard } from './guard/auth.guard';
import { UnauthGuard } from './guard/unauth.guard';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { FaqComponent } from './faq/faq.component';
import { PolitiqueConfidentialiteComponent } from './politique-confidentialite/politique-confidentialite.component';
import { StripeSuccessComponent } from './stripe-success/stripe-success.component';
import { CameratestComponent } from './cameratest/cameratest.component';


export const routes: Routes = [
  { path: 'accueil', component: AccueilComponent, canActivate: [AuthGuard] },
  { path: 'contact', component: ContactComponent, canActivate: [AuthGuard] },
  { path: 'terms', component: TermsAndConditionsComponent },
  { path: 'faq', component: FaqComponent },
  { path: 'politique-confidentialite', component: PolitiqueConfidentialiteComponent },
  { path: 'videolist', component: VideoListComponent, canActivate: [AuthGuard] },
  { path: 'profil', component: ProfilComponent, canActivate: [AuthGuard] },
  { path: 'prompteur', component: PrompteurComponent, canActivate: [AuthGuard] },
  { path: 'stripe-success', component: StripeSuccessComponent },
  {path: 'test', component: CameratestComponent},

  {
    path: 'connexion',
    component: ConnexionComponent,
    canActivate: [UnauthGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [UnauthGuard]
  },
  {
    path: 'forgot',
    component: ResetPasswordComponent,
    canActivate: [UnauthGuard]
  },
  { path: '', component: RegisterComponent },
];

