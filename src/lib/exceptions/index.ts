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
      'Something went wrong. Please reach out to the developers',
      'INTERNAL_SERVER_ERROR',
      500
    );
  }
}

export class InvalidInput extends BaseContextualError {
  constructor(invalidFields: string) {
    super(invalidFields, 'INVALID_INPUT_ERROR', 400);
  }
}

export class UserNotFound extends BaseContextualError {
  constructor(userId: string) {
    super(`${userId} is not registered`, 'USER_NOT_FOUND', 404);
  }
}

export class InvalidAccessToken extends BaseContextualError {
  constructor(reason: string) {
    super(reason, 'INVALID_ACCESS_TOKEN', 400);
  }
}

export class InvalidRefreshToken extends BaseContextualError {
  constructor(reason: string) {
    super(reason, 'INVALID_REFRESH_TOKEN', 400);
  }
}

export class InadequatePermissions extends BaseContextualError {
  constructor() {
    super(
      `You don't have the necessary permissions for this`,
      'INADEQUATE_PERMISSIONS',
      403
    );
  }
}

export class IncorrectPassword extends BaseContextualError {
  constructor() {
    super(`Specified password is incorrect`, 'INCORRECT_PASSWORD', 400);
  }
}

export class PlayerNotFound extends BaseContextualError {
  constructor(playerId: string) {
    super(`${playerId} doesn't exist`, 'PLAYER_NOT_FOUND', 404);
  }
}

export class TeamNotFound extends BaseContextualError {
  constructor(teamId: string) {
    super(`${teamId} doesn't exist`, 'TEAM_NOT_FOUND', 404);
  }
}

export class TransferNotFound extends BaseContextualError {
  constructor(transferId: string) {
    super(`${transferId} doesn't exist`, 'TRANSFER_NOT_FOUND', 404);
  }
}

export class PlayerAlreadyContracted extends BaseContextualError {
  constructor(playerId: string) {
    super(
      `Player ${playerId} already belongs to another team`,
      'PLAYER_ALREADY_CONTRACTED',
      400
    );
  }
}

export class MaxTeamsLimitReached extends BaseContextualError {
  constructor(userId: string) {
    super(
      `User ${userId} has reached the maximum allowed number of teams`,
      'MAX_TEAMS_LIMIT_REACHED',
      400
    );
  }
}

export class InadequateBudget extends BaseContextualError {
  constructor(teamId: string) {
    super(
      `Team ${teamId} does not have enough funds`,
      'INADEQUATE_BUDGET',
      400
    );
  }
}

export class PlayerInDifferentTeam extends BaseContextualError {
  constructor(playerId: string) {
    super(
      `Player ${playerId} belongs to a different team`,
      'PLAYER_IN_DIFFERENT_TEAM',
      400
    );
  }
}

export class TransferNotOpen extends BaseContextualError {
  constructor(transferId: string) {
    super(`Transfer ${transferId} is not open`, 'TRANSFER_NOT_OPEN', 400);
  }
}

export class TransferAlreadySettled extends BaseContextualError {
  constructor(transferId: string) {
    super(`Transfer ${transferId} is settled`, 'TRANSFER_ALREADY_SETTLED', 400);
  }
}

export class NothingToUpdate extends BaseContextualError {
  constructor() {
    super(`None of the fields are update-able`, 'NOTHING_TO_UPDATE', 400);
  }
}

export class InvalidTransferRequest extends BaseContextualError {
  constructor(reason: string) {
    super(reason, 'INVALID_TRANSFER_REQUEST', 400);
  }
}
