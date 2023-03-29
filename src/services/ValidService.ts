/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Service } from 'typedi';
import { Connection } from 'typeorm';
import ValidDto from './dto/ValidServiceDto';
import CertificateManageEntity from '../repositories/postgres/CertificateManageEntity';
import CertificateManageRepository from '../repositories/CertificateManageRepository';
/* eslint-enable */
import AppError from '../common/AppError';
import PostValidResDto from '../resources/dto/PostValidResDto';
import { ResponseCode } from '../common/ResponseCode';
import Config from '../common/Config';
const Message = Config.ReadConfig('./config/message.json');

/**
 * クライアント証明書有効性検証サービス
 */
@Service()
export default class ValidService {
    /**
     * クライアント証明書有効性検証
     * @param connection
     * @param validDto
     */
    public static async isCertificateValid (connection: Connection, validDto: ValidDto): Promise<{}> {
        // 証明書管理ドメインを生成
        const repository: CertificateManageRepository = new CertificateManageRepository(connection);

        // 証明書情報を取得
        const entity: CertificateManageEntity = await repository.getRecord(validDto.getSerialNo(), validDto.getFingerPrint());
        if (!entity) {
            // エラーを返す
            throw new AppError(Message.TARGET_NO_DATA, ResponseCode.BAD_REQUEST);
        }
        // 現在日時を取得
        const now: Date = new Date();

        // 証明書の有効期限を確認
        if (entity.getValidPeriodStart().getTime() > now.getTime() ||
            now.getTime() > entity.getValidPeriodEnd().getTime()) {
            // エラーを返す
            throw new AppError(Message.FAILED_CERTIFICATE_EXPIRED, ResponseCode.UNAUTHORIZED);
        }

        // レスポンスを生成
        const response: PostValidResDto = new PostValidResDto();
        response.result = 'success';

        // レスポンスを返す
        return response.getAsJson();
    }
}
