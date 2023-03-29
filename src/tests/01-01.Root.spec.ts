/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import * as supertest from 'supertest';
import Application from '../index';
import { connectDatabase } from '../common/Connection';
import Common, { Url } from './Common';
import { Session } from './Session';
import Config from '../common/Config';
import StubOperatorServer from './StubOperatorServer';
import Subject from '../resources/dto/SubjectDto';
import fs = require('fs');
import urljoin = require('url-join');
const Message = Config.ReadConfig('./config/message.json');
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

// 対象アプリケーションを取得
const expressApp = Application.express.app;
const common = new Common();

// 設定ファイル読込
const config = Config.ReadConfig('./config/config.json');

// スタブサーバー（オペレータサービス）
let _operatorServer: StubOperatorServer = null;

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

        // サーバ停止
        await Application.stop();
    });
    /**
     * 各テスト実行の後処理
     */
    afterEach(async () => {
        // スタブサーバー停止
        if (_operatorServer) {
            _operatorServer._server.close();
            _operatorServer = null;
        }
    });

    /**
     * ルート証明書生成
     */
    describe('ルート証明書生成', () => {
        test('正常：初回生成', async () => {
            // 送信データを生成
            const url = urljoin(Url.rootURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({});

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.certType).toBe('root');
            expect(response.body.subject).not.toBeNull();
            expect(response.body.subject.C).toBe(config['root']['subject']['C']);
            expect(response.body.subject.ST).toBe(config['root']['subject']['ST']);
            expect(response.body.subject.L).toBe(config['root']['subject']['L']);
            expect(response.body.subject.O).toBe(config['root']['subject']['O']);
            expect(response.body.subject.OU).toBe(config['root']['subject']['OU']);
            expect(response.body.subject.CN).toBe(config['root']['subject']['CN']);
            expect(response.body.serialNo).not.toBeNull();
            expect(response.body.fingerPrint).not.toBeNull();
            expect(response.body.validPeriodStart).not.toBeNull();
            expect(response.body.validPeriodEnd).not.toBeNull();
            expect(response.body.certificate).not.toBeNull();
        });
        test('正常：2回目以降の生成', async () => {
            // 送信データを生成
            const url = urljoin(Url.rootURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send();

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.certType).toBe('root');
            expect(response.body.subject).not.toBeNull();
            expect(response.body.subject.C).toBe(config['root']['subject']['C']);
            expect(response.body.subject.ST).toBe(config['root']['subject']['ST']);
            expect(response.body.subject.L).toBe(config['root']['subject']['L']);
            expect(response.body.subject.O).toBe(config['root']['subject']['O']);
            expect(response.body.subject.OU).toBe(config['root']['subject']['OU']);
            expect(response.body.subject.CN).toBe(config['root']['subject']['CN']);
            expect(response.body.serialNo).not.toBeNull();
            expect(response.body.fingerPrint).not.toBeNull();
            expect(response.body.validPeriodStart).not.toBeNull();
            expect(response.body.validPeriodEnd).not.toBeNull();
            expect(response.body.certificate).not.toBeNull();
        });
        test('正常：Cookie使用, 個人', async () => {
            // スタブサーバー起動
            _operatorServer = new StubOperatorServer(200);

            // 送信データを生成
            const url = urljoin(Url.rootURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type0_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send();

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.id).not.toBeNull();
        });
        test('正常：Cookie使用, アプリケーション', async () => {
            // スタブサーバー起動
            _operatorServer = new StubOperatorServer(200);

            // 送信データを生成
            const url = urljoin(Url.rootURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type2_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send();

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.id).not.toBeNull();
        });
        test('正常：Cookie使用, 運営メンバー', async () => {
            // スタブサーバー起動
            _operatorServer = new StubOperatorServer(200);

            // 送信データを生成
            const url = urljoin(Url.rootURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send();

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.id).not.toBeNull();
        });
        test('異常：Cookie使用, オペレータサービス未起動', async () => {
            // 送信データを生成
            const url = urljoin(Url.rootURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send();

            // レスポンスチェック
            expect(response.status).toBe(500);
            expect(response.body.message).toBe(Message.FAILED_CONNECT_TO_OPERATOR);
        });
        test('異常：Cookie使用, オペレータサービス応答400系', async () => {
            // スタブサーバー起動
            _operatorServer = new StubOperatorServer(400);

            // 送信データを生成
            const url = urljoin(Url.rootURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send();

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_AUTHORIZED);
        });
        test('異常：Cookie使用, オペレータサービス応答500系', async () => {
            // スタブサーバー起動
            _operatorServer = new StubOperatorServer(500);

            // 送信データを生成
            const url = urljoin(Url.rootURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send();

            // レスポンスチェック
            expect(response.status).toBe(500);
            expect(response.body.message).toBe(Message.FAILED_TAKE_SESSION);
        });
        test('異常：セッションなし', async () => {
            // 送信データを生成
            const url = urljoin(Url.rootURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send();

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_AUTHORIZED);
        });
    });

    /**
     * ルート証明書取得
     */
    describe('ルート証明書取得', () => {
        test('正常：取得', async () => {
            // 送信データを生成
            const url = urljoin(Url.rootURI);

            // 対象APIに送信
            const response = await supertest(expressApp).get(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send();

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.certType).toBe('root');
            expect(response.body.subject).not.toBeNull();
            expect(response.body.subject.C).toBe(config['root']['subject']['C']);
            expect(response.body.subject.ST).toBe(config['root']['subject']['ST']);
            expect(response.body.subject.L).toBe(config['root']['subject']['L']);
            expect(response.body.subject.O).toBe(config['root']['subject']['O']);
            expect(response.body.subject.OU).toBe(config['root']['subject']['OU']);
            expect(response.body.subject.CN).toBe(config['root']['subject']['CN']);
            expect(response.body.serialNo).not.toBeNull();
            expect(response.body.fingerPrint).not.toBeNull();
            expect(response.body.validPeriodStart).not.toBeNull();
            expect(response.body.validPeriodEnd).not.toBeNull();
            expect(response.body.certificate).not.toBeNull();
        });
        test('正常：Cookie使用, 個人', async () => {
            // スタブサーバー起動
            _operatorServer = new StubOperatorServer(200);

            // 送信データを生成
            const url = urljoin(Url.rootURI);

            // 対象APIに送信
            const response = await supertest(expressApp).get(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type0_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send();

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.certType).toBe('root');
            expect(response.body.subject).not.toBeNull();
            expect(response.body.subject.C).toBe(config['root']['subject']['C']);
            expect(response.body.subject.ST).toBe(config['root']['subject']['ST']);
            expect(response.body.subject.L).toBe(config['root']['subject']['L']);
            expect(response.body.subject.O).toBe(config['root']['subject']['O']);
            expect(response.body.subject.OU).toBe(config['root']['subject']['OU']);
            expect(response.body.subject.CN).toBe(config['root']['subject']['CN']);
            expect(response.body.serialNo).not.toBeNull();
            expect(response.body.fingerPrint).not.toBeNull();
            expect(response.body.validPeriodStart).not.toBeNull();
            expect(response.body.validPeriodEnd).not.toBeNull();
            expect(response.body.certificate).not.toBeNull();
        });
        test('正常：Cookie使用, アプリケーション', async () => {
            // スタブサーバー起動
            _operatorServer = new StubOperatorServer(200);

            // 送信データを生成
            const url = urljoin(Url.rootURI);

            // 対象APIに送信
            const response = await supertest(expressApp).get(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type2_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send();

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.certType).toBe('root');
            expect(response.body.subject).not.toBeNull();
            expect(response.body.subject.C).toBe(config['root']['subject']['C']);
            expect(response.body.subject.ST).toBe(config['root']['subject']['ST']);
            expect(response.body.subject.L).toBe(config['root']['subject']['L']);
            expect(response.body.subject.O).toBe(config['root']['subject']['O']);
            expect(response.body.subject.OU).toBe(config['root']['subject']['OU']);
            expect(response.body.subject.CN).toBe(config['root']['subject']['CN']);
            expect(response.body.serialNo).not.toBeNull();
            expect(response.body.fingerPrint).not.toBeNull();
            expect(response.body.validPeriodStart).not.toBeNull();
            expect(response.body.validPeriodEnd).not.toBeNull();
            expect(response.body.certificate).not.toBeNull();
        });
        test('正常：Cookie使用, 運営メンバー', async () => {
            // スタブサーバー起動
            _operatorServer = new StubOperatorServer(200);

            // 送信データを生成
            const url = urljoin(Url.rootURI);

            // 対象APIに送信
            const response = await supertest(expressApp).get(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send();

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.certType).toBe('root');
            expect(response.body.subject).not.toBeNull();
            expect(response.body.subject.C).toBe(config['root']['subject']['C']);
            expect(response.body.subject.ST).toBe(config['root']['subject']['ST']);
            expect(response.body.subject.L).toBe(config['root']['subject']['L']);
            expect(response.body.subject.O).toBe(config['root']['subject']['O']);
            expect(response.body.subject.OU).toBe(config['root']['subject']['OU']);
            expect(response.body.subject.CN).toBe(config['root']['subject']['CN']);
            expect(response.body.serialNo).not.toBeNull();
            expect(response.body.fingerPrint).not.toBeNull();
            expect(response.body.validPeriodStart).not.toBeNull();
            expect(response.body.validPeriodEnd).not.toBeNull();
            expect(response.body.certificate).not.toBeNull();
        });
        test('異常：Cookie使用, オペレータサービス未起動', async () => {
            // 送信データを生成
            const url = urljoin(Url.rootURI);

            // 対象APIに送信
            const response = await supertest(expressApp).get(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send();

            // レスポンスチェック
            expect(response.status).toBe(500);
            expect(response.body.message).toBe(Message.FAILED_CONNECT_TO_OPERATOR);
        });
        test('異常：Cookie使用, オペレータサービス応答400系', async () => {
            // スタブサーバー起動
            _operatorServer = new StubOperatorServer(400);

            // 送信データを生成
            const url = urljoin(Url.rootURI);

            // 対象APIに送信
            const response = await supertest(expressApp).get(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send();

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_AUTHORIZED);
        });
        test('異常：Cookie使用, オペレータサービス応答500系', async () => {
            // スタブサーバー起動
            _operatorServer = new StubOperatorServer(500);

            // 送信データを生成
            const url = urljoin(Url.rootURI);

            // 対象APIに送信
            const response = await supertest(expressApp).get(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send();

            // レスポンスチェック
            expect(response.status).toBe(500);
            expect(response.body.message).toBe(Message.FAILED_TAKE_SESSION);
        });
        test('異常：セッションなし', async () => {
            // 送信データを生成
            const url = urljoin(Url.rootURI);

            // 対象APIに送信
            const response = await supertest(expressApp).get(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send();

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_AUTHORIZED);
        });
        test('異常：対象データなし', async () => {
            // 事前データ準備
            await common.executeSqlFile('initialData.sql');

            // 送信データを生成
            const url = urljoin(Url.rootURI);

            // 対象APIに送信
            const response = await supertest(expressApp).get(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send();

            // レスポンスチェック
            expect(response.status).toBe(204);
            // expect(response.body.message).toBe(Message.TARGET_NO_DATA);
        });
    });
});
