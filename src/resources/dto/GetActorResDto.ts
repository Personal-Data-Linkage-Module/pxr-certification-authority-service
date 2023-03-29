/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Idto } from './IdtoDto';
import CodeVersion from './CodeVersionDto';
/* eslint-enable */

/**
 * アクター情報取得(GET)レスポンスモデル
 */
export default class GetActorResDto implements Idto {
    /**
     * ブロックコード、バージョン
     */
    public block: CodeVersion = null;

    /**
     * アクターカタログコード、バージョン
     */
    public actor: CodeVersion = null;

    /**
     * データ構造取得(JSON用連想配列)
     */
    public getAsJson (): {} {
        const obj: {} = {
            actor: this.actor ? this.actor.getAsJson() : null,
            block: this.block ? this.block.getAsJson() : null
        };
        return obj;
    }

    /**
     * データ構造設定(JSON用連想配列)
     * @param obj
     */
    public setFromJson (obj: {}): void {
        if (obj['block']) {
            this.block = new CodeVersion();
            this.block.setFromJson(obj['block']);
        }
        if (obj['actor']) {
            this.actor = new CodeVersion();
            this.actor.setFromJson(obj['actor']);
        }
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
