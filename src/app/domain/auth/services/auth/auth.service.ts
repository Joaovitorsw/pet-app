import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { StorageService } from '../../../../shared/services/storage/storage.service';
import { ApiResponse, Owner } from '../../../pet/interfaces/pet';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  apiUrl = environment.apiUrl;
  constructor(
    public httpClient: HttpClient,
    private storageService: StorageService
  ) {}

  get hasUser() {
    return JSON.parse(this.storageService.getItem('user') || '{}')?.id;
  }

  signIn(value: Partial<{ username: string | null; password: string | null }>) {
    return this.httpClient.post<ApiResponse<Owner>>(
      `${this.apiUrl}/auth/sign-in`,
      value
    );
  }

  signUp(value: Partial<{ username: string | null; password: string | null }>) {
    return this.httpClient.post<ApiResponse<Owner>>(
      `${this.apiUrl}/auth/sign-up`,
      value
    );
  }
  logout() {
    this.storageService.removeItem('user');
  }
}
