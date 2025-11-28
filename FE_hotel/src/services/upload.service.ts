import api from '../utils/api';

export interface UploadResult {
  filename: string;
  url: string;
  contentType: string;
  size: number;
}

export const uploadService = {
  uploadImage: async (file: File): Promise<UploadResult> => {
    const form = new FormData();
    form.append('file', file);

    const response = await api.post('/uploads/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data as UploadResult;
  },
};
