import { Resource_Top, type DataSource } from "@k8ts/instruments"
import { v1 } from "../../kinds/default"
import { resolveDataSourceRecord } from "./resolver"

export interface Secret_Data_Entry {
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
export interface Secret_Props<Keys extends string = string> {
    $type?: Secret_Types
    $data?: Record<Keys, DataSource>
}

export class Secret<
    Name extends string = string,
    Keys extends string = string
> extends Resource_Top<Name, Secret_Props<Keys>> {
    get kind() {
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
