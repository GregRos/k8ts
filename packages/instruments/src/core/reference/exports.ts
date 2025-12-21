import type { LiveRefable } from "."
import type { Origin_Entity } from "../entities/origin/origin-entity"

export interface ExportsProps<
    Entity extends Origin_Entity = Origin_Entity,
    Produced extends LiveRefable = LiveRefable
> {
    origin: Entity
    PRODUCER: () => Iterable<Produced>
}
