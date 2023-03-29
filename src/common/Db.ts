/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
// eslint-disable-next-line no-unused-vars
import { createConnection, getConnectionManager, Connection } from 'typeorm';
import CertificateManageEntity from '../repositories/postgres/CertificateManageEntity';
import fs = require('fs');

// 環境ごとにconfigファイルを読み込む
let connectOption: any = null;
connectOption = JSON.parse(fs.readFileSync('./config/ormconfig.json', 'utf-8'));

// エンティティを設定
connectOption['entities'] = [
    CertificateManageEntity
];

/**
 * 設定ファイル操作クラス
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
     * DB切断
     */
    public async disconnect () {
        if (this.connection && this.connection.isConnected) {
            // DB切断
            await this.connection.close();
        }
    }
}
