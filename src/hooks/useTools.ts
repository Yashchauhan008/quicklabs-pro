import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { serverDetails } from '@/config';
import { getApiScope } from '@/utils/apiScope';
import { queryClient } from '@/main';

export interface Tool {
  id: string;
  title: string;
  description: string;
  logo_url: string;
  banner_urls: string[];
  /** Same order as `banner_urls`; used when editing to remove individual banners. */
  banner_file_ids: string[];
  link: string;
  category: string;
  status: 'online' | 'beta' | 'new';
  created_at: string;
  updated_at: string;
}

export interface ToolsResponse {
  success: boolean;
  data: Tool[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const toolKeys = {
  all: ['tools'] as const,
  lists: () => [...toolKeys.all, 'list'] as const,
  list: (params: any) => [...toolKeys.lists(), getApiScope(), params] as const,
};

async function getTools(params: any): Promise<ToolsResponse> {
  const scope = getApiScope();
  const { data } = await axios.get(`${serverDetails.serverProxyURL}/api/${scope}/tools`, {
    params,
    withCredentials: true,
  });
  return data;
}

export function useGetTools(params: any = {}) {
  return useQuery({
    queryKey: toolKeys.list(params),
    queryFn: () => getTools(params),
  });
}

import { PRIVATE_STATIC_ACCESS_TOKEN } from '@/config';

const getHeaders = () => ({
  'x-access-token': PRIVATE_STATIC_ACCESS_TOKEN,
});

export function useCreateTool() {
  const scope = getApiScope();
  return useMutation({
    mutationFn: (data: FormData) => 
      axios.post(`${serverDetails.serverProxyURL}/api/${scope}/tools`, data, { 
        withCredentials: true,
        headers: getHeaders()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: toolKeys.all });
    },
  });
}

export function useUpdateTool() {
  const scope = getApiScope();
  return useMutation({
    mutationFn: ({ id, formData }: { id: string, formData: FormData }) => 
      axios.put(`${serverDetails.serverProxyURL}/api/${scope}/tools/${id}`, formData, { 
        withCredentials: true,
        headers: getHeaders()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: toolKeys.all });
    },
  });
}

export function useDeleteTool() {
  const scope = getApiScope();
  return useMutation({
    mutationFn: (id: string) => 
      axios.delete(`${serverDetails.serverProxyURL}/api/${scope}/tools/${id}`, { 
        withCredentials: true,
        headers: getHeaders()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: toolKeys.all });
    },
  });
}
