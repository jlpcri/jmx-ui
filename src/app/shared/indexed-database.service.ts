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

  getProductNameListByComponent(ingredientName) {
    const subject = new Subject<any>();
    const tx = this.db.transaction([this.objectStoreName], GlobalConstants.idbReadOnly);
    const store = tx.objectStore(this.objectStoreName);
    const index = store.index(GlobalConstants.indexLabelKey);
    const myCursor = index.openCursor(null, GlobalConstants.nextUnique);

    let ingredients = [];

    myCursor.onsuccess = event => {
      const cursor = event.target.result;
      if (cursor) {
        ingredients = cursor.value.ingredients;
        for (const item of ingredients) {
          if (item.name === ingredientName) {
            subject.next({
              label: cursor.value.label,
              labelKey: cursor.value.labelKey
            });
            break;
          }
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
    const recipes = [];
    let colorIdx = 1;
    const colorTotal = 20;
    let tmpColor = '';
    let quantitySum = 0;

    const index = this.db
      .transaction([this.objectStoreName], GlobalConstants.idbReadOnly)
      .objectStore(this.objectStoreName)
      .index(indexName);

    const getRequest = index.get(key);
    getRequest.onsuccess = () => {
      for (const item of getRequest.result.ingredients) {
        if (item.name.toLowerCase().indexOf('nicotine') >= 0) {
          tmpColor = 'nicotine';
        } else {
          tmpColor = (colorIdx % colorTotal).toString();
        }
        recipes.push({
          ingredients: item.name,
          quantity: item.quantity,
          percentage: 0,
          color: tmpColor
        });
        quantitySum += parseFloat(item.quantity);
        colorIdx++;
      }
      for (const item of recipes) {
        item.percentage = (item.quantity / quantitySum).toFixed(2);
      }
    };
    return recipes;

  }

  getProductNameList(search) {
    const subject = new Subject<any>();

    const tx = this.db.transaction([this.objectStoreName], GlobalConstants.idbReadOnly);
    const store = tx.objectStore(this.objectStoreName);
    const index = store.index(GlobalConstants.indexLabelKey);
    const myCursor = index.openCursor(null, GlobalConstants.nextUnique);

    let found = false;
    let labelKey = '';

    myCursor.onsuccess = event => {
      const cursor = event.target.result;

      if (cursor) {
        labelKey = cursor.value.labelKey;
        if (labelKey.indexOf(search.toLowerCase()) >= 0) {
          if (!found) {
            found = true;
          }
          subject.next({
            label: cursor.value.label,
            labelKey: cursor.value.labelKey
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

  getComponentNameList(search) {
    const subject = new Subject<any>();

    const tx = this.db.transaction([this.objectStoreName], GlobalConstants.idbReadOnly);
    const store = tx.objectStore(this.objectStoreName);
    const index = store.index(GlobalConstants.indexLabelKey);
    const myCursor = index.openCursor();

    let found = false;
    let ingredients = [];
    let idx = 0;

    // get componentNameList
    myCursor.onsuccess = event => {
      const cursor = event.target.result;

      if (cursor) {
        ingredients = cursor.value.ingredients;
        for (const item of ingredients) {
          if (item.name.toLowerCase().indexOf(search.toLowerCase()) >= 0) {
            if (!found) {
              found = true;
            }
            subject.next({
              id: idx,
              name: item.name,
            });
            idx++;
          }
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

  getProductSizeNicStrength(search) {
    const subject = new Subject<any>();

    const tx = this.db.transaction([this.objectStoreName], GlobalConstants.idbReadOnly);
    const store = tx.objectStore(this.objectStoreName);
    const index = store.index(GlobalConstants.indexLabelKey);
    const myCursor = index.openCursor(null);

    let labelKey = '';

    myCursor.onsuccess = event => {
      const cursor = event.target.result;
      if (cursor) {
        labelKey = cursor.value.labelKey;
        if (labelKey === search) {
          subject.next({
            bottleSize: cursor.value.bottleSize,
            nicStrength: cursor.value.nicStrength
          });
        }
        cursor.continue();
      }
    };

    return subject;

  }

  getProductPrintData(searchName) {
    const subject = new Subject<any>();

    const tx = this.db.transaction([this.objectStoreName], GlobalConstants.idbReadOnly);
    const store = tx.objectStore(this.objectStoreName);
    const index = store.index(GlobalConstants.indexProductKey);

    const getRequest = index.get(searchName);
    getRequest.onsuccess = () => {
      subject.next({
        name: getRequest.result.name,
        sku: getRequest.result.sku,
        size: getRequest.result.bottleSize,
        strength: getRequest.result.nicStrength
      });
    };

    return subject;
  }

}
