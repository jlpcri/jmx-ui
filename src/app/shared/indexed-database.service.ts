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
      objectStore.createIndex("product-name", "productName", {unique: false});
      objectStore.createIndex("component-name", "componentName", {unique: false});
      objectStore.createIndex("quantity", "quantity", {unique: false});
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
