import { Meta } from "./meta"

export class NamedMeta<Name extends string> extends Meta {
    get name() {
        return this.get("name") as Name
    }
}
