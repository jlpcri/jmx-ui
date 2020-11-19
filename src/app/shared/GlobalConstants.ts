import * as moment from 'moment';

export class GlobalConstants {
  public static indexProductName = 'productName';
  public static indexProductSku = 'productSku';
  public static indexLocation = 'name';
  public static indexLabelKey = 'labelKey';
  public static indexProductKey = 'productKey';
  public static nextUnique = 'nextunique';
  public static idbReadOnly = 'readonly';
  public static idbReadWrite = 'readwrite';
  public static nameListInitial = [{
    id: 0,
    name: '',
  }];
  public static printDataInitial = {
    name: '',
    size: '',
    sku: '',
    strength: '',
    storeName: 'Alohma Bellevue',
    storeLocation: '11527 S 36th St, Bellevue NE, 68123',
    currentDate: moment().format('L'),
    batchId: '159763'};

  public static scanDataInitial = {
    eventTimestamp: '',
    associateName: 'John Doe',
    batchId: '4158',
    productSku: '790080',
    productName: 'Purple Worm',
    locationName: '',
    productBarcode: '7 746307 900805',
  };
}
