/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import Subject from '../resources/dto/SubjectDto';
/* eslint-enable */
import * as supertest from 'supertest';
import Application from '../index';
import { connectDatabase } from '../common/Connection';
import Common, { Url } from './Common';
import { Session } from './Session';
import Config from '../common/Config';
const Message = Config.ReadConfig('./config/message.json');
import urljoin = require('url-join');

// テストモジュールをインポート
jest.mock('../common/CertificateControl', () => {
    return {
        default: jest.fn().mockImplementation(() => {
            return {
                createRsaPrivateKey: jest.fn(async (opensslPath:string, keyPath: string) : Promise<any> => {
                    return null;
                }),
                createServerCertificate: jest.fn(async (opensslPath:string, privateKeyPath: string, certPath: string, periodDay: number, subject: Subject) : Promise<any> => {
                    return null;
                }),
                getConvertCertificate: jest.fn((target: string): string => {
                    return 'convert';
                }),
                getSerialNoByCertificate: jest.fn(async (opensslPath:string, certPath: string) : Promise<string> => {
                    return 'Serial';
                }),
                getFingerPrintByCertificate: jest.fn(async (opensslPath:string, certPath: string) : Promise<string> => {
                    return 'FingerPrint';
                }),
                getValidPeriodByCertificate: jest.fn(async (opensslPath:string, certPath: string) : Promise<string> => {
                    return null;
                })
            };
        })
    };
});

// 対象アプリケーションを取得
const expressApp = Application.express.app;
const common = new Common();

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

        // DB接続
        await common.connect();
        // DB初期化
        await common.executeSqlFile('initialData.sql');
        await common.executeSqlFile('insertCertificate.sql');
    });
    /**
     * 各テスト実行の前処理
     */
    beforeEach(async () => {
        // DB接続
        await common.connect();
    });
    /**
     * 全テスト実行の後処理
     */
    afterAll(async () => {
        // DB切断
        await common.disconnect();

        // ルート停止
        await Application.stop();

        // モック解除
        jest.deepUnmock('../common/CertificateControl');
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
        test('異常：OpenSSL有効期間取得エラー', async () => {
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
            expect(response.body.message).toBe(Message.FAILED_OPENSSL_CONVERT);
        });
    });
});
