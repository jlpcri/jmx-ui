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
    associateName: 'John Doe',
    batchId: '4158',
    productSku: '790080',
    productName: 'Purple Worm',
    locationName: '',
    status: '',
  };

  public static scanDataCheckFields = [
     'productName', 'productSku', 'batchId', 'associateName', 'locationName'
  ];
}
