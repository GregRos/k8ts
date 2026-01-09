import type { DummyResource } from "../resource"
import { Origin } from "./origin"
/**
 * Used as the Origin of {@link DummyResource} resources. These resources are never manifested by
 * k8ts. They're expected to already exist in the target cluster.
 */
export class DummyOrigin extends Origin {
    get kind() {
        return "[k8ts] External"
    }
    get namespace() {
        return undefined
    }
    private constructor() {
        super("External", {})
    }

    protected get __parent__(): Origin | undefined {
        return undefined
    }

    static instance = new DummyOrigin()
}
