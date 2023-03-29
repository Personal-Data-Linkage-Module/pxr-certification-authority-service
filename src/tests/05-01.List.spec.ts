/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import * as supertest from 'supertest';
import Application from '../index';
import { connectDatabase } from '../common/Connection';
import Common, { Url } from './Common';
import Config from '../common/Config';
import { Session } from './Session';
import StubOperatorServer from './StubOperatorServer';
const Message = Config.ReadConfig('./config/message.json');

// 対象アプリケーションを取得
const expressApp = Application.express.app;
const common = new Common();

// 設定ファイル読込
const config = Config.ReadConfig('./config/config.json');

// スタブクライアントー（オペレータサービス）
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
     * 証明書一覧取得
     */
    describe('証明書一覧取得', () => {
        test('正常：一覧取得', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp).get(Url.listURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send();

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.length).toBe(3);
            expect(response.body[0].certType).toBe('client');
            expect(response.body[0].subject).not.toBeNull();
            expect(response.body[0].subject.C).toBe(config['client']['subject']['C']);
            expect(response.body[0].subject.ST).toBe(config['client']['subject']['ST']);
            expect(response.body[0].subject.L).toBe(config['client']['subject']['L']);
            expect(response.body[0].subject.O).toBe(config['client']['subject']['O']);
            expect(response.body[0].subject.OU).toBe(config['client']['subject']['OU']);
            expect(response.body[0].subject.CN).toBe(config['client']['subject']['CN']);
            expect(response.body[0].serialNo).not.toBeNull();
            expect(response.body[0].fingerPrint).not.toBeNull();
            expect(response.body[0].validPeriodStart).not.toBeNull();
            expect(response.body[0].validPeriodEnd).not.toBeNull();
            expect(response.body[0].certificate).not.toBeNull();
            expect(response.body[1].certType).toBe('server');
            expect(response.body[1].subject).not.toBeNull();
            expect(response.body[1].subject.C).toBe(config['server']['subject']['C']);
            expect(response.body[1].subject.ST).toBe(config['server']['subject']['ST']);
            expect(response.body[1].subject.L).toBe(config['server']['subject']['L']);
            expect(response.body[1].subject.O).toBe(config['server']['subject']['O']);
            expect(response.body[1].subject.OU).toBe(config['server']['subject']['OU']);
            expect(response.body[1].subject.CN).toBe(config['server']['subject']['CN']);
            expect(response.body[1].serialNo).not.toBeNull();
            expect(response.body[1].fingerPrint).not.toBeNull();
            expect(response.body[1].validPeriodStart).not.toBeNull();
            expect(response.body[1].validPeriodEnd).not.toBeNull();
            expect(response.body[1].certificate).not.toBeNull();
            expect(response.body[2].certType).toBe('root');
            expect(response.body[2].subject).not.toBeNull();
            expect(response.body[2].subject.C).toBe(config['root']['subject']['C']);
            expect(response.body[2].subject.ST).toBe(config['root']['subject']['ST']);
            expect(response.body[2].subject.L).toBe(config['root']['subject']['L']);
            expect(response.body[2].subject.O).toBe(config['root']['subject']['O']);
            expect(response.body[2].subject.OU).toBe(config['root']['subject']['OU']);
            expect(response.body[2].subject.CN).toBe(config['root']['subject']['CN']);
            expect(response.body[2].serialNo).not.toBeNull();
            expect(response.body[2].fingerPrint).not.toBeNull();
            expect(response.body[2].validPeriodStart).not.toBeNull();
            expect(response.body[2].validPeriodEnd).not.toBeNull();
            expect(response.body[2].certificate).not.toBeNull();
        });
        test('正常：Cookie使用, 個人', async () => {
            // スタブクライアントー起動
            _operatorServer = new StubOperatorServer(200);

            // 対象APIに送信
            const response = await supertest(expressApp).get(Url.listURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type0_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send();

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.length).toBe(3);
            expect(response.body[0].certType).toBe('client');
            expect(response.body[0].subject).not.toBeNull();
            expect(response.body[0].subject.C).toBe(config['client']['subject']['C']);
            expect(response.body[0].subject.ST).toBe(config['client']['subject']['ST']);
            expect(response.body[0].subject.L).toBe(config['client']['subject']['L']);
            expect(response.body[0].subject.O).toBe(config['client']['subject']['O']);
            expect(response.body[0].subject.OU).toBe(config['client']['subject']['OU']);
            expect(response.body[0].subject.CN).toBe(config['client']['subject']['CN']);
            expect(response.body[0].serialNo).not.toBeNull();
            expect(response.body[0].fingerPrint).not.toBeNull();
            expect(response.body[0].validPeriodStart).not.toBeNull();
            expect(response.body[0].validPeriodEnd).not.toBeNull();
            expect(response.body[0].certificate).not.toBeNull();
            expect(response.body[1].certType).toBe('server');
            expect(response.body[1].subject).not.toBeNull();
            expect(response.body[1].subject.C).toBe(config['server']['subject']['C']);
            expect(response.body[1].subject.ST).toBe(config['server']['subject']['ST']);
            expect(response.body[1].subject.L).toBe(config['server']['subject']['L']);
            expect(response.body[1].subject.O).toBe(config['server']['subject']['O']);
            expect(response.body[1].subject.OU).toBe(config['server']['subject']['OU']);
            expect(response.body[1].subject.CN).toBe(config['server']['subject']['CN']);
            expect(response.body[1].serialNo).not.toBeNull();
            expect(response.body[1].fingerPrint).not.toBeNull();
            expect(response.body[1].validPeriodStart).not.toBeNull();
            expect(response.body[1].validPeriodEnd).not.toBeNull();
            expect(response.body[1].certificate).not.toBeNull();
            expect(response.body[2].certType).toBe('root');
            expect(response.body[2].subject).not.toBeNull();
            expect(response.body[2].subject.C).toBe(config['root']['subject']['C']);
            expect(response.body[2].subject.ST).toBe(config['root']['subject']['ST']);
            expect(response.body[2].subject.L).toBe(config['root']['subject']['L']);
            expect(response.body[2].subject.O).toBe(config['root']['subject']['O']);
            expect(response.body[2].subject.OU).toBe(config['root']['subject']['OU']);
            expect(response.body[2].subject.CN).toBe(config['root']['subject']['CN']);
            expect(response.body[2].serialNo).not.toBeNull();
            expect(response.body[2].fingerPrint).not.toBeNull();
            expect(response.body[2].validPeriodStart).not.toBeNull();
            expect(response.body[2].validPeriodEnd).not.toBeNull();
            expect(response.body[2].certificate).not.toBeNull();
        });
        test('正常：Cookie使用, アプリケーション', async () => {
            // スタブクライアントー起動
            _operatorServer = new StubOperatorServer(200);

            // 対象APIに送信
            const response = await supertest(expressApp).get(Url.listURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type2_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send();

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.length).toBe(3);
            expect(response.body[0].certType).toBe('client');
            expect(response.body[0].subject).not.toBeNull();
            expect(response.body[0].subject.C).toBe(config['client']['subject']['C']);
            expect(response.body[0].subject.ST).toBe(config['client']['subject']['ST']);
            expect(response.body[0].subject.L).toBe(config['client']['subject']['L']);
            expect(response.body[0].subject.O).toBe(config['client']['subject']['O']);
            expect(response.body[0].subject.OU).toBe(config['client']['subject']['OU']);
            expect(response.body[0].subject.CN).toBe(config['client']['subject']['CN']);
            expect(response.body[0].serialNo).not.toBeNull();
            expect(response.body[0].fingerPrint).not.toBeNull();
            expect(response.body[0].validPeriodStart).not.toBeNull();
            expect(response.body[0].validPeriodEnd).not.toBeNull();
            expect(response.body[0].certificate).not.toBeNull();
            expect(response.body[1].certType).toBe('server');
            expect(response.body[1].subject).not.toBeNull();
            expect(response.body[1].subject.C).toBe(config['server']['subject']['C']);
            expect(response.body[1].subject.ST).toBe(config['server']['subject']['ST']);
            expect(response.body[1].subject.L).toBe(config['server']['subject']['L']);
            expect(response.body[1].subject.O).toBe(config['server']['subject']['O']);
            expect(response.body[1].subject.OU).toBe(config['server']['subject']['OU']);
            expect(response.body[1].subject.CN).toBe(config['server']['subject']['CN']);
            expect(response.body[1].serialNo).not.toBeNull();
            expect(response.body[1].fingerPrint).not.toBeNull();
            expect(response.body[1].validPeriodStart).not.toBeNull();
            expect(response.body[1].validPeriodEnd).not.toBeNull();
            expect(response.body[1].certificate).not.toBeNull();
            expect(response.body[2].certType).toBe('root');
            expect(response.body[2].subject).not.toBeNull();
            expect(response.body[2].subject.C).toBe(config['root']['subject']['C']);
            expect(response.body[2].subject.ST).toBe(config['root']['subject']['ST']);
            expect(response.body[2].subject.L).toBe(config['root']['subject']['L']);
            expect(response.body[2].subject.O).toBe(config['root']['subject']['O']);
            expect(response.body[2].subject.OU).toBe(config['root']['subject']['OU']);
            expect(response.body[2].subject.CN).toBe(config['root']['subject']['CN']);
            expect(response.body[2].serialNo).not.toBeNull();
            expect(response.body[2].fingerPrint).not.toBeNull();
            expect(response.body[2].validPeriodStart).not.toBeNull();
            expect(response.body[2].validPeriodEnd).not.toBeNull();
            expect(response.body[2].certificate).not.toBeNull();
        });
        test('正常：Cookie使用, 運営メンバー', async () => {
            // スタブクライアントー起動
            _operatorServer = new StubOperatorServer(200);

            // 対象APIに送信
            const response = await supertest(expressApp).get(Url.listURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send();

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.length).toBe(3);
            expect(response.body[0].certType).toBe('client');
            expect(response.body[0].subject).not.toBeNull();
            expect(response.body[0].subject.C).toBe(config['client']['subject']['C']);
            expect(response.body[0].subject.ST).toBe(config['client']['subject']['ST']);
            expect(response.body[0].subject.L).toBe(config['client']['subject']['L']);
            expect(response.body[0].subject.O).toBe(config['client']['subject']['O']);
            expect(response.body[0].subject.OU).toBe(config['client']['subject']['OU']);
            expect(response.body[0].subject.CN).toBe(config['client']['subject']['CN']);
            expect(response.body[0].serialNo).not.toBeNull();
            expect(response.body[0].fingerPrint).not.toBeNull();
            expect(response.body[0].validPeriodStart).not.toBeNull();
            expect(response.body[0].validPeriodEnd).not.toBeNull();
            expect(response.body[0].certificate).not.toBeNull();
            expect(response.body[1].certType).toBe('server');
            expect(response.body[1].subject).not.toBeNull();
            expect(response.body[1].subject.C).toBe(config['server']['subject']['C']);
            expect(response.body[1].subject.ST).toBe(config['server']['subject']['ST']);
            expect(response.body[1].subject.L).toBe(config['server']['subject']['L']);
            expect(response.body[1].subject.O).toBe(config['server']['subject']['O']);
            expect(response.body[1].subject.OU).toBe(config['server']['subject']['OU']);
            expect(response.body[1].subject.CN).toBe(config['server']['subject']['CN']);
            expect(response.body[1].serialNo).not.toBeNull();
            expect(response.body[1].fingerPrint).not.toBeNull();
            expect(response.body[1].validPeriodStart).not.toBeNull();
            expect(response.body[1].validPeriodEnd).not.toBeNull();
            expect(response.body[1].certificate).not.toBeNull();
            expect(response.body[2].certType).toBe('root');
            expect(response.body[2].subject).not.toBeNull();
            expect(response.body[2].subject.C).toBe(config['root']['subject']['C']);
            expect(response.body[2].subject.ST).toBe(config['root']['subject']['ST']);
            expect(response.body[2].subject.L).toBe(config['root']['subject']['L']);
            expect(response.body[2].subject.O).toBe(config['root']['subject']['O']);
            expect(response.body[2].subject.OU).toBe(config['root']['subject']['OU']);
            expect(response.body[2].subject.CN).toBe(config['root']['subject']['CN']);
            expect(response.body[2].serialNo).not.toBeNull();
            expect(response.body[2].fingerPrint).not.toBeNull();
            expect(response.body[2].validPeriodStart).not.toBeNull();
            expect(response.body[2].validPeriodEnd).not.toBeNull();
            expect(response.body[2].certificate).not.toBeNull();
        });
        test('異常：Cookie使用, オペレータサービス未起動', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp).get(Url.listURI)
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

            // 対象APIに送信
            const response = await supertest(expressApp).get(Url.listURI)
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

            // 対象APIに送信
            const response = await supertest(expressApp).get(Url.listURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send();

            // レスポンスチェック
            expect(response.status).toBe(500);
            expect(response.body.message).toBe(Message.FAILED_TAKE_SESSION);
        });
        test('異常：セッションなし', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp).get(Url.listURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send();

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_AUTHORIZED);
        });
        test('異常：対象データなし', async () => {
            await common.executeSqlString(`
                DELETE FROM pxr_certification_authority.certificate_manage;
            `);
            // 対象APIに送信
            const response = await supertest(expressApp).get(Url.listURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send();

            // レスポンスチェック
            expect(response.status).toBe(204);
            // expect(response.body.message).toBe(Message.TARGET_NO_DATA);
        });
    });
});
