/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Idto } from './IdtoDto';
import CodeVersion from './CodeVersionDto';
/* eslint-enable */

/**
 * サーバ証明書生成(POST)リクエストモデル
 */
export default class PostServerReqDto implements Idto {
    /**
     * 証明書タイプ
     */
    private certType: string = null;

    /**
     * アクター名
     */
    private actorName: string = null;

    /**
     * ブロックコード、バージョン
     */
    private block: CodeVersion = null;

    /**
     * アクターカタログコード、バージョン
     */
    private actor: CodeVersion = null;

    /**
     * データ構造取得(JSON用連想配列)
     */
    public getAsJson (): {} {
        const obj: {} = {
            certType: this.certType,
            actorName: this.actorName,
            block: this.block ? this.block.getAsJson() : null,
            actor: this.actor ? this.actor.getAsJson() : null
        };
        return obj;
    }

    /**
     * データ構造設定(JSON用連想配列)
     * @param obj
     */
    public setFromJson (obj: {}): void {
        this.certType = obj['certType'];
        this.actorName = obj['actorName'];
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

    /**
     * 証明書タイプ取得
     */
    public getCertType (): string {
        return this.certType;
    }

    /**
     * 証明書タイプ設定
     * @param certType
     */
    public setCertType (certType: string) {
        this.certType = certType;
    }

    /**
     * アクター名取得
     */
    public getActorName (): string {
        return this.actorName;
    }

    /**
     * アクター名設定
     * @param actorName
     */
    public setActorName (actorName: string) {
        this.actorName = actorName;
    }

    /**
     * ブロックコード、バージョン取得
     */
    public getBlock (): CodeVersion {
        return this.block;
    }

    /**
     * ブロックコード、バージョン設定
     * @param block
     */
    public setBlock (block: CodeVersion) {
        this.block = block;
    }

    /**
     * アクターカタログコード、バージョン取得
     */
    public getActor (): CodeVersion {
        return this.actor;
    }

    /**
     * アクターカタログコード、バージョン設定
     * @param actor
     */
    public setActor (actor: CodeVersion) {
        this.actor = actor;
    }
}
