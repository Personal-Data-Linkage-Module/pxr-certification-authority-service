/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import Subject from '../resources/dto/SubjectDto';
/* eslint-enable */
import { applicationLogger } from '../common/logging';
import childProcess = require('child_process');
import fs = require('fs');

/**
 * 証明書操作クラス
 */
export default class CertificateControl {
    /**
     * RSA秘密鍵(2048bit)生成
     * @param keyPath
     */
    public async createRsaPrivateKey (opensslPath:string, keyPath: string) : Promise<any> {
        // opensslコマンドを生成
        const command = '"' + opensslPath + '" genrsa 2048 > "' + keyPath + '"';

        // RSA秘密鍵(2048bit)を生成
        return new Promise((resolve) => {
            childProcess.exec(command, (_error: any, _stdout: any, _stderr: any) => {
                applicationLogger.error(_error);
                resolve(_error);
            });
        });
    }

    /**
     * ルート証明書生成
     * @param privateKeyPath
     * @param certPath
     * @param periodDay
     * @param subject
     */
    public async createRootCertificate (opensslPath:string, privateKeyPath: string, certPath: string, periodDay: number, subject: Subject) : Promise<any> {
        // 登録するサブジェクトを生成
        const commandSubject = '/C=' + subject.C + '/ST=' + subject.ST + '/L=' + subject.L + '/O=' + subject.O + '/OU=' + subject.OU + '/CN=' + subject.CN;

        // opensslコマンドを生成
        const command = '"' + opensslPath + '" req -x509 -key "' + privateKeyPath + '" -out "' + certPath + '" -days ' + periodDay + ' -subj "' + commandSubject + '"';

        // ルート証明書を生成
        return new Promise((resolve) => {
            childProcess.exec(command, (_error: any, _stdout: any, _stderr: any) => {
                applicationLogger.error(_error);
                resolve(_error);
            });
        });
    }

    /**
     * サーバ証明書生成
     * @param keyPath
     * @param certPath
     * @param periodDay
     * @param subject
     */
    public async createServerCertificate (opensslPath:string, keyPath: string, certPath: string, periodDay: number, subject: Subject) : Promise<any> {
        // 登録するサブジェクトを生成
        const commandSubject = '/C=' + subject.C + '/ST=' + subject.ST + '/L=' + subject.L + '/O=' + subject.O + '/OU=' + subject.OU + '/CN=' + subject.CN;

        // opensslコマンドを生成
        const command = '"' + opensslPath + '" req -x509 -key "' + keyPath + '" -out "' + certPath + '" -days ' + periodDay + ' -subj "' + commandSubject + '"';

        // サーバ証明書を生成
        return new Promise((resolve) => {
            childProcess.exec(command, (_error: any, _stdout: any, _stderr: any) => {
                applicationLogger.error(_error);
                resolve(_error);
            });
        });
    }

    /**
     * クライアント証明書生成
     * @param keyPath
     * @param certPath
     * @param periodDay
     * @param subject
     */
    public async createClientCertificate (opensslPath:string, keyPath: string, certPath: string, periodDay: number, subject: Subject) : Promise<any> {
        // 登録するサブジェクトを生成
        const commandSubject = '/C=' + subject.C + '/ST=' + subject.ST + '/L=' + subject.L + '/O=' + subject.O + '/OU=' + subject.OU + '/CN=' + subject.CN;

        // opensslコマンドを生成
        const command = '"' + opensslPath + '" req -x509 -key "' + keyPath + '" -out "' + certPath + '" -days ' + periodDay + ' -subj "' + commandSubject + '"';

        // クライアント証明書を生成
        return new Promise((resolve) => {
            childProcess.exec(command, (_error: any, _stdout: any, _stderr: any) => {
                applicationLogger.error(_error);
                resolve(_error);
            });
        });
    }

    /**
     * 秘密鍵、証明書結合
     * @param privateKeyPath
     * @param certPath
     */
    public combineCert (privateKeyPath: string, certPath: string) : string {
        const privateKey: string = fs.readFileSync(privateKeyPath, 'utf-8');
        const cert: string = fs.readFileSync(certPath, 'utf-8');
        return privateKey + cert;
    }

    /**
     * シリアル番号取得(証明書)
     * @param certPath
     */
    public async getSerialNoByCertificate (opensslPath:string, certPath: string) : Promise<string> {
        // opensslコマンドを生成
        const command = '"' + opensslPath + '" x509 -serial -noout -in "' + certPath + '"';

        // ルート証明書を生成
        return new Promise((resolve) => {
            childProcess.exec(command, (_error: any, _stdout: any, _stderr: any) => {
                applicationLogger.error(_error);
                resolve(_stdout);
            });
        });
    }

    /**
     * フィンガープリント取得(証明書)
     * @param certPath
     */
    public async getFingerPrintByCertificate (opensslPath:string, certPath: string) : Promise<string> {
        // opensslコマンドを生成
        const command = '"' + opensslPath + '" x509 -sha1 -fingerprint -noout -in "' + certPath + '"';

        // ルート証明書を生成
        return new Promise((resolve) => {
            childProcess.exec(command, (_error: any, _stdout: any, _stderr: any) => {
                applicationLogger.error(_error);
                resolve(_stdout);
            });
        });
    }

    /**
     * 有効期限取得(証明書)
     * @param certPath
     */
    public async getValidPeriodByCertificate (opensslPath:string, certPath: string) : Promise<string> {
        // opensslコマンドを生成
        const command = '"' + opensslPath + '" x509 -dates -noout -in "' + certPath + '"';

        // ルート証明書を生成
        return new Promise((resolve) => {
            childProcess.exec(command, (_error: any, _stdout: any, _stderr: any) => {
                applicationLogger.error(_error);
                resolve(_stdout);
            });
        });
    }

    /**
     * OpenSSLの取得結果から対象の値を抽出
     * @param target
     */
    public getConvertCertificate (target: string): string {
        const result: string[] = target.split('=');
        return result[1].replace(/\r?\n/g, '');
    }

    /**
     * サーバ証明書失効
     * @param certPath
     */
    public async revokeServerCertificate (opensslPath:string, certPath: string) : Promise<any> {
        // opensslコマンドを生成
        const command = '"' + opensslPath + '" ca -revoke "' + certPath + '"';

        // サーバ証明書を失効
        return new Promise((resolve) => {
            childProcess.exec(command, (_error: any, _stdout: any, _stderr: any) => {
                applicationLogger.error(_error);
                resolve(_error);
            });
        });
    }

    /**
     * クライアント証明書失効
     * @param certPath
     */
    public async revokeClientCertificate (opensslPath:string, certPath: string) : Promise<any> {
        // opensslコマンドを生成
        const command = '"' + opensslPath + '" ca -revoke "' + certPath + '"';

        // サーバ証明書を失効
        return new Promise((resolve) => {
            childProcess.exec(command, (_error: any, _stdout: any, _stderr: any) => {
                applicationLogger.error(_error);
                resolve(_error);
            });
        });
    }
}
