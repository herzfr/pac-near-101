import { UnorderedMap } from "near-sdk-js";

// Manufacturer class represents a manufacturer
export class Manufacturer {
    constructor(
        public id: string,
        public name: string
    ) { }
}

export const manufacturers = new UnorderedMap<Manufacturer>("map-uid-1");