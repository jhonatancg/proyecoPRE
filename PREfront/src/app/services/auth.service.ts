import { Injectable } from '@angular/core';
import { environment } from '../environment/environmet';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;

  constructor() { }
}
