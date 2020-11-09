import {ProductComponent} from './product-component.model';

export class Product {
  id: number;
  sku: string;
  name: string;
  label: string;
  bottleSize: number;
  nicStrength: number;
  components: ProductComponent[] = [];
}
