/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Service } from 'typedi';
import { Connection, EntityManager } from 'typeorm';
import DistributedDto from './dto/DistributedServiceDto';
import Operator from '../resources/dto/OperatorDto';
/* eslint-enable */
import CertificateManageEntity from '../repositories/postgres/CertificateManageEntity';
import CertificateManageRepository from '../repositories/CertificateManageRepository';
import PostDistributedResDto from '../resources/dto/PostDistributedResDto';
import AppError from '../common/AppError';
import { ResponseCode } from '../common/ResponseCode';
import Config from '../common/Config';
const Message = Config.ReadConfig('./config/message.json');

/**
 * 証明書配布状況登録サービス
 */
@Service()
export default class DistributedService {
    /**
     * 証明書配布状況登録
     * @param connection
     * @param distributedDto
     */
    public static async updateDistributed (connection: Connection, distributedDto: DistributedDto): Promise<{}> {
        // オペレータ情報を取得
        const operator: Operator = distributedDto.getOperator();

        // 証明書管理ドメインを生成
        const repository: CertificateManageRepository = new CertificateManageRepository(connection);

        // 対象証明書を取得
        let entity: CertificateManageEntity = await repository.getRecord(distributedDto.getSerialNo(), distributedDto.getFingerPrint());
        if (!entity) {
            // エラーを返す
            throw new AppError(Message.TARGET_NO_DATA, ResponseCode.BAD_REQUEST);
        }

        // 証明書管理テーブル更新データを生成
        entity = new CertificateManageEntity({
            serial_no: distributedDto.getSerialNo(),
            finger_print: distributedDto.getFingerPrint(),
            is_distributed: true,
            created_by: operator.getLoginId(),
            updated_by: operator.getLoginId()
        });
        // トランザクション開始
        await connection.transaction(async (em: EntityManager) => {
            // 証明書配布状況を登録
            await repository.updateRecord(em, entity);
        }).catch(err => {
            throw err;
        });
        // レスポンスを生成
        const response: PostDistributedResDto = new PostDistributedResDto();
        response.serialNo = distributedDto.getSerialNo();
        response.fingerPrint = distributedDto.getFingerPrint();
        response.status = 'distributed';

        // レスポンスを返す
        return response.getAsJson();
    }
}
