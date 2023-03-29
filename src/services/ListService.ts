/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Connection } from 'typeorm';
import ListDto from './dto/ListServiceDto';
import CertificateManageEntity from '../repositories/postgres/CertificateManageEntity';
import CertificateManageRepository from '../repositories/CertificateManageRepository';
/* eslint-enable */
import { Service } from 'typedi';
import AppError from '../common/AppError';
import { ResponseCode } from '../common/ResponseCode';
import Subject from '../resources/dto/SubjectDto';
import Certificate from '../resources/dto/CertificateDto';
import GetListResDto from '../resources/dto/GetListResDto';
import Config from '../common/Config';
const Message = Config.ReadConfig('./config/message.json');

/**
 * 証明書一覧サービス
 */
@Service()
export default class ListService {
    /**
     * 証明書一覧取得
     * @param connection
     * @param listDto
     */
    public static async getCertificateList (connection: Connection, listDto: ListDto): Promise<{}> {
        // 証明書管理ドメインを生成
        const repository: CertificateManageRepository = new CertificateManageRepository(connection);

        // 証明書一覧を取得
        const entity: CertificateManageEntity[] = await repository.getCertificateList();
        if (entity.length <= 0) {
            // エラーを返す
            throw new AppError(Message.TARGET_NO_DATA, ResponseCode.NO_CONTENT);
        }

        // レスポンスを生成
        const response: GetListResDto = new GetListResDto();
        for (let index = 0; index < entity.length; index++) {
            const certificate = new Certificate();
            certificate.certType = entity[index].getCertType();
            certificate.subject = new Subject();
            certificate.subject.setFromJson(JSON.parse(entity[index].getSubject()));
            certificate.serialNo = entity[index].getSerialNo();
            certificate.fingerPrint = entity[index].getFingerPrint();
            certificate.validPeriodStart = entity[index].getValidPeriodStart();
            certificate.validPeriodEnd = entity[index].getValidPeriodEnd();
            response.list.push(certificate);
        }

        // レスポンスを返す
        return response.getAsJson();
    }

    /**
     * 証明書一覧取得
     * @param connection
     * @param actorCode
     */
    public static async getListByActorCode (connection: Connection, actorCode: number): Promise<{}> {
        // 証明書管理ドメインを生成
        const repository: CertificateManageRepository = new CertificateManageRepository(connection);

        // 証明書一覧を取得
        const entity: CertificateManageEntity[] = await repository.getCertListByActorCode(actorCode);
        if (entity.length <= 0) {
            // エラーを返す
            throw new AppError(Message.TARGET_NO_DATA, ResponseCode.NO_CONTENT);
        }

        // レスポンスを生成
        const response: GetListResDto = new GetListResDto();
        for (let index = 0; index < entity.length; index++) {
            const certificate = new Certificate();
            certificate.certType = entity[index].getCertType();
            certificate.subject = new Subject();
            certificate.subject.setFromJson(JSON.parse(entity[index].getSubject()));
            certificate.serialNo = entity[index].getSerialNo();
            certificate.fingerPrint = entity[index].getFingerPrint();
            certificate.validPeriodStart = entity[index].getValidPeriodStart();
            certificate.validPeriodEnd = entity[index].getValidPeriodEnd();
            response.list.push(certificate);
        }

        // レスポンスを返す
        return response.getAsJson();
    }
}
