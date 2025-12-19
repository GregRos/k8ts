import { BaseOriginEntity, type OriginEntity, type OriginEntityProps } from "@k8ts/instruments"

export abstract class ChildOriginEntity<
    Props extends OriginEntityProps
> extends BaseOriginEntity<Props> {
    constructor(
        private readonly _parent: OriginEntity,
        name: string,
        props: Props
    ) {
        super(name, props)
    }

    protected __post_construct__() {
        
    }

    protected __parent__() {
        return this._parent
    }

    get resourceKinds() {
        return this.__parent__().resourceKinds.child(super.resourceKinds)
    }
}
