import * as moment from 'moment';

export class GlobalConstants {
  public static indexProductName = 'productName';
  public static indexProductSku = 'productSku';
  public static indexLocation = 'name';
  public static indexLabelKey = 'labelKey';
  public static indexProductKey = 'productKey';
  public static indexAppProperty = 'property';
  public static indexBatchId = 'batchId';
  public static indexAssociateName = 'associateName';
  public static indexLocationName = 'locationName';
  public static nextUnique = 'nextunique';
  public static idbReadOnly = 'readonly';
  public static idbReadWrite = 'readwrite';
  public static bottleScanCommit = 'commit';
  public static bottleScanSend = 'send';
  public static appPropertyNotExist = 'app property not exist: ';
  public static appPropertyLocation = 'location';
  public static appPropertyUser = 'user';
  public static appPropertyIdbLastUpdate = 'idbLastUpdate';
  public static spinnerName = 'ingredientsTable';
  public static timestampFormat = 'YYYY-MM-DDTHH:mm:ssZ';
  public static refreshFrequencyHours = 24;

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
    batchId: '',
    productSku: '',
    productName: '',
    locationName: '',
    status: '',
    scanCode: '(01)**********0002(10)25852'
  };

  public static scanDataCheckFields = [
     'batchId', 'associateName'
  ];

  public static appLocation = {
    name: '',
    storeLocation: ''
  };

  public static appAssociate = {
    name: '',
    roles: []
  };

  public static appLocationErrorMsg = 'App Property Location error. Go to main menu AppConfig';
  public static appUserErrorMsg = 'App Property User error. Go to main menu AppConfig';

  public static recipeColors = [
    '#02C4CC', '#8DAE32', '#C6D2D0', '#614870', '#D27973', '#A2E5F3',
    '#55CDB0', '#B598F4', '#A28EAE', '#E9B191', '#A4D797', '#C35AE8',
    '#456DD5', '#868487', '#E8735A', '#588A4B', '#031111', '#155462', '#CD4631'];
  public static recipeColorsNicotine = '#F2BA02';

  public static rolesNameAdmin = 'GROUP - Alohma Admin';
  public static rolesNameJmxApp = 'JMX App';
}
