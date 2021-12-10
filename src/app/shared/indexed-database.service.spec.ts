import {IndexedDatabaseService} from './indexed-database.service';
import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MessageService} from './message.service';
import {GlobalConstants} from './GlobalConstants';
import {RecipeModel} from '../recipe-list/shared/recipe.model';

describe('IndexedDatabaseService', () => {
  let service: IndexedDatabaseService;
  let messageService: jasmine.SpyObj<MessageService>;

  let db: any;

  function setupDB(callback) {
    const request = indexedDB.open('AmvRecipesDatabase', 1);
    let dbExisted = true;

    request.onsuccess = (event) => {
      db = request.result;
      callback(dbExisted);
      // initializeObjectStores(db);
    };

    request.onupgradeneeded = (event) => {
      db = request.result;
      if (event.oldVersion < 1) {
        initializeObjectStores(db);
        dbExisted = false;
      }
    };
  }

  function initializeObjectStores(dbName) {
    const osName = 'recipes';
    const osLocation = 'locations';
    const osUser = 'users';
    const osBottleScan = 'bottleScans';
    const osAppConfig = 'appConfig';

    const objectStore = dbName.createObjectStore(osName, {keyPath: 'id', autoIncrement: true});
    objectStore.createIndex(GlobalConstants.indexLabelKey, 'labelKey', {unique: false});

    objectStore.put({
      id: 123,
      bottleSize: 1,
      ingredients: [
        {
          sku: '181080',
          name: 'Pineapple 960ml 0mg',
          quantity: 120
        },
        {
          sku: '11767',
          name: 'Empty 120mL Bottle w/ Childproof Tamper Evident Cap',
          quantity: 1
        },
        {
          sku: '518480',
          name: '300mg Nicotine',
          quantity: 0
        }
      ],
      key: 'madvapor-pineapple:1:0',
      label: 'Madvapor, Pineapple,',
      labelKey: 'madvapor-pineapple',
      name: 'Madvapor, Pineapple, 120ml, 0mg',
      nicStrength: 0,
      saltNic: false,
      sku: '181050'
    });

    const objectStoreLocation = dbName.createObjectStore(osLocation, {keyPath: 'id', autoIncrement: true});
    objectStoreLocation.put({
      id: 4071,
      name: 'Alohma Belleve',
      storeLocation: '11527 S 36th st, Bellevue NE'
    });
    const objectStoreUser = dbName.createObjectStore(osUser, {keyPath: 'id', autoIncrement: true});
    objectStoreUser.put({
      name: 'test user',
      roles: ['JMX App']
    });
    const objectStoreBottleScan = dbName.createObjectStore(osBottleScan, {keyPath: 'id', autoIncrement: true});
    const objectStoreAppConfig = dbName.createObjectStore(osAppConfig, {keyPath: 'id', autoIncrement: true});
    objectStoreAppConfig.put({
      id: 1,
      property: 'user',
      value: {
        name: 'test user',
        roles: ['JMX App']
      }
    });
    objectStoreAppConfig.put({
      id: 2,
      property: 'location',
      value: {
        id: 3347,
        name: 'Alohma Belleve',
        storeLocation: '11527 S 36th St , Bellevue NE, 68123'
      }
    });
    objectStoreAppConfig.put({
      id: 3,
      property: 'idbLastUpdate',
      value: '2021-12-04T12:20:09-06:00'
    });
  }

  beforeEach(() => {
    messageService = jasmine.createSpyObj('MessageService', ['error', 'warn', 'info']);
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        { provide: MessageService, useValue: messageService }
      ]
    });
    service = TestBed.inject(IndexedDatabaseService);

    setupDB(dbExisted => {
      if (!dbExisted) {
        console.log('DB created.');
      } else {
        console.log('DB existed.');
      }
    });

  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('idbService init', () => {


    service.init(dbExisted => {
      if (!dbExisted) {
        console.log('Init test DB created');
      } else {
        console.log('Init test DB existed.');
      }
    });

    expect(service).toBeTruthy();
  });

});
