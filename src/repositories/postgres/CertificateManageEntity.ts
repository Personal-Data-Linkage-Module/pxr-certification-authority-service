/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 証明書管理テーブルエンティティ
 */
@Entity('certificate_manage')
export default class CertificateManageEntity {
    /**
     * ID
     */
    @PrimaryGeneratedColumn({ type: 'bigint' })
    readonly id: number = 0;

    /**
     * 証明書タイプ
     */
    @Column({ type: 'varchar', length: 255, nullable: false, name: 'cert_type' })
    certType: string = null;

    /**
     * サブジェクト
     */
    @Column({ type: 'text', nullable: false, name: 'subject' })
    subject: string = null;

    /**
     * シリアル番号
     */
    @Column({ type: 'varchar', length: 255, nullable: false, name: 'serial_no' })
    serialNo: string = '';

    /**
     * フィンガープリント
     */
    @Column({ type: 'varchar', length: 255, nullable: false, name: 'finger_print' })
    fingerPrint: string = '';

    /**
     * 有効期間開始
     */
    @Column({ type: 'timestamp without time zone', nullable: false, name: 'valid_period_start' })
    validPeriodStart: Date = new Date();

    /**
     * 有効期間終了
     */
    @Column({ type: 'timestamp without time zone', nullable: false, name: 'valid_period_end' })
    validPeriodEnd: Date = new Date();

    /**
     * 証明書(PEM)
     */
    @Column({ type: 'text', nullable: false, name: 'certificate' })
    certificate: string = null;

    /**
     * アクターカタログコード
     */
    @Column({ type: 'bigint', name: 'actor_code' })
    actorCode: number = null;

    /**
     * アクターカタログバージョン
     */
    @Column({ type: 'bigint', name: 'actor_version' })
    actorVersion: number = null;

    /**
     * ブロックコード
     */
    @Column({ type: 'bigint', nullable: false, name: 'block_code' })
    blockCode: number = null;

    /**
     * ブロックバージョン
     */
    @Column({ type: 'bigint', nullable: false, name: 'block_version' })
    blockVersion: number = null;

    /**
     * 配布フラグ
     */
    @Column({ type: 'boolean', nullable: false, default: false, name: 'is_distributed' })
    isDistributed: boolean = false;

    /**
     * 削除フラグ
     */
    @Column({ type: 'boolean', nullable: false, default: false, name: 'is_disabled' })
    isDisabled: boolean = false;

    /**
     * 登録者
     */
    @Column({ type: 'varchar', length: 255, nullable: false, name: 'created_by' })
    createdBy: string = '';

    /**
     * 登録日時
     */
    @CreateDateColumn({ type: 'timestamp without time zone', nullable: false, default: 'NOW()', name: 'created_at' })
    readonly createdAt: Date = new Date();

    /**
     * 更新者
     */
    @Column({ type: 'varchar', length: 255, nullable: false, name: 'updated_by' })
    updatedBy: string = '';

    /**
     * 更新日時
     */
    @UpdateDateColumn({ type: 'timestamp without time zone', nullable: false, default: 'NOW()', name: 'updated_at' })
    readonly updatedAt: Date = new Date();

    /**
     * コンストラクタ
     * @param entity
     */
    constructor (entity: {}) {
        if (entity) {
            this.id = entity['id'] ? Number(entity['id']) : 0;
            this.certType = entity['cert_type'];
            this.subject = entity['subject'];
            this.serialNo = entity['serial_no'];
            this.fingerPrint = entity['finger_print'];
            this.validPeriodStart = entity['valid_period_start'] ? new Date(entity['valid_period_start']) : null;
            this.validPeriodEnd = entity['valid_period_end'] ? new Date(entity['valid_period_end']) : null;
            this.certificate = entity['certificate'];
            this.actorCode = entity['actor_code'] ? Number(entity['actor_code']) : null;
            this.actorVersion = entity['actor_version'] ? Number(entity['actor_version']) : null;
            this.blockCode = entity['block_code'] ? Number(entity['block_code']) : null;
            this.blockVersion = entity['block_version'] ? Number(entity['block_version']) : null;
            this.isDistributed = entity['is_distributed'] ? Boolean(entity['is_distributed']) : false;
            this.isDisabled = entity['is_disabled'] ? Boolean(entity['is_disabled']) : false;
            this.createdBy = entity['created_by'];
            this.createdAt = entity['created_at'] ? new Date(entity['created_at']) : null;
            this.updatedBy = entity['updated_by'];
            this.updatedAt = entity['updated_at'] ? new Date(entity['updated_at']) : null;
        }
    }

    public getId (): number {
        return this.id;
    }

    public getCertType (): string {
        return this.certType;
    }

    public setCertType (certType: string): void {
        this.certType = certType;
    }

    public getSubject (): string {
        return this.subject;
    }

    public setSubject (subject: string): void {
        this.subject = subject;
    }

    public getSerialNo (): string {
        return this.serialNo;
    }

    public setSerialNo (serialNo: string): void {
        this.serialNo = serialNo;
    }

    public getFingerPrint (): string {
        return this.fingerPrint;
    }

    public setFingerPrint (fingerPrint: string): void {
        this.fingerPrint = fingerPrint;
    }

    public getValidPeriodStart (): Date {
        return this.validPeriodStart;
    }

    public setValidPeriodStart (validPeriodStart: Date): void {
        this.validPeriodStart = validPeriodStart;
    }

    public getValidPeriodEnd (): Date {
        return this.validPeriodEnd;
    }

    public setValidPeriodEnd (validPeriodEnd: Date): void {
        this.validPeriodEnd = validPeriodEnd;
    }

    public getCertificate (): string {
        return this.certificate;
    }

    public setCertificate (certificate: string): void {
        this.certificate = certificate;
    }

    public getActorCode (): number {
        return this.actorCode;
    }

    public setActorCode (actorCode: number): void {
        this.actorCode = actorCode;
    }

    public getActorVersion (): number {
        return this.actorVersion;
    }

    public setActorVersion (actorVersion: number): void {
        this.actorVersion = actorVersion;
    }

    public getBlockCode (): number {
        return this.blockCode;
    }

    public setBlockCode (blockCode: number): void {
        this.blockCode = blockCode;
    }

    public getBlockVersion (): number {
        return this.blockVersion;
    }

    public setBlockVersion (blockVersion: number): void {
        this.blockVersion = blockVersion;
    }

    public getIsDistributed (): boolean {
        return this.isDistributed;
    }

    public setIsDistributed (isDistributed: boolean): void {
        this.isDistributed = isDistributed;
    }

    public getIsDisabled (): boolean {
        return this.isDisabled;
    }

    public setIsDisabled (isDisabled: boolean): void {
        this.isDisabled = isDisabled;
    }

    public getCreatedBy (): string {
        return this.createdBy;
    }

    public setCreatedBy (createdBy: string): void {
        this.createdBy = createdBy;
    }

    public getCreatedAt (): Date {
        return this.createdAt;
    }

    public getUpdatedBy (): string {
        return this.updatedBy;
    }

    public setUpdatedBy (updatedBy: string): void {
        this.updatedBy = updatedBy;
    }

    public getUpdatedAt (): Date {
        return this.updatedAt;
    }
}
