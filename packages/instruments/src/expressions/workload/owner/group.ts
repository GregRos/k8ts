import { LinuxOwnership } from "./ownership"
import { LinuxUser } from "./user"

export interface LinuxGroup {
    readonly id: number
    readonly name: string
    user(id: number, name?: string): LinuxOwnership
    user(user: LinuxUser): LinuxOwnership
}
export function LinuxGroup(id: number, name: string) {
    return new _LinuxGroup(id, name) as LinuxGroup
}
class _LinuxGroup {
    constructor(
        readonly id: number,
        readonly name: string
    ) {}

    user(id: number, name?: string): LinuxOwnership
    user(user: LinuxUser): LinuxOwnership
    user(param1: number | LinuxUser, param2?: string): LinuxOwnership {
        let user: LinuxUser
        if (typeof param1 === "number") {
            user = LinuxUser(param1, param2 ?? "")
        } else {
            user = param1
        }
        return LinuxOwnership(user, this)
    }
}
