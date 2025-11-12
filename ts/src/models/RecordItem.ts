export interface RecordItem {
  id: string;
  companyName: string;
  directorName: string;
  phone: string;
  address: {
    city: string;
    street: string;
    building: number | string;
  };
}

export type SortableKeys = Extract<keyof RecordItem, 'companyName' | 'directorName'>;
