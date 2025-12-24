import { DataSource_Lazy } from "./base"

export class DataSource_EnvVar extends DataSource_Lazy<string> {
    constructor(public readonly name: string) {
        super(async () => {
            const value = process.env[this.name]
            if (value === undefined) {
                throw new Error(`Environment variable "${this.name}" is not set`)
            }
            return value
        })
    }
}

export function localRefEnvVar(name: string) {
    return new DataSource_EnvVar(name)
}
