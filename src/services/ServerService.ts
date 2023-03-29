/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Service } from 'typedi';
import { Connection, EntityManager } from 'typeorm';
import Operator from '../resources/dto/OperatorDto';
import ServerDto from './dto/ServerServiceDto';
/* eslint-enable */
import CertificateManageEntity from '../repositories/postgres/CertificateManageEntity';
import CertificateManageRepository from '../repositories/CertificateManageRepository';
import GetServerResDto from '../resources/dto/GetServerResDto';
import PostServerResDto from '../resources/dto/PostServerResDto';
import DeleteServerResDto from '../resources/dto/DeleteServerResDto';
import Subject from '../resources/dto/SubjectDto';
import CertificateControl from '../common/CertificateControl';
import AppError from '../common/AppError';
import { ResponseCode } from '../common/ResponseCode';
import Config from '../common/Config';
import fs = require('fs');
const Message = Config.ReadConfig('./config/message.json');

/**
 * サーバ証明書サービス
 */
@Service()
export default class ServerService {
    /**
     * サーバ証明書取得
     * @param connection
     * @param serverDto
     */
    public static async getCertificate (connection: Connection, serverDto: ServerDto): Promise<{}> {
        // 証明書管理ドメインを生成
        const repository: CertificateManageRepository = new CertificateManageRepository(connection);

        // サーバ証明書を取得
        const entity: CertificateManageEntity = await repository.getServerCertificate(serverDto.getSerialNo(), serverDto.getFingerPrint());
        if (!entity) {
            // エラーを返す
            throw new AppError(Message.TARGET_NO_DATA, ResponseCode.NO_CONTENT);
        }

        // レスポンスを生成
        const response: GetServerResDto = new GetServerResDto();
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
     * サーバ証明書生成
     * @param connection
     * @param opensslPath
     * @param serverDto
     */
    public static async createCertificate (connection: Connection, opensslPath: string, serverDto: ServerDto): Promise<{}> {
        // オペレータ情報を取得
        const operator: Operator = serverDto.getOperator();

        // サーバ証明書用サブジェクトを取得
        const subject = serverDto.getSubject();

        // 証明書操作オブジェクトを生成
        const certificate: CertificateControl = new CertificateControl();

        // opensslを使用してRSA秘密鍵(2048bit)を生成する
        let result: string = await certificate.createRsaPrivateKey(opensslPath, serverDto.getPrivateKeyPath());
        if (result) {
            // エラーを返す
            throw new AppError(Message.FAILED_OPENSSL_PRIVATE_KEY, ResponseCode.SERVICE_UNAVAILABLE);
        }

        // opensslを使用して生成したRSA秘密鍵を基にサーバ証明書(PEM)を生成する
        result = await certificate.createServerCertificate(opensslPath, serverDto.getPrivateKeyPath(), serverDto.getCertPath(), serverDto.getPeriodDay(), subject);
        if (result) {
            // エラーを返す
            throw new AppError(Message.FAILED_OPENSSL_CERTIFICATE, ResponseCode.SERVICE_UNAVAILABLE);
        }

        // 生成した証明書からシリアル番号を取得
        result = await certificate.getSerialNoByCertificate(opensslPath, serverDto.getCertPath());
        if (!result) {
            // エラーを返す
            throw new AppError(Message.FAILED_OPENSSL_CONVERT, ResponseCode.SERVICE_UNAVAILABLE);
        }
        const serialNo: string = certificate.getConvertCertificate(result);

        // 生成した証明書からフィンガープリントを取得
        result = await certificate.getFingerPrintByCertificate(opensslPath, serverDto.getCertPath());
        if (!result) {
            // エラーを返す
            throw new AppError(Message.FAILED_OPENSSL_CONVERT, ResponseCode.SERVICE_UNAVAILABLE);
        }
        const fingerPrint: string = certificate.getConvertCertificate(result);

        // 生成した証明書から有効期間を取得
        result = await certificate.getValidPeriodByCertificate(opensslPath, serverDto.getCertPath());
        if (!result) {
            // エラーを返す
            throw new AppError(Message.FAILED_OPENSSL_CONVERT, ResponseCode.SERVICE_UNAVAILABLE);
        }
        var validPeriodList = result.split(/\r\n|\r|\n/);
        const validPeriodStart: string = certificate.getConvertCertificate(validPeriodList[0]);
        const validPeriodEnd: string = certificate.getConvertCertificate(validPeriodList[1]);

        // RSA秘密鍵、サーバ証明書(PEM)を結合する
        const combineCert: string = certificate.combineCert(serverDto.getPrivateKeyPath(), serverDto.getCertPath());

        // 証明書管理ドメインを生成
        const repository: CertificateManageRepository = new CertificateManageRepository(connection);

        // 証明書管理テーブル追加データを生成
        const entity: CertificateManageEntity = new CertificateManageEntity({
            cert_type: 'server',
            subject: JSON.stringify(subject.getAsJson()),
            serial_no: serialNo,
            finger_print: fingerPrint,
            valid_period_start: validPeriodStart,
            valid_period_end: validPeriodEnd,
            certificate: combineCert,
            actor_code: serverDto.getActor().value,
            actor_version: serverDto.getActor().ver,
            block_code: serverDto.getBlock().value,
            block_version: serverDto.getBlock().ver,
            is_distributed: false,
            is_disabled: false,
            created_by: operator.getLoginId(),
            updated_by: operator.getLoginId()
        });

        // トランザクション開始
        await connection.transaction(async (em: EntityManager) => {
            // 結合したサーバ証明書を証明書管理に保存
            await repository.insertRecord(em, entity);
        }).catch(err => {
            throw err;
        });

        // レスポンスを生成
        const response: PostServerResDto = new PostServerResDto();
        response.certType = 'server';
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
     * サーバ証明書失効
     * @param connection
     * @param opensslPath
     * @param serverDto
     */
    public static async revokeCertificate (connection: Connection, opensslPath: string, serverDto: ServerDto): Promise<{}> {
        // オペレータ情報を取得
        const operator: Operator = serverDto.getOperator();

        // 証明書管理ドメインを生成
        const repository: CertificateManageRepository = new CertificateManageRepository(connection);

        // サーバ証明書を取得
        const entity: CertificateManageEntity = await repository.getServerCertificate(serverDto.getSerialNo(), serverDto.getFingerPrint());
        if (!entity) {
            // エラーを返す
            throw new AppError(Message.TARGET_NO_DATA, ResponseCode.BAD_REQUEST);
        }

        // 失効対象の証明書ファイルを生成
        fs.writeFileSync(serverDto.getCertPath(), entity.getCertificate());

        // 証明書操作オブジェクトを生成
        const certificate: CertificateControl = new CertificateControl();

        // opensslを使用してサーバ証明書を失効する
        const result: string = await certificate.revokeServerCertificate(opensslPath, serverDto.getCertPath());
        if (result) {
            // エラーを返す
            throw new AppError(Message.FAILED_OPENSSL_CERTIFICATE_REVOKE, ResponseCode.SERVICE_UNAVAILABLE);
        }

        // 証明書管理テーブル削除データを生成
        entity.setIsDisabled(true);
        entity.setCreatedBy(operator.getLoginId());
        entity.setUpdatedBy(operator.getLoginId());

        // トランザクション開始
        await connection.transaction(async (em: EntityManager) => {
            // サーバ証明書を証明書管理から削除
            await repository.deleteRecord(em, entity);
        }).catch(err => {
            throw err;
        });

        // レスポンスを生成
        const response: DeleteServerResDto = new DeleteServerResDto();
        response.result = 'success';

        // レスポンスを返す
        return response.getAsJson();
    }
}
