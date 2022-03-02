import { BufferSourceConverter } from "pvtsutils";
import { AlgorithmError, CryptoError, OperationError, RequiredPropertyError, UnsupportedOperationError } from "./errors";
import { KeyUsages, ProviderKeyUsages } from "./types";
import { isJWK } from "./utils";

export interface IProviderCheckOptions {
  keyUsage?: boolean;
}

export abstract class ProviderCrypto {

  /**
   * Name of the algorithm
   */
  public abstract readonly name: string;

  /**
   * Key usages for secret key or key pair
   */
  public abstract readonly usages: ProviderKeyUsages;

  //#region Digest
  public async digest(algorithm: Algorithm, data: ArrayBuffer, ...args: any[]): Promise<ArrayBuffer>;
  public async digest(...args: any[]): Promise<ArrayBuffer> {
    this.checkDigest.apply(this, args);
    return this.onDigest.apply(this, args);
  }
  public checkDigest(algorithm: Algorithm, data: ArrayBuffer) {
    this.checkAlgorithmName(algorithm);
  }
  public async onDigest(algorithm: Algorithm, data: ArrayBuffer): Promise<ArrayBuffer> {
    throw new UnsupportedOperationError("digest");
  }
  //#endregion

  //#region Generate key
  public async generateKey(algorithm: RsaHashedKeyGenParams | EcKeyGenParams, extractable: boolean, keyUsages: KeyUsage[]): Promise<CryptoKeyPair>;
  public async generateKey(algorithm: AesKeyGenParams | HmacKeyGenParams | Pbkdf2Params, extractable: boolean, keyUsages: KeyUsage[]): Promise<CryptoKey>;
  public async generateKey(algorithm: Algorithm, extractable: boolean, keyUsages: KeyUsage[], ...args: any[]): Promise<CryptoKeyPair | CryptoKey>;
  public async generateKey(...args: any[]): Promise<CryptoKeyPair | CryptoKey> {
    this.checkGenerateKey.apply(this, args);
    return this.onGenerateKey.apply(this, args);
  }
  public checkGenerateKey(algorithm: Algorithm, extractable: boolean, keyUsages: KeyUsage[], ...args: any[]) {
    this.checkAlgorithmName(algorithm);
    this.checkGenerateKeyParams(algorithm);
    if (!(keyUsages && keyUsages.length)) {
      throw new TypeError(`Usages cannot be empty when creating a key.`);
    }
    let allowedUsages: KeyUsages;
    if (Array.isArray(this.usages)) {
      allowedUsages = this.usages;
    } else {
      allowedUsages = this.usages.privateKey.concat(this.usages.publicKey);
    }
    this.checkKeyUsages(keyUsages, allowedUsages);
  }
  public checkGenerateKeyParams(algorithm: Algorithm) {
    // nothing
  }
  public async onGenerateKey(algorithm: Algorithm, extractable: boolean, keyUsages: KeyUsage[], ...args: any[]): Promise<CryptoKeyPair | CryptoKey> {
    throw new UnsupportedOperationError("generateKey");
  }
  //#endregion

  //#region Sign
  public async sign(algorithm: Algorithm, key: CryptoKey, data: ArrayBuffer, ...args: any[]): Promise<ArrayBuffer> ;
  public async sign(...args: any[]): Promise<ArrayBuffer> {
    this.checkSign.apply(this, args);
    return this.onSign.apply(this, args);
  }
  public checkSign(algorithm: Algorithm, key: CryptoKey, data: ArrayBuffer, ...args: any[]) {
    this.checkAlgorithmName(algorithm);
    this.checkAlgorithmParams(algorithm);
    this.checkCryptoKey(key, "sign");
  }
  public async onSign(algorithm: Algorithm, key: CryptoKey, data: ArrayBuffer, ...args: any[]): Promise<ArrayBuffer> {
    throw new UnsupportedOperationError("sign");
  }
  //#endregion

