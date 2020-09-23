import {Injectable} from "@angular/core";
import {MessageService} from "./message.service";

@Injectable({
  providedIn: 'root'
})

export class IndexedDatabaseService {
  public db;
  private version = 1;
  private db_name = 'AmvRecipesDatabase'
  private objectStore_name = 'recipes'

  constructor(private messageService: MessageService) {
  }

  init(){
    let request = indexedDB.open(this.db_name, this.version);

    request.onerror = (event: any) => {
      this.messageService.error(
        "Could not open browser database",
        JSON.stringify(event, null, 2));
    };

    request.onsuccess = (event: any) => {
      this.db = event.target.result;
      this.db.onerror = (event: any) => {
        this.messageService.error(
          "Database Error",
          JSON.stringify(event, null, 2));
      }
    };

    request.onupgradeneeded = (event: any) => {
      let db = event.target.result;
      let objectStore = db.createObjectStore(this.objectStore_name, {keyPath: "id", autoIncrement: true});
      objectStore.createIndex("product", "productName", {unique: false});
      objectStore.createIndex("component", "componentName", {unique: false});

    }
  }

  syncRecipes(data){
    for (let i = 0; i < data.length; i++){
      this.addRecipe(data[i].sku, data[i].productName, data[i].componentName, data[i].quantity)
    }
  }

  addRecipe(sku: string, productName: string, componentName: string, quantity: number){
    let tx = this.db.transaction([this.objectStore_name], 'readwrite')
    let store = tx.objectStore(this.objectStore_name)
    let tmp = {
      sku: sku,
      productName: productName,
      componentName: componentName,
      quantity: quantity
    }
    store.put(tmp)

    tx.oncomplete = function (){}
    tx.onerror = function (error){
      console.error('Error add data to indexedDB ', error )
    }
  }

  getProductNameList(){
    let result = [];
    let tx = this.db.transaction([this.objectStore_name], 'readonly');
    let store = tx.objectStore(this.objectStore_name);
    let index = store.index('product');
    let name = ''
    let name_arr = []

    index.getAll().onsuccess = function (event){
      let raw_data = event.target.result;
      let idx: number = 0;
      for (let i = 0; i < raw_data.length; i++){
        name = raw_data[i].productName;
        if (!(result.some(e => e.name === name))) {
          name_arr = name.split(/[\s,]+/)
          result.push({
            id: idx,
            name: name,
            size: name_arr[name_arr.length - 2],
            strength: name_arr[name_arr.length - 1]
          })
          idx++;
        }
      }
    }
    console.log('Job getProductNameList done.')
    return result;
  }

  getComponentNameList(ingredients){
    let result = []
    let tx = this.db.transaction([this.objectStore_name], 'readonly');
    let store = tx.objectStore(this.objectStore_name);
    let index = store.index('component');
    let name = '';
    let name_arr = [];
    let componentName = '';

    index.getAll().onsuccess = function (event){
      let raw_data = event.target.result;
      let idx: number = 0;
      if (ingredients === null) {
        for (let i = 0; i < raw_data.length; i++) {
          name = raw_data[i].componentName;
          if (!(result.some(e => e.name === name))) {
            result.push({
              id: idx,
              name: name
            });
            idx++;
          }
        }
        // console.log('Job getComponentNameList done.')
      } else {
        for (let i = 0; i < raw_data.length; i++){
          name = raw_data[i].productName;
          componentName = raw_data[i].componentName;
          if ((componentName === ingredients) && (!(result.some(e => e.name === name)))){
            result.push({
              id: idx,
              name: name
            });
            idx++;
          }
        }
        // console.log('Job getProductNameList by componentName done.')
      }
    }

    // console.log(result)
    return result;
  }

  clearData(){
    let tx = this.db.transaction([this.objectStore_name], 'readwrite');
    let objectStore = tx.objectStore(this.objectStore_name)
    let objectStoreReq = objectStore.clear()

    objectStoreReq.onsuccess = function (event){
      console.log('IDb cleared.')
    }
  }

  getRecipesFromIdb(indexName: string, key: string){
    let result = [];
    let color_idx: number = 1;
    let color_total: number = 7;
    let quantity_sum: number = 0;

    let index = this.db
      .transaction([this.objectStore_name], 'readonly')
      .objectStore(this.objectStore_name)
      .index(indexName)

    index.openCursor().onsuccess = function (event){
      let cursor = event.target.result;
      if(cursor){
        if (cursor.value.productName === key){
          result.push({
            ingredients: cursor.value.componentName,
            quantity: (cursor.value.quantity).toFixed(2),
            percentage: 0,
            color: (color_idx % color_total).toString(),
          })
          quantity_sum += parseFloat(cursor.value.quantity)
          color_idx++;
        }
        cursor.continue();
      } else {
        for (let i = 0; i < result.length; i++){
          result[i].percentage = (result[i].quantity / quantity_sum).toFixed(2)
        }
      }
    }

    return result
  }

}
