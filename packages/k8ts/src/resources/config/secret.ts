import { ResourceTop, type DataSource, type Resource_Props_Top } from "@k8ts/instruments"
import { merge } from "lodash"
import type { CDK } from "../.."
import { v1 } from "../../resource-idents/default"
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
    extends Resource_Props_Top<CDK.KubeSecretProps> {
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
    get kind() {
        return v1.Secret._
    }

    protected async __body__(): Promise<CDK.KubeSecretProps> {
        const resolved = await resolveDataSourceRecord(this, this.props.$data ?? {})
        const body = {
            type: this.props.$type ?? "Opaque",
            data: resolved.binaryData,
            stringData: resolved.data
        }
        return merge(body, this.props.$overrides)
    }
}
