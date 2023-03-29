/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
// eslint-disable-next-line no-unused-vars
import { Connection } from 'typeorm';

/**
 * DBクラス
 */
export default class Db {
    /**
     * DB接続オブジェクト
     */
    private connection: Connection = null;

    /**
     * DB接続オブジェクト取得
     */
    public getConnect (): Connection {
        return this.connection;
    }

    /**
     * DB接続
     */
    public async connect () {
        throw new Error('Unit Test DB Connect Error');
    }

    /**
     * DB切断
     */
    public async disconnect () {
    }
}
