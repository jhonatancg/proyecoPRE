import { Routes } from '@angular/router';
import { AlumnoListComponent } from './components/alumno-list/alumno-list.component';
import { AlumnoFormComponent } from './components/alumno-form/alumno-form.component';
import { LoginComponent } from './auth/login/login.component';
import { authGuard } from './auth/guards/auth.guards';

export const routes: Routes = [

    { path: '', redirectTo: '/alumons', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'alumnos', component: AlumnoListComponent, canActivate: [authGuard] },
    { path: 'alumnos/nuevo', component: AlumnoFormComponent, canActivate: [authGuard] },
    { path: 'alumnos/editar/:id', component: AlumnoFormComponent },
    { path: '**', redirectTo: '/alumnos' }
];
