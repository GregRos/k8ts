import type { DummyResource } from "../resource"
import { OriginEntity } from "./origin"
/**
 * Used as the Origin of {@link DummyResource} resources. These resources are never manifested by
 * k8ts. They're expected to already exist in the target cluster.
 */
export class NullOrigin extends OriginEntity {
    get kind() {
        return "[k8ts] External"
    }
    get namespace() {
        return undefined
    }
    private constructor() {
        super("External", {})
    }

    protected get __parent__(): OriginEntity | undefined {
        return undefined
    }

    static instance = new NullOrigin()
}
