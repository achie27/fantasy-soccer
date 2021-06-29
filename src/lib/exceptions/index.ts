export class BaseContextualError extends Error {
  readonly code: string;
  readonly httpResponseCode: number;
  readonly notes?: Record<string, any>;

  constructor(
    message: string,
    code: string,
    httpResponseCode: number,
    notes?: Record<string, any>
  ) {
    super(message);

    this.code = code;
    this.httpResponseCode = httpResponseCode;
    this.notes = notes || {};
  }

  getContext() {
    return {
      name: this.name,
      message: this.message,
      stack: this.stack,
      code: this.code,
      notes: this.notes,
      httpResponseCode: this.httpResponseCode,
    };
  }
}

export const isContextualError = (error: any): error is BaseContextualError => {
  return error && error.code && error.httpResponseCode;
};

export class InternalServerError extends BaseContextualError {
  constructor() {
    super(
      "Something went wrong. Please reach out to the developers",
      "INTERNAL_SERVER_ERROR",
      500
    );
  }
}

export class InvalidInput extends BaseContextualError {
  constructor(invalidFields: string) {
    super(invalidFields, "INVALID_INPUT_ERROR", 400);
  }
}

export class UserNotFound extends BaseContextualError {
  constructor(userId: string) {
    super(`${userId} is not registered`, "USER_NOT_FOUND", 404);
  }
}

export class InvalidAccessToken extends BaseContextualError {
  constructor(token: string) {
    super(`'${token}' is invalid`, "INVALID_ACCESS_TOKEN", 400);
  }
}

export class InadequatePermissions extends BaseContextualError {
  constructor() {
    super(
      `You don't have the necessary permissions for this`,
      "INADEQUATE_PERMISSIONS",
      403
    );
  }
}

export class IncorrectPassword extends BaseContextualError {
  constructor() {
    super(`Specified password is incorrect`, "INCORRECT_PASSWORD", 400);
  }
}
