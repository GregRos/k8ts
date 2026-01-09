import type { LinuxGroup } from "./group"
import type { LinuxUser } from "./user"
export interface LinuxOwnership {
    readonly user: LinuxUser
    readonly group: LinuxGroup

    toDockerEnv(prefix?: string): Record<string, string>
}
export function LinuxOwnership(user: LinuxUser, group: LinuxGroup) {
    return new _LinuxOwnership(user, group) as LinuxOwnership
}

class _LinuxOwnership implements LinuxOwnership {
    constructor(
        readonly user: LinuxUser,
        readonly group: LinuxGroup
    ) {}

    toDockerEnv(prefix: string = "P") {
        const env: Record<string, string> = {
            [`${prefix}UID`]: `${this.user.id}`,
            [`${prefix}GID`]: `${this.group.id}`
        }
        return env
    }
}
