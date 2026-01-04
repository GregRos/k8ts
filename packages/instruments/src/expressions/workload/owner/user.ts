import { LinuxGroup, Owner_LinuxGroup } from "./group"
import { Owner_LinuxOwnership, type LinuxOwnership } from "./ownership"

export class Owner_LinuxUser {
    constructor(
        readonly id: number,
        readonly name: string
    ) {}

    group(id: number, name?: string): LinuxOwnership
    group(group: LinuxGroup): LinuxOwnership
    group(param1: number | LinuxGroup, param2?: string) {
        let group: LinuxGroup
        if (typeof param1 === "number") {
            group = new Owner_LinuxGroup(param1, param2 ?? "")
        } else {
            group = param1
        }
        return new Owner_LinuxOwnership(this, group)
    }
}
export type LinuxUser = Owner_LinuxUser
export function LinuxUser(id: number, name: string) {
    return new Owner_LinuxUser(id, name)
}
