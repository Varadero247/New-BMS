import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Building, CreateBuildingRequest, ApiResponse } from '@ims/shared';

export function useBuildings() {
  return useQuery({
    queryKey: ['buildings'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Building[]>>('/buildings');
      return response.data.data;
    },
  });
}

export function useBuilding(id: string) {
  return useQuery({
    queryKey: ['buildings', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Building>>(`/buildings/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateBuilding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBuildingRequest) => {
      const response = await api.post<ApiResponse<Building>>('/buildings', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
    },
  });
}

export function useUpdateBuilding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateBuildingRequest> }) => {
      const response = await api.put<ApiResponse<Building>>(`/buildings/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      queryClient.invalidateQueries({ queryKey: ['buildings', id] });
    },
  });
}

export function useDeleteBuilding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/buildings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
    },
  });
}
