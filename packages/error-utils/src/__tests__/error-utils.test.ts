// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  AppError, ValidationError, NotFoundError, UnauthorizedError, ForbiddenError,
  isError, isAppError, toError, getErrorMessage, getErrorCode, getStatusCode,
  serializeError, createError, wrapError, isErrorCode,
  combineErrors, collectErrors, assertNoErrors,
  ok, err, mapResult, flatMapResult, unwrap, unwrapOr, fromTryCatch,
} from '../error-utils';

describe('AppError', () => {
  it('test_001: creates AppError with message code-1', () => {
    const e = new AppError('msg1', 'CODE_1', 401);
    expect(e.message).toBe('msg1');
    expect(e.code).toBe('CODE_1');
    expect(e.statusCode).toBe(401);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_002: creates AppError with message code-2', () => {
    const e = new AppError('msg2', 'CODE_2', 402);
    expect(e.message).toBe('msg2');
    expect(e.code).toBe('CODE_2');
    expect(e.statusCode).toBe(402);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_003: creates AppError with message code-3', () => {
    const e = new AppError('msg3', 'CODE_3', 403);
    expect(e.message).toBe('msg3');
    expect(e.code).toBe('CODE_3');
    expect(e.statusCode).toBe(403);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_004: creates AppError with message code-4', () => {
    const e = new AppError('msg4', 'CODE_4', 404);
    expect(e.message).toBe('msg4');
    expect(e.code).toBe('CODE_4');
    expect(e.statusCode).toBe(404);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_005: creates AppError with message code-5', () => {
    const e = new AppError('msg5', 'CODE_5', 405);
    expect(e.message).toBe('msg5');
    expect(e.code).toBe('CODE_5');
    expect(e.statusCode).toBe(405);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_006: creates AppError with message code-6', () => {
    const e = new AppError('msg6', 'CODE_6', 406);
    expect(e.message).toBe('msg6');
    expect(e.code).toBe('CODE_6');
    expect(e.statusCode).toBe(406);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_007: creates AppError with message code-7', () => {
    const e = new AppError('msg7', 'CODE_7', 407);
    expect(e.message).toBe('msg7');
    expect(e.code).toBe('CODE_7');
    expect(e.statusCode).toBe(407);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_008: creates AppError with message code-8', () => {
    const e = new AppError('msg8', 'CODE_8', 408);
    expect(e.message).toBe('msg8');
    expect(e.code).toBe('CODE_8');
    expect(e.statusCode).toBe(408);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_009: creates AppError with message code-9', () => {
    const e = new AppError('msg9', 'CODE_9', 409);
    expect(e.message).toBe('msg9');
    expect(e.code).toBe('CODE_9');
    expect(e.statusCode).toBe(409);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_010: creates AppError with message code-10', () => {
    const e = new AppError('msg10', 'CODE_10', 410);
    expect(e.message).toBe('msg10');
    expect(e.code).toBe('CODE_10');
    expect(e.statusCode).toBe(410);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_011: creates AppError with message code-11', () => {
    const e = new AppError('msg11', 'CODE_11', 411);
    expect(e.message).toBe('msg11');
    expect(e.code).toBe('CODE_11');
    expect(e.statusCode).toBe(411);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_012: creates AppError with message code-12', () => {
    const e = new AppError('msg12', 'CODE_12', 412);
    expect(e.message).toBe('msg12');
    expect(e.code).toBe('CODE_12');
    expect(e.statusCode).toBe(412);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_013: creates AppError with message code-13', () => {
    const e = new AppError('msg13', 'CODE_13', 413);
    expect(e.message).toBe('msg13');
    expect(e.code).toBe('CODE_13');
    expect(e.statusCode).toBe(413);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_014: creates AppError with message code-14', () => {
    const e = new AppError('msg14', 'CODE_14', 414);
    expect(e.message).toBe('msg14');
    expect(e.code).toBe('CODE_14');
    expect(e.statusCode).toBe(414);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_015: creates AppError with message code-15', () => {
    const e = new AppError('msg15', 'CODE_15', 415);
    expect(e.message).toBe('msg15');
    expect(e.code).toBe('CODE_15');
    expect(e.statusCode).toBe(415);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_016: creates AppError with message code-16', () => {
    const e = new AppError('msg16', 'CODE_16', 416);
    expect(e.message).toBe('msg16');
    expect(e.code).toBe('CODE_16');
    expect(e.statusCode).toBe(416);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_017: creates AppError with message code-17', () => {
    const e = new AppError('msg17', 'CODE_17', 417);
    expect(e.message).toBe('msg17');
    expect(e.code).toBe('CODE_17');
    expect(e.statusCode).toBe(417);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_018: creates AppError with message code-18', () => {
    const e = new AppError('msg18', 'CODE_18', 418);
    expect(e.message).toBe('msg18');
    expect(e.code).toBe('CODE_18');
    expect(e.statusCode).toBe(418);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_019: creates AppError with message code-19', () => {
    const e = new AppError('msg19', 'CODE_19', 419);
    expect(e.message).toBe('msg19');
    expect(e.code).toBe('CODE_19');
    expect(e.statusCode).toBe(419);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_020: creates AppError with message code-20', () => {
    const e = new AppError('msg20', 'CODE_20', 420);
    expect(e.message).toBe('msg20');
    expect(e.code).toBe('CODE_20');
    expect(e.statusCode).toBe(420);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_021: creates AppError with message code-21', () => {
    const e = new AppError('msg21', 'CODE_21', 421);
    expect(e.message).toBe('msg21');
    expect(e.code).toBe('CODE_21');
    expect(e.statusCode).toBe(421);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_022: creates AppError with message code-22', () => {
    const e = new AppError('msg22', 'CODE_22', 422);
    expect(e.message).toBe('msg22');
    expect(e.code).toBe('CODE_22');
    expect(e.statusCode).toBe(422);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_023: creates AppError with message code-23', () => {
    const e = new AppError('msg23', 'CODE_23', 423);
    expect(e.message).toBe('msg23');
    expect(e.code).toBe('CODE_23');
    expect(e.statusCode).toBe(423);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_024: creates AppError with message code-24', () => {
    const e = new AppError('msg24', 'CODE_24', 424);
    expect(e.message).toBe('msg24');
    expect(e.code).toBe('CODE_24');
    expect(e.statusCode).toBe(424);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_025: creates AppError with message code-25', () => {
    const e = new AppError('msg25', 'CODE_25', 425);
    expect(e.message).toBe('msg25');
    expect(e.code).toBe('CODE_25');
    expect(e.statusCode).toBe(425);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_026: creates AppError with message code-26', () => {
    const e = new AppError('msg26', 'CODE_26', 426);
    expect(e.message).toBe('msg26');
    expect(e.code).toBe('CODE_26');
    expect(e.statusCode).toBe(426);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_027: creates AppError with message code-27', () => {
    const e = new AppError('msg27', 'CODE_27', 427);
    expect(e.message).toBe('msg27');
    expect(e.code).toBe('CODE_27');
    expect(e.statusCode).toBe(427);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_028: creates AppError with message code-28', () => {
    const e = new AppError('msg28', 'CODE_28', 428);
    expect(e.message).toBe('msg28');
    expect(e.code).toBe('CODE_28');
    expect(e.statusCode).toBe(428);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_029: creates AppError with message code-29', () => {
    const e = new AppError('msg29', 'CODE_29', 429);
    expect(e.message).toBe('msg29');
    expect(e.code).toBe('CODE_29');
    expect(e.statusCode).toBe(429);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_030: creates AppError with message code-30', () => {
    const e = new AppError('msg30', 'CODE_30', 430);
    expect(e.message).toBe('msg30');
    expect(e.code).toBe('CODE_30');
    expect(e.statusCode).toBe(430);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_031: creates AppError with message code-31', () => {
    const e = new AppError('msg31', 'CODE_31', 431);
    expect(e.message).toBe('msg31');
    expect(e.code).toBe('CODE_31');
    expect(e.statusCode).toBe(431);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_032: creates AppError with message code-32', () => {
    const e = new AppError('msg32', 'CODE_32', 432);
    expect(e.message).toBe('msg32');
    expect(e.code).toBe('CODE_32');
    expect(e.statusCode).toBe(432);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_033: creates AppError with message code-33', () => {
    const e = new AppError('msg33', 'CODE_33', 433);
    expect(e.message).toBe('msg33');
    expect(e.code).toBe('CODE_33');
    expect(e.statusCode).toBe(433);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_034: creates AppError with message code-34', () => {
    const e = new AppError('msg34', 'CODE_34', 434);
    expect(e.message).toBe('msg34');
    expect(e.code).toBe('CODE_34');
    expect(e.statusCode).toBe(434);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_035: creates AppError with message code-35', () => {
    const e = new AppError('msg35', 'CODE_35', 435);
    expect(e.message).toBe('msg35');
    expect(e.code).toBe('CODE_35');
    expect(e.statusCode).toBe(435);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_036: creates AppError with message code-36', () => {
    const e = new AppError('msg36', 'CODE_36', 436);
    expect(e.message).toBe('msg36');
    expect(e.code).toBe('CODE_36');
    expect(e.statusCode).toBe(436);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_037: creates AppError with message code-37', () => {
    const e = new AppError('msg37', 'CODE_37', 437);
    expect(e.message).toBe('msg37');
    expect(e.code).toBe('CODE_37');
    expect(e.statusCode).toBe(437);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_038: creates AppError with message code-38', () => {
    const e = new AppError('msg38', 'CODE_38', 438);
    expect(e.message).toBe('msg38');
    expect(e.code).toBe('CODE_38');
    expect(e.statusCode).toBe(438);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_039: creates AppError with message code-39', () => {
    const e = new AppError('msg39', 'CODE_39', 439);
    expect(e.message).toBe('msg39');
    expect(e.code).toBe('CODE_39');
    expect(e.statusCode).toBe(439);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_040: creates AppError with message code-40', () => {
    const e = new AppError('msg40', 'CODE_40', 440);
    expect(e.message).toBe('msg40');
    expect(e.code).toBe('CODE_40');
    expect(e.statusCode).toBe(440);
    expect(e.name).toBe('AppError');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_041: AppError without statusCode', () => {
    const e = new AppError('no status', 'NOSTAT');
    expect(e.statusCode).toBeUndefined();
    expect(e.message).toBe('no status');
  });
  it('test_042: AppError has stack', () => {
    const e = new AppError('stack test', 'STACK', 500);
    expect(e.stack).toBeDefined();
  });
  it('test_043: AppError code is accessible', () => {
    const e = new AppError('x', 'MY_CODE');
    expect(e.code).toBe('MY_CODE');
  });
  it('test_044: AppError is instance of Error', () => {
    expect(new AppError('a', 'B') instanceof Error).toBe(true);
  });
  it('test_045: AppError statusCode 0 is stored', () => {
    const e = new AppError('z', 'Z', 0);
    expect(e.statusCode).toBe(0);
  });
  it('test_046: AppError name is AppError', () => {
    const e = new AppError('n', 'N');
    expect(e.name).toBe('AppError');
  });
  it('test_047: AppError empty message', () => {
    const e = new AppError('', 'EMPTY');
    expect(e.message).toBe('');
  });
  it('test_048: AppError large statusCode', () => {
    const e = new AppError('big', 'BIG', 9999);
    expect(e.statusCode).toBe(9999);
  });
  it('test_049: AppError code with numbers', () => {
    const e = new AppError('m', 'CODE_123');
    expect(e.code).toBe('CODE_123');
  });
  it('test_050: AppError toString includes message', () => {
    const e = new AppError('visible', 'V');
    expect(String(e)).toContain('visible');
  });
});

