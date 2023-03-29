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
import { sprintf } from 'sprintf-js';
import Subject from '../resources/dto/SubjectDto';
import fs = require('fs');
import urljoin = require('url-join');
const Message = Config.ReadConfig('./config/message.json');
/* eslint-enable */

let createCnt = 0;
let revokeCnt = 0;
// テストモジュールをインポート
jest.mock('../common/CertificateControl', () => {
    return {
        default: jest.fn().mockImplementation(() => {
            return {
                createRsaPrivateKey: jest.fn(async (opensslPath: string, keyPath: string): Promise<any> => {
                    return null;
                }),
                createClientCertificate: jest.fn(async (opensslPath: string, privateKeyPath: string, certPath: string, periodDay: number, subject: Subject): Promise<any> => {
                    return null;
                }),
                getSerialNoByCertificate: jest.fn(async (opensslPath: string, certPath: string): Promise<any> => {
                    let serial = null;
                    if (createCnt === 0) {
                        serial = 'serial=03FB2FF750768C468AB0C85C0127A545';
                    } else if (createCnt === 1) {
                        serial = 'serial=13FB2FF750768C468AB0C85C0127A545';
                    } else if (createCnt === 2) {
                        serial = 'serial=23FB2FF750768C468AB0C85C0127A545';
                    } else if (createCnt === 3) {
                        serial = 'serial=33FB2FF750768C468AB0C85C0127A545';
                    } else if (createCnt === 4) {
                        serial = 'serial=43FB2FF750768C468AB0C85C0127A545';
                    } else if (createCnt === 5) {
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
                    if (createCnt === 0) {
                        fingerprint = 'SHA1 Fingerprint=02:34:56:78:9A:F2:19:A2:0C:1E:57:E3:29:6E:3E:F5:F4:40:15:FF';
                    } else if (createCnt === 1) {
                        fingerprint = 'SHA1 Fingerprint=12:34:56:78:9A:F2:19:A2:0C:1E:57:E3:29:6E:3E:F5:F4:40:15:FF';
                    } else if (createCnt === 2) {
                        fingerprint = 'SHA1 Fingerprint=22:34:56:78:9A:F2:19:A2:0C:1E:57:E3:29:6E:3E:F5:F4:40:15:FF';
                    } else if (createCnt === 3) {
                        fingerprint = 'SHA1 Fingerprint=32:34:56:78:9A:F2:19:A2:0C:1E:57:E3:29:6E:3E:F5:F4:40:15:FF';
                    } else if (createCnt === 4) {
                        fingerprint = 'SHA1 Fingerprint=42:34:56:78:9A:F2:19:A2:0C:1E:57:E3:29:6E:3E:F5:F4:40:15:FF';
                    } else if (createCnt === 5) {
                        fingerprint = 'SHA1 Fingerprint=52:34:56:78:9A:F2:19:A2:0C:1E:57:E3:29:6E:3E:F5:F4:40:15:FF';
                    }
                    return fingerprint;
                }),
                getValidPeriodByCertificate: jest.fn(async (opensslPath: string, certPath: string): Promise<any> => {
                    return `notBefore=Jul 14 00:00:00 2018 GMT
                            notAfter=Jul 14 23:59:59 2022 GMT`;
                }),
                combineCert: jest.fn((privateKeyPath: string, certPath: string): string => {
                    createCnt++;
                    const privateKey: string = fs.readFileSync(privateKeyPath, 'utf-8');
                    const cert: string = fs.readFileSync(certPath, 'utf-8');
                    return privateKey + cert;
                }),
                revokeClientCertificate: jest.fn(async (opensslPath: string, certPath: string): Promise<any> => {
                    if (revokeCnt === 1) {
                        return 'ERROR:Already revoked, serial number ~';
                    }
                    revokeCnt++;
                    return null;
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

// スタブクライアントー（オペレータサービス）
let _operatorServer: StubOperatorServer = null;

// 証明書情報
const serialNoList: string[] = [];
const fingerPrintList: string[] = [];

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

        // クライアント停止
        await Application.stop();
    });
    /**
     * 各テスト実行の後処理
     */
    afterEach(async () => {
        // スタブクライアントー停止
        if (_operatorServer) {
            _operatorServer._server.close();
            _operatorServer = null;
        }
    });

    /**
     * クライアント証明書生成
     */
    describe('クライアント証明書生成', () => {
        test('正常：初回生成', async () => {
            // 送信データを生成
            const url = urljoin(Url.clientURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    certType: 'client',
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
            expect(response.status).toBe(200);
            expect(response.body.certType).toBe('client');
            expect(response.body.subject).not.toBeNull();
            expect(response.body.subject.C).toBe(config['server']['subject']['C']);
            expect(response.body.subject.ST).toBe(config['server']['subject']['ST']);
            expect(response.body.subject.L).toBe(config['server']['subject']['L']);
            expect(response.body.subject.O).toBe(config['server']['subject']['O']);
            expect(response.body.subject.CN).toBe(config['server']['subject']['CN']);
            expect(response.body.serialNo).not.toBeNull();
            expect(response.body.fingerPrint).not.toBeNull();
            expect(response.body.validPeriodStart).not.toBeNull();
            expect(response.body.validPeriodEnd).not.toBeNull();
            expect(response.body.certificate).not.toBeNull();
            serialNoList.push(response.body.serialNo);
            fingerPrintList.push(response.body.fingerPrint);
        });
        test('正常：2回目以降の生成', async () => {
            // 送信データを生成
            const url = urljoin(Url.clientURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    certType: 'client',
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
            expect(response.status).toBe(200);
            expect(response.body.certType).toBe('client');
            expect(response.body.subject).not.toBeNull();
            expect(response.body.subject.C).toBe(config['server']['subject']['C']);
            expect(response.body.subject.ST).toBe(config['server']['subject']['ST']);
            expect(response.body.subject.L).toBe(config['server']['subject']['L']);
            expect(response.body.subject.O).toBe(config['server']['subject']['O']);
            expect(response.body.subject.CN).toBe(config['server']['subject']['CN']);
            expect(response.body.serialNo).not.toBeNull();
            expect(response.body.fingerPrint).not.toBeNull();
            expect(response.body.validPeriodStart).not.toBeNull();
            expect(response.body.validPeriodEnd).not.toBeNull();
            expect(response.body.certificate).not.toBeNull();
            serialNoList.push(response.body.serialNo);
            fingerPrintList.push(response.body.fingerPrint);
        });
        test('正常：Cookie使用, 個人', async () => {
            // スタブクライアントー起動
            _operatorServer = new StubOperatorServer(200);

            // 送信データを生成
            const url = urljoin(Url.clientURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type0_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send({
                    certType: 'client',
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
            expect(response.status).toBe(200);
            expect(response.body.certType).toBe('client');
            expect(response.body.subject).not.toBeNull();
            expect(response.body.subject.C).toBe(config['server']['subject']['C']);
            expect(response.body.subject.ST).toBe(config['server']['subject']['ST']);
            expect(response.body.subject.L).toBe(config['server']['subject']['L']);
            expect(response.body.subject.O).toBe(config['server']['subject']['O']);
            expect(response.body.subject.CN).toBe(config['server']['subject']['CN']);
            expect(response.body.serialNo).not.toBeNull();
            expect(response.body.fingerPrint).not.toBeNull();
            expect(response.body.validPeriodStart).not.toBeNull();
            expect(response.body.validPeriodEnd).not.toBeNull();
            expect(response.body.certificate).not.toBeNull();
            serialNoList.push(response.body.serialNo);
            fingerPrintList.push(response.body.fingerPrint);
        });
        test('正常：Cookie使用, アプリケーション', async () => {
            // スタブクライアントー起動
            _operatorServer = new StubOperatorServer(200);

            // 送信データを生成
            const url = urljoin(Url.clientURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type2_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send({
                    certType: 'client',
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
            expect(response.status).toBe(200);
            expect(response.body.certType).toBe('client');
            expect(response.body.subject).not.toBeNull();
            expect(response.body.subject.C).toBe(config['server']['subject']['C']);
            expect(response.body.subject.ST).toBe(config['server']['subject']['ST']);
            expect(response.body.subject.L).toBe(config['server']['subject']['L']);
            expect(response.body.subject.O).toBe(config['server']['subject']['O']);
            expect(response.body.subject.CN).toBe(config['server']['subject']['CN']);
            expect(response.body.serialNo).not.toBeNull();
            expect(response.body.fingerPrint).not.toBeNull();
            expect(response.body.validPeriodStart).not.toBeNull();
            expect(response.body.validPeriodEnd).not.toBeNull();
            expect(response.body.certificate).not.toBeNull();
            serialNoList.push(response.body.serialNo);
            fingerPrintList.push(response.body.fingerPrint);
        });
        test('正常：Cookie使用, 運営メンバー', async () => {
            // スタブクライアントー起動
            _operatorServer = new StubOperatorServer(200);

            // 送信データを生成
            const url = urljoin(Url.clientURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send({
                    certType: 'client',
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
            expect(response.status).toBe(200);
            expect(response.body.certType).toBe('client');
            expect(response.body.subject).not.toBeNull();
            expect(response.body.subject.C).toBe(config['server']['subject']['C']);
            expect(response.body.subject.ST).toBe(config['server']['subject']['ST']);
            expect(response.body.subject.L).toBe(config['server']['subject']['L']);
            expect(response.body.subject.O).toBe(config['server']['subject']['O']);
            expect(response.body.subject.CN).toBe(config['server']['subject']['CN']);
            expect(response.body.serialNo).not.toBeNull();
            expect(response.body.fingerPrint).not.toBeNull();
            expect(response.body.validPeriodStart).not.toBeNull();
            expect(response.body.validPeriodEnd).not.toBeNull();
            expect(response.body.certificate).not.toBeNull();
            serialNoList.push(response.body.serialNo);
            fingerPrintList.push(response.body.fingerPrint);
        });
        test('異常：Cookie使用, オペレータサービス未起動', async () => {
            // 送信データを生成
            const url = urljoin(Url.clientURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send({
                    certType: 'client',
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
            expect(response.status).toBe(500);
            expect(response.body.message).toBe(Message.FAILED_CONNECT_TO_OPERATOR);
        });
        test('異常：Cookie使用, オペレータサービス応答400系', async () => {
            // スタブクライアントー起動
            _operatorServer = new StubOperatorServer(400);

            // 送信データを生成
            const url = urljoin(Url.clientURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send({
                    certType: 'client',
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
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_AUTHORIZED);
        });
        test('異常：Cookie使用, オペレータサービス応答500系', async () => {
            // スタブクライアントー起動
            _operatorServer = new StubOperatorServer(500);

            // 送信データを生成
            const url = urljoin(Url.clientURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send({
                    certType: 'client',
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
            expect(response.status).toBe(500);
            expect(response.body.message).toBe(Message.FAILED_TAKE_SESSION);
        });
        test('異常：セッションなし', async () => {
            // 送信データを生成
            const url = urljoin(Url.clientURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({
                    certType: 'client',
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
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_AUTHORIZED);
        });
        test('パラメータ不足：certType', async () => {
            // 送信データを生成
            const url = urljoin(Url.clientURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
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
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(sprintf(Message.validation.isDefined, 'certType'));
        });
        test('パラメータ不足：actorName', async () => {
            // 送信データを生成
            const url = urljoin(Url.clientURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    certType: 'client',
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
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(sprintf(Message.validation.isDefined, 'actorName'));
        });
        test('パラメータ不足：actor', async () => {
            // 送信データを生成
            const url = urljoin(Url.clientURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    certType: 'client',
                    actorName: 'test-unit',
                    block: {
                        value: 10002,
                        ver: 2
                    }
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(sprintf(Message.validation.isDefined, 'actor'));
        });
        test('パラメータ不足：actor.value', async () => {
            // 送信データを生成
            const url = urljoin(Url.clientURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    certType: 'client',
                    actorName: 'test-unit',
                    actor: {
                        ver: 1
                    },
                    block: {
                        value: 10002,
                        ver: 2
                    }
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(sprintf(Message.validation.isDefined, 'actor.value'));
        });
        test('パラメータ不足：actor.ver', async () => {
            // 送信データを生成
            const url = urljoin(Url.clientURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    certType: 'client',
                    actorName: 'test-unit',
                    actor: {
                        value: 10001
                    },
                    block: {
                        value: 10002,
                        ver: 2
                    }
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(sprintf(Message.validation.isDefined, 'actor.ver'));
        });
        test('パラメータ不足：block', async () => {
            // 送信データを生成
            const url = urljoin(Url.clientURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    certType: 'client',
                    actorName: 'test-unit',
                    actor: {
                        value: 10001,
                        ver: 1
                    }
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(sprintf(Message.validation.isDefined, 'block'));
        });
        test('パラメータ不足：block.value', async () => {
            // 送信データを生成
            const url = urljoin(Url.clientURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    certType: 'client',
                    actorName: 'test-unit',
                    actor: {
                        value: 10001,
                        ver: 1
                    },
                    block: {
                        ver: 2
                    }
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(sprintf(Message.validation.isDefined, 'block.value'));
        });
        test('パラメータ不足：block.ver', async () => {
            // 送信データを生成
            const url = urljoin(Url.clientURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    certType: 'client',
                    actorName: 'test-unit',
                    actor: {
                        value: 10001,
                        ver: 1
                    },
                    block: {
                        value: 10002
                    }
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(sprintf(Message.validation.isDefined, 'block.ver'));
        });
        test('パラメータ不足：リクエストが空', async () => {
            // 送信データを生成
            const url = urljoin(Url.clientURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({});

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.REQUEST_IS_EMPTY);
        });
        test('パラメータ異常：certType', async () => {
            // 送信データを生成
            const url = urljoin(Url.clientURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    certType: '',
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
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(sprintf(Message.validation.isNotEmpty, 'certType'));
        });
        test('パラメータ異常：actorName', async () => {
            // 送信データを生成
            const url = urljoin(Url.clientURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    certType: 'client',
                    actorName: '',
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
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(sprintf(Message.validation.isNotEmpty, 'actorName'));
        });
        test('パラメータ異常：block.value', async () => {
            // 送信データを生成
            const url = urljoin(Url.clientURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    certType: 'client',
                    actorName: 'test-unit',
                    actor: {
                        value: 10001,
                        ver: 1
                    },
                    block: {
                        value: 'XXXXX',
                        ver: 2
                    }
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(sprintf(Message.validation.isNumber, 'block.value'));
        });
        test('パラメータ異常：block.value', async () => {
            // 送信データを生成
            const url = urljoin(Url.clientURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    certType: 'client',
                    actorName: 'test-unit',
                    actor: {
                        value: 10001,
                        ver: 1
                    },
                    block: {
                        value: null,
                        ver: 2
                    }
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(sprintf(Message.validation.isDefined, 'block.value'));
        });
        test('パラメータ異常：block.ver', async () => {
            // 送信データを生成
            const url = urljoin(Url.clientURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    certType: 'client',
                    actorName: 'test-unit',
                    actor: {
                        value: 10001,
                        ver: 1
                    },
                    block: {
                        value: 10002,
                        ver: 'XXXXX'
                    }
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(sprintf(Message.validation.isNumber, 'block.ver'));
        });
        test('パラメータ異常：block.ver', async () => {
            // 送信データを生成
            const url = urljoin(Url.clientURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    certType: 'client',
                    actorName: 'test-unit',
                    actor: {
                        value: 10001,
                        ver: 1
                    },
                    block: {
                        value: 10002,
                        ver: null
                    }
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(sprintf(Message.validation.isDefined, 'block.ver'));
        });
        test('パラメータ異常：actor.value', async () => {
            // 送信データを生成
            const url = urljoin(Url.clientURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    certType: 'client',
                    actorName: 'test-unit',
                    actor: {
                        value: 'XXXXX',
                        ver: 1
                    },
                    block: {
                        value: 10002,
                        ver: 2
                    }
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(sprintf(Message.validation.isNumber, 'actor.value'));
        });
        test('パラメータ異常：actor.value', async () => {
            // 送信データを生成
            const url = urljoin(Url.clientURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    certType: 'client',
                    actorName: 'test-unit',
                    actor: {
                        value: null,
                        ver: 1
                    },
                    block: {
                        value: 10002,
                        ver: 2
                    }
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(sprintf(Message.validation.isDefined, 'actor.value'));
        });
        test('パラメータ異常：actor.ver', async () => {
            // 送信データを生成
            const url = urljoin(Url.clientURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    certType: 'client',
                    actorName: 'test-unit',
                    actor: {
                        value: 10001,
                        ver: 'XXXXX'
                    },
                    block: {
                        value: 10002,
                        ver: 2
                    }
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(sprintf(Message.validation.isNumber, 'actor.ver'));
        });
        test('パラメータ異常：actor.ver', async () => {
            // 送信データを生成
            const url = urljoin(Url.clientURI);

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    certType: 'client',
                    actorName: 'test-unit',
                    actor: {
                        value: 10001,
                        ver: null
                    },
                    block: {
                        value: 10002,
                        ver: 2
                    }
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(sprintf(Message.validation.isDefined, 'actor.ver'));
        });
    });

    /**
     * クライアント証明書取得
     */
    describe('クライアント証明書取得', () => {
        test('正常：取得', async () => {
            // 送信データを生成
            const serialNo: string = serialNoList.length > 0 ? serialNoList[0] : 'XXXXX';
            const fingerPrint: string = fingerPrintList.length > 0 ? fingerPrintList[0] : 'YYYYY';
            const url = urljoin(Url.clientURI, '/' + serialNo, '/' + fingerPrint);

            // 対象APIに送信
            const response = await supertest(expressApp).get(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send();

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.certType).toBe('client');
            expect(response.body.subject).not.toBeNull();
            expect(response.body.subject.C).toBe(config['server']['subject']['C']);
            expect(response.body.subject.ST).toBe(config['server']['subject']['ST']);
            expect(response.body.subject.L).toBe(config['server']['subject']['L']);
            expect(response.body.subject.O).toBe(config['server']['subject']['O']);
            expect(response.body.subject.CN).toBe(config['server']['subject']['CN']);
            expect(response.body.serialNo).not.toBeNull();
            expect(response.body.fingerPrint).not.toBeNull();
            expect(response.body.validPeriodStart).not.toBeNull();
            expect(response.body.validPeriodEnd).not.toBeNull();
            expect(response.body.certificate).not.toBeNull();
        });
        test('正常：Cookie使用, 個人', async () => {
            // スタブクライアントー起動
            _operatorServer = new StubOperatorServer(200);

            // 送信データを生成
            const serialNo: string = serialNoList.length > 0 ? serialNoList[0] : 'XXXXX';
            const fingerPrint: string = fingerPrintList.length > 0 ? fingerPrintList[0] : 'YYYYY';
            const url = urljoin(Url.clientURI, '/' + serialNo, '/' + fingerPrint);

            // 対象APIに送信
            const response = await supertest(expressApp).get(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type0_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send();

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.id).not.toBeNull();
        });
        test('正常：Cookie使用, アプリケーション', async () => {
            // スタブクライアントー起動
            _operatorServer = new StubOperatorServer(200);

            // 送信データを生成
            const serialNo: string = serialNoList.length > 0 ? serialNoList[0] : 'XXXXX';
            const fingerPrint: string = fingerPrintList.length > 0 ? fingerPrintList[0] : 'YYYYY';
            const url = urljoin(Url.clientURI, '/' + serialNo, '/' + fingerPrint);

            // 対象APIに送信
            const response = await supertest(expressApp).get(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type2_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send();

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.id).not.toBeNull();
        });
        test('正常：Cookie使用, 運営メンバー', async () => {
            // スタブクライアントー起動
            _operatorServer = new StubOperatorServer(200);

            // 送信データを生成
            const serialNo: string = serialNoList.length > 0 ? serialNoList[0] : 'XXXXX';
            const fingerPrint: string = fingerPrintList.length > 0 ? fingerPrintList[0] : 'YYYYY';
            const url = urljoin(Url.clientURI, '/' + serialNo, '/' + fingerPrint);

            // 対象APIに送信
            const response = await supertest(expressApp).get(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send();

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.id).not.toBeNull();
        });
        test('異常：Cookie使用, オペレータサービス未起動', async () => {
            // 送信データを生成
            const serialNo: string = serialNoList.length > 0 ? serialNoList[0] : 'XXXXX';
            const fingerPrint: string = fingerPrintList.length > 0 ? fingerPrintList[0] : 'YYYYY';
            const url = urljoin(Url.clientURI, '/' + serialNo, '/' + fingerPrint);

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
            // スタブクライアントー起動
            _operatorServer = new StubOperatorServer(400);

            // 送信データを生成
            const serialNo: string = serialNoList.length > 0 ? serialNoList[0] : 'XXXXX';
            const fingerPrint: string = fingerPrintList.length > 0 ? fingerPrintList[0] : 'YYYYY';
            const url = urljoin(Url.clientURI, '/' + serialNo, '/' + fingerPrint);

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
            // スタブクライアントー起動
            _operatorServer = new StubOperatorServer(500);

            // 送信データを生成
            const serialNo: string = serialNoList.length > 0 ? serialNoList[0] : 'XXXXX';
            const fingerPrint: string = fingerPrintList.length > 0 ? fingerPrintList[0] : 'YYYYY';
            const url = urljoin(Url.clientURI, '/' + serialNo, '/' + fingerPrint);

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
            const serialNo: string = serialNoList.length > 0 ? serialNoList[0] : 'XXXXX';
            const fingerPrint: string = fingerPrintList.length > 0 ? fingerPrintList[0] : 'YYYYY';
            const url = urljoin(Url.clientURI, '/' + serialNo, '/' + fingerPrint);

            // 対象APIに送信
            const response = await supertest(expressApp).get(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send();

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_AUTHORIZED);
        });
        test('異常：対象データなし', async () => {
            // 送信データを生成
            const url = urljoin(Url.clientURI, '/XXXXX', '/YYYYY');

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

    /**
     * クライアント証明書失効
     */
    describe('クライアント証明書失効', () => {
        test('正常：失効', async () => {
            // 送信データを生成
            const serialNo: string = serialNoList.length > 0 ? serialNoList[0] : 'XXXXX';
            const fingerPrint: string = fingerPrintList.length > 0 ? fingerPrintList[0] : 'YYYYY';
            // serialNoList.shift();
            // fingerPrintList.shift();
            const url = urljoin(Url.clientURI, '/' + serialNo, '/' + fingerPrint);

            // 対象APIに送信
            const response = await supertest(expressApp).delete(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send();

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.result).toBe('success');
        });
        test('正常：既に失効済み', async () => {
            // 送信データを生成
            const serialNo: string = serialNoList.length > 0 ? serialNoList[0] : 'XXXXX';
            const fingerPrint: string = fingerPrintList.length > 0 ? fingerPrintList[0] : 'YYYYY';
            serialNoList.shift();
            fingerPrintList.shift();
            const url = urljoin(Url.clientURI, '/' + serialNo, '/' + fingerPrint);

            await common.executeSqlString(
                'UPDATE pxr_certification_authority.certificate_manage SET is_disabled = false ' +
                'WHERE serial_no = \'' + serialNo + '\' AND finger_print = \'' + fingerPrint + '\';');

            // 対象APIに送信
            const response = await supertest(expressApp).delete(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send();

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.result).toBe('success');
        });
        test('正常：Cookie使用, 個人', async () => {
            // スタブクライアントー起動
            _operatorServer = new StubOperatorServer(200);

            // 送信データを生成
            const serialNo: string = serialNoList.length > 0 ? serialNoList[0] : 'XXXXX';
            const fingerPrint: string = fingerPrintList.length > 0 ? fingerPrintList[0] : 'YYYYY';
            serialNoList.shift();
            fingerPrintList.shift();
            const url = urljoin(Url.clientURI, '/' + serialNo, '/' + fingerPrint);

            // 対象APIに送信
            const response = await supertest(expressApp).delete(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type0_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send();

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.result).toBe('success');
        });
        test('正常：Cookie使用, アプリケーション', async () => {
            // スタブクライアントー起動
            _operatorServer = new StubOperatorServer(200);

            // 送信データを生成
            const serialNo: string = serialNoList.length > 0 ? serialNoList[0] : 'XXXXX';
            const fingerPrint: string = fingerPrintList.length > 0 ? fingerPrintList[0] : 'YYYYY';
            serialNoList.shift();
            fingerPrintList.shift();
            const url = urljoin(Url.clientURI, '/' + serialNo, '/' + fingerPrint);

            // 対象APIに送信
            const response = await supertest(expressApp).delete(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type2_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send();

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.result).toBe('success');
        });
        test('正常：Cookie使用, 運営メンバー', async () => {
            // スタブクライアントー起動
            _operatorServer = new StubOperatorServer(200);

            // 送信データを生成
            const serialNo: string = serialNoList.length > 0 ? serialNoList[0] : 'XXXXX';
            const fingerPrint: string = fingerPrintList.length > 0 ? fingerPrintList[0] : 'YYYYY';
            serialNoList.shift();
            fingerPrintList.shift();
            const url = urljoin(Url.clientURI, '/' + serialNo, '/' + fingerPrint);

            // 対象APIに送信
            const response = await supertest(expressApp).delete(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send();

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.result).toBe('success');
        });
        test('異常：Cookie使用, オペレータサービス未起動', async () => {
            // 送信データを生成
            const serialNo: string = serialNoList.length > 0 ? serialNoList[0] : 'XXXXX';
            const fingerPrint: string = fingerPrintList.length > 0 ? fingerPrintList[0] : 'YYYYY';
            serialNoList.shift();
            fingerPrintList.shift();
            const url = urljoin(Url.clientURI, '/' + serialNo, '/' + fingerPrint);

            // 対象APIに送信
            const response = await supertest(expressApp).delete(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send();

            // レスポンスチェック
            expect(response.status).toBe(500);
            expect(response.body.message).toBe(Message.FAILED_CONNECT_TO_OPERATOR);
        });
        test('異常：Cookie使用, オペレータサービス応答400系', async () => {
            // スタブクライアントー起動
            _operatorServer = new StubOperatorServer(400);

            // 送信データを生成
            const serialNo: string = serialNoList.length > 0 ? serialNoList[0] : 'XXXXX';
            const fingerPrint: string = fingerPrintList.length > 0 ? fingerPrintList[0] : 'YYYYY';
            serialNoList.shift();
            fingerPrintList.shift();
            const url = urljoin(Url.clientURI, '/' + serialNo, '/' + fingerPrint);

            // 対象APIに送信
            const response = await supertest(expressApp).delete(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send();

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_AUTHORIZED);
        });
        test('異常：Cookie使用, オペレータサービス応答500系', async () => {
            // スタブクライアントー起動
            _operatorServer = new StubOperatorServer(500);

            // 送信データを生成
            const serialNo: string = serialNoList.length > 0 ? serialNoList[0] : 'XXXXX';
            const fingerPrint: string = fingerPrintList.length > 0 ? fingerPrintList[0] : 'YYYYY';
            serialNoList.shift();
            fingerPrintList.shift();
            const url = urljoin(Url.clientURI, '/' + serialNo, '/' + fingerPrint);

            // 対象APIに送信
            const response = await supertest(expressApp).delete(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send();

            // レスポンスチェック
            expect(response.status).toBe(500);
            expect(response.body.message).toBe(Message.FAILED_TAKE_SESSION);
        });
        test('異常：セッションなし', async () => {
            // 送信データを生成
            const serialNo: string = serialNoList.length > 0 ? serialNoList[0] : 'XXXXX';
            const fingerPrint: string = fingerPrintList.length > 0 ? fingerPrintList[0] : 'YYYYY';
            serialNoList.shift();
            fingerPrintList.shift();
            const url = urljoin(Url.clientURI, '/' + serialNo, '/' + fingerPrint);

            // 対象APIに送信
            const response = await supertest(expressApp).delete(url)
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
            const url = urljoin(Url.clientURI, '/XXXXX', '/YYYYY');

            // 対象APIに送信
            const response = await supertest(expressApp).delete(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send();

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.TARGET_NO_DATA);
        });
        test('パラメータ不足：serialNo', async () => {
            // 送信データを生成
            const serialNo: string = '';
            const fingerPrint: string = fingerPrintList.length > 0 ? fingerPrintList[0] : 'YYYYY';
            serialNoList.shift();
            fingerPrintList.shift();
            const url = urljoin(Url.clientURI, '/' + serialNo, '/' + fingerPrint);

            // 対象APIに送信
            const response = await supertest(expressApp).delete(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send();

            // レスポンスチェック
            expect(response.status).toBe(404);
        });
        test('パラメータ不足：fingerPrint', async () => {
            // 送信データを生成
            const serialNo: string = serialNoList.length > 0 ? serialNoList[0] : 'XXXXX';
            const fingerPrint: string = '';
            serialNoList.shift();
            fingerPrintList.shift();
            const url = urljoin(Url.clientURI, '/' + serialNo, '/' + fingerPrint);

            // 対象APIに送信
            const response = await supertest(expressApp).delete(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send();

            // レスポンスチェック
            expect(response.status).toBe(404);
        });
    });
});
