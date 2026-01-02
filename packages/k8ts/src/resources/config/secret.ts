import { ResourceTop, type DataSource } from "@k8ts/instruments"
import { v1 } from "../idents/default"
import { resolveDataSourceRecord } from "./resolver"

export interface SecretDataEntry {
    as: "base64" | "plain"
    value: DataSource
}

export type SecretTypes =
    | `kubernetes.io/${
          | "service-account-token"
          | "dockercfg"
          | "dockerconfigjson"
          | "basic-auth"
          | "ssh-auth"
          | "tls"}`
    | "bootstrap.kubernetes.io/token"
export interface SecretProps<Keys extends string = string> {
    $type?: SecretTypes
    $data?: Record<Keys, DataSource>
}

export class Secret<Name extends string = string, Keys extends string = string> extends ResourceTop<
    Name,
    SecretProps<Keys>
> {
    get keys() {
        return Object.keys(this.props.$data ?? {}) as Keys[]
    }
    get ident() {
        return v1.Secret._
    }

    protected async body() {
        const resolved = await resolveDataSourceRecord(this, this.props.$data ?? {})
        return {
            type: this.props.$type ?? "Opaque",
            data: resolved.binaryData,
            stringData: resolved.data
        }
    }
}
