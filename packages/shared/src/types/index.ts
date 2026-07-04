/** Standard error envelope returned by the API on non-2xx. */
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
