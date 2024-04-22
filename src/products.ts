import { UnorderedMap, Vector } from "near-sdk-js";

// Product class represents a product
export class Product {
    constructor(
        public id: string,
        public name: string,
        public manufacturerId: string
    ) { }
}

// ProductHistory class represents the history of a product
export class ProductHistory {
    constructor(
        public productId: string,
        public manufacturerId: string,
        public timestamp: bigint
    ) { }
}

// Create a persistent map to store products
export const products = new UnorderedMap<Product>("products");

// Create a persistent array to store product histories
export const productHistories = new Vector<ProductHistory>("productHistories");