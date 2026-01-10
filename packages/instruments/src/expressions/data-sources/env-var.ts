import { doddlify } from "doddle"
import { K8sDataSourceError } from "./error"
import type { DataSource_Shape } from "./interface"

class DataSource_EnvVar implements DataSource_Shape<string> {
    constructor(public readonly name: string) {}

    @doddlify
    pull() {
        const value = process.env[this.name]
        if (value === undefined) {
            throw new K8sDataSourceError(`Environment variable "${this.name}" is not set`)
        }
        return value
    }
}

/** Reads from an environment variable in the current process. */
export function LocalEnvVar(name: string) {
    return new DataSource_EnvVar(name)
}
