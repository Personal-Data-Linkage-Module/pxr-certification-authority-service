/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Connection, createConnection, getConnectionManager } from 'typeorm';
/* eslint-enable */
import CertificateManageEntity from '../repositories/postgres/CertificateManageEntity';
import fs = require('fs');

// configファイルを読み込む
const connectOption = JSON.parse(fs.readFileSync('./config/ormconfig.json', 'utf-8'));

// エンティティを設定
connectOption['entities'] = [
    CertificateManageEntity
];

/**
 * テスト用データベース操作クラス
 */
export default class Db {
    /**
     * DB接続オブジェクト
     */
    private connection: Connection = null;

    /**
     * DB接続オブジェクト取得
     */
    public getConnection (): Connection {
        return this.connection;
    }

    /**
     * 接続
     */
    public async Connect () {
        try {
            // DBに接続
            this.connection = await createConnection(connectOption);
        } catch (err) {
            if (err.name === 'AlreadyHasActiveConnectionError') {
                this.connection = getConnectionManager().get('postgres');
            } else {
                throw err;
            }
        }
    }

    /**
     * 切断
     */
    public async Disconnect () {
        if (this.connection && this.connection.isConnected) {
            // DB切断
            await this.connection.close();
        }
    }
}
