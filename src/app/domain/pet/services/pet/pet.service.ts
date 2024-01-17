import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  ApiResponse,
  Owner,
  PaginationOptions,
  PaginationResponse,
  Pet,
} from '../../interfaces/pet';

@Injectable({
  providedIn: 'root',
})
export class PetService {
  apiUrl = environment.apiUrl;
  search$$ = new BehaviorSubject<boolean>(true);
  constructor(public httpClient: HttpClient) {}

  getPets(search?: Partial<Pet>, pagination?: Partial<PaginationOptions>) {
    let params = this.getSearchParams(search, pagination);

    return this.httpClient.get<ApiResponse<PaginationResponse<Pet>>>(
      `${this.apiUrl}/pets`,
      { params }
    );
  }
  searchPets(search?: Partial<Pet>, pagination?: Partial<PaginationOptions>) {
    let params = this.getSearchParams(search, pagination);

    return this.httpClient.get<ApiResponse<PaginationResponse<Pet>>>(
      `${this.apiUrl}/pets/search`,
      { params }
    );
  }

  getOwners() {
    const params = new HttpParams()
      .set('size', '10')
      .set('page', '0')
      .set('sort', 'id,desc');

    return this.httpClient.get<ApiResponse<PaginationResponse<Owner>>>(
      `${this.apiUrl}/auth`,
      { params }
    );
  }
  createPet(
    value: Partial<{
      name: string | null;
      birthDate: string | null;
      photoUrl: File | ArrayBuffer | string | null;
      owner: number | null;
    }>
  ) {
    const formData = new FormData();
    Object.keys(value).forEach((key: any) => {
      if (key === 'birthDate') {
        formData.append(key, new Date(value.birthDate as string).toISOString());
        return;
      }
      formData.append(key, (<any>value)[key]);
    });

    return this.httpClient.post<ApiResponse<Pet>>(
      `${this.apiUrl}/pets`,
      formData
    );
  }

  updatePet(
    value: Partial<{
      name: string | null;
      birthDate: string | null;
      photoUrl: File | ArrayBuffer | string | null;
      owner: number | null;
    }>
  ) {
    const formData = new FormData();
    Object.keys(value).forEach((key: any) => {
      if (key === 'birthDate') {
        formData.append(key, new Date(value.birthDate as string).toISOString());
        return;
      }
      formData.append(key, (<any>value)[key]);
    });
    return this.httpClient.put<ApiResponse<Pet>>(
      `${this.apiUrl}/pets`,
      formData
    );
  }
  removePet(pet: Pet) {
    return this.httpClient.delete<ApiResponse<Pet>>(
      `${this.apiUrl}/pets/${pet.id}`
    );
  }
  calendar(params: { field: string; year: number; month: number }) {
    const httpParams = new HttpParams()
      .set('field', params.field)
      .set('year', params.year.toString())
      .set('month', params.month.toString());

    return this.httpClient.get<
      ApiResponse<
        {
          day: string;
          total: number;
        }[]
      >
    >(`${this.apiUrl}/pets/calendar`, { params: httpParams });
  }
  private getSearchParams(
    search: Partial<Pet> | undefined,
    pagination?: Partial<PaginationOptions>
  ) {
    let params = new HttpParams();

    params = params
      .set('size', pagination?.size?.toString() ?? '10')
      .set('page', pagination?.page?.toString() ?? '0')
      .set('sort', pagination?.sort ?? 'createdAt,desc');

    if (search) {
      Object.keys(search).forEach((key) => {
        const searchData = (<any>search)[key];
        if (searchData) {
          const isDate = ['birthDate', 'createdAt', 'updatedAt'].includes(key);

          if (isDate) {
            params = this.getSearchDateParams(searchData, key, params);
            return;
          }
          params = params.set(key, searchData);
        }
      });
    }
    return params;
  }
  getPetImageUrl(photoUrl: string | number) {
    return `${environment.apiUrl}/pets/image/${photoUrl}`;
  }

  private getSearchDateParams(
    searchData: any,
    key: string,
    params: HttpParams
  ) {
    if (searchData instanceof Array) {
      return params.set(
        key,
        searchData
          .map((date: string) => this.transformISOformat(date))
          .join(',')
      );
    }
    return params.set(key, this.transformISOformat(searchData));
  }

  private transformISOformat(date: string) {
    return new Date(date).toISOString().replace(/(\d{4}-\d{2}-\d{2})T.*/, '$1');
  }
}
