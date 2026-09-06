import axios from 'axios';

interface ApiErrorEnvelope {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Terjadi kendala. Silakan coba lagi.',
): string {
  if (!axios.isAxiosError<ApiErrorEnvelope>(error)) {
    return error instanceof Error && error.message ? error.message : fallback;
  }

  if (error.code === 'ECONNABORTED') {
    return 'Permintaan melewati batas waktu. Periksa koneksi lalu coba lagi.';
  }

  return error.response?.data?.error?.message ?? fallback;
}

