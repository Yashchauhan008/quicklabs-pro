export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
  }
  
  export interface PaginationParams {
    page?: number;
    limit?: number;
  }
  
  export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }