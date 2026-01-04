import { Address4 } from "ip-address"

// TODO: Validate IP and Subnet strings more thoroughly
// TODO: Consider wrapping an existing library or just exposing that library directly
// TODO: Add IPv6 support

export type Ip4_Input_String = `${number}.${number}.${number}.${number}`

export class Ip4<Text extends Ip4_Input_String = Ip4_Input_String> {
    readonly _addr4: Address4 | undefined
    constructor(readonly text: Text) {
        this._addr4 = new Address4(text)
    }
}
