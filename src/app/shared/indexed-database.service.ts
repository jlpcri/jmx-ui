import {Injectable} from '@angular/core';
import {MessageService} from './message.service';
import {Subject} from 'rxjs';
import {GlobalConstants} from './GlobalConstants';
import {RecipeModel} from '../recipe-list/shared/recipe.model';

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

  init(callback) {
    const request = indexedDB.open(this.dbName, this.version);
    let dbExisted = true;

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
      callback(dbExisted);
    };

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      const objectStore = db.createObjectStore(this.objectStoreName, {keyPath: 'id', autoIncrement: true});
      objectStore.createIndex(GlobalConstants.indexProduct, 'name', {unique: false});
      objectStore.createIndex(GlobalConstants.indexLabelKey, 'labelKey', {unique: false});
      objectStore.createIndex(GlobalConstants.indexProductKey, 'key', {unique: false});
      dbExisted = false;

    };
  }

  syncRecipes(data) {
    for (const item of data) {
      this.addRecipe(item)
        .then();
    }
  }

  async addRecipe(product: RecipeModel) {
    const tmp = {
      sku: product.sku,
      name: product.name,
      label: product.label,
      labelKey: product.labelKey,
      nicStrength: product.nicStrength,
      bottleSize: product.bottleSize,
      key: product.key,
      ingredients: product.ingredients,
      saltNic: product.saltNic
    };

    const tx = this.db.transaction([this.objectStoreName], GlobalConstants.idbReadWrite);
    const store = tx.objectStore(this.objectStoreName);

    await store.put(tmp);

    tx.oncomplete = () => {};
    tx.onerror = onerror;
    await tx.done;

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
    let componentName = '';

    myCursor.onsuccess = event => {
      const cursor = event.target.result;
      if (cursor) {
        componentName = cursor.value.componentName;
        name = cursor.value.productName;

        if (componentName === ingredients) {
          subject.next(this.getProductDetailFromName(name));
        }
        cursor.continue();
      }
    };

    return subject;
  }

  eraseIdbData() {
    const idbDeleteRequest = indexedDB.deleteDatabase(this.dbName);
    idbDeleteRequest.onerror = event => {
      console.log('Error deleting database', event);
    };

    idbDeleteRequest.onblocked = event => {
      console.log('Blocked: ', event);
      this.db.close();
    };

    idbDeleteRequest.onsuccess = event => {
      console.log('Database deleted successfully', event);
    };
  }

  getRecipesFromIdb(indexName: string, key: string) {
    const result = [];
    let colorIdx = 1;
    const colorTotal = 20;
    let tmpColor = '';
    let quantitySum = 0;

    const index = this.db
      .transaction([this.objectStoreName], GlobalConstants.idbReadOnly)
      .objectStore(this.objectStoreName)
      .index(indexName);

    index.openCursor().onsuccess = event => {
      const cursor = event.target.result;
      if (cursor) {
        if (cursor.value.productName === key) {
          if (cursor.value.componentName.toLowerCase().indexOf('nicotine') >= 0) {
            tmpColor = 'nicotine';
          } else {
            tmpColor = (colorIdx % colorTotal).toString();
          }
          result.push({
            ingredients: cursor.value.componentName,
            quantity: (cursor.value.quantity).toFixed(2),
            percentage: 0,
            color: tmpColor,
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
            subject.next(this.getProductDetailFromName(name));
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

  getProductDetailFromName(name: string) {
    let nameArr: any[];
    let tmpName: string;
    let tmpSize: string;
    let tmpStrength: string;
    let tmpCommaCounts = '';

    nameArr = name.split(/[\s,]+/);
    // todo: size with ohm, strength with pack
    if ((nameArr[nameArr.length - 2].toLowerCase().indexOf('ml') < 0)
      || (nameArr[nameArr.length - 1].toLowerCase().indexOf('mg')) < 0) {
      tmpName = name;
      tmpSize = '';
      tmpStrength = '';
    } else {
      tmpName = nameArr.slice(0, nameArr.length - 2).join(' ');
      tmpSize = nameArr[nameArr.length - 2];
      tmpStrength = nameArr[nameArr.length - 1];
      if ((name.match(/,/g) || []).length > 1 ) {
        // todo: need check different locations of comma
        tmpCommaCounts = '2';
      } else {
        tmpCommaCounts = '1';
      }
    }

    return {
      name: tmpName,
      commaCount: tmpCommaCounts,
      size: tmpSize,
      strength: tmpStrength
    };
  }

  getProductPrintData(searchName) {
    const subject = new Subject<any>();

    const tx = this.db.transaction([this.objectStoreName], GlobalConstants.idbReadOnly);
    const store = tx.objectStore(this.objectStoreName);
    const index = store.index(GlobalConstants.indexProduct);
    const myCursor = index.openCursor(null, GlobalConstants.nextUnique);

    let found = false;

    myCursor.onsuccess = event => {
      const cursor = event.target.result;

      if (cursor) {
        const sku = cursor.value.sku;
        const name = cursor.value.productName;

        if (name.toUpperCase().indexOf(searchName.toUpperCase()) >= 0) {
          if (!found) {
            found = true;
          }
          subject.next({
            sku,
            name
          });
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

    return subject;
  }

}
