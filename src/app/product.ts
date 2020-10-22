export interface Product {
  name: string;
  sku: string;
  size: string;
  strength: string;
  storeName: string;
  storeLocation: string;
  batchNumber: string;
  currentDate: string;
}

export interface Locations {
  name: string;
  addrLine1: string;
  addrLine2: string;
  addrLine3: string;
  city: string;
  state: string;
  zipCode: string;
}
