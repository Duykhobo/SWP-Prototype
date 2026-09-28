/**
 * @file pagination.ts
 * @description Định nghĩa DTO phân trang chuẩn C# ASP.NET Core 8 Backend theo Quy tắc 3
 */

export interface PaginatedList<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginationParams {
  pageIndex: number;
  pageSize: number;
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: 'asc' | 'desc';
}
