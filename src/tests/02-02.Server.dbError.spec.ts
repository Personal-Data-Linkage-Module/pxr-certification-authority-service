/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import * as supertest from 'supertest';
import Application from '../index';
import { connectDatabase } from '../common/Connection';
import { Url } from './Common';
import { Session } from './Session';
import Config from '../common/Config';
import urljoin = require('url-join');
const Message = Config.ReadConfig('./config/message.json');

// テストモジュールをインポート
jest.mock('../common/Db');

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
        jest.deepUnmock('../common/Db');
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
        test('異常：DBエラー', async () => {
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
            expect(response.body.message).toBe(Message.UNDEFINED_ERROR);
        });
    });

    /**
     * サーバ証明書取得
     */
    describe('サーバ証明書取得', () => {
        test('異常：DBエラー', async () => {
            // 送信データを生成
            const url = urljoin(Url.serverURI, '/XXXXX', '/YYYYY');

            // 対象APIに送信
            const response = await supertest(expressApp).get(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send();

            // レスポンスチェック
            expect(response.status).toBe(503);
            expect(response.body.message).toBe(Message.UNDEFINED_ERROR);
        });
    });

    /**
     * サーバ証明書失効
     */
    describe('サーバ証明書失効', () => {
        test('異常：DBエラー', async () => {
            // 送信データを生成
            const url = urljoin(Url.serverURI, '/XXXXX', '/YYYYY');

            // 対象APIに送信
            const response = await supertest(expressApp).delete(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send();

            // レスポンスチェック
            expect(response.status).toBe(503);
            expect(response.body.message).toBe(Message.UNDEFINED_ERROR);
        });
    });
});
