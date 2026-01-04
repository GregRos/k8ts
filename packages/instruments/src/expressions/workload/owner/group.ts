import { Owner_LinuxOwnership, type LinuxOwnership } from "./ownership"
import { Owner_LinuxUser, type LinuxUser } from "./user"

export class Owner_LinuxGroup {
    constructor(
        readonly id: number,
        readonly name: string
    ) {}

    user(id: number, name?: string): LinuxOwnership
    user(user: LinuxUser): LinuxOwnership
    user(param1: number | LinuxUser, param2?: string) {
        let user: LinuxUser
        if (typeof param1 === "number") {
            user = new Owner_LinuxUser(param1, param2 ?? "")
        } else {
            user = param1
        }
        return new Owner_LinuxOwnership(user, this)
    }
}
export type LinuxGroup = Owner_LinuxGroup
export function LinuxGroup(id: number, name: string) {
    return new Owner_LinuxGroup(id, name)
}
