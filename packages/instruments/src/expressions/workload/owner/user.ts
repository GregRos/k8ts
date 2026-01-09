import { LinuxGroup } from "./group"
import { LinuxOwnership } from "./ownership"
export interface LinuxUser {
    readonly id: number
    readonly name: string

    group(id: number, name?: string): LinuxOwnership
    group(group: LinuxGroup): LinuxOwnership

    sameGroup(): LinuxOwnership
}
export function LinuxUser(id: number, name: string) {
    return new _LinuxUser(id, name) as LinuxUser
}
export class _LinuxUser implements LinuxUser {
    constructor(
        readonly id: number,
        readonly name: string
    ) {}

    group(param1: number | LinuxGroup, param2?: string): LinuxOwnership {
        let group: LinuxGroup
        if (typeof param1 === "number") {
            group = LinuxGroup(param1, param2 ?? "")
        } else {
            group = param1
        }
        return LinuxOwnership(this, group)
    }

    sameGroup(): LinuxOwnership {
        return LinuxOwnership(this, LinuxGroup(this.id, this.name))
    }
}
