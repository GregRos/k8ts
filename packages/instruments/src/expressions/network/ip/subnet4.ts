import { Address4 } from "ip-address"

export type Subnet4_Input_String = `${number}.${number}.${number}.${number}/${number}`
export class Subnet4<Text extends Subnet4_Input_String = Subnet4_Input_String> {
    readonly _addr4: Address4 | undefined
    constructor(readonly text: Text) {
        this._addr4 = new Address4(text)
    }
}
