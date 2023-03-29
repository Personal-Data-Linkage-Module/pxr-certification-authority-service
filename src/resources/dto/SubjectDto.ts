/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Idto } from './IdtoDto';
/* eslint-enable */

export default class SubjectDto implements Idto {
    /**
     * C
     */
    public C: string = null;
    /**
     * ST
     */
    public ST: string = null;
    /**
     * L
     */
    public L: string = null;
    /**
     * O
     */
    public O: string = null;
    /**
     * OU
     */
    public OU: string = null;
    /**
     * CN
     */
    public CN: string = null;

    /**
     * データ構造取得(JSON用連想配列)
     */
    public getAsJson (): {} {
        const obj: {} = {
            C: this.C,
            ST: this.ST,
            L: this.L,
            O: this.O,
            OU: this.OU,
            CN: this.CN
        };
        return obj;
    }

    /**
     * データ構造設定(JSON用連想配列)
     * @param obj
     */
    public setFromJson (obj: {}): void {
        this.C = obj['C'];
        this.ST = obj['ST'];
        this.L = obj['L'];
        this.O = obj['O'];
        this.OU = obj['OU'];
        this.CN = obj['CN'];
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
