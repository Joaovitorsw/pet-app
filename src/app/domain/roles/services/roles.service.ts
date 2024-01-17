import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  ApiResponse,
  PaginationOptions,
  PaginationResponse,
  Role,
} from '../../pet/interfaces/pet';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  apiUrl = environment.apiUrl;

  constructor(private httpClient: HttpClient) {}

  getRoles(search?: Partial<Role> & Partial<PaginationOptions>) {
    let params = new HttpParams();

    if (search) {
      Object.keys(search).forEach((string) => {
        const key = string as keyof Partial<Role> &
          keyof Partial<PaginationOptions>;
        params = params.set(key, search[key]);
      });
    }

    return this.httpClient.get<ApiResponse<PaginationResponse<Role>>>(
      `${this.apiUrl}/roles`,
      { params }
    );
  }

  createRole(role: Partial<Role>) {
    return this.httpClient.post<ApiResponse<Role>>(
      `${this.apiUrl}/roles`,
      role
    );
  }

  updateRole(role: Role) {
    return this.httpClient.put<ApiResponse<Role>>(`${this.apiUrl}/roles`, role);
  }

  removeRole(id: number) {
    return this.httpClient.delete<ApiResponse<Role>>(
      `${this.apiUrl}/roles/${id}`
    );
  }
}
