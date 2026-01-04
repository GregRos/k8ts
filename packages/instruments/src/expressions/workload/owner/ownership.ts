import type { LinuxGroup } from "./group"
import type { LinuxUser } from "./user"

export class Owner_LinuxOwnership {
    constructor(
        readonly user: LinuxUser,
        readonly group: LinuxGroup
    ) {}
}

export type LinuxOwnership = Owner_LinuxOwnership