describe('ValidationError', () => {
  it('test_001: ValidationError field-1', () => {
    const e = new ValidationError('bad field 1', 'field1');
    expect(e.message).toBe('bad field 1');
    expect(e.field).toBe('field1');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_002: ValidationError field-2', () => {
    const e = new ValidationError('bad field 2', 'field2');
    expect(e.message).toBe('bad field 2');
    expect(e.field).toBe('field2');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_003: ValidationError field-3', () => {
    const e = new ValidationError('bad field 3', 'field3');
    expect(e.message).toBe('bad field 3');
    expect(e.field).toBe('field3');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_004: ValidationError field-4', () => {
    const e = new ValidationError('bad field 4', 'field4');
    expect(e.message).toBe('bad field 4');
    expect(e.field).toBe('field4');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_005: ValidationError field-5', () => {
    const e = new ValidationError('bad field 5', 'field5');
    expect(e.message).toBe('bad field 5');
    expect(e.field).toBe('field5');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_006: ValidationError field-6', () => {
    const e = new ValidationError('bad field 6', 'field6');
    expect(e.message).toBe('bad field 6');
    expect(e.field).toBe('field6');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_007: ValidationError field-7', () => {
    const e = new ValidationError('bad field 7', 'field7');
    expect(e.message).toBe('bad field 7');
    expect(e.field).toBe('field7');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_008: ValidationError field-8', () => {
    const e = new ValidationError('bad field 8', 'field8');
    expect(e.message).toBe('bad field 8');
    expect(e.field).toBe('field8');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_009: ValidationError field-9', () => {
    const e = new ValidationError('bad field 9', 'field9');
    expect(e.message).toBe('bad field 9');
    expect(e.field).toBe('field9');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_010: ValidationError field-10', () => {
    const e = new ValidationError('bad field 10', 'field10');
    expect(e.message).toBe('bad field 10');
    expect(e.field).toBe('field10');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_011: ValidationError field-11', () => {
    const e = new ValidationError('bad field 11', 'field11');
    expect(e.message).toBe('bad field 11');
    expect(e.field).toBe('field11');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_012: ValidationError field-12', () => {
    const e = new ValidationError('bad field 12', 'field12');
    expect(e.message).toBe('bad field 12');
    expect(e.field).toBe('field12');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_013: ValidationError field-13', () => {
    const e = new ValidationError('bad field 13', 'field13');
    expect(e.message).toBe('bad field 13');
    expect(e.field).toBe('field13');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_014: ValidationError field-14', () => {
    const e = new ValidationError('bad field 14', 'field14');
    expect(e.message).toBe('bad field 14');
    expect(e.field).toBe('field14');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_015: ValidationError field-15', () => {
    const e = new ValidationError('bad field 15', 'field15');
    expect(e.message).toBe('bad field 15');
    expect(e.field).toBe('field15');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_016: ValidationError field-16', () => {
    const e = new ValidationError('bad field 16', 'field16');
    expect(e.message).toBe('bad field 16');
    expect(e.field).toBe('field16');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_017: ValidationError field-17', () => {
    const e = new ValidationError('bad field 17', 'field17');
    expect(e.message).toBe('bad field 17');
    expect(e.field).toBe('field17');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_018: ValidationError field-18', () => {
    const e = new ValidationError('bad field 18', 'field18');
    expect(e.message).toBe('bad field 18');
    expect(e.field).toBe('field18');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_019: ValidationError field-19', () => {
    const e = new ValidationError('bad field 19', 'field19');
    expect(e.message).toBe('bad field 19');
    expect(e.field).toBe('field19');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_020: ValidationError field-20', () => {
    const e = new ValidationError('bad field 20', 'field20');
    expect(e.message).toBe('bad field 20');
    expect(e.field).toBe('field20');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_021: ValidationError field-21', () => {
    const e = new ValidationError('bad field 21', 'field21');
    expect(e.message).toBe('bad field 21');
    expect(e.field).toBe('field21');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_022: ValidationError field-22', () => {
    const e = new ValidationError('bad field 22', 'field22');
    expect(e.message).toBe('bad field 22');
    expect(e.field).toBe('field22');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_023: ValidationError field-23', () => {
    const e = new ValidationError('bad field 23', 'field23');
    expect(e.message).toBe('bad field 23');
    expect(e.field).toBe('field23');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_024: ValidationError field-24', () => {
    const e = new ValidationError('bad field 24', 'field24');
    expect(e.message).toBe('bad field 24');
    expect(e.field).toBe('field24');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_025: ValidationError field-25', () => {
    const e = new ValidationError('bad field 25', 'field25');
    expect(e.message).toBe('bad field 25');
    expect(e.field).toBe('field25');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_026: ValidationError field-26', () => {
    const e = new ValidationError('bad field 26', 'field26');
    expect(e.message).toBe('bad field 26');
    expect(e.field).toBe('field26');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_027: ValidationError field-27', () => {
    const e = new ValidationError('bad field 27', 'field27');
    expect(e.message).toBe('bad field 27');
    expect(e.field).toBe('field27');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_028: ValidationError field-28', () => {
    const e = new ValidationError('bad field 28', 'field28');
    expect(e.message).toBe('bad field 28');
    expect(e.field).toBe('field28');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_029: ValidationError field-29', () => {
    const e = new ValidationError('bad field 29', 'field29');
    expect(e.message).toBe('bad field 29');
    expect(e.field).toBe('field29');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_030: ValidationError field-30', () => {
    const e = new ValidationError('bad field 30', 'field30');
    expect(e.message).toBe('bad field 30');
    expect(e.field).toBe('field30');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_031: ValidationError field-31', () => {
    const e = new ValidationError('bad field 31', 'field31');
    expect(e.message).toBe('bad field 31');
    expect(e.field).toBe('field31');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_032: ValidationError field-32', () => {
    const e = new ValidationError('bad field 32', 'field32');
    expect(e.message).toBe('bad field 32');
    expect(e.field).toBe('field32');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_033: ValidationError field-33', () => {
    const e = new ValidationError('bad field 33', 'field33');
    expect(e.message).toBe('bad field 33');
    expect(e.field).toBe('field33');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_034: ValidationError field-34', () => {
    const e = new ValidationError('bad field 34', 'field34');
    expect(e.message).toBe('bad field 34');
    expect(e.field).toBe('field34');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_035: ValidationError field-35', () => {
    const e = new ValidationError('bad field 35', 'field35');
    expect(e.message).toBe('bad field 35');
    expect(e.field).toBe('field35');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_036: ValidationError field-36', () => {
    const e = new ValidationError('bad field 36', 'field36');
    expect(e.message).toBe('bad field 36');
    expect(e.field).toBe('field36');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_037: ValidationError field-37', () => {
    const e = new ValidationError('bad field 37', 'field37');
    expect(e.message).toBe('bad field 37');
    expect(e.field).toBe('field37');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_038: ValidationError field-38', () => {
    const e = new ValidationError('bad field 38', 'field38');
    expect(e.message).toBe('bad field 38');
    expect(e.field).toBe('field38');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_039: ValidationError field-39', () => {
    const e = new ValidationError('bad field 39', 'field39');
    expect(e.message).toBe('bad field 39');
    expect(e.field).toBe('field39');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_040: ValidationError field-40', () => {
    const e = new ValidationError('bad field 40', 'field40');
    expect(e.message).toBe('bad field 40');
    expect(e.field).toBe('field40');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('ValidationError');
    expect(e instanceof ValidationError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_041: ValidationError without field', () => {
    const e = new ValidationError('no field');
    expect(e.field).toBeUndefined();
    expect(e.statusCode).toBe(400);
  });
  it('test_042: ValidationError code is VALIDATION_ERROR', () => {
    expect(new ValidationError('x').code).toBe('VALIDATION_ERROR');
  });
  it('test_043: ValidationError statusCode is 400', () => {
    expect(new ValidationError('y').statusCode).toBe(400);
  });
  it('test_044: ValidationError name', () => {
    expect(new ValidationError('z').name).toBe('ValidationError');
  });
  it('test_045: ValidationError instanceof Error', () => {
    expect(new ValidationError('e') instanceof Error).toBe(true);
  });
  it('test_046: ValidationError has stack', () => {
    expect(new ValidationError('s').stack).toBeDefined();
  });
  it('test_047: ValidationError empty field string', () => {
    const e = new ValidationError('msg', '');
    expect(e.field).toBe('');
  });
  it('test_048: ValidationError message empty', () => {
    const e = new ValidationError('');
    expect(e.message).toBe('');
  });
  it('test_049: ValidationError field with special chars', () => {
    const e = new ValidationError('bad', 'user.email');
    expect(e.field).toBe('user.email');
  });
  it('test_050: ValidationError instanceof AppError and Error', () => {
    const e = new ValidationError('both');
    expect(e instanceof AppError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });
});

describe('NotFoundError', () => {
  it('test_001: NotFoundError resource-1', () => {
    const e = new NotFoundError('Resource1');
    expect(e.message).toBe('Resource1 not found');
    expect(e.code).toBe('NOT_FOUND');
    expect(e.statusCode).toBe(404);
    expect(e.name).toBe('NotFoundError');
    expect(e instanceof NotFoundError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_002: NotFoundError resource-2', () => {
    const e = new NotFoundError('Resource2');
    expect(e.message).toBe('Resource2 not found');
    expect(e.code).toBe('NOT_FOUND');
    expect(e.statusCode).toBe(404);
    expect(e.name).toBe('NotFoundError');
    expect(e instanceof NotFoundError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_003: NotFoundError resource-3', () => {
    const e = new NotFoundError('Resource3');
    expect(e.message).toBe('Resource3 not found');
    expect(e.code).toBe('NOT_FOUND');
    expect(e.statusCode).toBe(404);
    expect(e.name).toBe('NotFoundError');
    expect(e instanceof NotFoundError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_004: NotFoundError resource-4', () => {
    const e = new NotFoundError('Resource4');
    expect(e.message).toBe('Resource4 not found');
    expect(e.code).toBe('NOT_FOUND');
    expect(e.statusCode).toBe(404);
    expect(e.name).toBe('NotFoundError');
    expect(e instanceof NotFoundError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_005: NotFoundError resource-5', () => {
    const e = new NotFoundError('Resource5');
    expect(e.message).toBe('Resource5 not found');
    expect(e.code).toBe('NOT_FOUND');
    expect(e.statusCode).toBe(404);
    expect(e.name).toBe('NotFoundError');
    expect(e instanceof NotFoundError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_006: NotFoundError resource-6', () => {
    const e = new NotFoundError('Resource6');
    expect(e.message).toBe('Resource6 not found');
    expect(e.code).toBe('NOT_FOUND');
    expect(e.statusCode).toBe(404);
    expect(e.name).toBe('NotFoundError');
    expect(e instanceof NotFoundError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_007: NotFoundError resource-7', () => {
    const e = new NotFoundError('Resource7');
    expect(e.message).toBe('Resource7 not found');
    expect(e.code).toBe('NOT_FOUND');
    expect(e.statusCode).toBe(404);
    expect(e.name).toBe('NotFoundError');
    expect(e instanceof NotFoundError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_008: NotFoundError resource-8', () => {
    const e = new NotFoundError('Resource8');
    expect(e.message).toBe('Resource8 not found');
    expect(e.code).toBe('NOT_FOUND');
    expect(e.statusCode).toBe(404);
    expect(e.name).toBe('NotFoundError');
    expect(e instanceof NotFoundError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_009: NotFoundError resource-9', () => {
    const e = new NotFoundError('Resource9');
    expect(e.message).toBe('Resource9 not found');
    expect(e.code).toBe('NOT_FOUND');
    expect(e.statusCode).toBe(404);
    expect(e.name).toBe('NotFoundError');
    expect(e instanceof NotFoundError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_010: NotFoundError resource-10', () => {
    const e = new NotFoundError('Resource10');
    expect(e.message).toBe('Resource10 not found');
    expect(e.code).toBe('NOT_FOUND');
    expect(e.statusCode).toBe(404);
    expect(e.name).toBe('NotFoundError');
    expect(e instanceof NotFoundError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_011: NotFoundError resource-11', () => {
    const e = new NotFoundError('Resource11');
    expect(e.message).toBe('Resource11 not found');
    expect(e.code).toBe('NOT_FOUND');
    expect(e.statusCode).toBe(404);
    expect(e.name).toBe('NotFoundError');
    expect(e instanceof NotFoundError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_012: NotFoundError resource-12', () => {
    const e = new NotFoundError('Resource12');
    expect(e.message).toBe('Resource12 not found');
    expect(e.code).toBe('NOT_FOUND');
    expect(e.statusCode).toBe(404);
    expect(e.name).toBe('NotFoundError');
    expect(e instanceof NotFoundError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_013: NotFoundError resource-13', () => {
    const e = new NotFoundError('Resource13');
    expect(e.message).toBe('Resource13 not found');
    expect(e.code).toBe('NOT_FOUND');
    expect(e.statusCode).toBe(404);
    expect(e.name).toBe('NotFoundError');
    expect(e instanceof NotFoundError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_014: NotFoundError resource-14', () => {
    const e = new NotFoundError('Resource14');
    expect(e.message).toBe('Resource14 not found');
    expect(e.code).toBe('NOT_FOUND');
    expect(e.statusCode).toBe(404);
    expect(e.name).toBe('NotFoundError');
    expect(e instanceof NotFoundError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_015: NotFoundError resource-15', () => {
    const e = new NotFoundError('Resource15');
    expect(e.message).toBe('Resource15 not found');
    expect(e.code).toBe('NOT_FOUND');
    expect(e.statusCode).toBe(404);
    expect(e.name).toBe('NotFoundError');
    expect(e instanceof NotFoundError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_016: NotFoundError resource-16', () => {
    const e = new NotFoundError('Resource16');
    expect(e.message).toBe('Resource16 not found');
    expect(e.code).toBe('NOT_FOUND');
    expect(e.statusCode).toBe(404);
    expect(e.name).toBe('NotFoundError');
    expect(e instanceof NotFoundError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_017: NotFoundError resource-17', () => {
    const e = new NotFoundError('Resource17');
    expect(e.message).toBe('Resource17 not found');
    expect(e.code).toBe('NOT_FOUND');
    expect(e.statusCode).toBe(404);
    expect(e.name).toBe('NotFoundError');
    expect(e instanceof NotFoundError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_018: NotFoundError resource-18', () => {
    const e = new NotFoundError('Resource18');
    expect(e.message).toBe('Resource18 not found');
    expect(e.code).toBe('NOT_FOUND');
    expect(e.statusCode).toBe(404);
    expect(e.name).toBe('NotFoundError');
    expect(e instanceof NotFoundError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_019: NotFoundError resource-19', () => {
    const e = new NotFoundError('Resource19');
    expect(e.message).toBe('Resource19 not found');
    expect(e.code).toBe('NOT_FOUND');
    expect(e.statusCode).toBe(404);
    expect(e.name).toBe('NotFoundError');
    expect(e instanceof NotFoundError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_020: NotFoundError resource-20', () => {
    const e = new NotFoundError('Resource20');
    expect(e.message).toBe('Resource20 not found');
    expect(e.code).toBe('NOT_FOUND');
    expect(e.statusCode).toBe(404);
    expect(e.name).toBe('NotFoundError');
    expect(e instanceof NotFoundError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_021: NotFoundError resource-21', () => {
    const e = new NotFoundError('Resource21');
    expect(e.message).toBe('Resource21 not found');
    expect(e.code).toBe('NOT_FOUND');
    expect(e.statusCode).toBe(404);
    expect(e.name).toBe('NotFoundError');
    expect(e instanceof NotFoundError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_022: NotFoundError resource-22', () => {
    const e = new NotFoundError('Resource22');
    expect(e.message).toBe('Resource22 not found');
    expect(e.code).toBe('NOT_FOUND');
    expect(e.statusCode).toBe(404);
    expect(e.name).toBe('NotFoundError');
    expect(e instanceof NotFoundError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_023: NotFoundError resource-23', () => {
    const e = new NotFoundError('Resource23');
    expect(e.message).toBe('Resource23 not found');
    expect(e.code).toBe('NOT_FOUND');
    expect(e.statusCode).toBe(404);
    expect(e.name).toBe('NotFoundError');
    expect(e instanceof NotFoundError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_024: NotFoundError resource-24', () => {
    const e = new NotFoundError('Resource24');
    expect(e.message).toBe('Resource24 not found');
    expect(e.code).toBe('NOT_FOUND');
    expect(e.statusCode).toBe(404);
    expect(e.name).toBe('NotFoundError');
    expect(e instanceof NotFoundError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_025: NotFoundError resource-25', () => {
    const e = new NotFoundError('Resource25');
    expect(e.message).toBe('Resource25 not found');
    expect(e.code).toBe('NOT_FOUND');
    expect(e.statusCode).toBe(404);
    expect(e.name).toBe('NotFoundError');
    expect(e instanceof NotFoundError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_026: NotFoundError resource-26', () => {
    const e = new NotFoundError('Resource26');
    expect(e.message).toBe('Resource26 not found');
    expect(e.code).toBe('NOT_FOUND');
    expect(e.statusCode).toBe(404);
    expect(e.name).toBe('NotFoundError');
    expect(e instanceof NotFoundError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_027: NotFoundError resource-27', () => {
    const e = new NotFoundError('Resource27');
    expect(e.message).toBe('Resource27 not found');
    expect(e.code).toBe('NOT_FOUND');
    expect(e.statusCode).toBe(404);
    expect(e.name).toBe('NotFoundError');
    expect(e instanceof NotFoundError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_028: NotFoundError resource-28', () => {
    const e = new NotFoundError('Resource28');
    expect(e.message).toBe('Resource28 not found');
    expect(e.code).toBe('NOT_FOUND');
    expect(e.statusCode).toBe(404);
    expect(e.name).toBe('NotFoundError');
    expect(e instanceof NotFoundError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_029: NotFoundError resource-29', () => {
    const e = new NotFoundError('Resource29');
    expect(e.message).toBe('Resource29 not found');
    expect(e.code).toBe('NOT_FOUND');
    expect(e.statusCode).toBe(404);
    expect(e.name).toBe('NotFoundError');
    expect(e instanceof NotFoundError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_030: NotFoundError resource-30', () => {
    const e = new NotFoundError('Resource30');
    expect(e.message).toBe('Resource30 not found');
    expect(e.code).toBe('NOT_FOUND');
    expect(e.statusCode).toBe(404);
    expect(e.name).toBe('NotFoundError');
    expect(e instanceof NotFoundError).toBe(true);
    expect(e instanceof AppError).toBe(true);
  });
  it('test_031: NotFoundError empty resource', () => {
    const e = new NotFoundError('');
    expect(e.message).toBe(' not found');
  });
  it('test_032: NotFoundError instanceof Error', () => {
    expect(new NotFoundError('X') instanceof Error).toBe(true);
  });
  it('test_033: NotFoundError has stack', () => {
    expect(new NotFoundError('X').stack).toBeDefined();
  });
  it('test_034: NotFoundError statusCode is 404', () => {
    expect(new NotFoundError('Y').statusCode).toBe(404);
  });
  it('test_035: NotFoundError code is NOT_FOUND', () => {
    expect(new NotFoundError('Z').code).toBe('NOT_FOUND');
  });
  it('test_036: NotFoundError name is NotFoundError', () => {
    expect(new NotFoundError('W').name).toBe('NotFoundError');
  });
  it('test_037: NotFoundError message includes resource', () => {
    const e = new NotFoundError('Invoice');
    expect(e.message).toContain('Invoice');
  });
  it('test_038: NotFoundError message ends with not found', () => {
    const e = new NotFoundError('Task');
    expect(e.message).toContain('not found');
  });
  it('test_039: NotFoundError with long resource name', () => {
    const resource = 'A'.repeat(100);
    const e = new NotFoundError(resource);
    expect(e.message).toBe(resource + ' not found');
  });
  it('test_040: NotFoundError multiple instances are independent', () => {
    const e1 = new NotFoundError('A');
    const e2 = new NotFoundError('B');
    expect(e1.message).not.toBe(e2.message);
  });
});

describe('UnauthorizedError', () => {
  it('test_001: UnauthorizedError with message-1', () => {
    const e = new UnauthorizedError('No access 1');
    expect(e.message).toBe('No access 1');
    expect(e.code).toBe('UNAUTHORIZED');
    expect(e.statusCode).toBe(401);
    expect(e.name).toBe('UnauthorizedError');
    expect(e instanceof UnauthorizedError).toBe(true);
  });
  it('test_002: UnauthorizedError with message-2', () => {
    const e = new UnauthorizedError('No access 2');
    expect(e.message).toBe('No access 2');
    expect(e.code).toBe('UNAUTHORIZED');
    expect(e.statusCode).toBe(401);
    expect(e.name).toBe('UnauthorizedError');
    expect(e instanceof UnauthorizedError).toBe(true);
  });
  it('test_003: UnauthorizedError with message-3', () => {
    const e = new UnauthorizedError('No access 3');
    expect(e.message).toBe('No access 3');
    expect(e.code).toBe('UNAUTHORIZED');
    expect(e.statusCode).toBe(401);
    expect(e.name).toBe('UnauthorizedError');
    expect(e instanceof UnauthorizedError).toBe(true);
  });
  it('test_004: UnauthorizedError with message-4', () => {
    const e = new UnauthorizedError('No access 4');
    expect(e.message).toBe('No access 4');
    expect(e.code).toBe('UNAUTHORIZED');
    expect(e.statusCode).toBe(401);
    expect(e.name).toBe('UnauthorizedError');
    expect(e instanceof UnauthorizedError).toBe(true);
  });
  it('test_005: UnauthorizedError with message-5', () => {
    const e = new UnauthorizedError('No access 5');
    expect(e.message).toBe('No access 5');
    expect(e.code).toBe('UNAUTHORIZED');
    expect(e.statusCode).toBe(401);
    expect(e.name).toBe('UnauthorizedError');
    expect(e instanceof UnauthorizedError).toBe(true);
  });
  it('test_006: UnauthorizedError with message-6', () => {
    const e = new UnauthorizedError('No access 6');
    expect(e.message).toBe('No access 6');
    expect(e.code).toBe('UNAUTHORIZED');
    expect(e.statusCode).toBe(401);
    expect(e.name).toBe('UnauthorizedError');
    expect(e instanceof UnauthorizedError).toBe(true);
  });
  it('test_007: UnauthorizedError with message-7', () => {
    const e = new UnauthorizedError('No access 7');
    expect(e.message).toBe('No access 7');
    expect(e.code).toBe('UNAUTHORIZED');
    expect(e.statusCode).toBe(401);
    expect(e.name).toBe('UnauthorizedError');
    expect(e instanceof UnauthorizedError).toBe(true);
  });
  it('test_008: UnauthorizedError with message-8', () => {
    const e = new UnauthorizedError('No access 8');
    expect(e.message).toBe('No access 8');
    expect(e.code).toBe('UNAUTHORIZED');
    expect(e.statusCode).toBe(401);
    expect(e.name).toBe('UnauthorizedError');
    expect(e instanceof UnauthorizedError).toBe(true);
  });
  it('test_009: UnauthorizedError with message-9', () => {
    const e = new UnauthorizedError('No access 9');
    expect(e.message).toBe('No access 9');
    expect(e.code).toBe('UNAUTHORIZED');
    expect(e.statusCode).toBe(401);
    expect(e.name).toBe('UnauthorizedError');
    expect(e instanceof UnauthorizedError).toBe(true);
  });
  it('test_010: UnauthorizedError with message-10', () => {
    const e = new UnauthorizedError('No access 10');
    expect(e.message).toBe('No access 10');
    expect(e.code).toBe('UNAUTHORIZED');
    expect(e.statusCode).toBe(401);
    expect(e.name).toBe('UnauthorizedError');
    expect(e instanceof UnauthorizedError).toBe(true);
  });
  it('test_011: UnauthorizedError with message-11', () => {
    const e = new UnauthorizedError('No access 11');
    expect(e.message).toBe('No access 11');
    expect(e.code).toBe('UNAUTHORIZED');
    expect(e.statusCode).toBe(401);
    expect(e.name).toBe('UnauthorizedError');
    expect(e instanceof UnauthorizedError).toBe(true);
  });
  it('test_012: UnauthorizedError with message-12', () => {
    const e = new UnauthorizedError('No access 12');
    expect(e.message).toBe('No access 12');
    expect(e.code).toBe('UNAUTHORIZED');
    expect(e.statusCode).toBe(401);
    expect(e.name).toBe('UnauthorizedError');
    expect(e instanceof UnauthorizedError).toBe(true);
  });
  it('test_013: UnauthorizedError with message-13', () => {
    const e = new UnauthorizedError('No access 13');
    expect(e.message).toBe('No access 13');
    expect(e.code).toBe('UNAUTHORIZED');
    expect(e.statusCode).toBe(401);
    expect(e.name).toBe('UnauthorizedError');
    expect(e instanceof UnauthorizedError).toBe(true);
  });
  it('test_014: UnauthorizedError with message-14', () => {
    const e = new UnauthorizedError('No access 14');
    expect(e.message).toBe('No access 14');
    expect(e.code).toBe('UNAUTHORIZED');
    expect(e.statusCode).toBe(401);
    expect(e.name).toBe('UnauthorizedError');
    expect(e instanceof UnauthorizedError).toBe(true);
  });
  it('test_015: UnauthorizedError with message-15', () => {
    const e = new UnauthorizedError('No access 15');
    expect(e.message).toBe('No access 15');
    expect(e.code).toBe('UNAUTHORIZED');
    expect(e.statusCode).toBe(401);
    expect(e.name).toBe('UnauthorizedError');
    expect(e instanceof UnauthorizedError).toBe(true);
  });
  it('test_016: UnauthorizedError with message-16', () => {
    const e = new UnauthorizedError('No access 16');
    expect(e.message).toBe('No access 16');
    expect(e.code).toBe('UNAUTHORIZED');
    expect(e.statusCode).toBe(401);
    expect(e.name).toBe('UnauthorizedError');
    expect(e instanceof UnauthorizedError).toBe(true);
  });
  it('test_017: UnauthorizedError with message-17', () => {
    const e = new UnauthorizedError('No access 17');
    expect(e.message).toBe('No access 17');
    expect(e.code).toBe('UNAUTHORIZED');
    expect(e.statusCode).toBe(401);
    expect(e.name).toBe('UnauthorizedError');
    expect(e instanceof UnauthorizedError).toBe(true);
  });
  it('test_018: UnauthorizedError with message-18', () => {
    const e = new UnauthorizedError('No access 18');
    expect(e.message).toBe('No access 18');
    expect(e.code).toBe('UNAUTHORIZED');
    expect(e.statusCode).toBe(401);
    expect(e.name).toBe('UnauthorizedError');
    expect(e instanceof UnauthorizedError).toBe(true);
  });
  it('test_019: UnauthorizedError with message-19', () => {
    const e = new UnauthorizedError('No access 19');
    expect(e.message).toBe('No access 19');
    expect(e.code).toBe('UNAUTHORIZED');
    expect(e.statusCode).toBe(401);
    expect(e.name).toBe('UnauthorizedError');
    expect(e instanceof UnauthorizedError).toBe(true);
  });
  it('test_020: UnauthorizedError with message-20', () => {
    const e = new UnauthorizedError('No access 20');
    expect(e.message).toBe('No access 20');
    expect(e.code).toBe('UNAUTHORIZED');
    expect(e.statusCode).toBe(401);
    expect(e.name).toBe('UnauthorizedError');
    expect(e instanceof UnauthorizedError).toBe(true);
  });
  it('test_021: UnauthorizedError default message', () => {
    const e = new UnauthorizedError();
    expect(e.message).toBe('Unauthorized');
  });
  it('test_022: UnauthorizedError undefined message', () => {
    const e = new UnauthorizedError(undefined);
    expect(e.message).toBe('Unauthorized');
  });
  it('test_023: UnauthorizedError instanceof AppError', () => {
    expect(new UnauthorizedError() instanceof AppError).toBe(true);
  });
  it('test_024: UnauthorizedError instanceof Error', () => {
    expect(new UnauthorizedError() instanceof Error).toBe(true);
  });
  it('test_025: UnauthorizedError statusCode is 401', () => {
    expect(new UnauthorizedError().statusCode).toBe(401);
  });
  it('test_026: UnauthorizedError code is UNAUTHORIZED', () => {
    expect(new UnauthorizedError().code).toBe('UNAUTHORIZED');
  });
  it('test_027: UnauthorizedError has stack', () => {
    expect(new UnauthorizedError().stack).toBeDefined();
  });
  it('test_028: UnauthorizedError name is UnauthorizedError', () => {
    expect(new UnauthorizedError().name).toBe('UnauthorizedError');
  });
  it('test_029: UnauthorizedError custom message stored', () => {
    const e = new UnauthorizedError('Token expired');
    expect(e.message).toBe('Token expired');
  });
  it('test_030: UnauthorizedError empty string message', () => {
    const e = new UnauthorizedError('');
    expect(e.message).toBe('');
  });
});

describe('ForbiddenError', () => {
  it('test_001: ForbiddenError with message-1', () => {
    const e = new ForbiddenError('Denied 1');
    expect(e.message).toBe('Denied 1');
    expect(e.code).toBe('FORBIDDEN');
    expect(e.statusCode).toBe(403);
    expect(e.name).toBe('ForbiddenError');
    expect(e instanceof ForbiddenError).toBe(true);
  });
  it('test_002: ForbiddenError with message-2', () => {
    const e = new ForbiddenError('Denied 2');
    expect(e.message).toBe('Denied 2');
    expect(e.code).toBe('FORBIDDEN');
    expect(e.statusCode).toBe(403);
    expect(e.name).toBe('ForbiddenError');
    expect(e instanceof ForbiddenError).toBe(true);
  });
  it('test_003: ForbiddenError with message-3', () => {
    const e = new ForbiddenError('Denied 3');
    expect(e.message).toBe('Denied 3');
    expect(e.code).toBe('FORBIDDEN');
    expect(e.statusCode).toBe(403);
    expect(e.name).toBe('ForbiddenError');
    expect(e instanceof ForbiddenError).toBe(true);
  });
  it('test_004: ForbiddenError with message-4', () => {
    const e = new ForbiddenError('Denied 4');
    expect(e.message).toBe('Denied 4');
    expect(e.code).toBe('FORBIDDEN');
    expect(e.statusCode).toBe(403);
    expect(e.name).toBe('ForbiddenError');
    expect(e instanceof ForbiddenError).toBe(true);
  });
  it('test_005: ForbiddenError with message-5', () => {
    const e = new ForbiddenError('Denied 5');
    expect(e.message).toBe('Denied 5');
    expect(e.code).toBe('FORBIDDEN');
    expect(e.statusCode).toBe(403);
    expect(e.name).toBe('ForbiddenError');
    expect(e instanceof ForbiddenError).toBe(true);
  });
  it('test_006: ForbiddenError with message-6', () => {
    const e = new ForbiddenError('Denied 6');
    expect(e.message).toBe('Denied 6');
    expect(e.code).toBe('FORBIDDEN');
    expect(e.statusCode).toBe(403);
    expect(e.name).toBe('ForbiddenError');
    expect(e instanceof ForbiddenError).toBe(true);
  });
  it('test_007: ForbiddenError with message-7', () => {
    const e = new ForbiddenError('Denied 7');
    expect(e.message).toBe('Denied 7');
    expect(e.code).toBe('FORBIDDEN');
    expect(e.statusCode).toBe(403);
    expect(e.name).toBe('ForbiddenError');
    expect(e instanceof ForbiddenError).toBe(true);
  });
  it('test_008: ForbiddenError with message-8', () => {
    const e = new ForbiddenError('Denied 8');
    expect(e.message).toBe('Denied 8');
    expect(e.code).toBe('FORBIDDEN');
    expect(e.statusCode).toBe(403);
    expect(e.name).toBe('ForbiddenError');
    expect(e instanceof ForbiddenError).toBe(true);
  });
  it('test_009: ForbiddenError with message-9', () => {
    const e = new ForbiddenError('Denied 9');
    expect(e.message).toBe('Denied 9');
    expect(e.code).toBe('FORBIDDEN');
    expect(e.statusCode).toBe(403);
    expect(e.name).toBe('ForbiddenError');
    expect(e instanceof ForbiddenError).toBe(true);
  });
  it('test_010: ForbiddenError with message-10', () => {
    const e = new ForbiddenError('Denied 10');
    expect(e.message).toBe('Denied 10');
    expect(e.code).toBe('FORBIDDEN');
    expect(e.statusCode).toBe(403);
    expect(e.name).toBe('ForbiddenError');
    expect(e instanceof ForbiddenError).toBe(true);
  });
  it('test_011: ForbiddenError with message-11', () => {
    const e = new ForbiddenError('Denied 11');
    expect(e.message).toBe('Denied 11');
    expect(e.code).toBe('FORBIDDEN');
    expect(e.statusCode).toBe(403);
    expect(e.name).toBe('ForbiddenError');
    expect(e instanceof ForbiddenError).toBe(true);
  });
  it('test_012: ForbiddenError with message-12', () => {
    const e = new ForbiddenError('Denied 12');
    expect(e.message).toBe('Denied 12');
    expect(e.code).toBe('FORBIDDEN');
    expect(e.statusCode).toBe(403);
    expect(e.name).toBe('ForbiddenError');
    expect(e instanceof ForbiddenError).toBe(true);
  });
  it('test_013: ForbiddenError with message-13', () => {
    const e = new ForbiddenError('Denied 13');
    expect(e.message).toBe('Denied 13');
    expect(e.code).toBe('FORBIDDEN');
    expect(e.statusCode).toBe(403);
    expect(e.name).toBe('ForbiddenError');
    expect(e instanceof ForbiddenError).toBe(true);
  });
  it('test_014: ForbiddenError with message-14', () => {
    const e = new ForbiddenError('Denied 14');
    expect(e.message).toBe('Denied 14');
    expect(e.code).toBe('FORBIDDEN');
    expect(e.statusCode).toBe(403);
    expect(e.name).toBe('ForbiddenError');
    expect(e instanceof ForbiddenError).toBe(true);
  });
  it('test_015: ForbiddenError with message-15', () => {
    const e = new ForbiddenError('Denied 15');
    expect(e.message).toBe('Denied 15');
    expect(e.code).toBe('FORBIDDEN');
    expect(e.statusCode).toBe(403);
    expect(e.name).toBe('ForbiddenError');
    expect(e instanceof ForbiddenError).toBe(true);
  });
  it('test_016: ForbiddenError with message-16', () => {
    const e = new ForbiddenError('Denied 16');
    expect(e.message).toBe('Denied 16');
    expect(e.code).toBe('FORBIDDEN');
    expect(e.statusCode).toBe(403);
    expect(e.name).toBe('ForbiddenError');
    expect(e instanceof ForbiddenError).toBe(true);
  });
  it('test_017: ForbiddenError with message-17', () => {
    const e = new ForbiddenError('Denied 17');
    expect(e.message).toBe('Denied 17');
    expect(e.code).toBe('FORBIDDEN');
    expect(e.statusCode).toBe(403);
    expect(e.name).toBe('ForbiddenError');
    expect(e instanceof ForbiddenError).toBe(true);
  });
  it('test_018: ForbiddenError with message-18', () => {
    const e = new ForbiddenError('Denied 18');
    expect(e.message).toBe('Denied 18');
    expect(e.code).toBe('FORBIDDEN');
    expect(e.statusCode).toBe(403);
    expect(e.name).toBe('ForbiddenError');
    expect(e instanceof ForbiddenError).toBe(true);
  });
  it('test_019: ForbiddenError with message-19', () => {
    const e = new ForbiddenError('Denied 19');
    expect(e.message).toBe('Denied 19');
    expect(e.code).toBe('FORBIDDEN');
    expect(e.statusCode).toBe(403);
    expect(e.name).toBe('ForbiddenError');
    expect(e instanceof ForbiddenError).toBe(true);
  });
  it('test_020: ForbiddenError with message-20', () => {
    const e = new ForbiddenError('Denied 20');
    expect(e.message).toBe('Denied 20');
    expect(e.code).toBe('FORBIDDEN');
    expect(e.statusCode).toBe(403);
    expect(e.name).toBe('ForbiddenError');
    expect(e instanceof ForbiddenError).toBe(true);
  });
  it('test_021: ForbiddenError default message', () => {
    const e = new ForbiddenError();
    expect(e.message).toBe('Forbidden');
  });
  it('test_022: ForbiddenError undefined message', () => {
    const e = new ForbiddenError(undefined);
    expect(e.message).toBe('Forbidden');
  });
  it('test_023: ForbiddenError instanceof AppError', () => {
    expect(new ForbiddenError() instanceof AppError).toBe(true);
  });
  it('test_024: ForbiddenError instanceof Error', () => {
    expect(new ForbiddenError() instanceof Error).toBe(true);
  });
  it('test_025: ForbiddenError statusCode is 403', () => {
    expect(new ForbiddenError().statusCode).toBe(403);
  });
  it('test_026: ForbiddenError code is FORBIDDEN', () => {
    expect(new ForbiddenError().code).toBe('FORBIDDEN');
  });
  it('test_027: ForbiddenError has stack', () => {
    expect(new ForbiddenError().stack).toBeDefined();
  });
  it('test_028: ForbiddenError name is ForbiddenError', () => {
    expect(new ForbiddenError().name).toBe('ForbiddenError');
  });
  it('test_029: ForbiddenError custom message stored', () => {
    const e = new ForbiddenError('Access denied to resource');
    expect(e.message).toBe('Access denied to resource');
  });
  it('test_030: ForbiddenError empty string message', () => {
    const e = new ForbiddenError('');
    expect(e.message).toBe('');
  });
});

describe('isError / isAppError', () => {
  it('test_001: isError returns true for Error', () => { expect(isError(new Error('x'))).toBe(true); });
  it('test_002: isError returns true for AppError', () => { expect(isError(new AppError('x', 'C'))).toBe(true); });
  it('test_003: isError returns true for ValidationError', () => { expect(isError(new ValidationError('v'))).toBe(true); });
  it('test_004: isError returns true for NotFoundError', () => { expect(isError(new NotFoundError('R'))).toBe(true); });
  it('test_005: isError returns true for UnauthorizedError', () => { expect(isError(new UnauthorizedError())).toBe(true); });
  it('test_006: isError returns true for ForbiddenError', () => { expect(isError(new ForbiddenError())).toBe(true); });
  it('test_007: isError returns false for string', () => { expect(isError('error')).toBe(false); });
  it('test_008: isError returns false for number', () => { expect(isError(42)).toBe(false); });
  it('test_009: isError returns false for null', () => { expect(isError(null)).toBe(false); });
  it('test_010: isError returns false for undefined', () => { expect(isError(undefined)).toBe(false); });
  it('test_011: isError returns false for plain object', () => { expect(isError({ message: 'x' })).toBe(false); });
  it('test_012: isError returns false for boolean', () => { expect(isError(true)).toBe(false); });
  it('test_013: isError returns false for array', () => { expect(isError([])).toBe(false); });
  it('test_014: isError returns false for function', () => { expect(isError(() => {})).toBe(false); });
  it('test_015: isError returns false for symbol', () => { expect(isError(Symbol('e'))).toBe(false); });
  it('test_016: isError with Error instance variant 16', () => {
    const e = new Error('e16');
    expect(isError(e)).toBe(true);
  });
  it('test_017: isError with Error instance variant 17', () => {
    const e = new Error('e17');
    expect(isError(e)).toBe(true);
  });
  it('test_018: isError with Error instance variant 18', () => {
    const e = new Error('e18');
    expect(isError(e)).toBe(true);
  });
  it('test_019: isError with Error instance variant 19', () => {
    const e = new Error('e19');
    expect(isError(e)).toBe(true);
  });
  it('test_020: isError with Error instance variant 20', () => {
    const e = new Error('e20');
    expect(isError(e)).toBe(true);
  });
  it('test_021: isError with Error instance variant 21', () => {
    const e = new Error('e21');
    expect(isError(e)).toBe(true);
  });
  it('test_022: isError with Error instance variant 22', () => {
    const e = new Error('e22');
    expect(isError(e)).toBe(true);
  });
  it('test_023: isError with Error instance variant 23', () => {
    const e = new Error('e23');
    expect(isError(e)).toBe(true);
  });
  it('test_024: isError with Error instance variant 24', () => {
    const e = new Error('e24');
    expect(isError(e)).toBe(true);
  });
  it('test_025: isError with Error instance variant 25', () => {
    const e = new Error('e25');
    expect(isError(e)).toBe(true);
  });
  it('test_026: isError with Error instance variant 26', () => {
    const e = new Error('e26');
    expect(isError(e)).toBe(true);
  });
  it('test_027: isError with Error instance variant 27', () => {
    const e = new Error('e27');
    expect(isError(e)).toBe(true);
  });
  it('test_028: isError with Error instance variant 28', () => {
    const e = new Error('e28');
    expect(isError(e)).toBe(true);
  });
  it('test_029: isError with Error instance variant 29', () => {
    const e = new Error('e29');
    expect(isError(e)).toBe(true);
  });
  it('test_030: isError with Error instance variant 30', () => {
    const e = new Error('e30');
    expect(isError(e)).toBe(true);
  });
  it('test_031: isError with Error instance variant 31', () => {
    const e = new Error('e31');
    expect(isError(e)).toBe(true);
  });
  it('test_032: isError with Error instance variant 32', () => {
    const e = new Error('e32');
    expect(isError(e)).toBe(true);
  });
  it('test_033: isError with Error instance variant 33', () => {
    const e = new Error('e33');
    expect(isError(e)).toBe(true);
  });
  it('test_034: isError with Error instance variant 34', () => {
    const e = new Error('e34');
    expect(isError(e)).toBe(true);
  });
  it('test_035: isError with Error instance variant 35', () => {
    const e = new Error('e35');
    expect(isError(e)).toBe(true);
  });
  it('test_036: isError with Error instance variant 36', () => {
    const e = new Error('e36');
    expect(isError(e)).toBe(true);
  });
  it('test_037: isError with Error instance variant 37', () => {
    const e = new Error('e37');
    expect(isError(e)).toBe(true);
  });
  it('test_038: isError with Error instance variant 38', () => {
    const e = new Error('e38');
    expect(isError(e)).toBe(true);
  });
  it('test_039: isError with Error instance variant 39', () => {
    const e = new Error('e39');
    expect(isError(e)).toBe(true);
  });
  it('test_040: isError with Error instance variant 40', () => {
    const e = new Error('e40');
    expect(isError(e)).toBe(true);
  });
  it('test_041: isError with Error instance variant 41', () => {
    const e = new Error('e41');
    expect(isError(e)).toBe(true);
  });
  it('test_042: isError with Error instance variant 42', () => {
    const e = new Error('e42');
    expect(isError(e)).toBe(true);
  });
  it('test_043: isError with Error instance variant 43', () => {
    const e = new Error('e43');
    expect(isError(e)).toBe(true);
  });
  it('test_044: isError with Error instance variant 44', () => {
    const e = new Error('e44');
    expect(isError(e)).toBe(true);
  });
  it('test_045: isError with Error instance variant 45', () => {
    const e = new Error('e45');
    expect(isError(e)).toBe(true);
  });
  it('test_046: isError with Error instance variant 46', () => {
    const e = new Error('e46');
    expect(isError(e)).toBe(true);
  });
  it('test_047: isError with Error instance variant 47', () => {
    const e = new Error('e47');
    expect(isError(e)).toBe(true);
  });
  it('test_048: isError with Error instance variant 48', () => {
    const e = new Error('e48');
    expect(isError(e)).toBe(true);
  });
  it('test_049: isError with Error instance variant 49', () => {
    const e = new Error('e49');
    expect(isError(e)).toBe(true);
  });
  it('test_050: isError with Error instance variant 50', () => {
    const e = new Error('e50');
    expect(isError(e)).toBe(true);
  });
  it('test_051: isAppError true for AppError', () => { expect(isAppError(new AppError('a', 'B'))).toBe(true); });
  it('test_052: isAppError true for ValidationError', () => { expect(isAppError(new ValidationError('v'))).toBe(true); });
  it('test_053: isAppError true for NotFoundError', () => { expect(isAppError(new NotFoundError('R'))).toBe(true); });
  it('test_054: isAppError true for UnauthorizedError', () => { expect(isAppError(new UnauthorizedError())).toBe(true); });
  it('test_055: isAppError true for ForbiddenError', () => { expect(isAppError(new ForbiddenError())).toBe(true); });
  it('test_056: isAppError false for plain Error', () => { expect(isAppError(new Error('x'))).toBe(false); });
  it('test_057: isAppError false for string', () => { expect(isAppError('err')).toBe(false); });
  it('test_058: isAppError false for null', () => { expect(isAppError(null)).toBe(false); });
  it('test_059: isAppError false for undefined', () => { expect(isAppError(undefined)).toBe(false); });
  it('test_060: isAppError false for number', () => { expect(isAppError(99)).toBe(false); });
  it('test_061: isAppError variant 61', () => {
    const e = new AppError('msg', 'CODE_61');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_062: isAppError variant 62', () => {
    const e = new AppError('msg', 'CODE_62');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_063: isAppError variant 63', () => {
    const e = new AppError('msg', 'CODE_63');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_064: isAppError variant 64', () => {
    const e = new AppError('msg', 'CODE_64');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_065: isAppError variant 65', () => {
    const e = new AppError('msg', 'CODE_65');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_066: isAppError variant 66', () => {
    const e = new AppError('msg', 'CODE_66');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_067: isAppError variant 67', () => {
    const e = new AppError('msg', 'CODE_67');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_068: isAppError variant 68', () => {
    const e = new AppError('msg', 'CODE_68');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_069: isAppError variant 69', () => {
    const e = new AppError('msg', 'CODE_69');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_070: isAppError variant 70', () => {
    const e = new AppError('msg', 'CODE_70');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_071: isAppError variant 71', () => {
    const e = new AppError('msg', 'CODE_71');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_072: isAppError variant 72', () => {
    const e = new AppError('msg', 'CODE_72');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_073: isAppError variant 73', () => {
    const e = new AppError('msg', 'CODE_73');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_074: isAppError variant 74', () => {
    const e = new AppError('msg', 'CODE_74');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_075: isAppError variant 75', () => {
    const e = new AppError('msg', 'CODE_75');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_076: isAppError variant 76', () => {
    const e = new AppError('msg', 'CODE_76');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_077: isAppError variant 77', () => {
    const e = new AppError('msg', 'CODE_77');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_078: isAppError variant 78', () => {
    const e = new AppError('msg', 'CODE_78');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_079: isAppError variant 79', () => {
    const e = new AppError('msg', 'CODE_79');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_080: isAppError variant 80', () => {
    const e = new AppError('msg', 'CODE_80');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_081: isAppError variant 81', () => {
    const e = new AppError('msg', 'CODE_81');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_082: isAppError variant 82', () => {
    const e = new AppError('msg', 'CODE_82');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_083: isAppError variant 83', () => {
    const e = new AppError('msg', 'CODE_83');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_084: isAppError variant 84', () => {
    const e = new AppError('msg', 'CODE_84');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_085: isAppError variant 85', () => {
    const e = new AppError('msg', 'CODE_85');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_086: isAppError variant 86', () => {
    const e = new AppError('msg', 'CODE_86');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_087: isAppError variant 87', () => {
    const e = new AppError('msg', 'CODE_87');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_088: isAppError variant 88', () => {
    const e = new AppError('msg', 'CODE_88');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_089: isAppError variant 89', () => {
    const e = new AppError('msg', 'CODE_89');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_090: isAppError variant 90', () => {
    const e = new AppError('msg', 'CODE_90');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_091: isAppError variant 91', () => {
    const e = new AppError('msg', 'CODE_91');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_092: isAppError variant 92', () => {
    const e = new AppError('msg', 'CODE_92');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_093: isAppError variant 93', () => {
    const e = new AppError('msg', 'CODE_93');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_094: isAppError variant 94', () => {
    const e = new AppError('msg', 'CODE_94');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_095: isAppError variant 95', () => {
    const e = new AppError('msg', 'CODE_95');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_096: isAppError variant 96', () => {
    const e = new AppError('msg', 'CODE_96');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_097: isAppError variant 97', () => {
    const e = new AppError('msg', 'CODE_97');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_098: isAppError variant 98', () => {
    const e = new AppError('msg', 'CODE_98');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_099: isAppError variant 99', () => {
    const e = new AppError('msg', 'CODE_99');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
  it('test_100: isAppError variant 100', () => {
    const e = new AppError('msg', 'CODE_100');
    expect(isAppError(e)).toBe(true);
    expect(isError(e)).toBe(true);
  });
});

describe('getErrorMessage / getErrorCode / getStatusCode', () => {
  it('test_001: getErrorMessage from Error', () => {
    expect(getErrorMessage(new Error('msg1'))).toBe('msg1');
  });
  it('test_002: getErrorMessage from Error', () => {
    expect(getErrorMessage(new Error('msg2'))).toBe('msg2');
  });
  it('test_003: getErrorMessage from Error', () => {
    expect(getErrorMessage(new Error('msg3'))).toBe('msg3');
  });
  it('test_004: getErrorMessage from Error', () => {
    expect(getErrorMessage(new Error('msg4'))).toBe('msg4');
  });
  it('test_005: getErrorMessage from Error', () => {
    expect(getErrorMessage(new Error('msg5'))).toBe('msg5');
  });
  it('test_006: getErrorMessage from Error', () => {
    expect(getErrorMessage(new Error('msg6'))).toBe('msg6');
  });
  it('test_007: getErrorMessage from Error', () => {
    expect(getErrorMessage(new Error('msg7'))).toBe('msg7');
  });
  it('test_008: getErrorMessage from Error', () => {
    expect(getErrorMessage(new Error('msg8'))).toBe('msg8');
  });
  it('test_009: getErrorMessage from Error', () => {
    expect(getErrorMessage(new Error('msg9'))).toBe('msg9');
  });
  it('test_010: getErrorMessage from Error', () => {
    expect(getErrorMessage(new Error('msg10'))).toBe('msg10');
  });
  it('test_011: getErrorMessage from Error', () => {
    expect(getErrorMessage(new Error('msg11'))).toBe('msg11');
  });
  it('test_012: getErrorMessage from Error', () => {
    expect(getErrorMessage(new Error('msg12'))).toBe('msg12');
  });
  it('test_013: getErrorMessage from Error', () => {
    expect(getErrorMessage(new Error('msg13'))).toBe('msg13');
  });
  it('test_014: getErrorMessage from Error', () => {
    expect(getErrorMessage(new Error('msg14'))).toBe('msg14');
  });
  it('test_015: getErrorMessage from Error', () => {
    expect(getErrorMessage(new Error('msg15'))).toBe('msg15');
  });
  it('test_016: getErrorMessage from Error', () => {
    expect(getErrorMessage(new Error('msg16'))).toBe('msg16');
  });
  it('test_017: getErrorMessage from Error', () => {
    expect(getErrorMessage(new Error('msg17'))).toBe('msg17');
  });
  it('test_018: getErrorMessage from Error', () => {
    expect(getErrorMessage(new Error('msg18'))).toBe('msg18');
  });
  it('test_019: getErrorMessage from Error', () => {
    expect(getErrorMessage(new Error('msg19'))).toBe('msg19');
  });
  it('test_020: getErrorMessage from Error', () => {
    expect(getErrorMessage(new Error('msg20'))).toBe('msg20');
  });
  it('test_021: getErrorMessage from AppError', () => {
    expect(getErrorMessage(new AppError('appmsg21', 'C'))).toBe('appmsg21');
  });
  it('test_022: getErrorMessage from AppError', () => {
    expect(getErrorMessage(new AppError('appmsg22', 'C'))).toBe('appmsg22');
  });
  it('test_023: getErrorMessage from AppError', () => {
    expect(getErrorMessage(new AppError('appmsg23', 'C'))).toBe('appmsg23');
  });
  it('test_024: getErrorMessage from AppError', () => {
    expect(getErrorMessage(new AppError('appmsg24', 'C'))).toBe('appmsg24');
  });
  it('test_025: getErrorMessage from AppError', () => {
    expect(getErrorMessage(new AppError('appmsg25', 'C'))).toBe('appmsg25');
  });
  it('test_026: getErrorMessage from AppError', () => {
    expect(getErrorMessage(new AppError('appmsg26', 'C'))).toBe('appmsg26');
  });
  it('test_027: getErrorMessage from AppError', () => {
    expect(getErrorMessage(new AppError('appmsg27', 'C'))).toBe('appmsg27');
  });
  it('test_028: getErrorMessage from AppError', () => {
    expect(getErrorMessage(new AppError('appmsg28', 'C'))).toBe('appmsg28');
  });
  it('test_029: getErrorMessage from AppError', () => {
    expect(getErrorMessage(new AppError('appmsg29', 'C'))).toBe('appmsg29');
  });
  it('test_030: getErrorMessage from AppError', () => {
    expect(getErrorMessage(new AppError('appmsg30', 'C'))).toBe('appmsg30');
  });
  it('test_031: getErrorMessage from AppError', () => {
    expect(getErrorMessage(new AppError('appmsg31', 'C'))).toBe('appmsg31');
  });
  it('test_032: getErrorMessage from AppError', () => {
    expect(getErrorMessage(new AppError('appmsg32', 'C'))).toBe('appmsg32');
  });
  it('test_033: getErrorMessage from AppError', () => {
    expect(getErrorMessage(new AppError('appmsg33', 'C'))).toBe('appmsg33');
  });
  it('test_034: getErrorMessage from AppError', () => {
    expect(getErrorMessage(new AppError('appmsg34', 'C'))).toBe('appmsg34');
  });
  it('test_035: getErrorMessage from AppError', () => {
    expect(getErrorMessage(new AppError('appmsg35', 'C'))).toBe('appmsg35');
  });
  it('test_036: getErrorMessage from AppError', () => {
    expect(getErrorMessage(new AppError('appmsg36', 'C'))).toBe('appmsg36');
  });
  it('test_037: getErrorMessage from AppError', () => {
    expect(getErrorMessage(new AppError('appmsg37', 'C'))).toBe('appmsg37');
  });
  it('test_038: getErrorMessage from AppError', () => {
    expect(getErrorMessage(new AppError('appmsg38', 'C'))).toBe('appmsg38');
  });
  it('test_039: getErrorMessage from AppError', () => {
    expect(getErrorMessage(new AppError('appmsg39', 'C'))).toBe('appmsg39');
  });
  it('test_040: getErrorMessage from AppError', () => {
    expect(getErrorMessage(new AppError('appmsg40', 'C'))).toBe('appmsg40');
  });
  it('test_041: getErrorMessage from string', () => { expect(getErrorMessage('raw string')).toBe('raw string'); });
  it('test_042: getErrorMessage from number', () => { expect(getErrorMessage(123)).toBe('123'); });
  it('test_043: getErrorMessage from null', () => { expect(getErrorMessage(null)).toBe('null'); });
  it('test_044: getErrorMessage from undefined', () => { expect(getErrorMessage(undefined)).toBe('undefined'); });
  it('test_045: getErrorMessage from object with message', () => { expect(getErrorMessage({ message: 'obj msg' })).toBe('obj msg'); });
  it('test_046: getErrorMessage from object without message', () => { expect(getErrorMessage({ code: 'X' })).toBe('[object Object]'); });
  it('test_047: getErrorMessage from boolean true', () => { expect(getErrorMessage(true)).toBe('true'); });
  it('test_048: getErrorMessage from boolean false', () => { expect(getErrorMessage(false)).toBe('false'); });
  it('test_049: getErrorMessage from empty string', () => { expect(getErrorMessage('')).toBe(''); });
  it('test_050: getErrorMessage from ValidationError', () => {
    expect(getErrorMessage(new ValidationError('val err'))).toBe('val err');
  });
  it('test_051: getErrorCode from AppError', () => {
    const e = new AppError('m', 'CODE_51');
    expect(getErrorCode(e)).toBe('CODE_51');
  });
  it('test_052: getErrorCode from AppError', () => {
    const e = new AppError('m', 'CODE_52');
    expect(getErrorCode(e)).toBe('CODE_52');
  });
  it('test_053: getErrorCode from AppError', () => {
    const e = new AppError('m', 'CODE_53');
    expect(getErrorCode(e)).toBe('CODE_53');
  });
  it('test_054: getErrorCode from AppError', () => {
    const e = new AppError('m', 'CODE_54');
    expect(getErrorCode(e)).toBe('CODE_54');
  });
  it('test_055: getErrorCode from AppError', () => {
    const e = new AppError('m', 'CODE_55');
    expect(getErrorCode(e)).toBe('CODE_55');
  });
  it('test_056: getErrorCode from AppError', () => {
    const e = new AppError('m', 'CODE_56');
    expect(getErrorCode(e)).toBe('CODE_56');
  });
  it('test_057: getErrorCode from AppError', () => {
    const e = new AppError('m', 'CODE_57');
    expect(getErrorCode(e)).toBe('CODE_57');
  });
  it('test_058: getErrorCode from AppError', () => {
    const e = new AppError('m', 'CODE_58');
    expect(getErrorCode(e)).toBe('CODE_58');
  });
  it('test_059: getErrorCode from AppError', () => {
    const e = new AppError('m', 'CODE_59');
    expect(getErrorCode(e)).toBe('CODE_59');
  });
  it('test_060: getErrorCode from AppError', () => {
    const e = new AppError('m', 'CODE_60');
    expect(getErrorCode(e)).toBe('CODE_60');
  });
  it('test_061: getErrorCode from AppError', () => {
    const e = new AppError('m', 'CODE_61');
    expect(getErrorCode(e)).toBe('CODE_61');
  });
  it('test_062: getErrorCode from AppError', () => {
    const e = new AppError('m', 'CODE_62');
    expect(getErrorCode(e)).toBe('CODE_62');
  });
  it('test_063: getErrorCode from AppError', () => {
    const e = new AppError('m', 'CODE_63');
    expect(getErrorCode(e)).toBe('CODE_63');
  });
  it('test_064: getErrorCode from AppError', () => {
    const e = new AppError('m', 'CODE_64');
    expect(getErrorCode(e)).toBe('CODE_64');
  });
  it('test_065: getErrorCode from AppError', () => {
    const e = new AppError('m', 'CODE_65');
    expect(getErrorCode(e)).toBe('CODE_65');
  });
  it('test_066: getErrorCode from AppError', () => {
    const e = new AppError('m', 'CODE_66');
    expect(getErrorCode(e)).toBe('CODE_66');
  });
  it('test_067: getErrorCode from AppError', () => {
    const e = new AppError('m', 'CODE_67');
    expect(getErrorCode(e)).toBe('CODE_67');
  });
  it('test_068: getErrorCode from AppError', () => {
    const e = new AppError('m', 'CODE_68');
    expect(getErrorCode(e)).toBe('CODE_68');
  });
  it('test_069: getErrorCode from AppError', () => {
    const e = new AppError('m', 'CODE_69');
    expect(getErrorCode(e)).toBe('CODE_69');
  });
  it('test_070: getErrorCode from AppError', () => {
    const e = new AppError('m', 'CODE_70');
    expect(getErrorCode(e)).toBe('CODE_70');
  });
  it('test_071: getErrorCode from plain Error is undefined', () => { expect(getErrorCode(new Error('x'))).toBeUndefined(); });
  it('test_072: getErrorCode from string is undefined', () => { expect(getErrorCode('err')).toBeUndefined(); });
  it('test_073: getErrorCode from null is undefined', () => { expect(getErrorCode(null)).toBeUndefined(); });
  it('test_074: getErrorCode from object with code', () => { expect(getErrorCode({ code: 'OBJ_CODE' })).toBe('OBJ_CODE'); });
  it('test_075: getErrorCode from object without code', () => { expect(getErrorCode({ message: 'x' })).toBeUndefined(); });
  it('test_076: getErrorCode from ValidationError', () => { expect(getErrorCode(new ValidationError('v'))).toBe('VALIDATION_ERROR'); });
  it('test_077: getErrorCode from NotFoundError', () => { expect(getErrorCode(new NotFoundError('R'))).toBe('NOT_FOUND'); });
  it('test_078: getErrorCode from UnauthorizedError', () => { expect(getErrorCode(new UnauthorizedError())).toBe('UNAUTHORIZED'); });
  it('test_079: getErrorCode from ForbiddenError', () => { expect(getErrorCode(new ForbiddenError())).toBe('FORBIDDEN'); });
  it('test_080: getErrorCode from number is undefined', () => { expect(getErrorCode(42)).toBeUndefined(); });
  it('test_081: getStatusCode from AppError statusCode-81', () => {
    const e = new AppError('m', 'C', 481);
    expect(getStatusCode(e)).toBe(481);
  });
  it('test_082: getStatusCode from AppError statusCode-82', () => {
    const e = new AppError('m', 'C', 482);
    expect(getStatusCode(e)).toBe(482);
  });
  it('test_083: getStatusCode from AppError statusCode-83', () => {
    const e = new AppError('m', 'C', 483);
    expect(getStatusCode(e)).toBe(483);
  });
  it('test_084: getStatusCode from AppError statusCode-84', () => {
    const e = new AppError('m', 'C', 484);
    expect(getStatusCode(e)).toBe(484);
  });
  it('test_085: getStatusCode from AppError statusCode-85', () => {
    const e = new AppError('m', 'C', 485);
    expect(getStatusCode(e)).toBe(485);
  });
  it('test_086: getStatusCode from AppError statusCode-86', () => {
    const e = new AppError('m', 'C', 486);
    expect(getStatusCode(e)).toBe(486);
  });
  it('test_087: getStatusCode from AppError statusCode-87', () => {
    const e = new AppError('m', 'C', 487);
    expect(getStatusCode(e)).toBe(487);
  });
  it('test_088: getStatusCode from AppError statusCode-88', () => {
    const e = new AppError('m', 'C', 488);
    expect(getStatusCode(e)).toBe(488);
  });
  it('test_089: getStatusCode from AppError statusCode-89', () => {
    const e = new AppError('m', 'C', 489);
    expect(getStatusCode(e)).toBe(489);
  });
  it('test_090: getStatusCode from AppError statusCode-90', () => {
    const e = new AppError('m', 'C', 490);
    expect(getStatusCode(e)).toBe(490);
  });
  it('test_091: getStatusCode from AppError statusCode-91', () => {
    const e = new AppError('m', 'C', 491);
    expect(getStatusCode(e)).toBe(491);
  });
  it('test_092: getStatusCode from AppError statusCode-92', () => {
    const e = new AppError('m', 'C', 492);
    expect(getStatusCode(e)).toBe(492);
  });
  it('test_093: getStatusCode from AppError statusCode-93', () => {
    const e = new AppError('m', 'C', 493);
    expect(getStatusCode(e)).toBe(493);
  });
  it('test_094: getStatusCode from AppError statusCode-94', () => {
    const e = new AppError('m', 'C', 494);
    expect(getStatusCode(e)).toBe(494);
  });
  it('test_095: getStatusCode from AppError statusCode-95', () => {
    const e = new AppError('m', 'C', 495);
    expect(getStatusCode(e)).toBe(495);
  });
  it('test_096: getStatusCode from AppError statusCode-96', () => {
    const e = new AppError('m', 'C', 496);
    expect(getStatusCode(e)).toBe(496);
  });
  it('test_097: getStatusCode from AppError statusCode-97', () => {
    const e = new AppError('m', 'C', 497);
    expect(getStatusCode(e)).toBe(497);
  });
  it('test_098: getStatusCode from AppError statusCode-98', () => {
    const e = new AppError('m', 'C', 498);
    expect(getStatusCode(e)).toBe(498);
  });
  it('test_099: getStatusCode from AppError statusCode-99', () => {
    const e = new AppError('m', 'C', 499);
    expect(getStatusCode(e)).toBe(499);
  });
  it('test_100: getStatusCode from AppError statusCode-100', () => {
    const e = new AppError('m', 'C', 500);
    expect(getStatusCode(e)).toBe(500);
  });
});

describe('serializeError', () => {
  it('test_001: serializeError AppError-1', () => {
    const e = new AppError('msg1', 'CODE_1', 401);
    const s = serializeError(e);
    expect(s.message).toBe('msg1');
    expect(s.name).toBe('AppError');
    expect(s.code).toBe('CODE_1');
    expect(s.statusCode).toBe(401);
    expect(s.stack).toBeDefined();
  });
  it('test_002: serializeError AppError-2', () => {
    const e = new AppError('msg2', 'CODE_2', 402);
    const s = serializeError(e);
    expect(s.message).toBe('msg2');
    expect(s.name).toBe('AppError');
    expect(s.code).toBe('CODE_2');
    expect(s.statusCode).toBe(402);
    expect(s.stack).toBeDefined();
  });
  it('test_003: serializeError AppError-3', () => {
    const e = new AppError('msg3', 'CODE_3', 403);
    const s = serializeError(e);
    expect(s.message).toBe('msg3');
    expect(s.name).toBe('AppError');
    expect(s.code).toBe('CODE_3');
    expect(s.statusCode).toBe(403);
    expect(s.stack).toBeDefined();
  });
  it('test_004: serializeError AppError-4', () => {
    const e = new AppError('msg4', 'CODE_4', 404);
    const s = serializeError(e);
    expect(s.message).toBe('msg4');
    expect(s.name).toBe('AppError');
    expect(s.code).toBe('CODE_4');
    expect(s.statusCode).toBe(404);
    expect(s.stack).toBeDefined();
  });
  it('test_005: serializeError AppError-5', () => {
    const e = new AppError('msg5', 'CODE_5', 405);
    const s = serializeError(e);
    expect(s.message).toBe('msg5');
    expect(s.name).toBe('AppError');
    expect(s.code).toBe('CODE_5');
    expect(s.statusCode).toBe(405);
    expect(s.stack).toBeDefined();
  });
  it('test_006: serializeError AppError-6', () => {
    const e = new AppError('msg6', 'CODE_6', 406);
    const s = serializeError(e);
    expect(s.message).toBe('msg6');
    expect(s.name).toBe('AppError');
    expect(s.code).toBe('CODE_6');
    expect(s.statusCode).toBe(406);
    expect(s.stack).toBeDefined();
  });
  it('test_007: serializeError AppError-7', () => {
    const e = new AppError('msg7', 'CODE_7', 407);
    const s = serializeError(e);
    expect(s.message).toBe('msg7');
    expect(s.name).toBe('AppError');
    expect(s.code).toBe('CODE_7');
    expect(s.statusCode).toBe(407);
    expect(s.stack).toBeDefined();
  });
  it('test_008: serializeError AppError-8', () => {
    const e = new AppError('msg8', 'CODE_8', 408);
    const s = serializeError(e);
    expect(s.message).toBe('msg8');
    expect(s.name).toBe('AppError');
    expect(s.code).toBe('CODE_8');
    expect(s.statusCode).toBe(408);
    expect(s.stack).toBeDefined();
  });
  it('test_009: serializeError AppError-9', () => {
    const e = new AppError('msg9', 'CODE_9', 409);
    const s = serializeError(e);
    expect(s.message).toBe('msg9');
    expect(s.name).toBe('AppError');
    expect(s.code).toBe('CODE_9');
    expect(s.statusCode).toBe(409);
    expect(s.stack).toBeDefined();
  });
  it('test_010: serializeError AppError-10', () => {
    const e = new AppError('msg10', 'CODE_10', 410);
    const s = serializeError(e);
    expect(s.message).toBe('msg10');
    expect(s.name).toBe('AppError');
    expect(s.code).toBe('CODE_10');
    expect(s.statusCode).toBe(410);
    expect(s.stack).toBeDefined();
  });
  it('test_011: serializeError AppError-11', () => {
    const e = new AppError('msg11', 'CODE_11', 411);
    const s = serializeError(e);
    expect(s.message).toBe('msg11');
    expect(s.name).toBe('AppError');
    expect(s.code).toBe('CODE_11');
    expect(s.statusCode).toBe(411);
    expect(s.stack).toBeDefined();
  });
  it('test_012: serializeError AppError-12', () => {
    const e = new AppError('msg12', 'CODE_12', 412);
    const s = serializeError(e);
    expect(s.message).toBe('msg12');
    expect(s.name).toBe('AppError');
    expect(s.code).toBe('CODE_12');
    expect(s.statusCode).toBe(412);
    expect(s.stack).toBeDefined();
  });
  it('test_013: serializeError AppError-13', () => {
    const e = new AppError('msg13', 'CODE_13', 413);
    const s = serializeError(e);
    expect(s.message).toBe('msg13');
    expect(s.name).toBe('AppError');
    expect(s.code).toBe('CODE_13');
    expect(s.statusCode).toBe(413);
    expect(s.stack).toBeDefined();
  });
  it('test_014: serializeError AppError-14', () => {
    const e = new AppError('msg14', 'CODE_14', 414);
    const s = serializeError(e);
    expect(s.message).toBe('msg14');
    expect(s.name).toBe('AppError');
    expect(s.code).toBe('CODE_14');
    expect(s.statusCode).toBe(414);
    expect(s.stack).toBeDefined();
  });
  it('test_015: serializeError AppError-15', () => {
    const e = new AppError('msg15', 'CODE_15', 415);
    const s = serializeError(e);
    expect(s.message).toBe('msg15');
    expect(s.name).toBe('AppError');
    expect(s.code).toBe('CODE_15');
    expect(s.statusCode).toBe(415);
    expect(s.stack).toBeDefined();
  });
  it('test_016: serializeError AppError-16', () => {
    const e = new AppError('msg16', 'CODE_16', 416);
    const s = serializeError(e);
    expect(s.message).toBe('msg16');
    expect(s.name).toBe('AppError');
    expect(s.code).toBe('CODE_16');
    expect(s.statusCode).toBe(416);
    expect(s.stack).toBeDefined();
  });
  it('test_017: serializeError AppError-17', () => {
    const e = new AppError('msg17', 'CODE_17', 417);
    const s = serializeError(e);
    expect(s.message).toBe('msg17');
    expect(s.name).toBe('AppError');
    expect(s.code).toBe('CODE_17');
    expect(s.statusCode).toBe(417);
    expect(s.stack).toBeDefined();
  });
  it('test_018: serializeError AppError-18', () => {
    const e = new AppError('msg18', 'CODE_18', 418);
    const s = serializeError(e);
    expect(s.message).toBe('msg18');
    expect(s.name).toBe('AppError');
    expect(s.code).toBe('CODE_18');
    expect(s.statusCode).toBe(418);
    expect(s.stack).toBeDefined();
  });
  it('test_019: serializeError AppError-19', () => {
    const e = new AppError('msg19', 'CODE_19', 419);
    const s = serializeError(e);
    expect(s.message).toBe('msg19');
    expect(s.name).toBe('AppError');
    expect(s.code).toBe('CODE_19');
    expect(s.statusCode).toBe(419);
    expect(s.stack).toBeDefined();
  });
  it('test_020: serializeError AppError-20', () => {
    const e = new AppError('msg20', 'CODE_20', 420);
    const s = serializeError(e);
    expect(s.message).toBe('msg20');
    expect(s.name).toBe('AppError');
    expect(s.code).toBe('CODE_20');
    expect(s.statusCode).toBe(420);
    expect(s.stack).toBeDefined();
  });
  it('test_021: serializeError AppError-21', () => {
    const e = new AppError('msg21', 'CODE_21', 421);
    const s = serializeError(e);
    expect(s.message).toBe('msg21');
    expect(s.name).toBe('AppError');
    expect(s.code).toBe('CODE_21');
    expect(s.statusCode).toBe(421);
    expect(s.stack).toBeDefined();
  });
  it('test_022: serializeError AppError-22', () => {
    const e = new AppError('msg22', 'CODE_22', 422);
    const s = serializeError(e);
    expect(s.message).toBe('msg22');
    expect(s.name).toBe('AppError');
    expect(s.code).toBe('CODE_22');
    expect(s.statusCode).toBe(422);
    expect(s.stack).toBeDefined();
  });
  it('test_023: serializeError AppError-23', () => {
    const e = new AppError('msg23', 'CODE_23', 423);
    const s = serializeError(e);
    expect(s.message).toBe('msg23');
    expect(s.name).toBe('AppError');
    expect(s.code).toBe('CODE_23');
    expect(s.statusCode).toBe(423);
    expect(s.stack).toBeDefined();
  });
  it('test_024: serializeError AppError-24', () => {
    const e = new AppError('msg24', 'CODE_24', 424);
    const s = serializeError(e);
    expect(s.message).toBe('msg24');
    expect(s.name).toBe('AppError');
    expect(s.code).toBe('CODE_24');
    expect(s.statusCode).toBe(424);
    expect(s.stack).toBeDefined();
  });
  it('test_025: serializeError AppError-25', () => {
    const e = new AppError('msg25', 'CODE_25', 425);
    const s = serializeError(e);
    expect(s.message).toBe('msg25');
    expect(s.name).toBe('AppError');
    expect(s.code).toBe('CODE_25');
    expect(s.statusCode).toBe(425);
    expect(s.stack).toBeDefined();
  });
  it('test_026: serializeError AppError-26', () => {
    const e = new AppError('msg26', 'CODE_26', 426);
    const s = serializeError(e);
    expect(s.message).toBe('msg26');
    expect(s.name).toBe('AppError');
    expect(s.code).toBe('CODE_26');
    expect(s.statusCode).toBe(426);
    expect(s.stack).toBeDefined();
  });
  it('test_027: serializeError AppError-27', () => {
    const e = new AppError('msg27', 'CODE_27', 427);
    const s = serializeError(e);
    expect(s.message).toBe('msg27');
    expect(s.name).toBe('AppError');
    expect(s.code).toBe('CODE_27');
    expect(s.statusCode).toBe(427);
    expect(s.stack).toBeDefined();
  });
  it('test_028: serializeError AppError-28', () => {
    const e = new AppError('msg28', 'CODE_28', 428);
    const s = serializeError(e);
    expect(s.message).toBe('msg28');
    expect(s.name).toBe('AppError');
    expect(s.code).toBe('CODE_28');
    expect(s.statusCode).toBe(428);
    expect(s.stack).toBeDefined();
  });
  it('test_029: serializeError AppError-29', () => {
    const e = new AppError('msg29', 'CODE_29', 429);
    const s = serializeError(e);
    expect(s.message).toBe('msg29');
    expect(s.name).toBe('AppError');
    expect(s.code).toBe('CODE_29');
    expect(s.statusCode).toBe(429);
    expect(s.stack).toBeDefined();
  });
  it('test_030: serializeError AppError-30', () => {
    const e = new AppError('msg30', 'CODE_30', 430);
    const s = serializeError(e);
    expect(s.message).toBe('msg30');
    expect(s.name).toBe('AppError');
    expect(s.code).toBe('CODE_30');
    expect(s.statusCode).toBe(430);
    expect(s.stack).toBeDefined();
  });
  it('test_031: serializeError plain Error-31', () => {
    const e = new Error('plain31');
    const s = serializeError(e);
    expect(s.message).toBe('plain31');
    expect(s.name).toBe('Error');
    expect(s.code).toBeUndefined();
    expect(s.statusCode).toBeUndefined();
  });
  it('test_032: serializeError plain Error-32', () => {
    const e = new Error('plain32');
    const s = serializeError(e);
    expect(s.message).toBe('plain32');
    expect(s.name).toBe('Error');
    expect(s.code).toBeUndefined();
    expect(s.statusCode).toBeUndefined();
  });
  it('test_033: serializeError plain Error-33', () => {
    const e = new Error('plain33');
    const s = serializeError(e);
    expect(s.message).toBe('plain33');
    expect(s.name).toBe('Error');
    expect(s.code).toBeUndefined();
    expect(s.statusCode).toBeUndefined();
  });
  it('test_034: serializeError plain Error-34', () => {
    const e = new Error('plain34');
    const s = serializeError(e);
    expect(s.message).toBe('plain34');
    expect(s.name).toBe('Error');
    expect(s.code).toBeUndefined();
    expect(s.statusCode).toBeUndefined();
  });
  it('test_035: serializeError plain Error-35', () => {
    const e = new Error('plain35');
    const s = serializeError(e);
    expect(s.message).toBe('plain35');
    expect(s.name).toBe('Error');
    expect(s.code).toBeUndefined();
    expect(s.statusCode).toBeUndefined();
  });
  it('test_036: serializeError plain Error-36', () => {
    const e = new Error('plain36');
    const s = serializeError(e);
    expect(s.message).toBe('plain36');
    expect(s.name).toBe('Error');
    expect(s.code).toBeUndefined();
    expect(s.statusCode).toBeUndefined();
  });
  it('test_037: serializeError plain Error-37', () => {
    const e = new Error('plain37');
    const s = serializeError(e);
    expect(s.message).toBe('plain37');
    expect(s.name).toBe('Error');
    expect(s.code).toBeUndefined();
    expect(s.statusCode).toBeUndefined();
  });
  it('test_038: serializeError plain Error-38', () => {
    const e = new Error('plain38');
    const s = serializeError(e);
    expect(s.message).toBe('plain38');
    expect(s.name).toBe('Error');
    expect(s.code).toBeUndefined();
    expect(s.statusCode).toBeUndefined();
  });
  it('test_039: serializeError plain Error-39', () => {
    const e = new Error('plain39');
    const s = serializeError(e);
    expect(s.message).toBe('plain39');
    expect(s.name).toBe('Error');
    expect(s.code).toBeUndefined();
    expect(s.statusCode).toBeUndefined();
  });
  it('test_040: serializeError plain Error-40', () => {
    const e = new Error('plain40');
    const s = serializeError(e);
    expect(s.message).toBe('plain40');
    expect(s.name).toBe('Error');
    expect(s.code).toBeUndefined();
    expect(s.statusCode).toBeUndefined();
  });
  it('test_041: serializeError plain Error-41', () => {
    const e = new Error('plain41');
    const s = serializeError(e);
    expect(s.message).toBe('plain41');
    expect(s.name).toBe('Error');
    expect(s.code).toBeUndefined();
    expect(s.statusCode).toBeUndefined();
  });
  it('test_042: serializeError plain Error-42', () => {
    const e = new Error('plain42');
    const s = serializeError(e);
    expect(s.message).toBe('plain42');
    expect(s.name).toBe('Error');
    expect(s.code).toBeUndefined();
    expect(s.statusCode).toBeUndefined();
  });
  it('test_043: serializeError plain Error-43', () => {
    const e = new Error('plain43');
    const s = serializeError(e);
    expect(s.message).toBe('plain43');
    expect(s.name).toBe('Error');
    expect(s.code).toBeUndefined();
    expect(s.statusCode).toBeUndefined();
  });
  it('test_044: serializeError plain Error-44', () => {
    const e = new Error('plain44');
    const s = serializeError(e);
    expect(s.message).toBe('plain44');
    expect(s.name).toBe('Error');
    expect(s.code).toBeUndefined();
    expect(s.statusCode).toBeUndefined();
  });
  it('test_045: serializeError plain Error-45', () => {
    const e = new Error('plain45');
    const s = serializeError(e);
    expect(s.message).toBe('plain45');
    expect(s.name).toBe('Error');
    expect(s.code).toBeUndefined();
    expect(s.statusCode).toBeUndefined();
  });
  it('test_046: serializeError plain Error-46', () => {
    const e = new Error('plain46');
    const s = serializeError(e);
    expect(s.message).toBe('plain46');
    expect(s.name).toBe('Error');
    expect(s.code).toBeUndefined();
    expect(s.statusCode).toBeUndefined();
  });
  it('test_047: serializeError plain Error-47', () => {
    const e = new Error('plain47');
    const s = serializeError(e);
    expect(s.message).toBe('plain47');
    expect(s.name).toBe('Error');
    expect(s.code).toBeUndefined();
    expect(s.statusCode).toBeUndefined();
  });
  it('test_048: serializeError plain Error-48', () => {
    const e = new Error('plain48');
    const s = serializeError(e);
    expect(s.message).toBe('plain48');
    expect(s.name).toBe('Error');
    expect(s.code).toBeUndefined();
    expect(s.statusCode).toBeUndefined();
  });
  it('test_049: serializeError plain Error-49', () => {
    const e = new Error('plain49');
    const s = serializeError(e);
    expect(s.message).toBe('plain49');
    expect(s.name).toBe('Error');
    expect(s.code).toBeUndefined();
    expect(s.statusCode).toBeUndefined();
  });
  it('test_050: serializeError plain Error-50', () => {
    const e = new Error('plain50');
    const s = serializeError(e);
    expect(s.message).toBe('plain50');
    expect(s.name).toBe('Error');
    expect(s.code).toBeUndefined();
    expect(s.statusCode).toBeUndefined();
  });
  it('test_051: serializeError ValidationError', () => {
    const s = serializeError(new ValidationError('bad', 'field'));
    expect(s.code).toBe('VALIDATION_ERROR');
    expect(s.statusCode).toBe(400);
    expect(s.name).toBe('ValidationError');
  });
  it('test_052: serializeError NotFoundError', () => {
    const s = serializeError(new NotFoundError('Item'));
    expect(s.code).toBe('NOT_FOUND');
    expect(s.statusCode).toBe(404);
  });
  it('test_053: serializeError UnauthorizedError', () => {
    const s = serializeError(new UnauthorizedError());
    expect(s.code).toBe('UNAUTHORIZED');
    expect(s.statusCode).toBe(401);
  });
  it('test_054: serializeError ForbiddenError', () => {
    const s = serializeError(new ForbiddenError());
    expect(s.code).toBe('FORBIDDEN');
    expect(s.statusCode).toBe(403);
  });
  it('test_055: serializeError string', () => {
    const s = serializeError('raw');
    expect(s.message).toBe('raw');
    expect(s.name).toBe('UnknownError');
  });
  it('test_056: serializeError null', () => {
    const s = serializeError(null);
    expect(s.name).toBe('UnknownError');
  });
  it('test_057: serializeError number', () => {
    const s = serializeError(42);
    expect(s.message).toBe('42');
    expect(s.name).toBe('UnknownError');
  });
  it('test_058: serializeError undefined', () => {
    const s = serializeError(undefined);
    expect(s.name).toBe('UnknownError');
  });
  it('test_059: serializeError object', () => {
    const s = serializeError({ message: 'obj' });
    expect(s.name).toBe('UnknownError');
  });
  it('test_060: serializeError AppError without statusCode', () => {
    const e = new AppError('x', 'X');
    const s = serializeError(e);
    expect(s.statusCode).toBeUndefined();
  });
  it('test_061: serializeError returns object with message key variant 61', () => {
    const s = serializeError(new AppError('m61', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_062: serializeError returns object with message key variant 62', () => {
    const s = serializeError(new AppError('m62', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_063: serializeError returns object with message key variant 63', () => {
    const s = serializeError(new AppError('m63', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_064: serializeError returns object with message key variant 64', () => {
    const s = serializeError(new AppError('m64', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_065: serializeError returns object with message key variant 65', () => {
    const s = serializeError(new AppError('m65', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_066: serializeError returns object with message key variant 66', () => {
    const s = serializeError(new AppError('m66', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_067: serializeError returns object with message key variant 67', () => {
    const s = serializeError(new AppError('m67', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_068: serializeError returns object with message key variant 68', () => {
    const s = serializeError(new AppError('m68', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_069: serializeError returns object with message key variant 69', () => {
    const s = serializeError(new AppError('m69', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_070: serializeError returns object with message key variant 70', () => {
    const s = serializeError(new AppError('m70', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_071: serializeError returns object with message key variant 71', () => {
    const s = serializeError(new AppError('m71', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_072: serializeError returns object with message key variant 72', () => {
    const s = serializeError(new AppError('m72', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_073: serializeError returns object with message key variant 73', () => {
    const s = serializeError(new AppError('m73', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_074: serializeError returns object with message key variant 74', () => {
    const s = serializeError(new AppError('m74', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_075: serializeError returns object with message key variant 75', () => {
    const s = serializeError(new AppError('m75', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_076: serializeError returns object with message key variant 76', () => {
    const s = serializeError(new AppError('m76', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_077: serializeError returns object with message key variant 77', () => {
    const s = serializeError(new AppError('m77', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_078: serializeError returns object with message key variant 78', () => {
    const s = serializeError(new AppError('m78', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_079: serializeError returns object with message key variant 79', () => {
    const s = serializeError(new AppError('m79', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_080: serializeError returns object with message key variant 80', () => {
    const s = serializeError(new AppError('m80', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_081: serializeError returns object with message key variant 81', () => {
    const s = serializeError(new AppError('m81', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_082: serializeError returns object with message key variant 82', () => {
    const s = serializeError(new AppError('m82', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_083: serializeError returns object with message key variant 83', () => {
    const s = serializeError(new AppError('m83', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_084: serializeError returns object with message key variant 84', () => {
    const s = serializeError(new AppError('m84', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_085: serializeError returns object with message key variant 85', () => {
    const s = serializeError(new AppError('m85', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_086: serializeError returns object with message key variant 86', () => {
    const s = serializeError(new AppError('m86', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_087: serializeError returns object with message key variant 87', () => {
    const s = serializeError(new AppError('m87', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_088: serializeError returns object with message key variant 88', () => {
    const s = serializeError(new AppError('m88', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_089: serializeError returns object with message key variant 89', () => {
    const s = serializeError(new AppError('m89', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_090: serializeError returns object with message key variant 90', () => {
    const s = serializeError(new AppError('m90', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_091: serializeError returns object with message key variant 91', () => {
    const s = serializeError(new AppError('m91', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_092: serializeError returns object with message key variant 92', () => {
    const s = serializeError(new AppError('m92', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_093: serializeError returns object with message key variant 93', () => {
    const s = serializeError(new AppError('m93', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_094: serializeError returns object with message key variant 94', () => {
    const s = serializeError(new AppError('m94', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_095: serializeError returns object with message key variant 95', () => {
    const s = serializeError(new AppError('m95', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_096: serializeError returns object with message key variant 96', () => {
    const s = serializeError(new AppError('m96', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_097: serializeError returns object with message key variant 97', () => {
    const s = serializeError(new AppError('m97', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_098: serializeError returns object with message key variant 98', () => {
    const s = serializeError(new AppError('m98', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_099: serializeError returns object with message key variant 99', () => {
    const s = serializeError(new AppError('m99', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
  it('test_100: serializeError returns object with message key variant 100', () => {
    const s = serializeError(new AppError('m100', 'C'));
    expect(typeof s.message).toBe('string');
    expect(typeof s.name).toBe('string');
  });
});

describe('toError / wrapError / createError / isErrorCode', () => {
  it('test_001: toError from Error passes through', () => {
    const e = new Error('pass1');
    expect(toError(e)).toBe(e);
  });
  it('test_002: toError from Error passes through', () => {
    const e = new Error('pass2');
    expect(toError(e)).toBe(e);
  });
  it('test_003: toError from Error passes through', () => {
    const e = new Error('pass3');
    expect(toError(e)).toBe(e);
  });
  it('test_004: toError from Error passes through', () => {
    const e = new Error('pass4');
    expect(toError(e)).toBe(e);
  });
  it('test_005: toError from Error passes through', () => {
    const e = new Error('pass5');
    expect(toError(e)).toBe(e);
  });
  it('test_006: toError from Error passes through', () => {
    const e = new Error('pass6');
    expect(toError(e)).toBe(e);
  });
  it('test_007: toError from Error passes through', () => {
    const e = new Error('pass7');
    expect(toError(e)).toBe(e);
  });
  it('test_008: toError from Error passes through', () => {
    const e = new Error('pass8');
    expect(toError(e)).toBe(e);
  });
  it('test_009: toError from Error passes through', () => {
    const e = new Error('pass9');
    expect(toError(e)).toBe(e);
  });
  it('test_010: toError from Error passes through', () => {
    const e = new Error('pass10');
    expect(toError(e)).toBe(e);
  });
  it('test_011: toError from Error passes through', () => {
    const e = new Error('pass11');
    expect(toError(e)).toBe(e);
  });
  it('test_012: toError from Error passes through', () => {
    const e = new Error('pass12');
    expect(toError(e)).toBe(e);
  });
  it('test_013: toError from Error passes through', () => {
    const e = new Error('pass13');
    expect(toError(e)).toBe(e);
  });
  it('test_014: toError from Error passes through', () => {
    const e = new Error('pass14');
    expect(toError(e)).toBe(e);
  });
  it('test_015: toError from Error passes through', () => {
    const e = new Error('pass15');
    expect(toError(e)).toBe(e);
  });
  it('test_016: toError from Error passes through', () => {
    const e = new Error('pass16');
    expect(toError(e)).toBe(e);
  });
  it('test_017: toError from Error passes through', () => {
    const e = new Error('pass17');
    expect(toError(e)).toBe(e);
  });
  it('test_018: toError from Error passes through', () => {
    const e = new Error('pass18');
    expect(toError(e)).toBe(e);
  });
  it('test_019: toError from Error passes through', () => {
    const e = new Error('pass19');
    expect(toError(e)).toBe(e);
  });
  it('test_020: toError from Error passes through', () => {
    const e = new Error('pass20');
    expect(toError(e)).toBe(e);
  });
  it('test_021: toError from string creates Error', () => {
    const e = toError('str21');
    expect(e instanceof Error).toBe(true);
    expect(e.message).toBe('str21');
  });
  it('test_022: toError from string creates Error', () => {
    const e = toError('str22');
    expect(e instanceof Error).toBe(true);
    expect(e.message).toBe('str22');
  });
  it('test_023: toError from string creates Error', () => {
    const e = toError('str23');
    expect(e instanceof Error).toBe(true);
    expect(e.message).toBe('str23');
  });
  it('test_024: toError from string creates Error', () => {
    const e = toError('str24');
    expect(e instanceof Error).toBe(true);
    expect(e.message).toBe('str24');
  });
  it('test_025: toError from string creates Error', () => {
    const e = toError('str25');
    expect(e instanceof Error).toBe(true);
    expect(e.message).toBe('str25');
  });
  it('test_026: toError from string creates Error', () => {
    const e = toError('str26');
    expect(e instanceof Error).toBe(true);
    expect(e.message).toBe('str26');
  });
  it('test_027: toError from string creates Error', () => {
    const e = toError('str27');
    expect(e instanceof Error).toBe(true);
    expect(e.message).toBe('str27');
  });
  it('test_028: toError from string creates Error', () => {
    const e = toError('str28');
    expect(e instanceof Error).toBe(true);
    expect(e.message).toBe('str28');
  });
  it('test_029: toError from string creates Error', () => {
    const e = toError('str29');
    expect(e instanceof Error).toBe(true);
    expect(e.message).toBe('str29');
  });
  it('test_030: toError from string creates Error', () => {
    const e = toError('str30');
    expect(e instanceof Error).toBe(true);
    expect(e.message).toBe('str30');
  });
  it('test_031: toError from string creates Error', () => {
    const e = toError('str31');
    expect(e instanceof Error).toBe(true);
    expect(e.message).toBe('str31');
  });
  it('test_032: toError from string creates Error', () => {
    const e = toError('str32');
    expect(e instanceof Error).toBe(true);
    expect(e.message).toBe('str32');
  });
  it('test_033: toError from string creates Error', () => {
    const e = toError('str33');
    expect(e instanceof Error).toBe(true);
    expect(e.message).toBe('str33');
  });
  it('test_034: toError from string creates Error', () => {
    const e = toError('str34');
    expect(e instanceof Error).toBe(true);
    expect(e.message).toBe('str34');
  });
  it('test_035: toError from string creates Error', () => {
    const e = toError('str35');
    expect(e instanceof Error).toBe(true);
    expect(e.message).toBe('str35');
  });
  it('test_036: toError from string creates Error', () => {
    const e = toError('str36');
    expect(e instanceof Error).toBe(true);
    expect(e.message).toBe('str36');
  });
  it('test_037: toError from string creates Error', () => {
    const e = toError('str37');
    expect(e instanceof Error).toBe(true);
    expect(e.message).toBe('str37');
  });
  it('test_038: toError from string creates Error', () => {
    const e = toError('str38');
    expect(e instanceof Error).toBe(true);
    expect(e.message).toBe('str38');
  });
  it('test_039: toError from string creates Error', () => {
    const e = toError('str39');
    expect(e instanceof Error).toBe(true);
    expect(e.message).toBe('str39');
  });
  it('test_040: toError from string creates Error', () => {
    const e = toError('str40');
    expect(e instanceof Error).toBe(true);
    expect(e.message).toBe('str40');
  });
  it('test_041: toError from number', () => {
    const e = toError(42);
    expect(e instanceof Error).toBe(true);
    expect(e.message).toBe('42');
  });
  it('test_042: toError from null', () => {
    const e = toError(null);
    expect(e instanceof Error).toBe(true);
    expect(e.message).toBe('null');
  });
  it('test_043: toError from undefined', () => {
    const e = toError(undefined);
    expect(e instanceof Error).toBe(true);
    expect(e.message).toBe('undefined');
  });
  it('test_044: toError from object with message', () => {
    const e = toError({ message: 'obj msg' });
    expect(e instanceof Error).toBe(true);
    expect(e.message).toBe('obj msg');
  });
  it('test_045: toError from object without message', () => {
    const e = toError({ code: 'C' });
    expect(e instanceof Error).toBe(true);
  });
  it('test_046: toError from boolean', () => {
    const e = toError(true);
    expect(e instanceof Error).toBe(true);
  });
  it('test_047: wrapError wraps correctly-47', () => {
    const orig = new Error('original47');
    const w = wrapError(orig, 'context47');
    expect(w.message).toContain('context47');
    expect(w.message).toContain('original47');
    expect(w instanceof Error).toBe(true);
  });
  it('test_048: wrapError wraps correctly-48', () => {
    const orig = new Error('original48');
    const w = wrapError(orig, 'context48');
    expect(w.message).toContain('context48');
    expect(w.message).toContain('original48');
    expect(w instanceof Error).toBe(true);
  });
  it('test_049: wrapError wraps correctly-49', () => {
    const orig = new Error('original49');
    const w = wrapError(orig, 'context49');
    expect(w.message).toContain('context49');
    expect(w.message).toContain('original49');
    expect(w instanceof Error).toBe(true);
  });
  it('test_050: wrapError wraps correctly-50', () => {
    const orig = new Error('original50');
    const w = wrapError(orig, 'context50');
    expect(w.message).toContain('context50');
    expect(w.message).toContain('original50');
    expect(w instanceof Error).toBe(true);
  });
  it('test_051: wrapError wraps correctly-51', () => {
    const orig = new Error('original51');
    const w = wrapError(orig, 'context51');
    expect(w.message).toContain('context51');
    expect(w.message).toContain('original51');
    expect(w instanceof Error).toBe(true);
  });
  it('test_052: wrapError wraps correctly-52', () => {
    const orig = new Error('original52');
    const w = wrapError(orig, 'context52');
    expect(w.message).toContain('context52');
    expect(w.message).toContain('original52');
    expect(w instanceof Error).toBe(true);
  });
  it('test_053: wrapError wraps correctly-53', () => {
    const orig = new Error('original53');
    const w = wrapError(orig, 'context53');
    expect(w.message).toContain('context53');
    expect(w.message).toContain('original53');
    expect(w instanceof Error).toBe(true);
  });
  it('test_054: wrapError wraps correctly-54', () => {
    const orig = new Error('original54');
    const w = wrapError(orig, 'context54');
    expect(w.message).toContain('context54');
    expect(w.message).toContain('original54');
    expect(w instanceof Error).toBe(true);
  });
  it('test_055: wrapError wraps correctly-55', () => {
    const orig = new Error('original55');
    const w = wrapError(orig, 'context55');
    expect(w.message).toContain('context55');
    expect(w.message).toContain('original55');
    expect(w instanceof Error).toBe(true);
  });
  it('test_056: wrapError wraps correctly-56', () => {
    const orig = new Error('original56');
    const w = wrapError(orig, 'context56');
    expect(w.message).toContain('context56');
    expect(w.message).toContain('original56');
    expect(w instanceof Error).toBe(true);
  });
  it('test_057: wrapError wraps correctly-57', () => {
    const orig = new Error('original57');
    const w = wrapError(orig, 'context57');
    expect(w.message).toContain('context57');
    expect(w.message).toContain('original57');
    expect(w instanceof Error).toBe(true);
  });
  it('test_058: wrapError wraps correctly-58', () => {
    const orig = new Error('original58');
    const w = wrapError(orig, 'context58');
    expect(w.message).toContain('context58');
    expect(w.message).toContain('original58');
    expect(w instanceof Error).toBe(true);
  });
  it('test_059: wrapError wraps correctly-59', () => {
    const orig = new Error('original59');
    const w = wrapError(orig, 'context59');
    expect(w.message).toContain('context59');
    expect(w.message).toContain('original59');
    expect(w instanceof Error).toBe(true);
  });
  it('test_060: wrapError wraps correctly-60', () => {
    const orig = new Error('original60');
    const w = wrapError(orig, 'context60');
    expect(w.message).toContain('context60');
    expect(w.message).toContain('original60');
    expect(w instanceof Error).toBe(true);
  });
  it('test_061: createError produces AppError-61', () => {
    const e = createError('err61', 'CODE_61', 461);
    expect(e instanceof AppError).toBe(true);
    expect(e.message).toBe('err61');
    expect(e.code).toBe('CODE_61');
    expect(e.statusCode).toBe(461);
  });
  it('test_062: createError produces AppError-62', () => {
    const e = createError('err62', 'CODE_62', 462);
    expect(e instanceof AppError).toBe(true);
    expect(e.message).toBe('err62');
    expect(e.code).toBe('CODE_62');
    expect(e.statusCode).toBe(462);
  });
  it('test_063: createError produces AppError-63', () => {
    const e = createError('err63', 'CODE_63', 463);
    expect(e instanceof AppError).toBe(true);
    expect(e.message).toBe('err63');
    expect(e.code).toBe('CODE_63');
    expect(e.statusCode).toBe(463);
  });
  it('test_064: createError produces AppError-64', () => {
    const e = createError('err64', 'CODE_64', 464);
    expect(e instanceof AppError).toBe(true);
    expect(e.message).toBe('err64');
    expect(e.code).toBe('CODE_64');
    expect(e.statusCode).toBe(464);
  });
  it('test_065: createError produces AppError-65', () => {
    const e = createError('err65', 'CODE_65', 465);
    expect(e instanceof AppError).toBe(true);
    expect(e.message).toBe('err65');
    expect(e.code).toBe('CODE_65');
    expect(e.statusCode).toBe(465);
  });
  it('test_066: createError produces AppError-66', () => {
    const e = createError('err66', 'CODE_66', 466);
    expect(e instanceof AppError).toBe(true);
    expect(e.message).toBe('err66');
    expect(e.code).toBe('CODE_66');
    expect(e.statusCode).toBe(466);
  });
  it('test_067: createError produces AppError-67', () => {
    const e = createError('err67', 'CODE_67', 467);
    expect(e instanceof AppError).toBe(true);
    expect(e.message).toBe('err67');
    expect(e.code).toBe('CODE_67');
    expect(e.statusCode).toBe(467);
  });
  it('test_068: createError produces AppError-68', () => {
    const e = createError('err68', 'CODE_68', 468);
    expect(e instanceof AppError).toBe(true);
    expect(e.message).toBe('err68');
    expect(e.code).toBe('CODE_68');
    expect(e.statusCode).toBe(468);
  });
  it('test_069: createError produces AppError-69', () => {
    const e = createError('err69', 'CODE_69', 469);
    expect(e instanceof AppError).toBe(true);
    expect(e.message).toBe('err69');
    expect(e.code).toBe('CODE_69');
    expect(e.statusCode).toBe(469);
  });
  it('test_070: createError produces AppError-70', () => {
    const e = createError('err70', 'CODE_70', 470);
    expect(e instanceof AppError).toBe(true);
    expect(e.message).toBe('err70');
    expect(e.code).toBe('CODE_70');
    expect(e.statusCode).toBe(470);
  });
  it('test_071: createError produces AppError-71', () => {
    const e = createError('err71', 'CODE_71', 471);
    expect(e instanceof AppError).toBe(true);
    expect(e.message).toBe('err71');
    expect(e.code).toBe('CODE_71');
    expect(e.statusCode).toBe(471);
  });
  it('test_072: createError produces AppError-72', () => {
    const e = createError('err72', 'CODE_72', 472);
    expect(e instanceof AppError).toBe(true);
    expect(e.message).toBe('err72');
    expect(e.code).toBe('CODE_72');
    expect(e.statusCode).toBe(472);
  });
  it('test_073: createError produces AppError-73', () => {
    const e = createError('err73', 'CODE_73', 473);
    expect(e instanceof AppError).toBe(true);
    expect(e.message).toBe('err73');
    expect(e.code).toBe('CODE_73');
    expect(e.statusCode).toBe(473);
  });
  it('test_074: createError produces AppError-74', () => {
    const e = createError('err74', 'CODE_74', 474);
    expect(e instanceof AppError).toBe(true);
    expect(e.message).toBe('err74');
    expect(e.code).toBe('CODE_74');
    expect(e.statusCode).toBe(474);
  });
  it('test_075: createError produces AppError-75', () => {
    const e = createError('err75', 'CODE_75', 475);
    expect(e instanceof AppError).toBe(true);
    expect(e.message).toBe('err75');
    expect(e.code).toBe('CODE_75');
    expect(e.statusCode).toBe(475);
  });
  it('test_076: createError produces AppError-76', () => {
    const e = createError('err76', 'CODE_76', 476);
    expect(e instanceof AppError).toBe(true);
    expect(e.message).toBe('err76');
    expect(e.code).toBe('CODE_76');
    expect(e.statusCode).toBe(476);
  });
  it('test_077: createError produces AppError-77', () => {
    const e = createError('err77', 'CODE_77', 477);
    expect(e instanceof AppError).toBe(true);
    expect(e.message).toBe('err77');
    expect(e.code).toBe('CODE_77');
    expect(e.statusCode).toBe(477);
  });
  it('test_078: createError produces AppError-78', () => {
    const e = createError('err78', 'CODE_78', 478);
    expect(e instanceof AppError).toBe(true);
    expect(e.message).toBe('err78');
    expect(e.code).toBe('CODE_78');
    expect(e.statusCode).toBe(478);
  });
  it('test_079: createError produces AppError-79', () => {
    const e = createError('err79', 'CODE_79', 479);
    expect(e instanceof AppError).toBe(true);
    expect(e.message).toBe('err79');
    expect(e.code).toBe('CODE_79');
    expect(e.statusCode).toBe(479);
  });
  it('test_080: createError produces AppError-80', () => {
    const e = createError('err80', 'CODE_80', 480);
    expect(e instanceof AppError).toBe(true);
    expect(e.message).toBe('err80');
    expect(e.code).toBe('CODE_80');
    expect(e.statusCode).toBe(480);
  });
  it('test_081: createError default code is UNKNOWN', () => {
    const e = createError('no code');
    expect(e.code).toBe('UNKNOWN');
  });
  it('test_082: createError without statusCode', () => {
    const e = createError('x', 'C');
    expect(e.statusCode).toBeUndefined();
  });
  it('test_083: isErrorCode variant-83', () => {
    const e = new AppError('m', 'CODE_83');
    expect(isErrorCode(e, 'CODE_83')).toBe(true);
    expect(isErrorCode(e, 'WRONG')).toBe(false);
  });
  it('test_084: isErrorCode variant-84', () => {
    const e = new AppError('m', 'CODE_84');
    expect(isErrorCode(e, 'CODE_84')).toBe(true);
    expect(isErrorCode(e, 'WRONG')).toBe(false);
  });
  it('test_085: isErrorCode variant-85', () => {
    const e = new AppError('m', 'CODE_85');
    expect(isErrorCode(e, 'CODE_85')).toBe(true);
    expect(isErrorCode(e, 'WRONG')).toBe(false);
  });
  it('test_086: isErrorCode variant-86', () => {
    const e = new AppError('m', 'CODE_86');
    expect(isErrorCode(e, 'CODE_86')).toBe(true);
    expect(isErrorCode(e, 'WRONG')).toBe(false);
  });
  it('test_087: isErrorCode variant-87', () => {
    const e = new AppError('m', 'CODE_87');
    expect(isErrorCode(e, 'CODE_87')).toBe(true);
    expect(isErrorCode(e, 'WRONG')).toBe(false);
  });
  it('test_088: isErrorCode variant-88', () => {
    const e = new AppError('m', 'CODE_88');
    expect(isErrorCode(e, 'CODE_88')).toBe(true);
    expect(isErrorCode(e, 'WRONG')).toBe(false);
  });
  it('test_089: isErrorCode variant-89', () => {
    const e = new AppError('m', 'CODE_89');
    expect(isErrorCode(e, 'CODE_89')).toBe(true);
    expect(isErrorCode(e, 'WRONG')).toBe(false);
  });
  it('test_090: isErrorCode variant-90', () => {
    const e = new AppError('m', 'CODE_90');
    expect(isErrorCode(e, 'CODE_90')).toBe(true);
    expect(isErrorCode(e, 'WRONG')).toBe(false);
  });
  it('test_091: isErrorCode variant-91', () => {
    const e = new AppError('m', 'CODE_91');
    expect(isErrorCode(e, 'CODE_91')).toBe(true);
    expect(isErrorCode(e, 'WRONG')).toBe(false);
  });
  it('test_092: isErrorCode variant-92', () => {
    const e = new AppError('m', 'CODE_92');
    expect(isErrorCode(e, 'CODE_92')).toBe(true);
    expect(isErrorCode(e, 'WRONG')).toBe(false);
  });
  it('test_093: isErrorCode variant-93', () => {
    const e = new AppError('m', 'CODE_93');
    expect(isErrorCode(e, 'CODE_93')).toBe(true);
    expect(isErrorCode(e, 'WRONG')).toBe(false);
  });
  it('test_094: isErrorCode variant-94', () => {
    const e = new AppError('m', 'CODE_94');
    expect(isErrorCode(e, 'CODE_94')).toBe(true);
    expect(isErrorCode(e, 'WRONG')).toBe(false);
  });
  it('test_095: isErrorCode variant-95', () => {
    const e = new AppError('m', 'CODE_95');
    expect(isErrorCode(e, 'CODE_95')).toBe(true);
    expect(isErrorCode(e, 'WRONG')).toBe(false);
  });
  it('test_096: isErrorCode variant-96', () => {
    const e = new AppError('m', 'CODE_96');
    expect(isErrorCode(e, 'CODE_96')).toBe(true);
    expect(isErrorCode(e, 'WRONG')).toBe(false);
  });
  it('test_097: isErrorCode variant-97', () => {
    const e = new AppError('m', 'CODE_97');
    expect(isErrorCode(e, 'CODE_97')).toBe(true);
    expect(isErrorCode(e, 'WRONG')).toBe(false);
  });
  it('test_098: isErrorCode variant-98', () => {
    const e = new AppError('m', 'CODE_98');
    expect(isErrorCode(e, 'CODE_98')).toBe(true);
    expect(isErrorCode(e, 'WRONG')).toBe(false);
  });
  it('test_099: isErrorCode variant-99', () => {
    const e = new AppError('m', 'CODE_99');
    expect(isErrorCode(e, 'CODE_99')).toBe(true);
    expect(isErrorCode(e, 'WRONG')).toBe(false);
  });
  it('test_100: isErrorCode variant-100', () => {
    const e = new AppError('m', 'CODE_100');
    expect(isErrorCode(e, 'CODE_100')).toBe(true);
    expect(isErrorCode(e, 'WRONG')).toBe(false);
  });
  it('test_101: isErrorCode false for plain Error', () => {
    expect(isErrorCode(new Error('x'), 'ANY')).toBe(false);
  });
  it('test_102: isErrorCode false for string error', () => {
    expect(isErrorCode('err', 'ANY')).toBe(false);
  });
});

describe('combineErrors / collectErrors / assertNoErrors', () => {
  it('test_001: combineErrors with 2 errors', () => {
    const combined = combineErrors([new Error('e0'), new Error('e1')]);
    expect(combined instanceof Error).toBe(true);
    expect(combined.message).toContain('e0');
    expect(combined.message).toContain('e1');
  });
  it('test_002: combineErrors with 3 errors', () => {
    const combined = combineErrors([new Error('e0'), new Error('e1'), new Error('e2')]);
    expect(combined instanceof Error).toBe(true);
    expect(combined.message).toContain('e0');
    expect(combined.message).toContain('e1');
    expect(combined.message).toContain('e2');
  });
  it('test_003: combineErrors with 4 errors', () => {
    const combined = combineErrors([new Error('e0'), new Error('e1'), new Error('e2'), new Error('e3')]);
    expect(combined instanceof Error).toBe(true);
    expect(combined.message).toContain('e0');
    expect(combined.message).toContain('e1');
    expect(combined.message).toContain('e2');
    expect(combined.message).toContain('e3');
  });
  it('test_004: combineErrors with 5 errors', () => {
    const combined = combineErrors([new Error('e0'), new Error('e1'), new Error('e2'), new Error('e3'), new Error('e4')]);
    expect(combined instanceof Error).toBe(true);
    expect(combined.message).toContain('e0');
    expect(combined.message).toContain('e1');
    expect(combined.message).toContain('e2');
    expect(combined.message).toContain('e3');
    expect(combined.message).toContain('e4');
  });
  it('test_005: combineErrors with 6 errors', () => {
    const combined = combineErrors([new Error('e0'), new Error('e1'), new Error('e2'), new Error('e3'), new Error('e4'), new Error('e5')]);
    expect(combined instanceof Error).toBe(true);
    expect(combined.message).toContain('e0');
    expect(combined.message).toContain('e1');
    expect(combined.message).toContain('e2');
    expect(combined.message).toContain('e3');
    expect(combined.message).toContain('e4');
    expect(combined.message).toContain('e5');
  });
  it('test_006: combineErrors with 7 errors', () => {
    const combined = combineErrors([new Error('e0'), new Error('e1'), new Error('e2'), new Error('e3'), new Error('e4'), new Error('e5'), new Error('e6')]);
    expect(combined instanceof Error).toBe(true);
    expect(combined.message).toContain('e0');
    expect(combined.message).toContain('e1');
    expect(combined.message).toContain('e2');
    expect(combined.message).toContain('e3');
    expect(combined.message).toContain('e4');
    expect(combined.message).toContain('e5');
    expect(combined.message).toContain('e6');
  });
  it('test_007: combineErrors with 8 errors', () => {
    const combined = combineErrors([new Error('e0'), new Error('e1'), new Error('e2'), new Error('e3'), new Error('e4'), new Error('e5'), new Error('e6'), new Error('e7')]);
    expect(combined instanceof Error).toBe(true);
    expect(combined.message).toContain('e0');
    expect(combined.message).toContain('e1');
    expect(combined.message).toContain('e2');
    expect(combined.message).toContain('e3');
    expect(combined.message).toContain('e4');
    expect(combined.message).toContain('e5');
    expect(combined.message).toContain('e6');
    expect(combined.message).toContain('e7');
  });
  it('test_008: combineErrors with 9 errors', () => {
    const combined = combineErrors([new Error('e0'), new Error('e1'), new Error('e2'), new Error('e3'), new Error('e4'), new Error('e5'), new Error('e6'), new Error('e7'), new Error('e8')]);
    expect(combined instanceof Error).toBe(true);
    expect(combined.message).toContain('e0');
    expect(combined.message).toContain('e1');
    expect(combined.message).toContain('e2');
    expect(combined.message).toContain('e3');
    expect(combined.message).toContain('e4');
    expect(combined.message).toContain('e5');
    expect(combined.message).toContain('e6');
    expect(combined.message).toContain('e7');
    expect(combined.message).toContain('e8');
  });
  it('test_009: combineErrors with 10 errors', () => {
    const combined = combineErrors([new Error('e0'), new Error('e1'), new Error('e2'), new Error('e3'), new Error('e4'), new Error('e5'), new Error('e6'), new Error('e7'), new Error('e8'), new Error('e9')]);
    expect(combined instanceof Error).toBe(true);
    expect(combined.message).toContain('e0');
    expect(combined.message).toContain('e1');
    expect(combined.message).toContain('e2');
    expect(combined.message).toContain('e3');
    expect(combined.message).toContain('e4');
    expect(combined.message).toContain('e5');
    expect(combined.message).toContain('e6');
    expect(combined.message).toContain('e7');
    expect(combined.message).toContain('e8');
    expect(combined.message).toContain('e9');
  });
  it('test_010: combineErrors with 11 errors', () => {
    const combined = combineErrors([new Error('e0'), new Error('e1'), new Error('e2'), new Error('e3'), new Error('e4'), new Error('e5'), new Error('e6'), new Error('e7'), new Error('e8'), new Error('e9'), new Error('e10')]);
    expect(combined instanceof Error).toBe(true);
    expect(combined.message).toContain('e0');
    expect(combined.message).toContain('e1');
    expect(combined.message).toContain('e2');
    expect(combined.message).toContain('e3');
    expect(combined.message).toContain('e4');
    expect(combined.message).toContain('e5');
    expect(combined.message).toContain('e6');
    expect(combined.message).toContain('e7');
    expect(combined.message).toContain('e8');
    expect(combined.message).toContain('e9');
    expect(combined.message).toContain('e10');
  });
  it('test_011: combineErrors with 12 errors', () => {
    const combined = combineErrors([new Error('e0'), new Error('e1'), new Error('e2'), new Error('e3'), new Error('e4'), new Error('e5'), new Error('e6'), new Error('e7'), new Error('e8'), new Error('e9'), new Error('e10'), new Error('e11')]);
    expect(combined instanceof Error).toBe(true);
    expect(combined.message).toContain('e0');
    expect(combined.message).toContain('e1');
    expect(combined.message).toContain('e2');
    expect(combined.message).toContain('e3');
    expect(combined.message).toContain('e4');
    expect(combined.message).toContain('e5');
    expect(combined.message).toContain('e6');
    expect(combined.message).toContain('e7');
    expect(combined.message).toContain('e8');
    expect(combined.message).toContain('e9');
    expect(combined.message).toContain('e10');
    expect(combined.message).toContain('e11');
  });
  it('test_012: combineErrors with 13 errors', () => {
    const combined = combineErrors([new Error('e0'), new Error('e1'), new Error('e2'), new Error('e3'), new Error('e4'), new Error('e5'), new Error('e6'), new Error('e7'), new Error('e8'), new Error('e9'), new Error('e10'), new Error('e11'), new Error('e12')]);
    expect(combined instanceof Error).toBe(true);
    expect(combined.message).toContain('e0');
    expect(combined.message).toContain('e1');
    expect(combined.message).toContain('e2');
    expect(combined.message).toContain('e3');
    expect(combined.message).toContain('e4');
    expect(combined.message).toContain('e5');
    expect(combined.message).toContain('e6');
    expect(combined.message).toContain('e7');
    expect(combined.message).toContain('e8');
    expect(combined.message).toContain('e9');
    expect(combined.message).toContain('e10');
    expect(combined.message).toContain('e11');
    expect(combined.message).toContain('e12');
  });
  it('test_013: combineErrors with 14 errors', () => {
    const combined = combineErrors([new Error('e0'), new Error('e1'), new Error('e2'), new Error('e3'), new Error('e4'), new Error('e5'), new Error('e6'), new Error('e7'), new Error('e8'), new Error('e9'), new Error('e10'), new Error('e11'), new Error('e12'), new Error('e13')]);
    expect(combined instanceof Error).toBe(true);
    expect(combined.message).toContain('e0');
    expect(combined.message).toContain('e1');
    expect(combined.message).toContain('e2');
    expect(combined.message).toContain('e3');
    expect(combined.message).toContain('e4');
    expect(combined.message).toContain('e5');
    expect(combined.message).toContain('e6');
    expect(combined.message).toContain('e7');
    expect(combined.message).toContain('e8');
    expect(combined.message).toContain('e9');
    expect(combined.message).toContain('e10');
    expect(combined.message).toContain('e11');
    expect(combined.message).toContain('e12');
    expect(combined.message).toContain('e13');
  });
  it('test_014: combineErrors with 15 errors', () => {
    const combined = combineErrors([new Error('e0'), new Error('e1'), new Error('e2'), new Error('e3'), new Error('e4'), new Error('e5'), new Error('e6'), new Error('e7'), new Error('e8'), new Error('e9'), new Error('e10'), new Error('e11'), new Error('e12'), new Error('e13'), new Error('e14')]);
    expect(combined instanceof Error).toBe(true);
    expect(combined.message).toContain('e0');
    expect(combined.message).toContain('e1');
    expect(combined.message).toContain('e2');
    expect(combined.message).toContain('e3');
    expect(combined.message).toContain('e4');
    expect(combined.message).toContain('e5');
    expect(combined.message).toContain('e6');
    expect(combined.message).toContain('e7');
    expect(combined.message).toContain('e8');
    expect(combined.message).toContain('e9');
    expect(combined.message).toContain('e10');
    expect(combined.message).toContain('e11');
    expect(combined.message).toContain('e12');
    expect(combined.message).toContain('e13');
    expect(combined.message).toContain('e14');
  });
  it('test_015: combineErrors with 16 errors', () => {
    const combined = combineErrors([new Error('e0'), new Error('e1'), new Error('e2'), new Error('e3'), new Error('e4'), new Error('e5'), new Error('e6'), new Error('e7'), new Error('e8'), new Error('e9'), new Error('e10'), new Error('e11'), new Error('e12'), new Error('e13'), new Error('e14'), new Error('e15')]);
    expect(combined instanceof Error).toBe(true);
    expect(combined.message).toContain('e0');
    expect(combined.message).toContain('e1');
    expect(combined.message).toContain('e2');
    expect(combined.message).toContain('e3');
    expect(combined.message).toContain('e4');
    expect(combined.message).toContain('e5');
    expect(combined.message).toContain('e6');
    expect(combined.message).toContain('e7');
    expect(combined.message).toContain('e8');
    expect(combined.message).toContain('e9');
    expect(combined.message).toContain('e10');
    expect(combined.message).toContain('e11');
    expect(combined.message).toContain('e12');
    expect(combined.message).toContain('e13');
    expect(combined.message).toContain('e14');
    expect(combined.message).toContain('e15');
  });
  it('test_016: combineErrors with 17 errors', () => {
    const combined = combineErrors([new Error('e0'), new Error('e1'), new Error('e2'), new Error('e3'), new Error('e4'), new Error('e5'), new Error('e6'), new Error('e7'), new Error('e8'), new Error('e9'), new Error('e10'), new Error('e11'), new Error('e12'), new Error('e13'), new Error('e14'), new Error('e15'), new Error('e16')]);
    expect(combined instanceof Error).toBe(true);
    expect(combined.message).toContain('e0');
    expect(combined.message).toContain('e1');
    expect(combined.message).toContain('e2');
    expect(combined.message).toContain('e3');
    expect(combined.message).toContain('e4');
    expect(combined.message).toContain('e5');
    expect(combined.message).toContain('e6');
    expect(combined.message).toContain('e7');
    expect(combined.message).toContain('e8');
    expect(combined.message).toContain('e9');
    expect(combined.message).toContain('e10');
    expect(combined.message).toContain('e11');
    expect(combined.message).toContain('e12');
    expect(combined.message).toContain('e13');
    expect(combined.message).toContain('e14');
    expect(combined.message).toContain('e15');
    expect(combined.message).toContain('e16');
  });
  it('test_017: combineErrors with 18 errors', () => {
    const combined = combineErrors([new Error('e0'), new Error('e1'), new Error('e2'), new Error('e3'), new Error('e4'), new Error('e5'), new Error('e6'), new Error('e7'), new Error('e8'), new Error('e9'), new Error('e10'), new Error('e11'), new Error('e12'), new Error('e13'), new Error('e14'), new Error('e15'), new Error('e16'), new Error('e17')]);
    expect(combined instanceof Error).toBe(true);
    expect(combined.message).toContain('e0');
    expect(combined.message).toContain('e1');
    expect(combined.message).toContain('e2');
    expect(combined.message).toContain('e3');
    expect(combined.message).toContain('e4');
    expect(combined.message).toContain('e5');
    expect(combined.message).toContain('e6');
    expect(combined.message).toContain('e7');
    expect(combined.message).toContain('e8');
    expect(combined.message).toContain('e9');
    expect(combined.message).toContain('e10');
    expect(combined.message).toContain('e11');
    expect(combined.message).toContain('e12');
    expect(combined.message).toContain('e13');
    expect(combined.message).toContain('e14');
    expect(combined.message).toContain('e15');
    expect(combined.message).toContain('e16');
    expect(combined.message).toContain('e17');
  });
  it('test_018: combineErrors with 19 errors', () => {
    const combined = combineErrors([new Error('e0'), new Error('e1'), new Error('e2'), new Error('e3'), new Error('e4'), new Error('e5'), new Error('e6'), new Error('e7'), new Error('e8'), new Error('e9'), new Error('e10'), new Error('e11'), new Error('e12'), new Error('e13'), new Error('e14'), new Error('e15'), new Error('e16'), new Error('e17'), new Error('e18')]);
    expect(combined instanceof Error).toBe(true);
    expect(combined.message).toContain('e0');
    expect(combined.message).toContain('e1');
    expect(combined.message).toContain('e2');
    expect(combined.message).toContain('e3');
    expect(combined.message).toContain('e4');
    expect(combined.message).toContain('e5');
    expect(combined.message).toContain('e6');
    expect(combined.message).toContain('e7');
    expect(combined.message).toContain('e8');
    expect(combined.message).toContain('e9');
    expect(combined.message).toContain('e10');
    expect(combined.message).toContain('e11');
    expect(combined.message).toContain('e12');
    expect(combined.message).toContain('e13');
    expect(combined.message).toContain('e14');
    expect(combined.message).toContain('e15');
    expect(combined.message).toContain('e16');
    expect(combined.message).toContain('e17');
    expect(combined.message).toContain('e18');
  });
  it('test_019: combineErrors with 20 errors', () => {
    const combined = combineErrors([new Error('e0'), new Error('e1'), new Error('e2'), new Error('e3'), new Error('e4'), new Error('e5'), new Error('e6'), new Error('e7'), new Error('e8'), new Error('e9'), new Error('e10'), new Error('e11'), new Error('e12'), new Error('e13'), new Error('e14'), new Error('e15'), new Error('e16'), new Error('e17'), new Error('e18'), new Error('e19')]);
    expect(combined instanceof Error).toBe(true);
    expect(combined.message).toContain('e0');
    expect(combined.message).toContain('e1');
    expect(combined.message).toContain('e2');
    expect(combined.message).toContain('e3');
    expect(combined.message).toContain('e4');
    expect(combined.message).toContain('e5');
    expect(combined.message).toContain('e6');
    expect(combined.message).toContain('e7');
    expect(combined.message).toContain('e8');
    expect(combined.message).toContain('e9');
    expect(combined.message).toContain('e10');
    expect(combined.message).toContain('e11');
    expect(combined.message).toContain('e12');
    expect(combined.message).toContain('e13');
    expect(combined.message).toContain('e14');
    expect(combined.message).toContain('e15');
    expect(combined.message).toContain('e16');
    expect(combined.message).toContain('e17');
    expect(combined.message).toContain('e18');
    expect(combined.message).toContain('e19');
  });
  it('test_020: combineErrors with 21 errors', () => {
    const combined = combineErrors([new Error('e0'), new Error('e1'), new Error('e2'), new Error('e3'), new Error('e4'), new Error('e5'), new Error('e6'), new Error('e7'), new Error('e8'), new Error('e9'), new Error('e10'), new Error('e11'), new Error('e12'), new Error('e13'), new Error('e14'), new Error('e15'), new Error('e16'), new Error('e17'), new Error('e18'), new Error('e19'), new Error('e20')]);
    expect(combined instanceof Error).toBe(true);
    expect(combined.message).toContain('e0');
    expect(combined.message).toContain('e1');
    expect(combined.message).toContain('e2');
    expect(combined.message).toContain('e3');
    expect(combined.message).toContain('e4');
    expect(combined.message).toContain('e5');
    expect(combined.message).toContain('e6');
    expect(combined.message).toContain('e7');
    expect(combined.message).toContain('e8');
    expect(combined.message).toContain('e9');
    expect(combined.message).toContain('e10');
    expect(combined.message).toContain('e11');
    expect(combined.message).toContain('e12');
    expect(combined.message).toContain('e13');
    expect(combined.message).toContain('e14');
    expect(combined.message).toContain('e15');
    expect(combined.message).toContain('e16');
    expect(combined.message).toContain('e17');
    expect(combined.message).toContain('e18');
    expect(combined.message).toContain('e19');
    expect(combined.message).toContain('e20');
  });
  it('test_021: combineErrors with 1 error returns same error', () => {
    const e = new Error('solo');
    expect(combineErrors([e])).toBe(e);
  });
  it('test_022: combineErrors with empty array', () => {
    const c = combineErrors([]);
    expect(c instanceof Error).toBe(true);
    expect(c.message).toBe('No errors');
  });
  it('test_023: combineErrors message separates by semicolons', () => {
    const c = combineErrors([new Error('a'), new Error('b')]);
    expect(c.message).toContain('; ');
  });
  it('test_024: collectErrors with success-24', () => {
    const r = collectErrors(() => 24 * 2);
    expect(r.result).toBe(48);
    expect(r.errors).toHaveLength(0);
  });
  it('test_025: collectErrors with success-25', () => {
    const r = collectErrors(() => 25 * 2);
    expect(r.result).toBe(50);
    expect(r.errors).toHaveLength(0);
  });
  it('test_026: collectErrors with success-26', () => {
    const r = collectErrors(() => 26 * 2);
    expect(r.result).toBe(52);
    expect(r.errors).toHaveLength(0);
  });
  it('test_027: collectErrors with success-27', () => {
    const r = collectErrors(() => 27 * 2);
    expect(r.result).toBe(54);
    expect(r.errors).toHaveLength(0);
  });
  it('test_028: collectErrors with success-28', () => {
    const r = collectErrors(() => 28 * 2);
    expect(r.result).toBe(56);
    expect(r.errors).toHaveLength(0);
  });
  it('test_029: collectErrors with success-29', () => {
    const r = collectErrors(() => 29 * 2);
    expect(r.result).toBe(58);
    expect(r.errors).toHaveLength(0);
  });
  it('test_030: collectErrors with success-30', () => {
    const r = collectErrors(() => 30 * 2);
    expect(r.result).toBe(60);
    expect(r.errors).toHaveLength(0);
  });
  it('test_031: collectErrors with success-31', () => {
    const r = collectErrors(() => 31 * 2);
    expect(r.result).toBe(62);
    expect(r.errors).toHaveLength(0);
  });
  it('test_032: collectErrors with success-32', () => {
    const r = collectErrors(() => 32 * 2);
    expect(r.result).toBe(64);
    expect(r.errors).toHaveLength(0);
  });
  it('test_033: collectErrors with success-33', () => {
    const r = collectErrors(() => 33 * 2);
    expect(r.result).toBe(66);
    expect(r.errors).toHaveLength(0);
  });
  it('test_034: collectErrors with success-34', () => {
    const r = collectErrors(() => 34 * 2);
    expect(r.result).toBe(68);
    expect(r.errors).toHaveLength(0);
  });
  it('test_035: collectErrors with success-35', () => {
    const r = collectErrors(() => 35 * 2);
    expect(r.result).toBe(70);
    expect(r.errors).toHaveLength(0);
  });
  it('test_036: collectErrors with success-36', () => {
    const r = collectErrors(() => 36 * 2);
    expect(r.result).toBe(72);
    expect(r.errors).toHaveLength(0);
  });
  it('test_037: collectErrors with success-37', () => {
    const r = collectErrors(() => 37 * 2);
    expect(r.result).toBe(74);
    expect(r.errors).toHaveLength(0);
  });
  it('test_038: collectErrors with success-38', () => {
    const r = collectErrors(() => 38 * 2);
    expect(r.result).toBe(76);
    expect(r.errors).toHaveLength(0);
  });
  it('test_039: collectErrors with success-39', () => {
    const r = collectErrors(() => 39 * 2);
    expect(r.result).toBe(78);
    expect(r.errors).toHaveLength(0);
  });
  it('test_040: collectErrors with success-40', () => {
    const r = collectErrors(() => 40 * 2);
    expect(r.result).toBe(80);
    expect(r.errors).toHaveLength(0);
  });
  it('test_041: collectErrors captures throw-41', () => {
    const r = collectErrors(() => { throw new Error('thrown41'); });
    expect(r.result).toBeUndefined();
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0].message).toBe('thrown41');
  });
  it('test_042: collectErrors captures throw-42', () => {
    const r = collectErrors(() => { throw new Error('thrown42'); });
    expect(r.result).toBeUndefined();
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0].message).toBe('thrown42');
  });
  it('test_043: collectErrors captures throw-43', () => {
    const r = collectErrors(() => { throw new Error('thrown43'); });
    expect(r.result).toBeUndefined();
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0].message).toBe('thrown43');
  });
  it('test_044: collectErrors captures throw-44', () => {
    const r = collectErrors(() => { throw new Error('thrown44'); });
    expect(r.result).toBeUndefined();
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0].message).toBe('thrown44');
  });
  it('test_045: collectErrors captures throw-45', () => {
    const r = collectErrors(() => { throw new Error('thrown45'); });
    expect(r.result).toBeUndefined();
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0].message).toBe('thrown45');
  });
  it('test_046: collectErrors captures throw-46', () => {
    const r = collectErrors(() => { throw new Error('thrown46'); });
    expect(r.result).toBeUndefined();
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0].message).toBe('thrown46');
  });
  it('test_047: collectErrors captures throw-47', () => {
    const r = collectErrors(() => { throw new Error('thrown47'); });
    expect(r.result).toBeUndefined();
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0].message).toBe('thrown47');
  });
  it('test_048: collectErrors captures throw-48', () => {
    const r = collectErrors(() => { throw new Error('thrown48'); });
    expect(r.result).toBeUndefined();
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0].message).toBe('thrown48');
  });
  it('test_049: collectErrors captures throw-49', () => {
    const r = collectErrors(() => { throw new Error('thrown49'); });
    expect(r.result).toBeUndefined();
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0].message).toBe('thrown49');
  });
  it('test_050: collectErrors captures throw-50', () => {
    const r = collectErrors(() => { throw new Error('thrown50'); });
    expect(r.result).toBeUndefined();
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0].message).toBe('thrown50');
  });
  it('test_051: collectErrors captures throw-51', () => {
    const r = collectErrors(() => { throw new Error('thrown51'); });
    expect(r.result).toBeUndefined();
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0].message).toBe('thrown51');
  });
  it('test_052: collectErrors captures throw-52', () => {
    const r = collectErrors(() => { throw new Error('thrown52'); });
    expect(r.result).toBeUndefined();
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0].message).toBe('thrown52');
  });
  it('test_053: collectErrors captures throw-53', () => {
    const r = collectErrors(() => { throw new Error('thrown53'); });
    expect(r.result).toBeUndefined();
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0].message).toBe('thrown53');
  });
  it('test_054: collectErrors captures throw-54', () => {
    const r = collectErrors(() => { throw new Error('thrown54'); });
    expect(r.result).toBeUndefined();
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0].message).toBe('thrown54');
  });
  it('test_055: collectErrors captures throw-55', () => {
    const r = collectErrors(() => { throw new Error('thrown55'); });
    expect(r.result).toBeUndefined();
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0].message).toBe('thrown55');
  });
  it('test_056: collectErrors captures non-Error throw', () => {
    const r = collectErrors(() => { throw 'string error'; });
    expect(r.errors[0].message).toBe('string error');
  });
  it('test_057: assertNoErrors with empty array does not throw', () => {
    expect(() => assertNoErrors([])).not.toThrow();
  });
  it('test_058: assertNoErrors with one error throws', () => {
    expect(() => assertNoErrors([new Error('fail')])).toThrow('fail');
  });
  it('test_059: assertNoErrors with multiple errors throws combined', () => {
    expect(() => assertNoErrors([new Error('a'), new Error('b')])).toThrow();
  });
  it('test_060: assertNoErrors empty passes variant 60', () => {
    expect(() => assertNoErrors([])).not.toThrow();
  });
  it('test_061: assertNoErrors empty passes variant 61', () => {
    expect(() => assertNoErrors([])).not.toThrow();
  });
  it('test_062: assertNoErrors empty passes variant 62', () => {
    expect(() => assertNoErrors([])).not.toThrow();
  });
  it('test_063: assertNoErrors empty passes variant 63', () => {
    expect(() => assertNoErrors([])).not.toThrow();
  });
  it('test_064: assertNoErrors empty passes variant 64', () => {
    expect(() => assertNoErrors([])).not.toThrow();
  });
  it('test_065: assertNoErrors empty passes variant 65', () => {
    expect(() => assertNoErrors([])).not.toThrow();
  });
  it('test_066: assertNoErrors empty passes variant 66', () => {
    expect(() => assertNoErrors([])).not.toThrow();
  });
  it('test_067: assertNoErrors empty passes variant 67', () => {
    expect(() => assertNoErrors([])).not.toThrow();
  });
  it('test_068: assertNoErrors empty passes variant 68', () => {
    expect(() => assertNoErrors([])).not.toThrow();
  });
  it('test_069: assertNoErrors empty passes variant 69', () => {
    expect(() => assertNoErrors([])).not.toThrow();
  });
  it('test_070: assertNoErrors empty passes variant 70', () => {
    expect(() => assertNoErrors([])).not.toThrow();
  });
  it('test_071: assertNoErrors empty passes variant 71', () => {
    expect(() => assertNoErrors([])).not.toThrow();
  });
  it('test_072: assertNoErrors empty passes variant 72', () => {
    expect(() => assertNoErrors([])).not.toThrow();
  });
  it('test_073: assertNoErrors empty passes variant 73', () => {
    expect(() => assertNoErrors([])).not.toThrow();
  });
  it('test_074: assertNoErrors empty passes variant 74', () => {
    expect(() => assertNoErrors([])).not.toThrow();
  });
  it('test_075: assertNoErrors empty passes variant 75', () => {
    expect(() => assertNoErrors([])).not.toThrow();
  });
  it('test_076: assertNoErrors empty passes variant 76', () => {
    expect(() => assertNoErrors([])).not.toThrow();
  });
  it('test_077: assertNoErrors empty passes variant 77', () => {
    expect(() => assertNoErrors([])).not.toThrow();
  });
  it('test_078: assertNoErrors empty passes variant 78', () => {
    expect(() => assertNoErrors([])).not.toThrow();
  });
  it('test_079: assertNoErrors empty passes variant 79', () => {
    expect(() => assertNoErrors([])).not.toThrow();
  });
  it('test_080: assertNoErrors empty passes variant 80', () => {
    expect(() => assertNoErrors([])).not.toThrow();
  });
});

describe('ok / err / mapResult / flatMapResult', () => {
  it('test_001: ok result-1', () => {
    const r = ok(1);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(1);
  });
  it('test_002: ok result-2', () => {
    const r = ok(2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(2);
  });
  it('test_003: ok result-3', () => {
    const r = ok(3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(3);
  });
  it('test_004: ok result-4', () => {
    const r = ok(4);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(4);
  });
  it('test_005: ok result-5', () => {
    const r = ok(5);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(5);
  });
  it('test_006: ok result-6', () => {
    const r = ok(6);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(6);
  });
  it('test_007: ok result-7', () => {
    const r = ok(7);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(7);
  });
  it('test_008: ok result-8', () => {
    const r = ok(8);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(8);
  });
  it('test_009: ok result-9', () => {
    const r = ok(9);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(9);
  });
  it('test_010: ok result-10', () => {
    const r = ok(10);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(10);
  });
  it('test_011: ok result-11', () => {
    const r = ok(11);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(11);
  });
  it('test_012: ok result-12', () => {
    const r = ok(12);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(12);
  });
  it('test_013: ok result-13', () => {
    const r = ok(13);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(13);
  });
  it('test_014: ok result-14', () => {
    const r = ok(14);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(14);
  });
  it('test_015: ok result-15', () => {
    const r = ok(15);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(15);
  });
  it('test_016: ok result-16', () => {
    const r = ok(16);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(16);
  });
  it('test_017: ok result-17', () => {
    const r = ok(17);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(17);
  });
  it('test_018: ok result-18', () => {
    const r = ok(18);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(18);
  });
  it('test_019: ok result-19', () => {
    const r = ok(19);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(19);
  });
  it('test_020: ok result-20', () => {
    const r = ok(20);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(20);
  });
  it('test_021: ok result-21', () => {
    const r = ok(21);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(21);
  });
  it('test_022: ok result-22', () => {
    const r = ok(22);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(22);
  });
  it('test_023: ok result-23', () => {
    const r = ok(23);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(23);
  });
  it('test_024: ok result-24', () => {
    const r = ok(24);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(24);
  });
  it('test_025: ok result-25', () => {
    const r = ok(25);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(25);
  });
  it('test_026: ok result-26', () => {
    const r = ok(26);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(26);
  });
  it('test_027: ok result-27', () => {
    const r = ok(27);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(27);
  });
  it('test_028: ok result-28', () => {
    const r = ok(28);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(28);
  });
  it('test_029: ok result-29', () => {
    const r = ok(29);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(29);
  });
  it('test_030: ok result-30', () => {
    const r = ok(30);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(30);
  });
  it('test_031: ok result-31', () => {
    const r = ok(31);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(31);
  });
  it('test_032: ok result-32', () => {
    const r = ok(32);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(32);
  });
  it('test_033: ok result-33', () => {
    const r = ok(33);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(33);
  });
  it('test_034: ok result-34', () => {
    const r = ok(34);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(34);
  });
  it('test_035: ok result-35', () => {
    const r = ok(35);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(35);
  });
  it('test_036: ok result-36', () => {
    const r = ok(36);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(36);
  });
  it('test_037: ok result-37', () => {
    const r = ok(37);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(37);
  });
  it('test_038: ok result-38', () => {
    const r = ok(38);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(38);
  });
  it('test_039: ok result-39', () => {
    const r = ok(39);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(39);
  });
  it('test_040: ok result-40', () => {
    const r = ok(40);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(40);
  });
  it('test_041: err result-41', () => {
    const e = new AppError('err41', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_042: err result-42', () => {
    const e = new AppError('err42', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_043: err result-43', () => {
    const e = new AppError('err43', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_044: err result-44', () => {
    const e = new AppError('err44', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_045: err result-45', () => {
    const e = new AppError('err45', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_046: err result-46', () => {
    const e = new AppError('err46', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_047: err result-47', () => {
    const e = new AppError('err47', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_048: err result-48', () => {
    const e = new AppError('err48', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_049: err result-49', () => {
    const e = new AppError('err49', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_050: err result-50', () => {
    const e = new AppError('err50', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_051: err result-51', () => {
    const e = new AppError('err51', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_052: err result-52', () => {
    const e = new AppError('err52', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_053: err result-53', () => {
    const e = new AppError('err53', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_054: err result-54', () => {
    const e = new AppError('err54', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_055: err result-55', () => {
    const e = new AppError('err55', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_056: err result-56', () => {
    const e = new AppError('err56', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_057: err result-57', () => {
    const e = new AppError('err57', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_058: err result-58', () => {
    const e = new AppError('err58', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_059: err result-59', () => {
    const e = new AppError('err59', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_060: err result-60', () => {
    const e = new AppError('err60', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_061: err result-61', () => {
    const e = new AppError('err61', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_062: err result-62', () => {
    const e = new AppError('err62', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_063: err result-63', () => {
    const e = new AppError('err63', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_064: err result-64', () => {
    const e = new AppError('err64', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_065: err result-65', () => {
    const e = new AppError('err65', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_066: err result-66', () => {
    const e = new AppError('err66', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_067: err result-67', () => {
    const e = new AppError('err67', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_068: err result-68', () => {
    const e = new AppError('err68', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_069: err result-69', () => {
    const e = new AppError('err69', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_070: err result-70', () => {
    const e = new AppError('err70', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_071: err result-71', () => {
    const e = new AppError('err71', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_072: err result-72', () => {
    const e = new AppError('err72', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_073: err result-73', () => {
    const e = new AppError('err73', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_074: err result-74', () => {
    const e = new AppError('err74', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_075: err result-75', () => {
    const e = new AppError('err75', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_076: err result-76', () => {
    const e = new AppError('err76', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_077: err result-77', () => {
    const e = new AppError('err77', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_078: err result-78', () => {
    const e = new AppError('err78', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_079: err result-79', () => {
    const e = new AppError('err79', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_080: err result-80', () => {
    const e = new AppError('err80', 'C');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_081: mapResult on ok-81', () => {
    const r = mapResult(ok(81), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(162);
  });
  it('test_082: mapResult on ok-82', () => {
    const r = mapResult(ok(82), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(164);
  });
  it('test_083: mapResult on ok-83', () => {
    const r = mapResult(ok(83), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(166);
  });
  it('test_084: mapResult on ok-84', () => {
    const r = mapResult(ok(84), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(168);
  });
  it('test_085: mapResult on ok-85', () => {
    const r = mapResult(ok(85), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(170);
  });
  it('test_086: mapResult on ok-86', () => {
    const r = mapResult(ok(86), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(172);
  });
  it('test_087: mapResult on ok-87', () => {
    const r = mapResult(ok(87), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(174);
  });
  it('test_088: mapResult on ok-88', () => {
    const r = mapResult(ok(88), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(176);
  });
  it('test_089: mapResult on ok-89', () => {
    const r = mapResult(ok(89), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(178);
  });
  it('test_090: mapResult on ok-90', () => {
    const r = mapResult(ok(90), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(180);
  });
  it('test_091: mapResult on ok-91', () => {
    const r = mapResult(ok(91), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(182);
  });
  it('test_092: mapResult on ok-92', () => {
    const r = mapResult(ok(92), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(184);
  });
  it('test_093: mapResult on ok-93', () => {
    const r = mapResult(ok(93), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(186);
  });
  it('test_094: mapResult on ok-94', () => {
    const r = mapResult(ok(94), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(188);
  });
  it('test_095: mapResult on ok-95', () => {
    const r = mapResult(ok(95), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(190);
  });
  it('test_096: mapResult on ok-96', () => {
    const r = mapResult(ok(96), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(192);
  });
  it('test_097: mapResult on ok-97', () => {
    const r = mapResult(ok(97), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(194);
  });
  it('test_098: mapResult on ok-98', () => {
    const r = mapResult(ok(98), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(196);
  });
  it('test_099: mapResult on ok-99', () => {
    const r = mapResult(ok(99), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(198);
  });
  it('test_100: mapResult on ok-100', () => {
    const r = mapResult(ok(100), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(200);
  });
  it('test_101: mapResult on ok-101', () => {
    const r = mapResult(ok(101), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(202);
  });
  it('test_102: mapResult on ok-102', () => {
    const r = mapResult(ok(102), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(204);
  });
  it('test_103: mapResult on ok-103', () => {
    const r = mapResult(ok(103), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(206);
  });
  it('test_104: mapResult on ok-104', () => {
    const r = mapResult(ok(104), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(208);
  });
  it('test_105: mapResult on ok-105', () => {
    const r = mapResult(ok(105), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(210);
  });
  it('test_106: mapResult on ok-106', () => {
    const r = mapResult(ok(106), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(212);
  });
  it('test_107: mapResult on ok-107', () => {
    const r = mapResult(ok(107), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(214);
  });
  it('test_108: mapResult on ok-108', () => {
    const r = mapResult(ok(108), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(216);
  });
  it('test_109: mapResult on ok-109', () => {
    const r = mapResult(ok(109), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(218);
  });
  it('test_110: mapResult on ok-110', () => {
    const r = mapResult(ok(110), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(220);
  });
  it('test_111: mapResult on ok-111', () => {
    const r = mapResult(ok(111), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(222);
  });
  it('test_112: mapResult on ok-112', () => {
    const r = mapResult(ok(112), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(224);
  });
  it('test_113: mapResult on ok-113', () => {
    const r = mapResult(ok(113), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(226);
  });
  it('test_114: mapResult on ok-114', () => {
    const r = mapResult(ok(114), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(228);
  });
  it('test_115: mapResult on ok-115', () => {
    const r = mapResult(ok(115), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(230);
  });
  it('test_116: mapResult on ok-116', () => {
    const r = mapResult(ok(116), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(232);
  });
  it('test_117: mapResult on ok-117', () => {
    const r = mapResult(ok(117), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(234);
  });
  it('test_118: mapResult on ok-118', () => {
    const r = mapResult(ok(118), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(236);
  });
  it('test_119: mapResult on ok-119', () => {
    const r = mapResult(ok(119), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(238);
  });
  it('test_120: mapResult on ok-120', () => {
    const r = mapResult(ok(120), (v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(240);
  });
  it('test_121: mapResult on err passes error through-121', () => {
    const e = new AppError('e121', 'C');
    const r = mapResult(err(e), (v: number) => v * 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_122: mapResult on err passes error through-122', () => {
    const e = new AppError('e122', 'C');
    const r = mapResult(err(e), (v: number) => v * 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_123: mapResult on err passes error through-123', () => {
    const e = new AppError('e123', 'C');
    const r = mapResult(err(e), (v: number) => v * 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_124: mapResult on err passes error through-124', () => {
    const e = new AppError('e124', 'C');
    const r = mapResult(err(e), (v: number) => v * 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_125: mapResult on err passes error through-125', () => {
    const e = new AppError('e125', 'C');
    const r = mapResult(err(e), (v: number) => v * 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_126: mapResult on err passes error through-126', () => {
    const e = new AppError('e126', 'C');
    const r = mapResult(err(e), (v: number) => v * 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_127: mapResult on err passes error through-127', () => {
    const e = new AppError('e127', 'C');
    const r = mapResult(err(e), (v: number) => v * 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_128: mapResult on err passes error through-128', () => {
    const e = new AppError('e128', 'C');
    const r = mapResult(err(e), (v: number) => v * 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_129: mapResult on err passes error through-129', () => {
    const e = new AppError('e129', 'C');
    const r = mapResult(err(e), (v: number) => v * 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_130: mapResult on err passes error through-130', () => {
    const e = new AppError('e130', 'C');
    const r = mapResult(err(e), (v: number) => v * 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_131: mapResult on err passes error through-131', () => {
    const e = new AppError('e131', 'C');
    const r = mapResult(err(e), (v: number) => v * 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_132: mapResult on err passes error through-132', () => {
    const e = new AppError('e132', 'C');
    const r = mapResult(err(e), (v: number) => v * 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_133: mapResult on err passes error through-133', () => {
    const e = new AppError('e133', 'C');
    const r = mapResult(err(e), (v: number) => v * 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_134: mapResult on err passes error through-134', () => {
    const e = new AppError('e134', 'C');
    const r = mapResult(err(e), (v: number) => v * 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_135: mapResult on err passes error through-135', () => {
    const e = new AppError('e135', 'C');
    const r = mapResult(err(e), (v: number) => v * 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_136: mapResult on err passes error through-136', () => {
    const e = new AppError('e136', 'C');
    const r = mapResult(err(e), (v: number) => v * 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_137: mapResult on err passes error through-137', () => {
    const e = new AppError('e137', 'C');
    const r = mapResult(err(e), (v: number) => v * 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_138: mapResult on err passes error through-138', () => {
    const e = new AppError('e138', 'C');
    const r = mapResult(err(e), (v: number) => v * 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_139: mapResult on err passes error through-139', () => {
    const e = new AppError('e139', 'C');
    const r = mapResult(err(e), (v: number) => v * 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_140: mapResult on err passes error through-140', () => {
    const e = new AppError('e140', 'C');
    const r = mapResult(err(e), (v: number) => v * 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_141: mapResult on err passes error through-141', () => {
    const e = new AppError('e141', 'C');
    const r = mapResult(err(e), (v: number) => v * 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_142: mapResult on err passes error through-142', () => {
    const e = new AppError('e142', 'C');
    const r = mapResult(err(e), (v: number) => v * 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_143: mapResult on err passes error through-143', () => {
    const e = new AppError('e143', 'C');
    const r = mapResult(err(e), (v: number) => v * 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_144: mapResult on err passes error through-144', () => {
    const e = new AppError('e144', 'C');
    const r = mapResult(err(e), (v: number) => v * 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_145: mapResult on err passes error through-145', () => {
    const e = new AppError('e145', 'C');
    const r = mapResult(err(e), (v: number) => v * 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_146: mapResult on err passes error through-146', () => {
    const e = new AppError('e146', 'C');
    const r = mapResult(err(e), (v: number) => v * 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_147: mapResult on err passes error through-147', () => {
    const e = new AppError('e147', 'C');
    const r = mapResult(err(e), (v: number) => v * 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_148: mapResult on err passes error through-148', () => {
    const e = new AppError('e148', 'C');
    const r = mapResult(err(e), (v: number) => v * 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_149: mapResult on err passes error through-149', () => {
    const e = new AppError('e149', 'C');
    const r = mapResult(err(e), (v: number) => v * 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_150: mapResult on err passes error through-150', () => {
    const e = new AppError('e150', 'C');
    const r = mapResult(err(e), (v: number) => v * 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_151: flatMapResult on ok chains-151', () => {
    const r = flatMapResult(ok(151), (v) => ok(v + 1));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(152);
  });
  it('test_152: flatMapResult on ok chains-152', () => {
    const r = flatMapResult(ok(152), (v) => ok(v + 1));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(153);
  });
  it('test_153: flatMapResult on ok chains-153', () => {
    const r = flatMapResult(ok(153), (v) => ok(v + 1));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(154);
  });
  it('test_154: flatMapResult on ok chains-154', () => {
    const r = flatMapResult(ok(154), (v) => ok(v + 1));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(155);
  });
  it('test_155: flatMapResult on ok chains-155', () => {
    const r = flatMapResult(ok(155), (v) => ok(v + 1));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(156);
  });
  it('test_156: flatMapResult on ok chains-156', () => {
    const r = flatMapResult(ok(156), (v) => ok(v + 1));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(157);
  });
  it('test_157: flatMapResult on ok chains-157', () => {
    const r = flatMapResult(ok(157), (v) => ok(v + 1));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(158);
  });
  it('test_158: flatMapResult on ok chains-158', () => {
    const r = flatMapResult(ok(158), (v) => ok(v + 1));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(159);
  });
  it('test_159: flatMapResult on ok chains-159', () => {
    const r = flatMapResult(ok(159), (v) => ok(v + 1));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(160);
  });
  it('test_160: flatMapResult on ok chains-160', () => {
    const r = flatMapResult(ok(160), (v) => ok(v + 1));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(161);
  });
  it('test_161: flatMapResult on ok chains-161', () => {
    const r = flatMapResult(ok(161), (v) => ok(v + 1));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(162);
  });
  it('test_162: flatMapResult on ok chains-162', () => {
    const r = flatMapResult(ok(162), (v) => ok(v + 1));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(163);
  });
  it('test_163: flatMapResult on ok chains-163', () => {
    const r = flatMapResult(ok(163), (v) => ok(v + 1));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(164);
  });
  it('test_164: flatMapResult on ok chains-164', () => {
    const r = flatMapResult(ok(164), (v) => ok(v + 1));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(165);
  });
  it('test_165: flatMapResult on ok chains-165', () => {
    const r = flatMapResult(ok(165), (v) => ok(v + 1));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(166);
  });
  it('test_166: flatMapResult on ok chains-166', () => {
    const r = flatMapResult(ok(166), (v) => ok(v + 1));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(167);
  });
  it('test_167: flatMapResult on ok chains-167', () => {
    const r = flatMapResult(ok(167), (v) => ok(v + 1));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(168);
  });
  it('test_168: flatMapResult on ok chains-168', () => {
    const r = flatMapResult(ok(168), (v) => ok(v + 1));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(169);
  });
  it('test_169: flatMapResult on ok chains-169', () => {
    const r = flatMapResult(ok(169), (v) => ok(v + 1));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(170);
  });
  it('test_170: flatMapResult on ok chains-170', () => {
    const r = flatMapResult(ok(170), (v) => ok(v + 1));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(171);
  });
  it('test_171: flatMapResult on ok chains-171', () => {
    const r = flatMapResult(ok(171), (v) => ok(v + 1));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(172);
  });
  it('test_172: flatMapResult on ok chains-172', () => {
    const r = flatMapResult(ok(172), (v) => ok(v + 1));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(173);
  });
  it('test_173: flatMapResult on ok chains-173', () => {
    const r = flatMapResult(ok(173), (v) => ok(v + 1));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(174);
  });
  it('test_174: flatMapResult on ok chains-174', () => {
    const r = flatMapResult(ok(174), (v) => ok(v + 1));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(175);
  });
  it('test_175: flatMapResult on ok chains-175', () => {
    const r = flatMapResult(ok(175), (v) => ok(v + 1));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(176);
  });
  it('test_176: flatMapResult on ok chains-176', () => {
    const r = flatMapResult(ok(176), (v) => ok(v + 1));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(177);
  });
  it('test_177: flatMapResult on ok chains-177', () => {
    const r = flatMapResult(ok(177), (v) => ok(v + 1));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(178);
  });
  it('test_178: flatMapResult on ok chains-178', () => {
    const r = flatMapResult(ok(178), (v) => ok(v + 1));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(179);
  });
  it('test_179: flatMapResult on ok chains-179', () => {
    const r = flatMapResult(ok(179), (v) => ok(v + 1));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(180);
  });
  it('test_180: flatMapResult on ok chains-180', () => {
    const r = flatMapResult(ok(180), (v) => ok(v + 1));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(181);
  });
  it('test_181: flatMapResult on err passes through-181', () => {
    const e = new AppError('e181', 'C');
    const r = flatMapResult(err(e), (v: number) => ok(v));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_182: flatMapResult on err passes through-182', () => {
    const e = new AppError('e182', 'C');
    const r = flatMapResult(err(e), (v: number) => ok(v));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_183: flatMapResult on err passes through-183', () => {
    const e = new AppError('e183', 'C');
    const r = flatMapResult(err(e), (v: number) => ok(v));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_184: flatMapResult on err passes through-184', () => {
    const e = new AppError('e184', 'C');
    const r = flatMapResult(err(e), (v: number) => ok(v));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_185: flatMapResult on err passes through-185', () => {
    const e = new AppError('e185', 'C');
    const r = flatMapResult(err(e), (v: number) => ok(v));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_186: flatMapResult on err passes through-186', () => {
    const e = new AppError('e186', 'C');
    const r = flatMapResult(err(e), (v: number) => ok(v));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_187: flatMapResult on err passes through-187', () => {
    const e = new AppError('e187', 'C');
    const r = flatMapResult(err(e), (v: number) => ok(v));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_188: flatMapResult on err passes through-188', () => {
    const e = new AppError('e188', 'C');
    const r = flatMapResult(err(e), (v: number) => ok(v));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_189: flatMapResult on err passes through-189', () => {
    const e = new AppError('e189', 'C');
    const r = flatMapResult(err(e), (v: number) => ok(v));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_190: flatMapResult on err passes through-190', () => {
    const e = new AppError('e190', 'C');
    const r = flatMapResult(err(e), (v: number) => ok(v));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_191: flatMapResult on err passes through-191', () => {
    const e = new AppError('e191', 'C');
    const r = flatMapResult(err(e), (v: number) => ok(v));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_192: flatMapResult on err passes through-192', () => {
    const e = new AppError('e192', 'C');
    const r = flatMapResult(err(e), (v: number) => ok(v));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_193: flatMapResult on err passes through-193', () => {
    const e = new AppError('e193', 'C');
    const r = flatMapResult(err(e), (v: number) => ok(v));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_194: flatMapResult on err passes through-194', () => {
    const e = new AppError('e194', 'C');
    const r = flatMapResult(err(e), (v: number) => ok(v));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_195: flatMapResult on err passes through-195', () => {
    const e = new AppError('e195', 'C');
    const r = flatMapResult(err(e), (v: number) => ok(v));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_196: flatMapResult on err passes through-196', () => {
    const e = new AppError('e196', 'C');
    const r = flatMapResult(err(e), (v: number) => ok(v));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_197: flatMapResult on err passes through-197', () => {
    const e = new AppError('e197', 'C');
    const r = flatMapResult(err(e), (v: number) => ok(v));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_198: flatMapResult on err passes through-198', () => {
    const e = new AppError('e198', 'C');
    const r = flatMapResult(err(e), (v: number) => ok(v));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_199: flatMapResult on err passes through-199', () => {
    const e = new AppError('e199', 'C');
    const r = flatMapResult(err(e), (v: number) => ok(v));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_200: flatMapResult on err passes through-200', () => {
    const e = new AppError('e200', 'C');
    const r = flatMapResult(err(e), (v: number) => ok(v));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
  it('test_201: flatMapResult can return err from fn', () => {
    const e = new AppError('inner', 'C');
    const r = flatMapResult(ok(1), (_v) => err(e));
    expect(r.ok).toBe(false);
  });
  it('test_202: ok with string', () => {
    const r = ok('hello');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe('hello');
  });
  it('test_203: ok with object', () => {
    const r = ok({ id: 1 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toEqual({ id: 1 });
  });
  it('test_204: ok with null', () => {
    const r = ok(null);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeNull();
  });
  it('test_205: mapResult transforms string', () => {
    const r = mapResult(ok('hello'), (s) => s.toUpperCase());
    if (r.ok) expect(r.value).toBe('HELLO');
  });
});

describe('unwrap / unwrapOr', () => {
  it('test_001: unwrap ok result-1', () => {
    expect(unwrap(ok(1))).toBe(1);
  });
  it('test_002: unwrap ok result-2', () => {
    expect(unwrap(ok(2))).toBe(2);
  });
  it('test_003: unwrap ok result-3', () => {
    expect(unwrap(ok(3))).toBe(3);
  });
  it('test_004: unwrap ok result-4', () => {
    expect(unwrap(ok(4))).toBe(4);
  });
  it('test_005: unwrap ok result-5', () => {
    expect(unwrap(ok(5))).toBe(5);
  });
  it('test_006: unwrap ok result-6', () => {
    expect(unwrap(ok(6))).toBe(6);
  });
  it('test_007: unwrap ok result-7', () => {
    expect(unwrap(ok(7))).toBe(7);
  });
  it('test_008: unwrap ok result-8', () => {
    expect(unwrap(ok(8))).toBe(8);
  });
  it('test_009: unwrap ok result-9', () => {
    expect(unwrap(ok(9))).toBe(9);
  });
  it('test_010: unwrap ok result-10', () => {
    expect(unwrap(ok(10))).toBe(10);
  });
  it('test_011: unwrap ok result-11', () => {
    expect(unwrap(ok(11))).toBe(11);
  });
  it('test_012: unwrap ok result-12', () => {
    expect(unwrap(ok(12))).toBe(12);
  });
  it('test_013: unwrap ok result-13', () => {
    expect(unwrap(ok(13))).toBe(13);
  });
  it('test_014: unwrap ok result-14', () => {
    expect(unwrap(ok(14))).toBe(14);
  });
  it('test_015: unwrap ok result-15', () => {
    expect(unwrap(ok(15))).toBe(15);
  });
  it('test_016: unwrap ok result-16', () => {
    expect(unwrap(ok(16))).toBe(16);
  });
  it('test_017: unwrap ok result-17', () => {
    expect(unwrap(ok(17))).toBe(17);
  });
  it('test_018: unwrap ok result-18', () => {
    expect(unwrap(ok(18))).toBe(18);
  });
  it('test_019: unwrap ok result-19', () => {
    expect(unwrap(ok(19))).toBe(19);
  });
  it('test_020: unwrap ok result-20', () => {
    expect(unwrap(ok(20))).toBe(20);
  });
  it('test_021: unwrap ok result-21', () => {
    expect(unwrap(ok(21))).toBe(21);
  });
  it('test_022: unwrap ok result-22', () => {
    expect(unwrap(ok(22))).toBe(22);
  });
  it('test_023: unwrap ok result-23', () => {
    expect(unwrap(ok(23))).toBe(23);
  });
  it('test_024: unwrap ok result-24', () => {
    expect(unwrap(ok(24))).toBe(24);
  });
  it('test_025: unwrap ok result-25', () => {
    expect(unwrap(ok(25))).toBe(25);
  });
  it('test_026: unwrap ok result-26', () => {
    expect(unwrap(ok(26))).toBe(26);
  });
  it('test_027: unwrap ok result-27', () => {
    expect(unwrap(ok(27))).toBe(27);
  });
  it('test_028: unwrap ok result-28', () => {
    expect(unwrap(ok(28))).toBe(28);
  });
  it('test_029: unwrap ok result-29', () => {
    expect(unwrap(ok(29))).toBe(29);
  });
  it('test_030: unwrap ok result-30', () => {
    expect(unwrap(ok(30))).toBe(30);
  });
  it('test_031: unwrap ok result-31', () => {
    expect(unwrap(ok(31))).toBe(31);
  });
  it('test_032: unwrap ok result-32', () => {
    expect(unwrap(ok(32))).toBe(32);
  });
  it('test_033: unwrap ok result-33', () => {
    expect(unwrap(ok(33))).toBe(33);
  });
  it('test_034: unwrap ok result-34', () => {
    expect(unwrap(ok(34))).toBe(34);
  });
  it('test_035: unwrap ok result-35', () => {
    expect(unwrap(ok(35))).toBe(35);
  });
  it('test_036: unwrap ok result-36', () => {
    expect(unwrap(ok(36))).toBe(36);
  });
  it('test_037: unwrap ok result-37', () => {
    expect(unwrap(ok(37))).toBe(37);
  });
  it('test_038: unwrap ok result-38', () => {
    expect(unwrap(ok(38))).toBe(38);
  });
  it('test_039: unwrap ok result-39', () => {
    expect(unwrap(ok(39))).toBe(39);
  });
  it('test_040: unwrap ok result-40', () => {
    expect(unwrap(ok(40))).toBe(40);
  });
  it('test_041: unwrap ok result-41', () => {
    expect(unwrap(ok(41))).toBe(41);
  });
  it('test_042: unwrap ok result-42', () => {
    expect(unwrap(ok(42))).toBe(42);
  });
  it('test_043: unwrap ok result-43', () => {
    expect(unwrap(ok(43))).toBe(43);
  });
  it('test_044: unwrap ok result-44', () => {
    expect(unwrap(ok(44))).toBe(44);
  });
  it('test_045: unwrap ok result-45', () => {
    expect(unwrap(ok(45))).toBe(45);
  });
  it('test_046: unwrap ok result-46', () => {
    expect(unwrap(ok(46))).toBe(46);
  });
  it('test_047: unwrap ok result-47', () => {
    expect(unwrap(ok(47))).toBe(47);
  });
  it('test_048: unwrap ok result-48', () => {
    expect(unwrap(ok(48))).toBe(48);
  });
  it('test_049: unwrap ok result-49', () => {
    expect(unwrap(ok(49))).toBe(49);
  });
  it('test_050: unwrap ok result-50', () => {
    expect(unwrap(ok(50))).toBe(50);
  });
  it('test_051: unwrap err throws-51', () => {
    const e = new AppError('e51', 'C');
    expect(() => unwrap(err(e))).toThrow('e51');
  });
  it('test_052: unwrap err throws-52', () => {
    const e = new AppError('e52', 'C');
    expect(() => unwrap(err(e))).toThrow('e52');
  });
  it('test_053: unwrap err throws-53', () => {
    const e = new AppError('e53', 'C');
    expect(() => unwrap(err(e))).toThrow('e53');
  });
  it('test_054: unwrap err throws-54', () => {
    const e = new AppError('e54', 'C');
    expect(() => unwrap(err(e))).toThrow('e54');
  });
  it('test_055: unwrap err throws-55', () => {
    const e = new AppError('e55', 'C');
    expect(() => unwrap(err(e))).toThrow('e55');
  });
  it('test_056: unwrap err throws-56', () => {
    const e = new AppError('e56', 'C');
    expect(() => unwrap(err(e))).toThrow('e56');
  });
  it('test_057: unwrap err throws-57', () => {
    const e = new AppError('e57', 'C');
    expect(() => unwrap(err(e))).toThrow('e57');
  });
  it('test_058: unwrap err throws-58', () => {
    const e = new AppError('e58', 'C');
    expect(() => unwrap(err(e))).toThrow('e58');
  });
  it('test_059: unwrap err throws-59', () => {
    const e = new AppError('e59', 'C');
    expect(() => unwrap(err(e))).toThrow('e59');
  });
  it('test_060: unwrap err throws-60', () => {
    const e = new AppError('e60', 'C');
    expect(() => unwrap(err(e))).toThrow('e60');
  });
  it('test_061: unwrap err throws-61', () => {
    const e = new AppError('e61', 'C');
    expect(() => unwrap(err(e))).toThrow('e61');
  });
  it('test_062: unwrap err throws-62', () => {
    const e = new AppError('e62', 'C');
    expect(() => unwrap(err(e))).toThrow('e62');
  });
  it('test_063: unwrap err throws-63', () => {
    const e = new AppError('e63', 'C');
    expect(() => unwrap(err(e))).toThrow('e63');
  });
  it('test_064: unwrap err throws-64', () => {
    const e = new AppError('e64', 'C');
    expect(() => unwrap(err(e))).toThrow('e64');
  });
  it('test_065: unwrap err throws-65', () => {
    const e = new AppError('e65', 'C');
    expect(() => unwrap(err(e))).toThrow('e65');
  });
  it('test_066: unwrap err throws-66', () => {
    const e = new AppError('e66', 'C');
    expect(() => unwrap(err(e))).toThrow('e66');
  });
  it('test_067: unwrap err throws-67', () => {
    const e = new AppError('e67', 'C');
    expect(() => unwrap(err(e))).toThrow('e67');
  });
  it('test_068: unwrap err throws-68', () => {
    const e = new AppError('e68', 'C');
    expect(() => unwrap(err(e))).toThrow('e68');
  });
  it('test_069: unwrap err throws-69', () => {
    const e = new AppError('e69', 'C');
    expect(() => unwrap(err(e))).toThrow('e69');
  });
  it('test_070: unwrap err throws-70', () => {
    const e = new AppError('e70', 'C');
    expect(() => unwrap(err(e))).toThrow('e70');
  });
  it('test_071: unwrap err throws-71', () => {
    const e = new AppError('e71', 'C');
    expect(() => unwrap(err(e))).toThrow('e71');
  });
  it('test_072: unwrap err throws-72', () => {
    const e = new AppError('e72', 'C');
    expect(() => unwrap(err(e))).toThrow('e72');
  });
  it('test_073: unwrap err throws-73', () => {
    const e = new AppError('e73', 'C');
    expect(() => unwrap(err(e))).toThrow('e73');
  });
  it('test_074: unwrap err throws-74', () => {
    const e = new AppError('e74', 'C');
    expect(() => unwrap(err(e))).toThrow('e74');
  });
  it('test_075: unwrap err throws-75', () => {
    const e = new AppError('e75', 'C');
    expect(() => unwrap(err(e))).toThrow('e75');
  });
  it('test_076: unwrapOr ok returns value-76', () => {
    expect(unwrapOr(ok(76), -1)).toBe(76);
  });
  it('test_077: unwrapOr ok returns value-77', () => {
    expect(unwrapOr(ok(77), -1)).toBe(77);
  });
  it('test_078: unwrapOr ok returns value-78', () => {
    expect(unwrapOr(ok(78), -1)).toBe(78);
  });
  it('test_079: unwrapOr ok returns value-79', () => {
    expect(unwrapOr(ok(79), -1)).toBe(79);
  });
  it('test_080: unwrapOr ok returns value-80', () => {
    expect(unwrapOr(ok(80), -1)).toBe(80);
  });
  it('test_081: unwrapOr ok returns value-81', () => {
    expect(unwrapOr(ok(81), -1)).toBe(81);
  });
  it('test_082: unwrapOr ok returns value-82', () => {
    expect(unwrapOr(ok(82), -1)).toBe(82);
  });
  it('test_083: unwrapOr ok returns value-83', () => {
    expect(unwrapOr(ok(83), -1)).toBe(83);
  });
  it('test_084: unwrapOr ok returns value-84', () => {
    expect(unwrapOr(ok(84), -1)).toBe(84);
  });
  it('test_085: unwrapOr ok returns value-85', () => {
    expect(unwrapOr(ok(85), -1)).toBe(85);
  });
  it('test_086: unwrapOr ok returns value-86', () => {
    expect(unwrapOr(ok(86), -1)).toBe(86);
  });
  it('test_087: unwrapOr ok returns value-87', () => {
    expect(unwrapOr(ok(87), -1)).toBe(87);
  });
  it('test_088: unwrapOr ok returns value-88', () => {
    expect(unwrapOr(ok(88), -1)).toBe(88);
  });
  it('test_089: unwrapOr ok returns value-89', () => {
    expect(unwrapOr(ok(89), -1)).toBe(89);
  });
  it('test_090: unwrapOr ok returns value-90', () => {
    expect(unwrapOr(ok(90), -1)).toBe(90);
  });
  it('test_091: unwrapOr ok returns value-91', () => {
    expect(unwrapOr(ok(91), -1)).toBe(91);
  });
  it('test_092: unwrapOr ok returns value-92', () => {
    expect(unwrapOr(ok(92), -1)).toBe(92);
  });
  it('test_093: unwrapOr ok returns value-93', () => {
    expect(unwrapOr(ok(93), -1)).toBe(93);
  });
  it('test_094: unwrapOr ok returns value-94', () => {
    expect(unwrapOr(ok(94), -1)).toBe(94);
  });
  it('test_095: unwrapOr ok returns value-95', () => {
    expect(unwrapOr(ok(95), -1)).toBe(95);
  });
  it('test_096: unwrapOr ok returns value-96', () => {
    expect(unwrapOr(ok(96), -1)).toBe(96);
  });
  it('test_097: unwrapOr ok returns value-97', () => {
    expect(unwrapOr(ok(97), -1)).toBe(97);
  });
  it('test_098: unwrapOr ok returns value-98', () => {
    expect(unwrapOr(ok(98), -1)).toBe(98);
  });
  it('test_099: unwrapOr ok returns value-99', () => {
    expect(unwrapOr(ok(99), -1)).toBe(99);
  });
  it('test_100: unwrapOr ok returns value-100', () => {
    expect(unwrapOr(ok(100), -1)).toBe(100);
  });
  it('test_101: unwrapOr err returns fallback-101', () => {
    const e = new AppError('e', 'C');
    expect(unwrapOr(err(e), 101)).toBe(101);
  });
  it('test_102: unwrapOr err returns fallback-102', () => {
    const e = new AppError('e', 'C');
    expect(unwrapOr(err(e), 102)).toBe(102);
  });
  it('test_103: unwrapOr err returns fallback-103', () => {
    const e = new AppError('e', 'C');
    expect(unwrapOr(err(e), 103)).toBe(103);
  });
  it('test_104: unwrapOr err returns fallback-104', () => {
    const e = new AppError('e', 'C');
    expect(unwrapOr(err(e), 104)).toBe(104);
  });
  it('test_105: unwrapOr err returns fallback-105', () => {
    const e = new AppError('e', 'C');
    expect(unwrapOr(err(e), 105)).toBe(105);
  });
  it('test_106: unwrapOr err returns fallback-106', () => {
    const e = new AppError('e', 'C');
    expect(unwrapOr(err(e), 106)).toBe(106);
  });
  it('test_107: unwrapOr err returns fallback-107', () => {
    const e = new AppError('e', 'C');
    expect(unwrapOr(err(e), 107)).toBe(107);
  });
  it('test_108: unwrapOr err returns fallback-108', () => {
    const e = new AppError('e', 'C');
    expect(unwrapOr(err(e), 108)).toBe(108);
  });
  it('test_109: unwrapOr err returns fallback-109', () => {
    const e = new AppError('e', 'C');
    expect(unwrapOr(err(e), 109)).toBe(109);
  });
  it('test_110: unwrapOr err returns fallback-110', () => {
    const e = new AppError('e', 'C');
    expect(unwrapOr(err(e), 110)).toBe(110);
  });
  it('test_111: unwrapOr err returns fallback-111', () => {
    const e = new AppError('e', 'C');
    expect(unwrapOr(err(e), 111)).toBe(111);
  });
  it('test_112: unwrapOr err returns fallback-112', () => {
    const e = new AppError('e', 'C');
    expect(unwrapOr(err(e), 112)).toBe(112);
  });
  it('test_113: unwrapOr err returns fallback-113', () => {
    const e = new AppError('e', 'C');
    expect(unwrapOr(err(e), 113)).toBe(113);
  });
  it('test_114: unwrapOr err returns fallback-114', () => {
    const e = new AppError('e', 'C');
    expect(unwrapOr(err(e), 114)).toBe(114);
  });
  it('test_115: unwrapOr err returns fallback-115', () => {
    const e = new AppError('e', 'C');
    expect(unwrapOr(err(e), 115)).toBe(115);
  });
  it('test_116: unwrapOr err returns fallback-116', () => {
    const e = new AppError('e', 'C');
    expect(unwrapOr(err(e), 116)).toBe(116);
  });
  it('test_117: unwrapOr err returns fallback-117', () => {
    const e = new AppError('e', 'C');
    expect(unwrapOr(err(e), 117)).toBe(117);
  });
  it('test_118: unwrapOr err returns fallback-118', () => {
    const e = new AppError('e', 'C');
    expect(unwrapOr(err(e), 118)).toBe(118);
  });
  it('test_119: unwrapOr err returns fallback-119', () => {
    const e = new AppError('e', 'C');
    expect(unwrapOr(err(e), 119)).toBe(119);
  });
  it('test_120: unwrapOr err returns fallback-120', () => {
    const e = new AppError('e', 'C');
    expect(unwrapOr(err(e), 120)).toBe(120);
  });
  it('test_121: unwrapOr with string fallback', () => {
    const e = new AppError('e', 'C');
    expect(unwrapOr(err(e) as unknown as ReturnType<typeof ok<string>>, 'default')).toBe('default');
  });
  it('test_122: unwrap ok with string', () => {
    expect(unwrap(ok('hello'))).toBe('hello');
  });
  it('test_123: unwrap ok with object', () => {
    const obj = { a: 1 };
    expect(unwrap(ok(obj))).toBe(obj);
  });
  it('test_124: unwrap ok with null', () => {
    expect(unwrap(ok(null))).toBeNull();
  });
  it('test_125: unwrap ok with array', () => {
    expect(unwrap(ok([1, 2, 3]))).toEqual([1, 2, 3]);
  });
  it('test_126: unwrapOr ok returns original not fallback', () => {
    expect(unwrapOr(ok(999), -1)).toBe(999);
  });
  it('test_127: unwrapOr err never calls into ok path', () => {
    const e = new AppError('x', 'C');
    const result = unwrapOr(err(e), 42);
    expect(result).toBe(42);
  });
  it('test_128: unwrap ValidationError throws', () => {
    const e = new ValidationError('bad');
    expect(() => unwrap(err(e))).toThrow('bad');
  });
  it('test_129: unwrap NotFoundError throws', () => {
    const e = new NotFoundError('Item');
    expect(() => unwrap(err(e))).toThrow('Item not found');
  });
  it('test_130: unwrap UnauthorizedError throws', () => {
    const e = new UnauthorizedError('token expired');
    expect(() => unwrap(err(e))).toThrow('token expired');
  });
});

describe('fromTryCatch', () => {
  it('test_001: fromTryCatch success-1', () => {
    const r = fromTryCatch(() => 1 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(3);
  });
  it('test_002: fromTryCatch success-2', () => {
    const r = fromTryCatch(() => 2 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(6);
  });
  it('test_003: fromTryCatch success-3', () => {
    const r = fromTryCatch(() => 3 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(9);
  });
  it('test_004: fromTryCatch success-4', () => {
    const r = fromTryCatch(() => 4 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(12);
  });
  it('test_005: fromTryCatch success-5', () => {
    const r = fromTryCatch(() => 5 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(15);
  });
  it('test_006: fromTryCatch success-6', () => {
    const r = fromTryCatch(() => 6 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(18);
  });
  it('test_007: fromTryCatch success-7', () => {
    const r = fromTryCatch(() => 7 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(21);
  });
  it('test_008: fromTryCatch success-8', () => {
    const r = fromTryCatch(() => 8 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(24);
  });
  it('test_009: fromTryCatch success-9', () => {
    const r = fromTryCatch(() => 9 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(27);
  });
  it('test_010: fromTryCatch success-10', () => {
    const r = fromTryCatch(() => 10 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(30);
  });
  it('test_011: fromTryCatch success-11', () => {
    const r = fromTryCatch(() => 11 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(33);
  });
  it('test_012: fromTryCatch success-12', () => {
    const r = fromTryCatch(() => 12 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(36);
  });
  it('test_013: fromTryCatch success-13', () => {
    const r = fromTryCatch(() => 13 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(39);
  });
  it('test_014: fromTryCatch success-14', () => {
    const r = fromTryCatch(() => 14 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(42);
  });
  it('test_015: fromTryCatch success-15', () => {
    const r = fromTryCatch(() => 15 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(45);
  });
  it('test_016: fromTryCatch success-16', () => {
    const r = fromTryCatch(() => 16 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(48);
  });
  it('test_017: fromTryCatch success-17', () => {
    const r = fromTryCatch(() => 17 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(51);
  });
  it('test_018: fromTryCatch success-18', () => {
    const r = fromTryCatch(() => 18 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(54);
  });
  it('test_019: fromTryCatch success-19', () => {
    const r = fromTryCatch(() => 19 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(57);
  });
  it('test_020: fromTryCatch success-20', () => {
    const r = fromTryCatch(() => 20 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(60);
  });
  it('test_021: fromTryCatch success-21', () => {
    const r = fromTryCatch(() => 21 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(63);
  });
  it('test_022: fromTryCatch success-22', () => {
    const r = fromTryCatch(() => 22 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(66);
  });
  it('test_023: fromTryCatch success-23', () => {
    const r = fromTryCatch(() => 23 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(69);
  });
  it('test_024: fromTryCatch success-24', () => {
    const r = fromTryCatch(() => 24 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(72);
  });
  it('test_025: fromTryCatch success-25', () => {
    const r = fromTryCatch(() => 25 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(75);
  });
  it('test_026: fromTryCatch success-26', () => {
    const r = fromTryCatch(() => 26 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(78);
  });
  it('test_027: fromTryCatch success-27', () => {
    const r = fromTryCatch(() => 27 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(81);
  });
  it('test_028: fromTryCatch success-28', () => {
    const r = fromTryCatch(() => 28 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(84);
  });
  it('test_029: fromTryCatch success-29', () => {
    const r = fromTryCatch(() => 29 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(87);
  });
  it('test_030: fromTryCatch success-30', () => {
    const r = fromTryCatch(() => 30 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(90);
  });
  it('test_031: fromTryCatch success-31', () => {
    const r = fromTryCatch(() => 31 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(93);
  });
  it('test_032: fromTryCatch success-32', () => {
    const r = fromTryCatch(() => 32 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(96);
  });
  it('test_033: fromTryCatch success-33', () => {
    const r = fromTryCatch(() => 33 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(99);
  });
  it('test_034: fromTryCatch success-34', () => {
    const r = fromTryCatch(() => 34 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(102);
  });
  it('test_035: fromTryCatch success-35', () => {
    const r = fromTryCatch(() => 35 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(105);
  });
  it('test_036: fromTryCatch success-36', () => {
    const r = fromTryCatch(() => 36 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(108);
  });
  it('test_037: fromTryCatch success-37', () => {
    const r = fromTryCatch(() => 37 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(111);
  });
  it('test_038: fromTryCatch success-38', () => {
    const r = fromTryCatch(() => 38 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(114);
  });
  it('test_039: fromTryCatch success-39', () => {
    const r = fromTryCatch(() => 39 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(117);
  });
  it('test_040: fromTryCatch success-40', () => {
    const r = fromTryCatch(() => 40 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(120);
  });
  it('test_041: fromTryCatch success-41', () => {
    const r = fromTryCatch(() => 41 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(123);
  });
  it('test_042: fromTryCatch success-42', () => {
    const r = fromTryCatch(() => 42 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(126);
  });
  it('test_043: fromTryCatch success-43', () => {
    const r = fromTryCatch(() => 43 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(129);
  });
  it('test_044: fromTryCatch success-44', () => {
    const r = fromTryCatch(() => 44 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(132);
  });
  it('test_045: fromTryCatch success-45', () => {
    const r = fromTryCatch(() => 45 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(135);
  });
  it('test_046: fromTryCatch success-46', () => {
    const r = fromTryCatch(() => 46 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(138);
  });
  it('test_047: fromTryCatch success-47', () => {
    const r = fromTryCatch(() => 47 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(141);
  });
  it('test_048: fromTryCatch success-48', () => {
    const r = fromTryCatch(() => 48 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(144);
  });
  it('test_049: fromTryCatch success-49', () => {
    const r = fromTryCatch(() => 49 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(147);
  });
  it('test_050: fromTryCatch success-50', () => {
    const r = fromTryCatch(() => 50 * 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(150);
  });
  it('test_051: fromTryCatch catches Error-51', () => {
    const r = fromTryCatch(() => { throw new Error('thrown51'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown51');
  });
  it('test_052: fromTryCatch catches Error-52', () => {
    const r = fromTryCatch(() => { throw new Error('thrown52'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown52');
  });
  it('test_053: fromTryCatch catches Error-53', () => {
    const r = fromTryCatch(() => { throw new Error('thrown53'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown53');
  });
  it('test_054: fromTryCatch catches Error-54', () => {
    const r = fromTryCatch(() => { throw new Error('thrown54'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown54');
  });
  it('test_055: fromTryCatch catches Error-55', () => {
    const r = fromTryCatch(() => { throw new Error('thrown55'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown55');
  });
  it('test_056: fromTryCatch catches Error-56', () => {
    const r = fromTryCatch(() => { throw new Error('thrown56'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown56');
  });
  it('test_057: fromTryCatch catches Error-57', () => {
    const r = fromTryCatch(() => { throw new Error('thrown57'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown57');
  });
  it('test_058: fromTryCatch catches Error-58', () => {
    const r = fromTryCatch(() => { throw new Error('thrown58'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown58');
  });
  it('test_059: fromTryCatch catches Error-59', () => {
    const r = fromTryCatch(() => { throw new Error('thrown59'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown59');
  });
  it('test_060: fromTryCatch catches Error-60', () => {
    const r = fromTryCatch(() => { throw new Error('thrown60'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown60');
  });
  it('test_061: fromTryCatch catches Error-61', () => {
    const r = fromTryCatch(() => { throw new Error('thrown61'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown61');
  });
  it('test_062: fromTryCatch catches Error-62', () => {
    const r = fromTryCatch(() => { throw new Error('thrown62'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown62');
  });
  it('test_063: fromTryCatch catches Error-63', () => {
    const r = fromTryCatch(() => { throw new Error('thrown63'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown63');
  });
  it('test_064: fromTryCatch catches Error-64', () => {
    const r = fromTryCatch(() => { throw new Error('thrown64'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown64');
  });
  it('test_065: fromTryCatch catches Error-65', () => {
    const r = fromTryCatch(() => { throw new Error('thrown65'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown65');
  });
  it('test_066: fromTryCatch catches Error-66', () => {
    const r = fromTryCatch(() => { throw new Error('thrown66'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown66');
  });
  it('test_067: fromTryCatch catches Error-67', () => {
    const r = fromTryCatch(() => { throw new Error('thrown67'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown67');
  });
  it('test_068: fromTryCatch catches Error-68', () => {
    const r = fromTryCatch(() => { throw new Error('thrown68'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown68');
  });
  it('test_069: fromTryCatch catches Error-69', () => {
    const r = fromTryCatch(() => { throw new Error('thrown69'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown69');
  });
  it('test_070: fromTryCatch catches Error-70', () => {
    const r = fromTryCatch(() => { throw new Error('thrown70'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown70');
  });
  it('test_071: fromTryCatch catches Error-71', () => {
    const r = fromTryCatch(() => { throw new Error('thrown71'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown71');
  });
  it('test_072: fromTryCatch catches Error-72', () => {
    const r = fromTryCatch(() => { throw new Error('thrown72'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown72');
  });
  it('test_073: fromTryCatch catches Error-73', () => {
    const r = fromTryCatch(() => { throw new Error('thrown73'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown73');
  });
  it('test_074: fromTryCatch catches Error-74', () => {
    const r = fromTryCatch(() => { throw new Error('thrown74'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown74');
  });
  it('test_075: fromTryCatch catches Error-75', () => {
    const r = fromTryCatch(() => { throw new Error('thrown75'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown75');
  });
  it('test_076: fromTryCatch catches Error-76', () => {
    const r = fromTryCatch(() => { throw new Error('thrown76'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown76');
  });
  it('test_077: fromTryCatch catches Error-77', () => {
    const r = fromTryCatch(() => { throw new Error('thrown77'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown77');
  });
  it('test_078: fromTryCatch catches Error-78', () => {
    const r = fromTryCatch(() => { throw new Error('thrown78'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown78');
  });
  it('test_079: fromTryCatch catches Error-79', () => {
    const r = fromTryCatch(() => { throw new Error('thrown79'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown79');
  });
  it('test_080: fromTryCatch catches Error-80', () => {
    const r = fromTryCatch(() => { throw new Error('thrown80'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown80');
  });
  it('test_081: fromTryCatch catches Error-81', () => {
    const r = fromTryCatch(() => { throw new Error('thrown81'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown81');
  });
  it('test_082: fromTryCatch catches Error-82', () => {
    const r = fromTryCatch(() => { throw new Error('thrown82'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown82');
  });
  it('test_083: fromTryCatch catches Error-83', () => {
    const r = fromTryCatch(() => { throw new Error('thrown83'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown83');
  });
  it('test_084: fromTryCatch catches Error-84', () => {
    const r = fromTryCatch(() => { throw new Error('thrown84'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown84');
  });
  it('test_085: fromTryCatch catches Error-85', () => {
    const r = fromTryCatch(() => { throw new Error('thrown85'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown85');
  });
  it('test_086: fromTryCatch catches Error-86', () => {
    const r = fromTryCatch(() => { throw new Error('thrown86'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown86');
  });
  it('test_087: fromTryCatch catches Error-87', () => {
    const r = fromTryCatch(() => { throw new Error('thrown87'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown87');
  });
  it('test_088: fromTryCatch catches Error-88', () => {
    const r = fromTryCatch(() => { throw new Error('thrown88'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown88');
  });
  it('test_089: fromTryCatch catches Error-89', () => {
    const r = fromTryCatch(() => { throw new Error('thrown89'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown89');
  });
  it('test_090: fromTryCatch catches Error-90', () => {
    const r = fromTryCatch(() => { throw new Error('thrown90'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('thrown90');
  });
  it('test_091: fromTryCatch catches non-Error throw-91', () => {
    const r = fromTryCatch(() => { throw 'string91'; });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error instanceof Error).toBe(true);
  });
  it('test_092: fromTryCatch catches non-Error throw-92', () => {
    const r = fromTryCatch(() => { throw 'string92'; });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error instanceof Error).toBe(true);
  });
  it('test_093: fromTryCatch catches non-Error throw-93', () => {
    const r = fromTryCatch(() => { throw 'string93'; });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error instanceof Error).toBe(true);
  });
  it('test_094: fromTryCatch catches non-Error throw-94', () => {
    const r = fromTryCatch(() => { throw 'string94'; });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error instanceof Error).toBe(true);
  });
  it('test_095: fromTryCatch catches non-Error throw-95', () => {
    const r = fromTryCatch(() => { throw 'string95'; });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error instanceof Error).toBe(true);
  });
  it('test_096: fromTryCatch catches non-Error throw-96', () => {
    const r = fromTryCatch(() => { throw 'string96'; });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error instanceof Error).toBe(true);
  });
  it('test_097: fromTryCatch catches non-Error throw-97', () => {
    const r = fromTryCatch(() => { throw 'string97'; });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error instanceof Error).toBe(true);
  });
  it('test_098: fromTryCatch catches non-Error throw-98', () => {
    const r = fromTryCatch(() => { throw 'string98'; });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error instanceof Error).toBe(true);
  });
  it('test_099: fromTryCatch catches non-Error throw-99', () => {
    const r = fromTryCatch(() => { throw 'string99'; });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error instanceof Error).toBe(true);
  });
  it('test_100: fromTryCatch catches non-Error throw-100', () => {
    const r = fromTryCatch(() => { throw 'string100'; });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error instanceof Error).toBe(true);
  });
  it('test_101: fromTryCatch catches non-Error throw-101', () => {
    const r = fromTryCatch(() => { throw 'string101'; });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error instanceof Error).toBe(true);
  });
  it('test_102: fromTryCatch catches non-Error throw-102', () => {
    const r = fromTryCatch(() => { throw 'string102'; });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error instanceof Error).toBe(true);
  });
  it('test_103: fromTryCatch catches non-Error throw-103', () => {
    const r = fromTryCatch(() => { throw 'string103'; });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error instanceof Error).toBe(true);
  });
  it('test_104: fromTryCatch catches non-Error throw-104', () => {
    const r = fromTryCatch(() => { throw 'string104'; });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error instanceof Error).toBe(true);
  });
  it('test_105: fromTryCatch catches non-Error throw-105', () => {
    const r = fromTryCatch(() => { throw 'string105'; });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error instanceof Error).toBe(true);
  });
  it('test_106: fromTryCatch catches non-Error throw-106', () => {
    const r = fromTryCatch(() => { throw 'string106'; });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error instanceof Error).toBe(true);
  });
  it('test_107: fromTryCatch catches non-Error throw-107', () => {
    const r = fromTryCatch(() => { throw 'string107'; });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error instanceof Error).toBe(true);
  });
  it('test_108: fromTryCatch catches non-Error throw-108', () => {
    const r = fromTryCatch(() => { throw 'string108'; });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error instanceof Error).toBe(true);
  });
  it('test_109: fromTryCatch catches non-Error throw-109', () => {
    const r = fromTryCatch(() => { throw 'string109'; });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error instanceof Error).toBe(true);
  });
  it('test_110: fromTryCatch catches non-Error throw-110', () => {
    const r = fromTryCatch(() => { throw 'string110'; });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error instanceof Error).toBe(true);
  });
  it('test_111: fromTryCatch returns ok with string', () => {
    const r = fromTryCatch(() => 'success');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe('success');
  });
  it('test_112: fromTryCatch returns ok with null', () => {
    const r = fromTryCatch(() => null);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeNull();
  });
  it('test_113: fromTryCatch returns ok with object', () => {
    const r = fromTryCatch(() => ({ id: 1 }));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toEqual({ id: 1 });
  });
  it('test_114: fromTryCatch catches AppError', () => {
    const r = fromTryCatch(() => { throw new AppError('app', 'C'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('app');
  });
  it('test_115: fromTryCatch catches ValidationError', () => {
    const r = fromTryCatch(() => { throw new ValidationError('val'); });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('val');
  });
  it('test_116: fromTryCatch result is Result type', () => {
    const r = fromTryCatch(() => 42);
    expect('ok' in r).toBe(true);
  });
  it('test_117: fromTryCatch catches number throw', () => {
    const r = fromTryCatch(() => { throw 99; });
    expect(r.ok).toBe(false);
  });
  it('test_118: fromTryCatch catches null throw', () => {
    const r = fromTryCatch(() => { throw null; });
    expect(r.ok).toBe(false);
  });
  it('test_119: fromTryCatch ok false has error property', () => {
    const r = fromTryCatch(() => { throw new Error('x'); });
    if (!r.ok) expect(r.error).toBeInstanceOf(Error);
  });
  it('test_120: fromTryCatch with array return', () => {
    const r = fromTryCatch(() => [1, 2, 3]);
    if (r.ok) expect(r.value).toEqual([1, 2, 3]);
  });
});
