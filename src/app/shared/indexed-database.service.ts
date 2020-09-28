import {Injectable} from "@angular/core";
import {MessageService} from "./message.service";
import {Subject} from "rxjs";
import {GlobalConstants} from "./GlobalConstants";

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
      objectStore.createIndex(GlobalConstants.indexProduct, "productName", {unique: false});
      objectStore.createIndex(GlobalConstants.indexComponent, "componentName", {unique: false});

    }
  }

  syncRecipes(data){
    for (let i = 0; i < data.length; i++){
      this.addRecipe(data[i].sku, data[i].productName, data[i].componentName, data[i].quantity)
    }
  }

  addRecipe(sku: string, productName: string, componentName: string, quantity: number){
    let tx = this.db.transaction([this.objectStore_name], GlobalConstants.idbReadWrite)
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

  getProductNameListByComponent(ingredients){
    let subject = new Subject<any>();
    let tx = this.db.transaction([this.objectStore_name], GlobalConstants.idbReadOnly);
    let store = tx.objectStore(this.objectStore_name);
    let index = store.index(GlobalConstants.indexComponent);
    let myCursor = index.openCursor()

    let name = '';
    let name_arr = [];
    let componentName = '';
    let idx: number = 0;

    myCursor.onsuccess = function (event){
      let cursor = event.target.result
      if (cursor){
        componentName = cursor.value.componentName
        name = cursor.value.productName

        if (componentName === ingredients){
          name_arr = name.split(/[\s,]+/)
          subject.next({
            id: idx,
            name: name,
            size: name_arr[name_arr.length - 2],
            strength: name_arr[name_arr.length - 1]
          });
          idx++;
        }
        cursor.continue();
      }
    }

    return subject;
  }

  clearData(){
    let tx = this.db.transaction([this.objectStore_name], GlobalConstants.idbReadWrite);
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
      .transaction([this.objectStore_name], GlobalConstants.idbReadOnly)
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

  getProdComponentNames(indexName, search){
    let subject = new Subject<any>();

    const tx = this.db.transaction([this.objectStore_name], GlobalConstants.idbReadOnly);
    const store = tx.objectStore(this.objectStore_name);
    const index = store.index(indexName);
    const myCursor = index.openCursor(null, 'nextunique')

    let found = false;
    let name = ''
    let name_arr = []
    let idx: number = 0;

    if (indexName === GlobalConstants.indexProduct) {
      myCursor.onsuccess = function (event) {
        let cursor = event.target.result;

        if (cursor) {
          name = cursor.value.productName;
          if (name.toUpperCase().indexOf(search.toUpperCase()) >= 0) {
            if (!found){
              found = true
            }
            name_arr = name.split(/[\s,]+/)
            subject.next({
              id: idx,
              name: name,
              size: name_arr[name_arr.length - 2],
              strength: name_arr[name_arr.length - 1]
            });
            idx++;
          }
          cursor.continue();
        } else {
          if (!found){
            subject.next({
              'error': 'not found'
            })
          }
          // console.log('ProductName Index to the end.')
        }
      }
    } else {
      // get componentNameList
      myCursor.onsuccess = function (event){
        let cursor = event.target.result;

        if (cursor){
          name = cursor.value.componentName;
          if (name.toUpperCase().indexOf(search.toUpperCase()) >= 0){
            if (!found){
              found = true
            }
            subject.next({
              id: idx,
              name: name
            });
            idx++;
          }
          cursor.continue()
        } else {
          if (!found){
            subject.next({
              'error': 'not found'
            })
          }
          // console.log('ComponentName Index to the end.')
        }
      }
    }

    return subject;

  }

}
