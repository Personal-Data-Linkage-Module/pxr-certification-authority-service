/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import Subject from '../../resources/dto/SubjectDto';
/* eslint-enable */

/**
 * 証明書操作クラス
 */
export default class CertificateControl {
    /**
     * RSA秘密鍵(2048bit)生成
     * @param keyPath
     */
    public async createRsaPrivateKey (opensslPath:string, keyPath: string) : Promise<any> {
        return 'Unit Test Error';
    }

    /**
     * ルート証明書生成
     * @param privateKeyPath
     * @param certPath
     * @param periodDay
     * @param subject
     */
    public async createRootCertificate (opensslPath:string, privateKeyPath: string, certPath: string, periodDay: number, subject: Subject) : Promise<any> {
        return 'Unit Test Error';
    }

    /**
     * サーバ証明書生成
     * @param keyPath
     * @param certPath
     * @param periodDay
     * @param subject
     */
    public async createServerCertificate (opensslPath:string, keyPath: string, certPath: string, periodDay: number, subject: Subject) : Promise<any> {
        return 'Unit Test Error';
    }

    /**
     * クライアント証明書生成
     * @param keyPath
     * @param certPath
     * @param periodDay
     * @param subject
     */
    public async createClientCertificate (opensslPath:string, keyPath: string, certPath: string, periodDay: number, subject: Subject) : Promise<any> {
        return 'Unit Test Error';
    }

    /**
     * 秘密鍵、証明書結合
     * @param privateKeyPath
     * @param certPath
     */
    public combineCert (privateKeyPath: string, certPath: string) : string {
        return null;
    }

    /**
     * シリアル番号取得(証明書)
     * @param certPath
     */
    public async getSerialNoByCertificate (opensslPath:string, certPath: string) : Promise<string> {
        return null;
    }

    /**
     * フィンガープリント取得(証明書)
     * @param certPath
     */
    public async getFingerPrintByCertificate (opensslPath:string, certPath: string) : Promise<string> {
        return null;
    }

    /**
     * 有効期限取得(証明書)
     * @param certPath
     */
    public async getValidPeriodByCertificate (opensslPath:string, certPath: string) : Promise<string> {
        return null;
    }

    /**
     * OpenSSLの取得結果から対象の値を抽出
     * @param target
     */
    public getConvertCertificate (target: string): string {
        return null;
    }

    /**
     * サーバ証明書失効
     * @param certPath
     */
    public async revokeServerCertificate (opensslPath:string, certPath: string) : Promise<any> {
        return 'Unit Test Error';
    }

    /**
     * クライアント証明書失効
     * @param certPath
     */
    public async revokeClientCertificate (opensslPath:string, certPath: string) : Promise<any> {
        return 'Unit Test Error';
    }
}
