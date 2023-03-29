/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import * as supertest from 'supertest';
import Application from '../index';
import { connectDatabase } from '../common/Connection';
import { Url } from './Common';
import { Session } from './Session';
import urljoin = require('url-join');
import Subject from '../resources/dto/SubjectDto';
import fs = require('fs');
/* eslint-enable */

// テストモジュールをインポート
jest.mock('../common/CertificateControl', () => {
    return {
        default: jest.fn().mockImplementation(() => {
            return {
                createRsaPrivateKey: jest.fn(async (opensslPath: string, keyPath: string): Promise<any> => {
                    return null;
                }),
                createRootCertificate: jest.fn(async (opensslPath: string, privateKeyPath: string, certPath: string, periodDay: number, subject: Subject): Promise<any> => {
                    return null;
                }),
                getSerialNoByCertificate: jest.fn(async (opensslPath: string, certPath: string): Promise<any> => {
                    return 'serial=23FB2FF750768C468AB0C85C0127A545';
                }),
                getConvertCertificate: jest.fn((target: string): string => {
                    const result: string[] = target.split('=');
                    return result[1].replace(/\r?\n/g, '');
                }),
                getFingerPrintByCertificate: jest.fn(async (opensslPath: string, certPath: string): Promise<any> => {
                    return 'SHA1 Fingerprint=12:34:56:78:9A:F2:19:A2:0C:1E:57:E3:29:6E:3E:F5:F4:40:15:FF';
                }),
                getValidPeriodByCertificate: jest.fn(async (opensslPath: string, certPath: string): Promise<any> => {
                    return `notBefore=Jul 14 00:00:00 2018 GMT
                            notAfter=Jul 14 23:59:59 2022 GMT`;
                }),
                combineCert: jest.fn((privateKeyPath: string, certPath: string): string => {
                    const privateKey: string = fs.readFileSync(privateKeyPath, 'utf-8');
                    const cert: string = fs.readFileSync(certPath, 'utf-8');
                    return privateKey + cert;
                })
            };
        })
    };
});
jest.mock('../repositories/CertificateManageRepository');

// 対象アプリケーションを取得
const expressApp = Application.express.app;

/**
 * certification-autority API のユニットテスト
 */
describe('certification-autority API', () => {
    /**
     * 全テスト実行の前処理
     */
    beforeAll(async () => {
        await Application.start();
        await connectDatabase();
    });
    /**
     * 各テスト実行の前処理
     */
    beforeEach(async () => {
    });
    /**
     * 全テスト実行の後処理
     */
    afterAll(async () => {
        // サーバ停止
        await Application.stop();

        // モック解除
        jest.deepUnmock('../repositories/CertificateManageRepository');
    });
    /**
     * 各テスト実行の後処理
     */
    afterEach(async () => {
    });

    /**
     * ルート証明書生成
     */
    describe('ルート証明書生成', () => {
        test('異常：DBインサートエラー', async () => {
            // 送信データを生成
            const url = urljoin(Url.rootURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send();

            // レスポンスチェック
            expect(response.status).toBe(503);
            expect(response.body.message).toBe('Unit Test Insert Error');
        });
    });
});
