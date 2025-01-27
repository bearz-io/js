# @bearz/di

## Overview

The @bearz Dependency Injection (DI) module is for the use cases of managing
global singleton, factories, and switching out providers/drivers or
using multiple named providers.

## Documentation

Documentation is available on [jsr.io](https://jsr.io/@bearz/di/doc)

## Usage

```typescript
import { ServiceCollection, getServices } from "@bearz/di";

console.log(getServices); // this is the global service provider implementation


// some initial setup
export type Maker = 'toyota' | 'tesla' | 'kia' | 'gm';

export interface Vehicle
{
    maker: Maker
}

export class Truck implements Vehicle, Disposable
{
    constructor(public readonly maker: Maker)
    {
    }

    [Symbol.dispose]()
    {
        console.log("hi");
    }
}

var container = new ServiceCollection();
container.registerSingleton("default:maker", () => 'toyota');
container.registerScoped("vehicle", (s) => 
    new Truck(s.required<Maker>("default:maker")));

container.registerScoped("vehicle2", (s) => new Truck('telsa'));

let count;
container.registerTransient("vehicle3", (s) => {
    count++;
    const maker = count % 2 === 0 ? 'kia' : 'gm';

    return new Truck(maker);
});


const services = container.build();
const v = services.get<Vehicle>("vehicle");
const v2 = services.get<Vehicle>("vehicle2");
console.log(v.maker);
console.log(v2.maker);
console.log(services.get("vehicle3"));
console.log(services.get("vehicle3"));
console.log(services.get("vehicle3"));

// call dispose
services[Symbol.dispose]();
```

## Notes

The current JavaScript ecosystem does not have a rich type system that lends
itself to traditional dependency injection. Rather than try to make up for
the lack of a rich type system or using decorators, this module prioritizes
using keys and closure factory methods for speeds and simplicity.

There isn't as great of a need for DI in javascript as there in strongly
typed languages. Yet there are times where does make sense to have something
that manages global singletons, general factory generators, and something
to swap out provider/driver implementations.

## License

[MIT License](./LICENSE.md)
