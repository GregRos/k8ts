import { ManifestResource } from "@k8ts/instruments"
import { v1 } from "../../kinds/default"
export type Namespace = Namespace.Namespace
export namespace Namespace {
    export interface Namespace_Props {}

    export class Namespace extends ManifestResource<Namespace_Props> {
        get kind() {
            return v1.Namespace._
        }

        protected body() {
            return {
                spec: {}
            }
        }
    }
}
