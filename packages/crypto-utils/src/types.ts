export type HashAlgorithm = 'sha256' | 'sha384' | 'sha512' | 'md5' | 'sha1';
export type EncodingFormat = 'hex' | 'base64' | 'base64url' | 'binary';
export type TokenFormat = 'uuid' | 'hex' | 'alphanumeric' | 'numeric';

export interface HashOptions {
  algorithm: HashAlgorithm;
  encoding: EncodingFormat;
}

export interface TokenOptions {
  format: TokenFormat;
  length: number;
}

export interface HmacOptions {
  algorithm: HashAlgorithm;
  encoding: EncodingFormat;
}

export interface KeyDerivationOptions {
  iterations: number;
  keyLength: number;
  digest: HashAlgorithm;
}
