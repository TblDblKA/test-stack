import type { RecordItem, SortableKeys } from '../models/RecordItem.ts';

type RecordsListener = (records: RecordItem[]) => void;
type RecordsState = {
  records: RecordItem[];
  query: string;
  sortBy: SortableKeys | null;
  sortDirection: 'asc' | 'desc';
  page: number;
  pageSize: number;
};

class RecordsStore {
  private state: RecordsState = {
    records: [] as RecordItem[],
    query: '',
    sortBy: null,
    sortDirection: 'asc',
    page: 1,
    pageSize: 5,
  };
  private listeners: RecordsListener[] = [];
  private proxy: RecordsState;

  constructor() {
    this.proxy = new Proxy(this.state, {
      set: <K extends keyof RecordsState>(target: RecordsState, key: K, value: RecordsState[K]) => {
        target[key] = value;
        this.notify();
        return true;
      },
    });
  }

  get records(): RecordItem[] {
    return this.proxy.records;
  }
  get page(): number {
    return this.proxy.page;
  }
  get pageSize(): number {
    return this.proxy.pageSize;
  }
  get totalPages(): number {
    return Math.ceil(this.processed.length / this.proxy.pageSize);
  }

  get paginated(): RecordItem[] {
    const start = (this.proxy.page - 1) * this.proxy.pageSize;
    const end = start + this.proxy.pageSize;
    return this.processed.slice(start, end);
  }
  private get processed(): RecordItem[] {
    let result = JSON.parse(JSON.stringify(this.proxy.records)) as RecordItem[];

    if (this.proxy.query.trim()) {
      const q = this.proxy.query.trim().toLowerCase();
      result = result.filter((record) => record.directorName.toLowerCase().includes(q));
    }

    if (this.proxy.sortBy) {
      const key = this.proxy.sortBy;
      result.sort((a, b): number => {
        const firstVal = a[key].toLowerCase();
        const secondVal = b[key].toLowerCase();
        if (firstVal > secondVal) {
          return this.proxy.sortDirection === 'asc' ? 1 : -1;
        }
        if (secondVal > firstVal) {
          return this.proxy.sortDirection === 'asc' ? -1 : 1;
        }
        return 0;
      });
    }
    return result;
  }

  setFilter(q: string) {
    this.proxy.query = q;
    this.proxy.page = 1;
  }
  setSort(sortType: SortableKeys) {
    if (this.proxy.sortBy === sortType) {
      this.proxy.sortDirection = this.proxy.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.proxy.sortDirection = 'asc';
    }
    this.proxy.sortBy = sortType;
  }
  setRecords(newRecords: RecordItem[]) {
    this.proxy.records = JSON.parse(JSON.stringify(newRecords));
    this.proxy.page = 1;
  }
  add(record: RecordItem) {
    this.proxy.records.unshift(record);
    this.proxy.page = 1;
  }
  update(record: RecordItem) {
    this.proxy.records = this.proxy.records.map((r) => (r.id === record.id ? record : r));
  }
  remove(id: string) {
    this.proxy.records = this.proxy.records.filter((record) => record.id !== id);
  }

  setPage(page: number) {
    const total = this.totalPages;
    this.proxy.page = Math.min(Math.max(1, page), total);
  }
  setPageSize(size: number) {
    this.proxy.pageSize = size;
    this.proxy.page = 1;
  }

  subscribe(listener: RecordsListener) {
    this.listeners.push(listener);
    listener(this.paginated);
  }
  private notify() {
    this.listeners.forEach((listener) => listener(this.paginated));
  }
}

export const recordsStore = new RecordsStore();
