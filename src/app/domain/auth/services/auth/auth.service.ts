import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { StorageService } from '../../../../shared/services/storage/storage.service';
import { ApiResponse, Owner } from '../../../pet/interfaces/pet';
export enum eRoles {
  ADMIN = 0,
  DESENVOLVEDOR = 1,
  ANALISTA_TESTE = 2,
  LIDER_TECNICO = 3,
  DESIGNER = 4,
  ESTAGIARIO = 5,
  ARQUITETO = 6,
  ANALISTA_REQUISITOS = 7,
  ANALISTA_NEGOCIOS = 8,
  SCRUM_MASTER = 9,
  PRODUCT_OWNER = 10,
}

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
    return this.user?.id;
  }

  get user() {
    return JSON.parse(this.storageService.getItem('user') ?? '{}');
  }
  validRole(role?: eRoles | '') {
    const roles = [
      eRoles.DESENVOLVEDOR,
      eRoles.LIDER_TECNICO,
      eRoles.ANALISTA_TESTE,
    ];
    if (role != '' && role) {
      roles.push(role);
    }
    return roles.some((r) => this?.user?.role?.id == r);
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
