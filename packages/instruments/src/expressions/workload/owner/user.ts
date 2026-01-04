import { LinuxGroup } from "./group"
import { LinuxOwnership } from "./ownership"

export class LinuxUser {
    constructor(
        readonly id: number,
        readonly name: string
    ) {}

    group(id: number, name?: string): LinuxOwnership
    group(group: LinuxGroup): LinuxOwnership
    group(param1: number | LinuxGroup, param2?: string): LinuxOwnership {
        let group: LinuxGroup
        if (typeof param1 === "number") {
            group = new LinuxGroup(param1, param2 ?? "")
        } else {
            group = param1
        }
        return new LinuxOwnership(this, group)
    }

    sameGroup(): LinuxOwnership {
        return new LinuxOwnership(this, new LinuxGroup(this.id, this.name))
    }
}
