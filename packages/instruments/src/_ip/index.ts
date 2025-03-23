import { Address4 } from "ip-address"

export type Ip4_String = `${number}.${number}.${number}.${number}`

export class Ip4<Text extends Ip4_String = Ip4_String> {
    readonly _addr4: Address4 | undefined
    constructor(readonly text: Text) {
        this._addr4 = new Address4(text)
    }
}
export type Subnet4_String = `${number}.${number}.${number}.${number}/${number}`
export class Subnet4<Text extends Subnet4_String = Subnet4_String> {
    readonly _addr4: Address4 | undefined
    constructor(readonly text: Text) {
        this._addr4 = new Address4(text)
    }
}
