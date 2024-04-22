// Find all our documentation at https://docs.near.org
import { NearBindgen, near, call, view, initialize } from 'near-sdk-js';
import { Manufacturer, manufacturers } from './manufactures'
import { Product, ProductHistory, products, productHistories } from './products';

@NearBindgen({ requireInit: true })
class ProductAuthenticityChain {
  accountId = ""
  beneficiary: string = "";
  beneficiaryName: string = "";
  description: string = "";


  MIN_STORAGE: bigint = BigInt("1000000000000000000000") // 0.001Ⓝ

  @initialize({ privateFunction: true })
  init({
    accountId,
    beneficiary,
    beneficiaryName,
    description,
  }: {
    accountId: string;
    beneficiary: string;
    beneficiaryName: string;
    description: string;
  }) {
    this.accountId = accountId ?? near.signerAccountId();
    this.beneficiary = beneficiary;
    this.beneficiaryName = beneficiaryName;
    this.description = description;

    near.log('H', {
      accountId: this.accountId,
      beneficiary: this.beneficiary,
      beneficiaryName: this.beneficiaryName,
      description: this.description,
    })
  }


  // Function to register a manufacturer
  @call({})
  registerManufacturer({ name }: { name: string }) {
    const manufacturer = manufacturers.get(this.accountId);
    if (manufacturer != null) {
      near.log("Manufacturer already registered");
      return;
    }
    manufacturers.set(this.accountId, new Manufacturer(this.accountId, name));
  }

  // Create and add the product
  @call({})
  addProduct({ id, name }: { id: string, name: string }) {
    const manufacturer = manufacturers.get(this.accountId);
    if (manufacturer == null) {
      near.log("Manufacturer not registered");
      return;
    }

    // Check if product already exists
    const existingProduct = products.get(id);
    if (existingProduct != null) {
      near.log("Product already exists");
      return;
    }

    // Check if payment is attached
    if (near.attachedDeposit() < this.MIN_STORAGE) { // Minimum deposit requirement, adjust as needed
      near.log("Insufficient deposit. Minimum deposit is 0.001Ⓝ");
      return;
    }

    // Create and add the product
    const product = new Product(id, name, this.accountId);
    products.set(id, product);

    // Add product history
    const productHistory = new ProductHistory(id, this.accountId, near.blockTimestamp());
    productHistories.push(productHistory);
  }

  // Function to transfer ownership of a product
  @call({})
  transferProduct({ productId, newManufacturerId }: { productId: string, newManufacturerId: string }) {
    const product = products.get(productId);
    near.log("product", product);
    if (product == null) {
      near.log("Product not found");
      return;
    }

    near.log('Signer', this.accountId)

    // Check if the sender is the current owner of the product
    if (product.manufacturerId != this.accountId) {
      near.log("You are not the owner of this product");
      return;
    }

    // Update the manufacturer ID
    product.manufacturerId = newManufacturerId;
    products.set(productId, product);

    // Add product history
    const productHistory = new ProductHistory(productId, newManufacturerId, near.blockTimestamp());
    productHistories.push(productHistory);
  }


  // Function to retrieve product information
  @view({})
  getProduct({ productId }: { productId: string }): Product | null {
    return products.get(productId);
  }

  // Function to retrieve product information
  @view({})
  getSigner(): any {
    return {
      id: near.signerAccountId(),
      pk: near.signerAccountPk(),
      pre: near.predecessorAccountId(),
      balance: near.accountBalance()
    };
  }

  // Function to retrieve product history
  @view({})
  getProductHistory({ productId }: { productId: string }): ProductHistory[] {
    const history: ProductHistory[] = [];
    for (let i = 0; i < productHistories.length; i++) {
      if (productHistories[i].productId == productId) {
        history.push(productHistories[i]);
      }
    }
    return history;
  }



}