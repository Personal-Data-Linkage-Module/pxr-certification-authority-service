/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Service } from 'typedi';
import { Connection } from 'typeorm';
import ActorDto from './dto/ActorServiceDto';
import CertificateManageEntity from '../repositories/postgres/CertificateManageEntity';
import CertificateManageRepository from '../repositories/CertificateManageRepository';
/* eslint-enable */
import AppError from '../common/AppError';
import { ResponseCode } from '../common/ResponseCode';
import GetActorResDto from '../resources/dto/GetActorResDto';
import CodeVersion from '../resources/dto/CodeVersionDto';
import Config from '../common/Config';
const Message = Config.ReadConfig('./config/message.json');

/**
 * アクター情報サービス
 */
@Service()
export default class ActorService {
    /**
     * アクター情報取得
     * @param connection
     * @param actorDto
     */
    public static async getActorInfo (connection: Connection, actorDto: ActorDto): Promise<{}> {
        // 証明書管理ドメインを生成
        const repository: CertificateManageRepository = new CertificateManageRepository(connection);

        // アクター情報を取得
        const entity: CertificateManageEntity = await repository.getRecord(actorDto.getSerialNo(), actorDto.getFingerPrint());
        if (!entity) {
            // エラーを返す
            throw new AppError(Message.TARGET_NO_DATA, ResponseCode.NO_CONTENT);
        }

        // レスポンスを生成
        const response: GetActorResDto = new GetActorResDto();
        if (entity.getBlockCode() && entity.getBlockVersion()) {
            response.block = new CodeVersion();
            response.block.setFromJson({
                value: entity.getBlockCode(),
                ver: entity.getBlockVersion()
            });
        }
        if (entity.getActorCode() && entity.getActorVersion()) {
            response.actor = new CodeVersion();
            response.actor.setFromJson({
                value: entity.getActorCode(),
                ver: entity.getActorVersion()
            });
        }

        // レスポンスを返す
        return response.getAsJson();
    }
}
