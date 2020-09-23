import { Injectable} from "@angular/core";
import {MessageService} from "./message.service";
import { Observable, Subject } from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class IndexedDatabaseService {
  public db;
  private version = 1;

  constructor(private messageService: MessageService) {
  }

  init(){
    // this.version++;
    // console.log('idb version: ', this.version)
    let request = indexedDB.open("AmvRecipesDatabase", this.version);

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
      let objectStore = db.createObjectStore("recipes", {keyPath: "id", autoIncrement: true});
      objectStore.createIndex("product", "productName", {unique: false});
      objectStore.createIndex("component", "componentName", {unique: false});

    }
  }

  syncRecipes(data){

    // console.log('idb: ', data)

    for (let i = 0; i < data.length; i++){
      this.addRecipe(data[i].sku, data[i].productName, data[i].componentName, data[i].quantity)
    }
  }

  addRecipe(sku: string, productName: string, componentName: string, quantity: number){
    let tx = this.db.transaction(['recipes'], 'readwrite')
    let store = tx.objectStore('recipes')
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
    let tx = this.db.transaction(['recipes'], 'readonly');
    let store = tx.objectStore('recipes');
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

  clearData(){
    let tx = this.db.transaction(['recipes'], 'readwrite');
    let objectStore = tx.objectStore('recipes')
    let objectStoreReq = objectStore.clear()

    objectStoreReq.onsuccess = function (event){
      console.log('IDb cleared.')
    }
  }

  maxValue(storeName: string, indexName: string, field: string): Observable<any>{
    let subject = new Subject<any>();
    let cursor = this.db
      .transaction(storeName, 'readonly')
      .objectStore(storeName)
      .index(indexName)
      .openCursor(null, 'prev');

    cursor.onsuccess = (event) => {
      if (event.target.result){
        subject.next(event.target.result.value[field]);
      } else {
        subject.next(null);
      }
    };

    return subject;
  }

  getRecipesFromIdb(indexName: string, key: string){
    let result = [];
    let color_idx: number = 1;
    let quantity_sum: number = 0;

    let index = this.db
      .transaction(['recipes'], 'readonly')
      .objectStore('recipes')
      .index(indexName)

    index.openCursor().onsuccess = function (event){
      let cursor = event.target.result;
      if(cursor){
        if (cursor.value.productName === key){
          result.push({
            ingredients: cursor.value.componentName,
            quantity: cursor.value.quantity,
            percentage: 0,
            color: color_idx.toString(),
            quantity_total: quantity_sum + parseFloat(cursor.value.quantity)
          })
          quantity_sum += parseFloat(cursor.value.quantity)
          color_idx++;
        }
        cursor.continue();
      }
    }

    console.log(result)

    return result
  }

}
