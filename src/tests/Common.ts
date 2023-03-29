/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import Db from './Db';
import path = require('path');
import fs = require('fs');

// テスト用にlisten数を無制限に設定
require('events').EventEmitter.defaultMaxListeners = 0;

/**
 * URL
 */
export namespace Url {
    /**
     * ベースURL
     */
    export const baseURI: string = '/certification-authority';

    /**
     * ルート証明書
     */
    export const rootURI: string = baseURI + '/root';

    /**
     * サーバ証明書
     */
    export const serverURI: string = baseURI + '/server';

    /**
     * クライアント証明書
     */
    export const clientURI: string = baseURI + '/client';

    /**
     * 証明書一覧
     */
    export const listURI: string = baseURI + '/list';

    /**
     * 証明書配布状況登録
     */
    export const distributedURI: string = baseURI + '/distributed';

    /**
     * クライアント証明書有効性検証
     */
    export const validURI: string = baseURI + '/valid';

    /**
     * アクター情報
     */
    export const actorURI: string = baseURI + '/actor';
}

/**
 * テスト用共通クラス
 */
export default class Common {
    /**
     * DBオブジェクトを取得
     */
    private db: Db = null;

    /**
     * コンストラクタ
     */
    public constructor () {
        this.db = new Db();
    }

    /**
     * DB接続
     */
    public async connect () {
        await this.db.Connect();
    }

    /**
     * DB切断
     */
    public async disconnect () {
        await this.db.Disconnect();
    }

    /**
     * SQLファイル実行
     * @param fileName
     */
    public async executeSqlFile (fileName: string) {
        // ファイルをオープン
        const fd: number = fs.openSync(path.join('./ddl/unit-test/', fileName), 'r');

        // ファイルからSQLを読込
        const sql: string = fs.readFileSync(fd, 'utf-8');

        // ファイルをクローズ
        fs.closeSync(fd);

        // DBを初期化
        await this.db.getConnection().query(sql);
    }

    /**
     * SQL実行
     * @param sql
     */
    public async executeSqlString (sql: string) {
        // DBを初期化
        await this.db.getConnection().query(sql);
    }
}
