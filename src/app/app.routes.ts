import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home';
import { AboutComponent } from './pages/about';
import { ServicesComponent } from './pages/services';
import { QuoteComponent } from './pages/quote/quote';
import { ContactComponent } from './pages/contact';
import { CareerComponent } from './pages/career';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'quote', component: QuoteComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'career', component: CareerComponent },
  { path: '**', redirectTo: '' }
];
