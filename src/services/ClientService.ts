/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Service } from 'typedi';
import { Connection, EntityManager } from 'typeorm';
import ClientDto from './dto/ClientServiceDto';
import Operator from '../resources/dto/OperatorDto';
/* eslint-enable */
import CertificateManageEntity from '../repositories/postgres/CertificateManageEntity';
import CertificateManageRepository from '../repositories/CertificateManageRepository';
import GetClientResDto from '../resources/dto/GetClientResDto';
import PostClientResDto from '../resources/dto/PostClientResDto';
import DeleteClientResDto from '../resources/dto/DeleteClientResDto';
import Subject from '../resources/dto/SubjectDto';
import CertificateControl from '../common/CertificateControl';
import AppError from '../common/AppError';
import { ResponseCode } from '../common/ResponseCode';
import Config from '../common/Config';
import fs = require('fs');
const Message = Config.ReadConfig('./config/message.json');

/**
 * クライアント証明書サービス
 */
@Service()
export default class ClientService {
    /**
     * クライアント証明書取得
     * @param connection
     * @param clientDto
     */
    public static async getCertificate (connection: Connection, clientDto: ClientDto): Promise<{}> {
        // 証明書管理ドメインを生成
        const repository: CertificateManageRepository = new CertificateManageRepository(connection);

        // クライアント証明書を取得
        const entity: CertificateManageEntity = await repository.getClientCertificate(clientDto.getSerialNo(), clientDto.getFingerPrint());
        if (!entity) {
            // エラーを返す
            throw new AppError(Message.TARGET_NO_DATA, ResponseCode.NO_CONTENT);
        }

        // レスポンスを生成
        const response: GetClientResDto = new GetClientResDto();
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
     * クライアント証明書生成
     * @param connection
     * @param opensslPath
     * @param clientDto
     */
    public static async createCertificate (connection: Connection, opensslPath: string, clientDto: ClientDto): Promise<{}> {
        // オペレータ情報を取得
        const operator: Operator = clientDto.getOperator();

        // クライアント証明書用サブジェクトを取得
        const subject = clientDto.getSubject();

        // 証明書操作オブジェクトを生成
        const certificate: CertificateControl = new CertificateControl();

        // opensslを使用してRSA秘密鍵(2048bit)を生成する
        let result: string = await certificate.createRsaPrivateKey(opensslPath, clientDto.getPrivateKeyPath());
        if (result) {
            // エラーを返す
            throw new AppError(Message.FAILED_OPENSSL_PRIVATE_KEY, ResponseCode.SERVICE_UNAVAILABLE);
        }

        // opensslを使用して生成したRSA秘密鍵を基にクライアント証明書(PEM)を生成する
        result = await certificate.createClientCertificate(opensslPath, clientDto.getPrivateKeyPath(), clientDto.getCertPath(), clientDto.getPeriodDay(), subject);
        if (result) {
            // エラーを返す
            throw new AppError(Message.FAILED_OPENSSL_CERTIFICATE, ResponseCode.SERVICE_UNAVAILABLE);
        }

        // 生成した証明書からシリアル番号を取得
        result = await certificate.getSerialNoByCertificate(opensslPath, clientDto.getCertPath());
        if (!result) {
            // エラーを返す
            throw new AppError(Message.FAILED_OPENSSL_CONVERT, ResponseCode.SERVICE_UNAVAILABLE);
        }
        const serialNo: string = certificate.getConvertCertificate(result);

        // 生成した証明書からフィンガープリントを取得
        result = await certificate.getFingerPrintByCertificate(opensslPath, clientDto.getCertPath());
        if (!result) {
            // エラーを返す
            throw new AppError(Message.FAILED_OPENSSL_CONVERT, ResponseCode.SERVICE_UNAVAILABLE);
        }
        const fingerPrint: string = certificate.getConvertCertificate(result);

        // 生成した証明書から有効期間を取得
        result = await certificate.getValidPeriodByCertificate(opensslPath, clientDto.getCertPath());
        if (!result) {
            // エラーを返す
            throw new AppError(Message.FAILED_OPENSSL_CONVERT, ResponseCode.SERVICE_UNAVAILABLE);
        }
        var validPeriodList = result.split(/\r\n|\r|\n/);
        const validPeriodStart: string = certificate.getConvertCertificate(validPeriodList[0]);
        const validPeriodEnd: string = certificate.getConvertCertificate(validPeriodList[1]);

        // RSA秘密鍵、クライアント証明書(PEM)を結合する
        const combineCert: string = certificate.combineCert(clientDto.getPrivateKeyPath(), clientDto.getCertPath());

        // 証明書管理ドメインを生成
        const repository: CertificateManageRepository = new CertificateManageRepository(connection);

        // 証明書管理テーブル追加データを生成
        const entity: CertificateManageEntity = new CertificateManageEntity({
            cert_type: 'client',
            subject: JSON.stringify(subject.getAsJson()),
            serial_no: serialNo,
            finger_print: fingerPrint,
            valid_period_start: validPeriodStart,
            valid_period_end: validPeriodEnd,
            certificate: combineCert,
            actor_code: clientDto.getActor().value,
            actor_version: clientDto.getActor().ver,
            block_code: clientDto.getBlock().value,
            block_version: clientDto.getBlock().ver,
            is_distributed: false,
            is_disabled: false,
            created_by: operator.getLoginId(),
            updated_by: operator.getLoginId()
        });

        // トランザクション開始
        await connection.transaction(async (em: EntityManager) => {
            // 結合したクライアント証明書を証明書管理に保存
            await repository.insertRecord(em, entity);
        }).catch(err => {
            throw err;
        });

        // レスポンスを生成
        const response: PostClientResDto = new PostClientResDto();
        response.certType = 'client';
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
     * クライアント証明書失効
     * @param connection
     * @param opensslPath
     * @param clientDto
     */
    public static async revokeCertificate (connection: Connection, opensslPath: string, clientDto: ClientDto): Promise<{}> {
        // オペレータ情報を取得
        const operator: Operator = clientDto.getOperator();

        // 証明書管理ドメインを生成
        const repository: CertificateManageRepository = new CertificateManageRepository(connection);

        // クライアント証明書を取得
        const entity: CertificateManageEntity = await repository.getClientCertificate(clientDto.getSerialNo(), clientDto.getFingerPrint());
        if (!entity) {
            // エラーを返す
            throw new AppError(Message.TARGET_NO_DATA, ResponseCode.BAD_REQUEST);
        }

        // 失効対象の証明書ファイルを生成
        fs.writeFileSync(clientDto.getCertPath(), entity.getCertificate());

        // 証明書操作オブジェクトを生成
        const certificate: CertificateControl = new CertificateControl();

        // opensslを使用してクライアント証明書を失効する
        const result: string = await certificate.revokeClientCertificate(opensslPath, clientDto.getCertPath());
        if (result) {
            if (result.indexOf('Already revoked') >= 0) {
                // そのまま進む
            } else {
                // エラーを返す
                throw new AppError(Message.FAILED_OPENSSL_CERTIFICATE_REVOKE, ResponseCode.SERVICE_UNAVAILABLE);
            }
        }

        // 証明書管理テーブル削除データを生成
        entity.setIsDisabled(true);
        entity.setCreatedBy(operator.getLoginId());
        entity.setUpdatedBy(operator.getLoginId());

        // トランザクション開始
        await connection.transaction(async (em: EntityManager) => {
            // クライアント証明書を証明書管理から削除
            await repository.deleteRecord(em, entity);
        }).catch(err => {
            throw err;
        });

        // レスポンスを生成
        const response: DeleteClientResDto = new DeleteClientResDto();
        response.result = 'success';

        // レスポンスを返す
        return response.getAsJson();
    }
}
