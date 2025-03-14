import { RefKey, Traced, type Kind, type Origin } from "@k8ts/instruments"
export interface DependsOn {
    resource: AbsResource
    text: string
}

export abstract class AbsResource<Props extends object = object> extends Traced {
    abstract readonly api: Kind.Identifier
    constructor(
        readonly origin: Origin,
        readonly name: string,
        readonly props: Props
    ) {
        super()
    }

    get shortFqn() {
        return [this.api.name, this.name].filter(Boolean).join("/")
    }

    get key() {
        return RefKey.make(this.api.name, this.name)
    }

    get dependencies(): DependsOn[] {
        return []
    }

    equals(other: AbsResource): boolean {
        // TODO: implement
        return this === other
    }

    getResourceSubtree(): AbsResource[] {
        const resources = new Set<AbsResource>()
        const recurseIntoSubResource = (resource: AbsResource) => {
            if (resources.has(resource)) {
                return
            }
            resources.add(resource)
            for (const sub of resource.subResources) {
                recurseIntoSubResource(sub)
            }
        }
        recurseIntoSubResource(this)

        return Array.from(resources)
    }
    isSubResourceOf(resource: AbsResource): boolean {
        return this.getResourceSubtree().includes(resource)
    }

    getDependencyTree(): DependsOn[] {
        const resources = new Map<AbsResource, DependsOn>()
        const recurseIntoDependency = (dependency: DependsOn) => {
            if (resources.has(dependency.resource)) {
                return
            }
            resources.set(dependency.resource, dependency)
            const ownDeps = dependency.resource.dependencies
            for (const dep of ownDeps) {
                recurseIntoDependency(dep)
            }
        }
        recurseIntoDependency({ resource: this, text: "self" })
        resources.delete(this)
        return Array.from(resources.values())
    }

    getAllRecursiveDependencies(): DependsOn[] {
        const subtree = new Set(this.getResourceSubtree())
        const all = this.getResourceSubtree().flatMap(x => {
            const deps = x.getDependencyTree()
            return deps.filter(dep => !subtree.has(dep.resource))
        })
        return all
    }

    getRecursiveDependecies(self = false): DependsOn[] {
        const resources = new Map<AbsResource, DependsOn>()
        const recurseIntoDependency = (dependency: DependsOn) => {
            if (resources.has(dependency.resource)) {
                return
            }
            resources.set(dependency.resource, dependency)
            const ownDeps = dependency.resource.dependencies
            const subresources = dependency.resource.getResourceSubtree()
            for (const dep of ownDeps) {
                recurseIntoDependency(dep)
            }
            for (const sub of subresources) {
                recurseIntoSubResource(sub)
            }
        }
        const recurseIntoSubResource = (resource: AbsResource) => {
            for (const dep of resource.dependencies) {
                recurseIntoDependency(dep)
            }
        }
        recurseIntoSubResource(this)
        return Array.from(resources.values())
    }

    get subResources(): AbsResource[] {
        return []
    }
}
