import { Base } from "../../node"
import { Container, ContainerProps } from "./container"
import { AnyDeviceBackend, Device } from "./volume/devices"
import { AnyVolumeBackend, Volume } from "./volume/volumes"

export class PodScope {
    Container<Ports extends string>(
        name: string,
        options: ContainerProps<Ports>
    ): Container<Ports> {
        return Container.make(name, "main", options)
    }
    InitContainer(name: string, options: ContainerProps<never>): Container<never> {
        return Container.make(name, "init", options)
    }
    Volume(name: string, options: AnyVolumeBackend) {
        return Volume.make(
            name,
            options instanceof Base
                ? ({
                      backend: options
                  } as AnyVolumeBackend)
                : options
        )
    }
    Device(name: string, options: AnyDeviceBackend): Device {
        return Device.make(name, options)
    }
}
