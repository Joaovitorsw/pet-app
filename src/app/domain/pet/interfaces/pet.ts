export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  success: boolean;
}

export interface PaginationResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
}

export interface Pet {
  id: number | string;
  name: string;
  birthDate: string;
  photoUrl: string;
  owner: Owner;
  createdAt: string;
  updatedAt: string;
}

export interface Owner {
  id: number;
  username: string;
  email: string;
  role: Role;
}

export interface Role {
  id: number;
  name: string;
}
export interface PaginationOptions {
  page: number;
  size: number;
  sort: string;
}
