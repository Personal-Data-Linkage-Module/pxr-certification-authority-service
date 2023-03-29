/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import * as supertest from 'supertest';
import Application from '../index';
import { connectDatabase } from '../common/Connection';
import Common, { Url } from './Common';
import { Session } from './Session';
import StubOperatorServer from './StubOperatorServer';
import Config from '../common/Config';
import urljoin = require('url-join');
const Message = Config.ReadConfig('./config/message.json');

// 対象アプリケーションを取得
const expressApp = Application.express.app;
const common = new Common();

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
     * アクター情報取得
     */
    describe('アクター情報取得', () => {
        test('正常：ルート証明書取得', async () => {
            // 送信データを生成
            const serialNo: string = 'XXXXX1';
            const fingerPrint: string = 'YYYYY1';
            const url = urljoin(Url.actorURI, '/' + serialNo, '/' + fingerPrint);

            // 対象APIに送信
            const response = await supertest(expressApp).get(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send();

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.actor).toBeNull();
            expect(response.body.block).toBeNull();
        });
        test('正常：サーバ証明書取得', async () => {
            // 送信データを生成
            const serialNo: string = 'XXXXX2';
            const fingerPrint: string = 'YYYYY2';
            const url = urljoin(Url.actorURI, '/' + serialNo, '/' + fingerPrint);

            // 対象APIに送信
            const response = await supertest(expressApp).get(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send();

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.actor).toBeNull();
            expect(response.body.block).not.toBeNull();
            expect(response.body.block.value).toBe(10002);
            expect(response.body.block.ver).toBe(2);
        });
        test('正常：クライアント証明書取得', async () => {
            // 送信データを生成
            const serialNo: string = 'XXXXX3';
            const fingerPrint: string = 'YYYYY3';
            const url = urljoin(Url.actorURI, '/' + serialNo, '/' + fingerPrint);

            // 対象APIに送信
            const response = await supertest(expressApp).get(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send();

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.actor).not.toBeNull();
            expect(response.body.actor.value).toBe(10001);
            expect(response.body.actor.ver).toBe(1);
            expect(response.body.block).not.toBeNull();
            expect(response.body.block.value).toBe(10002);
            expect(response.body.block.ver).toBe(2);
        });
        test('正常：Cookie使用, 個人', async () => {
            // スタブクライアントー起動
            _operatorServer = new StubOperatorServer(200);

            // 送信データを生成
            const serialNo: string = 'XXXXX3';
            const fingerPrint: string = 'YYYYY3';
            const url = urljoin(Url.actorURI, '/' + serialNo, '/' + fingerPrint);

            // 対象APIに送信
            const response = await supertest(expressApp).get(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type0_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send();

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.actor).not.toBeNull();
            expect(response.body.actor.value).toBe(10001);
            expect(response.body.actor.ver).toBe(1);
            expect(response.body.block).not.toBeNull();
            expect(response.body.block.value).toBe(10002);
            expect(response.body.block.ver).toBe(2);
        });
        test('正常：Cookie使用, アプリケーション', async () => {
            // スタブクライアントー起動
            _operatorServer = new StubOperatorServer(200);

            // 送信データを生成
            const serialNo: string = 'XXXXX3';
            const fingerPrint: string = 'YYYYY3';
            const url = urljoin(Url.actorURI, '/' + serialNo, '/' + fingerPrint);

            // 対象APIに送信
            const response = await supertest(expressApp).get(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type2_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send();

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.actor).not.toBeNull();
            expect(response.body.actor.value).toBe(10001);
            expect(response.body.actor.ver).toBe(1);
            expect(response.body.block).not.toBeNull();
            expect(response.body.block.value).toBe(10002);
            expect(response.body.block.ver).toBe(2);
        });
        test('正常：Cookie使用, 運営メンバー', async () => {
            // スタブクライアントー起動
            _operatorServer = new StubOperatorServer(200);

            // 送信データを生成
            const serialNo: string = 'XXXXX3';
            const fingerPrint: string = 'YYYYY3';
            const url = urljoin(Url.actorURI, '/' + serialNo, '/' + fingerPrint);

            // 対象APIに送信
            const response = await supertest(expressApp).get(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send();

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.actor).not.toBeNull();
            expect(response.body.actor.value).toBe(10001);
            expect(response.body.actor.ver).toBe(1);
            expect(response.body.block).not.toBeNull();
            expect(response.body.block.value).toBe(10002);
            expect(response.body.block.ver).toBe(2);
        });
        test('異常：Cookie使用, オペレータサービス未起動', async () => {
            // 送信データを生成
            const serialNo: string = 'XXXXX3';
            const fingerPrint: string = 'YYYYY3';
            const url = urljoin(Url.actorURI, '/' + serialNo, '/' + fingerPrint);

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
            const serialNo: string = 'XXXXX3';
            const fingerPrint: string = 'YYYYY3';
            const url = urljoin(Url.actorURI, '/' + serialNo, '/' + fingerPrint);

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
            const serialNo: string = 'XXXXX3';
            const fingerPrint: string = 'YYYYY3';
            const url = urljoin(Url.actorURI, '/' + serialNo, '/' + fingerPrint);

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
            const serialNo: string = 'XXXXX3';
            const fingerPrint: string = 'YYYYY3';
            const url = urljoin(Url.actorURI, '/' + serialNo, '/' + fingerPrint);

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
            const url = urljoin(Url.actorURI, '/XXXXX', '/YYYYY');

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
