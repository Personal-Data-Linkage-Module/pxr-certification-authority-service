/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Connection, InsertResult, EntityManager, UpdateResult } from 'typeorm';
import CertificateManageEntity from '../postgres/CertificateManageEntity';
import { ResponseCode } from '../../common/ResponseCode';
import AppError from '../../common/AppError';
/* eslint-enable */

/**
 * 証明書管理テーブルドメイン
 */
export default class CertificateManageRepository {
    /**
     * DB接続オブジェクト
     */
    private connection: Connection = null;

    /**
     * コンストラクタ
     * @param connection
     */
    // eslint-disable-next-line no-useless-constructor
    public constructor (connection: Connection) {
        this.connection = connection;
    }

    /**
     * ルート証明書取得
     */
    public async getRootCertificate (): Promise<CertificateManageEntity> {
        // SQLを生成及び実行
        const ret = await this.connection
            .createQueryBuilder()
            .from(CertificateManageEntity, 'certificate_manage')
            .where('certificate_manage.is_disabled = :is_disabled', { is_disabled: false })
            .andWhere('certificate_manage.cert_type = :cert_type', { cert_type: 'root' })
            .getRawOne();
        return ret ? new CertificateManageEntity(ret) : null;
    }

    /**
     * サーバ証明書取得
     * @param serialNo
     * @param fingerPrint
     */
    public async getServerCertificate (serialNo: string, fingerPrint: string): Promise<CertificateManageEntity> {
        // SQLを生成及び実行
        const ret = await this.connection
            .createQueryBuilder()
            .from(CertificateManageEntity, 'certificate_manage')
            .where('certificate_manage.is_disabled = :is_disabled', { is_disabled: false })
            .andWhere('certificate_manage.cert_type = :cert_type', { cert_type: 'server' })
            .andWhere('certificate_manage.serial_no = :serial_no', { serial_no: serialNo })
            .andWhere('certificate_manage.finger_print = :finger_print', { finger_print: fingerPrint })
            .getRawOne();
        return ret ? new CertificateManageEntity(ret) : null;
    }

    /**
     * クライアント証明書取得
     * @param serialNo
     * @param fingerPrint
     */
    public async getClientCertificate (serialNo: string, fingerPrint: string): Promise<CertificateManageEntity> {
        // SQLを生成及び実行
        const ret = await this.connection
            .createQueryBuilder()
            .from(CertificateManageEntity, 'certificate_manage')
            .where('certificate_manage.is_disabled = :is_disabled', { is_disabled: false })
            .andWhere('certificate_manage.cert_type = :cert_type', { cert_type: 'client' })
            .andWhere('certificate_manage.serial_no = :serial_no', { serial_no: serialNo })
            .andWhere('certificate_manage.finger_print = :finger_print', { finger_print: fingerPrint })
            .getRawOne();
        return ret ? new CertificateManageEntity(ret) : null;
    }

    /**
     * 証明書一覧取得
     */
    public async getCertificateList (): Promise<CertificateManageEntity[]> {
        // SQLを生成及び実行
        const ret = await this.connection
            .createQueryBuilder()
            .from(CertificateManageEntity, 'certificate_manage')
            .where('certificate_manage.is_disabled = :is_disabled', { is_disabled: false })
            .orderBy('certificate_manage.id', 'DESC')
            .getRawMany();
        const list: CertificateManageEntity[] = [];
        ret.forEach(element => {
            list.push(new CertificateManageEntity(element));
        });
        return list;
    }

    /**
     * 証明書管理レコード取得
     * @param serialNo
     * @param fingerPrint
     */
    public async getRecord (serialNo: string, fingerPrint: string): Promise<CertificateManageEntity> {
        // SQLを生成及び実行
        const ret = await this.connection
            .createQueryBuilder()
            .from(CertificateManageEntity, 'certificate_manage')
            .where('certificate_manage.is_disabled = :is_disabled', { is_disabled: false })
            .andWhere('certificate_manage.serial_no = :serial_no', { serial_no: serialNo })
            .andWhere('certificate_manage.finger_print = :finger_print', { finger_print: fingerPrint })
            .getRawOne();
        return ret ? new CertificateManageEntity(ret) : null;
    }

    /**
     * 証明書管理レコード更新
     * @param em
     * @param entity
     */
    public async updateRecord (em: EntityManager, entity: CertificateManageEntity): Promise<UpdateResult> {
        throw new AppError('Unit Test Update Error', ResponseCode.SERVICE_UNAVAILABLE);
    }

    /**
     * 証明書管理レコード追加
     * @param em
     * @param entity
     */
    public async insertRecord (em: EntityManager, entity: CertificateManageEntity): Promise<InsertResult> {
        throw new AppError('Unit Test Insert Error', ResponseCode.SERVICE_UNAVAILABLE);
    }

    /**
     * 証明書管理レコード削除
     * @param em
     * @param entity
     */
    public async deleteRecord (em: EntityManager, entity: CertificateManageEntity): Promise<UpdateResult> {
        throw new AppError('Unit Test Update Error', ResponseCode.SERVICE_UNAVAILABLE);
    }
}
