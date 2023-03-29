/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import * as supertest from 'supertest';
import Application from '../index';
import { connectDatabase } from '../common/Connection';
import Common, { Url } from './Common';
import { Session } from './Session';
import Config from '../common/Config';
const Message = Config.ReadConfig('./config/message.json');
import urljoin = require('url-join');

// テストモジュールをインポート
jest.mock('../common/CertificateControl');

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

        // クライアント停止
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
     * クライアント証明書生成
     */
    describe('クライアント証明書生成', () => {
        test('異常：OpenSSLエラー', async () => {
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
            expect(response.status).toBe(503);
            expect(response.body.message).toBe(Message.FAILED_OPENSSL_PRIVATE_KEY);
        });
    });

    /**
     * クライアント証明書失効
     */
    describe('クライアント証明書失効', () => {
        test('異常：OpenSSLエラー', async () => {
            // 送信データを生成
            const serialNo: string = 'XXXXX3';
            const fingerPrint: string = 'YYYYY3';
            const url = urljoin(Url.clientURI, '/' + serialNo, '/' + fingerPrint);

            // 対象APIに送信
            const response = await supertest(expressApp).delete(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send();

            // レスポンスチェック
            try {
                expect(response.status).toBe(503);
                expect(response.body.message).toBe(Message.FAILED_OPENSSL_CERTIFICATE_REVOKE);
            } catch (err) {
                console.log(response.body);
                throw err;
            }
        });
    });
});
