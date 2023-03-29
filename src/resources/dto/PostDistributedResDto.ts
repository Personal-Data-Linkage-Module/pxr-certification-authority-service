/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Idto } from './IdtoDto';
/* eslint-enable */

/**
 * 証明書配布状況登録(POST)レスポンスモデル
 */
export default class PostDistributedResDto implements Idto {
    /**
     * シリアル番号
     */
    public serialNo: string = null;

    /**
     * フィンガープリント
     */
    public fingerPrint: string = null;

    /**
     * 配布状況
     */
    public status: string = null;

    /**
     * データ構造取得(JSON用連想配列)
     */
    public getAsJson (): {} {
        const obj: {} = {
            serialNo: this.serialNo,
            fingerPrint: this.fingerPrint,
            status: this.status
        };
        return obj;
    }

    /**
     * データ構造設定(JSON用連想配列)
     * @param obj
     */
    public setFromJson (obj: {}): void {
        this.serialNo = obj['serialNo'];
        this.fingerPrint = obj['fingerPrint'];
        this.status = obj['status'];
    }

    /**
     * データ構造コピー
     */
    public clone<T> (): T {
        const clone = new (this.constructor as { new(): T })();
        Object.assign(clone, this);
        return clone;
    }
}
