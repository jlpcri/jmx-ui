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
      let objectStore = db.createObjectStore("recipes", {keyPath: "sku"});
      objectStore.createIndex("sku", "sku", {unique: true});
      objectStore.createIndex("name", "productName", {unique: false});
    }
  }

  syncRecipes(data){

    console.log('idb: ', data)

    for (let i = 0; i < data.length; i++){
      this.addRecipe(data[i].sku, data[i].productName, data[i].componentName, data[i].quantity)
    }
  }

  addRecipe(sku: string, productName: string, componentName: string, quantity: number){
    let tx = this.db.transaction(['recipes'], 'readwrite')
    let store = tx.objectStore('recipes')
    let tmp = {
      sku: sku,
      name: productName,
      recipes: [{
        componentName: componentName,
        quantity: quantity
      }]
    }
    store.add(tmp)

    tx.oncomplete = function (){}
    tx.onerror = function (){
      console.error('Error add data to indexedDB')
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

}