  //#region Verify
  public async verify(algorithm: Algorithm, key: CryptoKey, signature: ArrayBuffer, data: ArrayBuffer, ...args: any[]): Promise<boolean>;
  public async verify(...args: any[]): Promise<boolean> {
    this.checkVerify.apply(this, args);
    return this.onVerify.apply(this, args);
  }
  public checkVerify(algorithm: Algorithm, key: CryptoKey, signature: ArrayBuffer, data: ArrayBuffer, ...args: any[]) {
    this.checkAlgorithmName(algorithm);
    this.checkAlgorithmParams(algorithm);
    this.checkCryptoKey(key, "verify");
  }
  public async onVerify(algorithm: Algorithm, key: CryptoKey, signature: ArrayBuffer, data: ArrayBuffer, ...args: any[]): Promise<boolean> {
    throw new UnsupportedOperationError("verify");
  }
  //#endregion

  //#region Encrypt
  public async encrypt(algorithm: Algorithm, key: CryptoKey, data: ArrayBuffer, options?: IProviderCheckOptions, ...args: any[]): Promise<ArrayBuffer>;
  public async encrypt(...args: any[]): Promise<ArrayBuffer> {
    this.checkEncrypt.apply(this, args);
    return this.onEncrypt.apply(this, args);
  }
  public checkEncrypt(algorithm: Algorithm, key: CryptoKey, data: ArrayBuffer, options: IProviderCheckOptions = {}, ...args: any[]) {
    this.checkAlgorithmName(algorithm);
    this.checkAlgorithmParams(algorithm);
    this.checkCryptoKey(key, options.keyUsage ? "encrypt" : void 0);
  }
  public async onEncrypt(algorithm: Algorithm, key: CryptoKey, data: ArrayBuffer, ...args: any[]): Promise<ArrayBuffer> {
    throw new UnsupportedOperationError("encrypt");
  }
  //#endregion

  //#region
  public async decrypt(algorithm: Algorithm, key: CryptoKey, data: ArrayBuffer, options?: IProviderCheckOptions, ...args: any[]): Promise<ArrayBuffer>;
  public async decrypt(...args: any[]): Promise<ArrayBuffer> {
    this.checkDecrypt.apply(this, args);
    return this.onDecrypt.apply(this, args);
  }
  public checkDecrypt(algorithm: Algorithm, key: CryptoKey, data: ArrayBuffer, options: IProviderCheckOptions = {}, ...args: any[]) {
    this.checkAlgorithmName(algorithm);
    this.checkAlgorithmParams(algorithm);
    this.checkCryptoKey(key, options.keyUsage ? "decrypt" : void 0);
  }
  public async onDecrypt(algorithm: Algorithm, key: CryptoKey, data: ArrayBuffer, ...args: any[]): Promise<ArrayBuffer> {
    throw new UnsupportedOperationError("decrypt");
  }
  //#endregion

  //#region Derive bits
  public async deriveBits(algorithm: Algorithm, baseKey: CryptoKey, length: number, options?: IProviderCheckOptions, ...args: any[]): Promise<ArrayBuffer>;
  public async deriveBits(...args: any[]): Promise<ArrayBuffer> {
    this.checkDeriveBits.apply(this, args);
    return this.onDeriveBits.apply(this, args);
  }
  public checkDeriveBits(algorithm: Algorithm, baseKey: CryptoKey, length: number, options: IProviderCheckOptions = {}, ...args: any[]) {
    this.checkAlgorithmName(algorithm);
    this.checkAlgorithmParams(algorithm);
    this.checkCryptoKey(baseKey, options.keyUsage ? "deriveBits" : void 0);
    if (length % 8 !== 0) {
      throw new OperationError("length: Is not multiple of 8");
    }
  }
  public async onDeriveBits(algorithm: Algorithm, baseKey: CryptoKey, length: number, ...args: any[]): Promise<ArrayBuffer> {
    throw new UnsupportedOperationError("deriveBits");
  }
  //#endregion

  //#region Export key
  public async exportKey(format: KeyFormat, key: CryptoKey, ...args: any[]): Promise<JsonWebKey | ArrayBuffer>;
  public async exportKey(...args: any[]): Promise<JsonWebKey | ArrayBuffer> {
    this.checkExportKey.apply(this, args);
    return this.onExportKey.apply(this, args);
  }
  public checkExportKey(format: KeyFormat, key: CryptoKey, ...args: any[]) {
    this.checkKeyFormat(format);
    this.checkCryptoKey(key);

    if (!key.extractable) {
      throw new CryptoError("key: Is not extractable");
    }
  }
  public async onExportKey(format: KeyFormat, key: CryptoKey, ...args: any[]): Promise<JsonWebKey | ArrayBuffer> {
    throw new UnsupportedOperationError("exportKey");
  }
  //#endregion

