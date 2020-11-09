export class Pageable {
  content: any[];
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}
