import api from '../utils/api';

export interface CategoryDTO {
  id: number;
  name: string;
  slug?: string;
  imageUrl?: string;
  active?: boolean;
}

export const categoryService = {
  getAll: async (): Promise<CategoryDTO[]> => {
    const resp = await api.get('/categories');
    return resp.data;
  },

  getById: async (id: number): Promise<CategoryDTO> => {
    const resp = await api.get(`/categories/${id}`);
    return resp.data;
  },

  create: async (payload: Partial<CategoryDTO>) => {
    const resp = await api.post('/categories', payload);
    return resp.data;
  },

  update: async (id: number, payload: Partial<CategoryDTO>) => {
    const resp = await api.put(`/categories/${id}`, payload);
    return resp.data;
  },

  delete: async (id: number) => {
    await api.delete(`/categories/${id}`);
  }
};
