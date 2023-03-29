/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import AppError from './AppError';
/* eslint-disable */
import { Connection, createConnection, getConnectionManager } from 'typeorm';
import Config from '../common/Config';
const Message = Config.ReadConfig('./config/message.json');
import CertificateManageEntity from '../repositories/postgres/CertificateManageEntity';
import fs = require('fs');
/* eslint-enable */

const connectOption = JSON.parse(fs.readFileSync('./config/ormconfig.json', 'utf-8'));
// エンティティを設定
connectOption['entities'] = [
    CertificateManageEntity
];

/**
 * コネクションの生成
 */
export async function connectDatabase (): Promise<Connection> {
    let connection = null;
    try {
        // データベースに接続
        connection = await createConnection(connectOption);
    } catch (err) {
        if (err.name === 'AlreadyHasActiveConnectionError') {
            // すでにコネクションが張られている場合には、流用する
            connection = getConnectionManager().get('postgres');
        } else {
            // エラーが発生した場合は、アプリケーション例外に内包してスローする
            throw new AppError(
                Message.FAILED_CONNECT_TO_DATABASE, 500, err);
        }
    }
    // 接続したコネクションを返却
    return connection;
}
