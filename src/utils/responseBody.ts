import { Request } from "express";

interface GenericResponse {
  timestamp: string;
  path: string;
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

export const generateErrorResponse = (request: Request, error: ErrorObj): ErrorResponse => ({
  timestamp: new Date().toISOString(),
  path: request.path,
  success: false,
  error: {
    code: error.code,
    message: error.message
  }
});

export const generateSuccessResponse = (request: Request, params: Params): SuccessResponse => ({
  timestamp: new Date().toISOString(),
  path: request.path,
  success: true,
  params
});
