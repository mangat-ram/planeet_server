interface IApiResponse {
  statusCode: number;
  data: any;
  message: string;
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
}

export function successResponse (
  statusCode: number,
  data: any, 
  message: string = "success"
): IApiResponse {
  return {
    statusCode,
    data,
    message,
    success: statusCode < 400
  };
}

export function errorResponse (
  statusCode: number,
  message: string
): IApiResponse {
  return {
    statusCode,
    data: null,
    message,
    success: false
  };
}