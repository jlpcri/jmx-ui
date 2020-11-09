export class RecipeModel {
  id: number;
  name: string;
  sku: string;
  label: string;
  labelKey: string;
  bottleSize: number;
  nicStrength: number;
  key: string;
  ingredients: IngredientModel[];
  saltNic: boolean;
}

export class IngredientModel {
  name: string;
  sku: string;
  quantity: number;
}
