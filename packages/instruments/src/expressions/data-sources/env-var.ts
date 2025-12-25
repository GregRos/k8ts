import { DataSource_Lazy } from "./base"

/**
 * Data source that retrieves values from environment variables. Throws an error if the environment
 * variable is not set.
 *
 * Can be used instead of a primitive in some cases when building Kubernetes manifests.
 */
class DataSource_EnvVar extends DataSource_Lazy<string> {
    /**
     * Creates an environment variable data source.
     *
     * @param name - The name of the environment variable
     */
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

/**
 * Creates a lazy data source that reads from an environment variable.
 *
 * @example
 *     const apiKey = localRefEnvVar("API_KEY")
 *     const key = await apiKey.get() // Reads from process.env.API_KEY
 *
 * @param name - The name of the environment variable to read
 * @returns A lazy data source for the environment variable
 * @throws {Error} When the environment variable is not set
 */
export function localRefEnvVar(name: string) {
    return new DataSource_EnvVar(name)
}
