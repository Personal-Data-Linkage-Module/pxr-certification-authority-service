/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Service } from 'typedi';
import { Connection, EntityManager } from 'typeorm';
import RootDto from './dto/RootServiceDto';
import Operator from '../resources/dto/OperatorDto';
/* eslint-enable */
import CertificateManageEntity from '../repositories/postgres/CertificateManageEntity';
import CertificateManageRepository from '../repositories/CertificateManageRepository';
import GetRootResDto from '../resources/dto/GetRootResDto';
import Subject from '../resources/dto/SubjectDto';
import CertificateControl from '../common/CertificateControl';
import PostRootResDto from '../resources/dto/PostRootResDto';
import AppError from '../common/AppError';
import { ResponseCode } from '../common/ResponseCode';
import Config from '../common/Config';
const Message = Config.ReadConfig('./config/message.json');

/**
 * ルート証明書サービス
 */
@Service()
export default class RootService {
    /**
     * ルート証明書取得
     * @param connection
     * @param rootDto
     */
    public static async getCertificate (connection: Connection, rootDto: RootDto): Promise<{}> {
        // 証明書管理ドメインを生成
        const repository: CertificateManageRepository = new CertificateManageRepository(connection);

        // ルート証明書を取得
        const entity: CertificateManageEntity = await repository.getRootCertificate();
        if (!entity) {
            // エラーを返す
            throw new AppError(Message.TARGET_NO_DATA, ResponseCode.NO_CONTENT);
        }

        // レスポンスを生成
        const response: GetRootResDto = new GetRootResDto();
        response.certType = entity.getCertType();
        response.subject = new Subject();
        response.subject.setFromJson(JSON.parse(entity.getSubject()));
        response.serialNo = entity.getSerialNo();
        response.fingerPrint = entity.getFingerPrint();
        response.validPeriodStart = entity.getValidPeriodStart();
        response.validPeriodEnd = entity.getValidPeriodEnd();
        response.certificate = entity.getCertificate();

        // レスポンスを返す
        return response.getAsJson();
    }

    /**
     * ルート証明書生成
     * @param connection
     * @param opensslPath
     * @param rootDto
     */
    public static async createCertificate (connection: Connection, opensslPath: string, rootDto: RootDto): Promise<{}> {
        // オペレータ情報を取得
        const operator: Operator = rootDto.getOperator();

        // ルート証明書用サブジェクトを取得
        const subject = rootDto.getSubject();

        // 証明書操作オブジェクトを生成
        const certificate: CertificateControl = new CertificateControl();

        // opensslを使用してRSA秘密鍵(2048bit)を生成する
        let result: string = await certificate.createRsaPrivateKey(opensslPath, rootDto.getPrivateKeyPath());
        if (result) {
            // エラーを返す
            throw new AppError(Message.FAILED_OPENSSL_PRIVATE_KEY, ResponseCode.SERVICE_UNAVAILABLE);
        }

        // opensslを使用して生成したRSA秘密鍵を基にルート証明書(PEM)を生成する
        result = await certificate.createRootCertificate(opensslPath, rootDto.getPrivateKeyPath(), rootDto.getCertPath(), rootDto.getPeriodDay(), subject);
        if (result) {
            // エラーを返す
            throw new AppError(Message.FAILED_OPENSSL_CERTIFICATE, ResponseCode.SERVICE_UNAVAILABLE);
        }

        // 生成した証明書からシリアル番号を取得
        result = await certificate.getSerialNoByCertificate(opensslPath, rootDto.getCertPath());
        if (!result) {
            // エラーを返す
            throw new AppError(Message.FAILED_OPENSSL_CONVERT, ResponseCode.SERVICE_UNAVAILABLE);
        }
        const serialNo: string = certificate.getConvertCertificate(result);

        // 生成した証明書からフィンガープリントを取得
        result = await certificate.getFingerPrintByCertificate(opensslPath, rootDto.getCertPath());
        if (!result) {
            // エラーを返す
            throw new AppError(Message.FAILED_OPENSSL_CONVERT, ResponseCode.SERVICE_UNAVAILABLE);
        }
        const fingerPrint: string = certificate.getConvertCertificate(result);

        // 生成した証明書から有効期間を取得
        result = await certificate.getValidPeriodByCertificate(opensslPath, rootDto.getCertPath());
        if (!result) {
            // エラーを返す
            throw new AppError(Message.FAILED_OPENSSL_CONVERT, ResponseCode.SERVICE_UNAVAILABLE);
        }
        var validPeriodList = result.split(/\r\n|\r|\n/);
        const validPeriodStart: string = certificate.getConvertCertificate(validPeriodList[0]);
        const validPeriodEnd: string = certificate.getConvertCertificate(validPeriodList[1]);

        // RSA秘密鍵、ルート証明書(PEM)を結合する
        const combineCert: string = certificate.combineCert(rootDto.getPrivateKeyPath(), rootDto.getCertPath());

        // 証明書管理ドメインを生成
        const repository: CertificateManageRepository = new CertificateManageRepository(connection);

        // 証明書管理テーブル追加データを生成
        const entity: CertificateManageEntity = new CertificateManageEntity({
            cert_type: 'root',
            subject: JSON.stringify(subject.getAsJson()),
            serial_no: serialNo,
            finger_print: fingerPrint,
            valid_period_start: validPeriodStart,
            valid_period_end: validPeriodEnd,
            certificate: combineCert,
            actor_code: null,
            actor_version: null,
            block_code: null,
            block_version: null,
            is_distributed: false,
            is_disabled: false,
            created_by: operator.getLoginId(),
            updated_by: operator.getLoginId()
        });

        // トランザクション開始
        await connection.transaction(async (em: EntityManager) => {
            // 結合したルート証明書を証明書管理に保存
            await repository.insertRecord(em, entity);
        }).catch(err => {
            throw err;
        });

        // レスポンスを生成
        const response: PostRootResDto = new PostRootResDto();
        response.certType = 'root';
        response.subject = new Subject();
        response.subject.setFromJson(JSON.parse(entity.getSubject()));
        response.serialNo = entity.getSerialNo();
        response.fingerPrint = entity.getFingerPrint();
        response.validPeriodStart = entity.getValidPeriodStart();
        response.validPeriodEnd = entity.getValidPeriodEnd();
        response.certificate = entity.getCertificate();

        // レスポンスを返す
        return response.getAsJson();
    }
}