  //#region Import key
  public async importKey(format: KeyFormat, keyData: JsonWebKey | ArrayBuffer, algorithm: Algorithm, extractable: boolean, keyUsages: KeyUsage[], ...args: any[]): Promise<CryptoKey>;
  public async importKey(...args: any[]): Promise<CryptoKey> {
    this.checkImportKey.apply(this, args);
    return this.onImportKey.apply(this, args);
  }
  public checkImportKey(format: KeyFormat, keyData: JsonWebKey | ArrayBuffer, algorithm: Algorithm, extractable: boolean, keyUsages: KeyUsage[], ...args: any[]) {
    this.checkKeyFormat(format);
    this.checkKeyData(format, keyData);
    this.checkAlgorithmName(algorithm);
    this.checkImportParams(algorithm);

    // check key usages
    if (Array.isArray(this.usages)) {
      // symmetric provider
      this.checkKeyUsages(keyUsages, this.usages);
    } else {
      // asymmetric provider
      // TODO: implement
    }
  }
  public async onImportKey(format: KeyFormat, keyData: JsonWebKey | ArrayBuffer, algorithm: Algorithm, extractable: boolean, keyUsages: KeyUsage[], ...args: any[]): Promise<CryptoKey> {
    throw new UnsupportedOperationError("importKey");
  }
  //#endregion

  public checkAlgorithmName(algorithm: Algorithm) {
    if (algorithm.name.toLowerCase() !== this.name.toLowerCase()) {
      throw new AlgorithmError("Unrecognized name");
    }
  }

  public checkAlgorithmParams(algorithm: Algorithm) {
    // nothing
  }

  public checkDerivedKeyParams(algorithm: Algorithm) {
    // nothing
  }

  public checkKeyUsages(usages: KeyUsages, allowed: KeyUsages) {
    for (const usage of usages) {
      if (allowed.indexOf(usage) === -1) {
        throw new TypeError("Cannot create a key using the specified key usages");
      }
    }
  }

  public checkCryptoKey(key: CryptoKey, keyUsage?: KeyUsage) {
    this.checkAlgorithmName(key.algorithm);
    if (keyUsage && key.usages.indexOf(keyUsage) === -1) {
      throw new CryptoError(`key does not match that of operation`);
    }
  }

  public checkRequiredProperty(data: object, propName: string) {
    if (!(propName in data)) {
      throw new RequiredPropertyError(propName);
    }
  }

  public checkHashAlgorithm(algorithm: Algorithm, hashAlgorithms: string[]) {
    for (const item of hashAlgorithms) {
      if (item.toLowerCase() === algorithm.name.toLowerCase()) {
        return;
      }
    }
    throw new OperationError(`hash: Must be one of ${hashAlgorithms.join(", ")}`);
  }

  public checkImportParams(algorithm: Algorithm) {
    // nothing
  }

  public checkKeyFormat(format: any) {
    switch (format) {
      case "raw":
      case "pkcs8":
      case "spki":
      case "jwk":
        break;
      default:
        throw new TypeError("format: Is invalid value. Must be 'jwk', 'raw', 'spki', or 'pkcs8'");
    }
  }

  public checkKeyData(format: KeyFormat, keyData: any) {
    if (!keyData) {
      throw new TypeError("keyData: Cannot be empty on empty on key importing");
    }
    if (format === "jwk") {
      if (!isJWK(keyData)) {
        throw new TypeError("keyData: Is not JsonWebToken");
      }
    } else if (!BufferSourceConverter.isBufferSource(keyData)) {
      throw new TypeError("keyData: Is not ArrayBufferView or ArrayBuffer");
    }
  }

  protected prepareData(data: any) {
    return BufferSourceConverter.toArrayBuffer(data);
  }
}
