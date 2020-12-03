export class LocationModel {
  name: string;
  storeLocation: string;
}

export class LocationResponseModel {
  name: string;
  addrLine1: string;
  addrLine2: string;
  city: string;
  state: string;
  zipCode: string;
}

export class LocationResponseListModel {
  content: LocationResponseModel[];
  page: {
    totalElements: number;
  };
}
