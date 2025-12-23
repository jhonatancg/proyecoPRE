import { Routes } from '@angular/router';
import { AlumnoListComponent } from './components/alumno-list/alumno-list.component';
import { AlumnoFormComponent } from './components/alumno-form/alumno-form.component';
import { LoginComponent } from './auth/login/login.component';
import { authGuard } from './auth/guards/auth.guards';
import { MatriculaFormComponent } from './components/matricula-form/matricula-form.component';
import { MatriculaListComponent } from './components/matricula-list/matricula-list.component';

export const routes: Routes = [

    { path: '', redirectTo: '/alumnos', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'alumnos', component: AlumnoListComponent, canActivate: [authGuard] },
    { path: 'matriculas', component: MatriculaListComponent, canActivate: [authGuard] },
    { path: 'matriculas/nueva', component: MatriculaFormComponent, canActivate: [authGuard] },
    { path: 'alumnos/nuevo', component: AlumnoFormComponent, canActivate: [authGuard] },
    { path: 'alumnos/editar/:id', component: AlumnoFormComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: '/alumnos' }
];
