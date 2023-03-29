/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/**
 * クライアント証明書有効性検証サービスデータ
 */
export default class ValidServiceDto {
    /**
     * シリアル番号
     */
    private serialNo: string = null;

    /**
     * フィンガープリント
     */
    private fingerPrint: string = null;

    /**
     * シリアル番号取得
     */
    public getSerialNo (): string {
        return this.serialNo;
    }

    /**
     * シリアル番号設定
     * @param serialNo
     */
    public setSerialNo (serialNo: string) {
        this.serialNo = serialNo;
    }

    /**
     * フィンガープリント取得
     */
    public getFingerPrint (): string {
        return this.fingerPrint;
    }

    /**
     * フィンガープリント設定
     * @param fingerPrint
     */
    public setFingerPrint (fingerPrint: string) {
        this.fingerPrint = fingerPrint;
    }
}
