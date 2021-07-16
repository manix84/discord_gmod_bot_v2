interface GenericResponse {
  timestamp: string;
}
interface ErrorResponse extends GenericResponse {
  success: false;
  error?: ErrorObj;
}
interface SuccessResponse extends GenericResponse {
  success: true;
  [key: string]: any;
}
export type Params = {
  [key: string]: any;
};
export type Response = ErrorResponse | SuccessResponse;
export type ErrorObj = {
  code: string;
  message: string;
}

export const generateErrorResponse = (error: ErrorObj): ErrorResponse => ({
  timestamp: new Date().toISOString(),
  success: false,
  error: {
    code: error.code,
    message: error.message
  }
});

export const generateSuccessResponse = (params: Params): SuccessResponse => ({
  timestamp: new Date().toISOString(),
  success: true,
  params
});
