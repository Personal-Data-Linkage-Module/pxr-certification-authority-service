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
import Subject from '../resources/dto/SubjectDto';
import fs = require('fs');
import urljoin = require('url-join');
/* eslint-enable */

let count = 0;
// テストモジュールをインポート
jest.mock('../common/CertificateControl', () => {
    return {
        default: jest.fn().mockImplementation(() => {
            return {
                createRsaPrivateKey: jest.fn(async (opensslPath: string, keyPath: string): Promise<any> => {
                    return null;
                }),
                createServerCertificate: jest.fn(async (opensslPath: string, privateKeyPath: string, certPath: string, periodDay: number, subject: Subject): Promise<any> => {
                    return null;
                }),
                getSerialNoByCertificate: jest.fn(async (opensslPath: string, certPath: string): Promise<any> => {
                    let serial = null;
                    if (count === 0) {
                        serial = 'serial=03FB2FF750768C468AB0C85C0127A545';
                    } else if (count === 1) {
                        serial = 'serial=13FB2FF750768C468AB0C85C0127A545';
                    } else if (count === 2) {
                        serial = 'serial=23FB2FF750768C468AB0C85C0127A545';
                    } else if (count === 3) {
                        serial = 'serial=33FB2FF750768C468AB0C85C0127A545';
                    } else if (count === 4) {
                        serial = 'serial=43FB2FF750768C468AB0C85C0127A545';
                    } else if (count === 5) {
                        serial = 'serial=53FB2FF750768C468AB0C85C0127A545';
                    }
                    return serial;
                }),
                getConvertCertificate: jest.fn((target: string): string => {
                    const result: string[] = target.split('=');
                    return result[1].replace(/\r?\n/g, '');
                }),
                getFingerPrintByCertificate: jest.fn(async (opensslPath: string, certPath: string): Promise<any> => {
                    let fingerprint = null;
                    if (count === 0) {
                        fingerprint = 'SHA1 Fingerprint=02:34:56:78:9A:F2:19:A2:0C:1E:57:E3:29:6E:3E:F5:F4:40:15:FF';
                    } else if (count === 1) {
                        fingerprint = 'SHA1 Fingerprint=12:34:56:78:9A:F2:19:A2:0C:1E:57:E3:29:6E:3E:F5:F4:40:15:FF';
                    } else if (count === 2) {
                        fingerprint = 'SHA1 Fingerprint=22:34:56:78:9A:F2:19:A2:0C:1E:57:E3:29:6E:3E:F5:F4:40:15:FF';
                    } else if (count === 3) {
                        fingerprint = 'SHA1 Fingerprint=32:34:56:78:9A:F2:19:A2:0C:1E:57:E3:29:6E:3E:F5:F4:40:15:FF';
                    } else if (count === 4) {
                        fingerprint = 'SHA1 Fingerprint=42:34:56:78:9A:F2:19:A2:0C:1E:57:E3:29:6E:3E:F5:F4:40:15:FF';
                    } else if (count === 5) {
                        fingerprint = 'SHA1 Fingerprint=52:34:56:78:9A:F2:19:A2:0C:1E:57:E3:29:6E:3E:F5:F4:40:15:FF';
                    }
                    return fingerprint;
                }),
                getValidPeriodByCertificate: jest.fn(async (opensslPath: string, certPath: string): Promise<any> => {
                    return `notBefore=Jul 14 00:00:00 2018 GMT
                            notAfter=Jul 14 23:59:59 2022 GMT`;
                }),
                combineCert: jest.fn((privateKeyPath: string, certPath: string): string => {
                    count++;
                    const privateKey: string = fs.readFileSync(privateKeyPath, 'utf-8');
                    const cert: string = fs.readFileSync(certPath, 'utf-8');
                    return privateKey + cert;
                }),
                revokeServerCertificate: jest.fn(async (opensslPath: string, certPath: string): Promise<any> => {
                    return null;
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
     * サーバ証明書生成
     */
    describe('サーバ証明書生成', () => {
        test('異常：DBインサートエラー', async () => {
            // 送信データを生成
            const url = urljoin(Url.serverURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    certType: 'server',
                    actorName: 'test-unit',
                    actor: {
                        value: 10001,
                        ver: 1
                    },
                    block: {
                        value: 10002,
                        ver: 2
                    }
                });

            // レスポンスチェック
            expect(response.status).toBe(503);
            expect(response.body.message).toBe('Unit Test Insert Error');
        });
    });
});
