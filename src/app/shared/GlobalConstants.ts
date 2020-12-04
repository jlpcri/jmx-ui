import * as moment from 'moment';

export class GlobalConstants {
  public static indexProductName = 'productName';
  public static indexProductSku = 'productSku';
  public static indexLocation = 'name';
  public static indexLabelKey = 'labelKey';
  public static indexProductKey = 'productKey';
  public static indexAppProperty = 'property';
  public static nextUnique = 'nextunique';
  public static idbReadOnly = 'readonly';
  public static idbReadWrite = 'readwrite';
  public static bottleScanCommit = 'commit';
  public static bottleScanSend = 'send';
  public static appPropertyNotExist = 'app property not exist: ';
  public static appPropertyLocation = 'location';

  public static nameListInitial = [{
    id: 0,
    name: '',
  }];
  public static printDataInitial = {
    name: '',
    size: '',
    sku: '',
    strength: '',
    storeName: 'Store Name',
    storeLocation: 'Store Location Address',
    currentDate: moment().format('L'),
    batchId: '159763'};

  public static scanDataInitial = {
    eventTimestamp: '',
    associateName: '',
    batchId: '4158',
    productSku: '790080',
    productName: 'Purple Worm',
    locationName: '',
    status: '',
  };

  public static scanDataCheckFields = [
     'productSku', 'batchId', 'associateName'
  ];

  public static appLocation = {
    name: '',
    storeLocation: ''
  };

  public static appLocationErrorMsg = 'App Location not set. Go to main menu AppConfig';
}
