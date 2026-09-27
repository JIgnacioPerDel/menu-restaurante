/** Error normalizado a partir de las respuestas ProblemDetail (RFC 7807) del backend. */
export interface ApiError {
  status: number;
  message: string;
  fieldErrors: Record<string, string>;
}
