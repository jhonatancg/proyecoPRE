import { Routes } from '@angular/router';
import { AlumnoListComponent } from './components/alumno-list/alumno-list.component';
import { AlumnoFormComponent } from './components/alumno-form/alumno-form.component';

export const routes: Routes = [

    { path: '', redirectTo: '/alumons', pathMatch: 'full' },
    { path: 'alumnos', component: AlumnoListComponent },
    { path: 'alumnos/nuevo', component: AlumnoFormComponent },
    { path: 'alumnos/editar/:id', component: AlumnoFormComponent },
    { path: '**', redirectTo: '/alumnos' }
];
