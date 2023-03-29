/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Connection, InsertResult, EntityManager, UpdateResult } from 'typeorm';
/* eslint-enable */
import CertificateManageEntity from './postgres/CertificateManageEntity';

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
     * 証明書一覧取得（by アクターコード）
     */
    public async getCertListByActorCode (actorCode: number): Promise<CertificateManageEntity[]> {
        // SQLを生成及び実行
        const ret = await this.connection
            .createQueryBuilder()
            .from(CertificateManageEntity, 'certificate_manage')
            .where('certificate_manage.is_disabled = :is_disabled', { is_disabled: false })
            .andWhere('certificate_manage.actor_code = :actor_code', { actor_code: actorCode })
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
        // SQLを生成及び実行
        const ret = await this.connection
            .createQueryBuilder()
            .update(CertificateManageEntity)
            .set({
                isDistributed: entity.getIsDistributed()
            })
            .where('certificate_manage.is_disabled = :is_disabled', { is_disabled: false })
            .andWhere('certificate_manage.serial_no = :serial_no', { serial_no: entity.getSerialNo() })
            .andWhere('certificate_manage.finger_print = :finger_print', { finger_print: entity.getFingerPrint() })
            .execute();
        return ret;
    }

    /**
     * 証明書管理レコード追加
     * @param em
     * @param entity
     */
    public async insertRecord (em: EntityManager, entity: CertificateManageEntity): Promise<InsertResult> {
        // SQLを生成及び実行
        const ret = await em
            .createQueryBuilder()
            .insert()
            .into(CertificateManageEntity)
            .values({
                certType: entity.getCertType(),
                subject: entity.getSubject(),
                serialNo: entity.getSerialNo(),
                fingerPrint: entity.getFingerPrint(),
                validPeriodStart: entity.getValidPeriodStart(),
                validPeriodEnd: entity.getValidPeriodEnd(),
                certificate: entity.getCertificate(),
                actorCode: entity.getActorCode(),
                actorVersion: entity.getActorVersion(),
                blockCode: entity.getBlockCode(),
                blockVersion: entity.getBlockVersion(),
                isDistributed: entity.getIsDistributed(),
                isDisabled: entity.getIsDisabled(),
                createdBy: entity.getCreatedBy(),
                updatedBy: entity.getUpdatedBy()
            })
            .execute();
        return ret;
    }

    /**
     * 証明書管理レコード削除
     * @param em
     * @param entity
     */
    public async deleteRecord (em: EntityManager, entity: CertificateManageEntity): Promise<UpdateResult> {
        // SQLを生成及び実行
        const ret = await this.connection
            .createQueryBuilder()
            .update(CertificateManageEntity)
            .set({
                isDisabled: true
            })
            .where('certificate_manage.is_disabled = :is_disabled', { is_disabled: false })
            .andWhere('certificate_manage.serial_no = :serial_no', { serial_no: entity.getSerialNo() })
            .andWhere('certificate_manage.finger_print = :finger_print', { finger_print: entity.getFingerPrint() })
            .execute();
        return ret;
    }
}
