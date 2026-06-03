import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home';
import { AboutComponent } from './pages/about';
import { ServicesComponent } from './pages/services';
import { QuoteComponent } from './pages/quote';
import { ContactComponent } from './pages/contact';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'quote', component: QuoteComponent },
  { path: 'contact', component: ContactComponent },
  { path: '**', redirectTo: '' }
];
