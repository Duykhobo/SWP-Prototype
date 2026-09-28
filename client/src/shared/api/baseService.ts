/**
 * @file baseService.ts
 * @description Tái sử dụng logic gọi API theo Quy tắc 2 (DRY & Zero Hardcoding)
 */

import { axiosClient } from './axiosClient';
import type { PaginatedList, PaginationParams } from '../types/pagination';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export function createBaseService<T, TCreateInput = Partial<T>, TUpdateInput = Partial<T>>(
  resourceEndpoint: string
) {
  return {
    getAll: async (params?: PaginationParams): Promise<PaginatedList<T>> => {
      const response = await axiosClient.get<PaginatedList<T>>(resourceEndpoint, { params });
      return response.data;
    },

    getById: async (id: string): Promise<T> => {
      const response = await axiosClient.get<T>(`${resourceEndpoint}/${id}`);
      return response.data;
    },

    create: async (data: TCreateInput): Promise<T> => {
      const response = await axiosClient.post<T>(resourceEndpoint, data);
      return response.data;
    },

    update: async (id: string, data: TUpdateInput): Promise<T> => {
      const response = await axiosClient.put<T>(`${resourceEndpoint}/${id}`, data);
      return response.data;
    },

    delete: async (id: string): Promise<boolean> => {
      await axiosClient.delete(`${resourceEndpoint}/${id}`);
      return true;
    },
  };
}
