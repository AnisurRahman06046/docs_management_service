import { MulterError } from 'multer';
import { IGenericErrorResponse } from '../interfaces/common';
import { IGenericErrorMessage } from '../interfaces/error';

const handleMulterError = (error: MulterError): IGenericErrorResponse => {
  const errors: IGenericErrorMessage[] = [];

  // Handle different types of MulterError
  switch (error.code) {
    case 'LIMIT_FILE_SIZE':
      errors.push({
        path: error.field || 'file',
        message: 'File size exceeds the allowed limit of 300 KB'
      });
      break;

    case 'LIMIT_UNEXPECTED_FILE':
      errors.push({
        path: error.field || 'file',
        message: 'Unexpected field name in file upload'
      });
      break;

    case 'LIMIT_PART_COUNT':
      errors.push({
        path: 'form',
        message: 'Too many parts in the multipart form'
      });
      break;

    case 'LIMIT_FILE_COUNT':
      errors.push({
        path: 'files',
        message: 'Too many files uploaded at once'
      });
      break;

    default:
      errors.push({
        path: error.field || 'file',
        message: error.message || 'File upload failed'
      });
  }

  const statusCode = 400;

  return {
    statusCode,
    message: 'File Upload Error',
    errorMessages: errors,
  };
};

export default handleMulterError;