import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  PaginationResponse,
  Role,
} from '../../pet/interfaces/pet';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  apiUrl = environment.apiUrl;

  constructor(private httpClient: HttpClient) {}

  getRoles() {
    return this.httpClient.get<ApiResponse<PaginationResponse<Role>>>(
      `${this.apiUrl}/roles`
    );
  }
}
