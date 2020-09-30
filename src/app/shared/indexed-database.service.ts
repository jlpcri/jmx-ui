import {Injectable} from '@angular/core';
import {MessageService} from './message.service';
import {Subject} from 'rxjs';
import {GlobalConstants} from './GlobalConstants';

@Injectable({
  providedIn: 'root'
})

export class IndexedDatabaseService {
  public db;
  private version = 1;
  private dbName = 'AmvRecipesDatabase';
  private objectStoreName = 'recipes';

  constructor(private messageService: MessageService) {
  }

  init() {
    const request = indexedDB.open(this.dbName, this.version);

    request.onerror = (event: any) => {
      this.messageService.error(
        'Could not open browser database',
        JSON.stringify(event, null, 2));
    };

    request.onsuccess = (event: any) => {
      this.db = event.target.result;
      this.db.onerror = () => {
        this.messageService.error(
          'Database Error',
          JSON.stringify(event, null, 2));
      };
    };

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      const objectStore = db.createObjectStore(this.objectStoreName, {keyPath: 'id', autoIncrement: true});
      objectStore.createIndex(GlobalConstants.indexProduct, 'productName', {unique: false});
      objectStore.createIndex(GlobalConstants.indexComponent, 'componentName', {unique: false});

    };
  }

  syncRecipes(data) {
    for (const item of data) {
      this.addRecipe(item.sku, item.productName, item.componentName, item.quantity);
    }
  }

  addRecipe(sku: string, productName: string, componentName: string, quantity: number) {
    const tx = this.db.transaction([this.objectStoreName], GlobalConstants.idbReadWrite);
    const store = tx.objectStore(this.objectStoreName);
    const tmp = {
      sku,
      productName,
      componentName,
      quantity
    };
    store.put(tmp);

    tx.oncomplete = () => {};
    tx.onerror = onerror;

    function onerror(error) {
      console.error('Error add data to indexedDB ', error);
    }
  }

  getProductNameListByComponent(ingredients) {
    const subject = new Subject<any>();
    const tx = this.db.transaction([this.objectStoreName], GlobalConstants.idbReadOnly);
    const store = tx.objectStore(this.objectStoreName);
    const index = store.index(GlobalConstants.indexComponent);
    const myCursor = index.openCursor();

    let name = '';
    let nameArray = [];
    let componentName = '';
    let idx = 0;

    myCursor.onsuccess = event => {
      const cursor = event.target.result;
      if (cursor) {
        componentName = cursor.value.componentName;
        name = cursor.value.productName;

        if (componentName === ingredients) {
          nameArray = name.split(/[\s,]+/);
          subject.next({
            id: idx,
            name,
            size: nameArray[nameArray.length - 2],
            strength: nameArray[nameArray.length - 1]
          });
          idx++;
        }
        cursor.continue();
      }
    };

    return subject;
  }

  clearData() {
    const tx = this.db.transaction([this.objectStoreName], GlobalConstants.idbReadWrite);
    const objectStore = tx.objectStore(this.objectStoreName);
    const objectStoreReq = objectStore.clear();

    objectStoreReq.onsuccess = () => {
      console.log('IDb cleared.');
    };
  }

  getRecipesFromIdb(indexName: string, key: string) {
    const result = [];
    let colorIdx = 1;
    const colorTotal = 7;
    let quantitySum = 0;

    const index = this.db
      .transaction([this.objectStoreName], GlobalConstants.idbReadOnly)
      .objectStore(this.objectStoreName)
      .index(indexName);

    index.openCursor().onsuccess = event => {
      const cursor = event.target.result;
      if (cursor) {
        if (cursor.value.productName === key) {
          result.push({
            ingredients: cursor.value.componentName,
            quantity: (cursor.value.quantity).toFixed(2),
            percentage: 0,
            color: (colorIdx % colorTotal).toString(),
          });
          quantitySum += parseFloat(cursor.value.quantity);
          colorIdx++;
        }
        cursor.continue();
      } else {
        for (const item of result) {
          item.percentage = (item.quantity / quantitySum).toFixed(2);
        }
      }
    };

    return result;
  }

  getProdComponentNames(indexName, search) {
    const subject = new Subject<any>();

    const tx = this.db.transaction([this.objectStoreName], GlobalConstants.idbReadOnly);
    const store = tx.objectStore(this.objectStoreName);
    const index = store.index(indexName);
    const myCursor = index.openCursor(null, GlobalConstants.nextUnique);

    let found = false;
    let name = '';
    let nameArr = [];
    let idx = 0;

    if (indexName === GlobalConstants.indexProduct) {
      myCursor.onsuccess = event => {
        const cursor = event.target.result;

        if (cursor) {
          name = cursor.value.productName;
          if (name.toUpperCase().indexOf(search.toUpperCase()) >= 0) {
            if (!found) {
              found = true;
            }
            nameArr = name.split(/[\s,]+/);
            subject.next({
              id: idx,
              name,
              size: nameArr[nameArr.length - 2],
              strength: nameArr[nameArr.length - 1]
            });
            idx++;
          }
          cursor.continue();
        } else {
          if (!found) {
            subject.next({
              error: 'not found'
            });
          }
        }
      };
    } else {
      // get componentNameList
      myCursor.onsuccess = event => {
        const cursor = event.target.result;

        if (cursor) {
          name = cursor.value.componentName;
          if (name.toUpperCase().indexOf(search.toUpperCase()) >= 0) {
            if (!found) {
              found = true;
            }
            subject.next({
              id: idx,
              name
            });
            idx++;
          }
          cursor.continue();
        } else {
          if (!found) {
            subject.next({
              error: 'not found'
            });
          }
        }
      };
    }

    return subject;

  }

}
