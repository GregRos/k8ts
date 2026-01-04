import type { LinuxGroup } from "./group"
import type { LinuxUser } from "./user"

export class LinuxOwnership {
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
