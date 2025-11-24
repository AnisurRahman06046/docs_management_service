import { DatabaseError } from "pg";
import { IGenericErrorMessage } from "../interfaces/error";

// PostgreSQL error codes
const pgErrorCodes = {
  uniqueViolation: '23505',
  notNullViolation: '23502',
  foreignKeyViolation: '23503',
  invalidTextRepresentation: '22P02',
  undefinedColumn: '42703',
  undefinedTable: '42P01',
} as const;

const handlePostgresError = (error: DatabaseError) => {
  let statusCode = 500;
  let message = 'Database error occurred';
  let errorMessages: IGenericErrorMessage[] = [];

  switch (error.code) {
    case pgErrorCodes.uniqueViolation:
      statusCode = 409;
      message = 'Duplicate entry';
      errorMessages = [
        {
          path: error.constraint || '',
          message: 'This value already exists',
        },
      ];
      break;

    case pgErrorCodes.notNullViolation:
      statusCode = 400;
      message = 'Missing required field';
      errorMessages = [
        {
          path: error.column || '',
          message: 'This field cannot be null',
        },
      ];
      break;

    case pgErrorCodes.foreignKeyViolation:
      statusCode = 400;
      message = 'Invalid reference';
      errorMessages = [
        {
          path: error.constraint || '',
          message: 'Referenced record does not exist',
        },
      ];
      break;

    case pgErrorCodes.invalidTextRepresentation:
      statusCode = 400;
      message = 'Invalid data format';
      errorMessages = [
        {
          path: '',
          message: 'Invalid data type or format',
        },
      ];
      break;

    case pgErrorCodes.undefinedColumn:
    case pgErrorCodes.undefinedTable:
      statusCode = 500;
      message = 'Database schema error';
      errorMessages = [
        {
          path: '',
          message: 'Invalid database query structure',
        },
      ];
      break;

    default:
      errorMessages = [
        {
          path: '',
          message: error.message,
        },
      ];
  }

  return {
    statusCode,
    message,
    errorMessages,
  };
};

export default handlePostgresError;