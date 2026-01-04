import { ResourceTop, type DataSource, type Resource_Props } from "@k8ts/instruments"
import type { CDK } from "../.."
import { v1 } from "../idents/default"
import { resolveDataSourceRecord } from "./resolver"

export interface Secret_Entry {
    as: "base64" | "plain"
    value: DataSource
}

export type Secret_Types =
    | `kubernetes.io/${
          | "service-account-token"
          | "dockercfg"
          | "dockerconfigjson"
          | "basic-auth"
          | "ssh-auth"
          | "tls"}`
    | "bootstrap.kubernetes.io/token"
export interface Secret_Props<Keys extends string = string>
    extends Resource_Props<CDK.KubeSecretProps> {
    $type?: Secret_Types
    $data?: Record<Keys, DataSource>
}

export class Secret<Name extends string = string, Keys extends string = string> extends ResourceTop<
    Name,
    Secret_Props<Keys>
> {
    get keys() {
        return Object.keys(this.props.$data ?? {}) as Keys[]
    }
    get ident() {
        return v1.Secret._
    }

    protected async __body__() {
        const resolved = await resolveDataSourceRecord(this, this.props.$data ?? {})
        return {
            type: this.props.$type ?? "Opaque",
            data: resolved.binaryData,
            stringData: resolved.data
        }
    }
}
