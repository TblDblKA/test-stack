import { recordsStore } from './store/recordsStore.ts';
import { records } from './data/records.ts';
import type { RecordItem } from './models/RecordItem.ts';
import { addTypedListener } from './utils/typedListener.ts';
import { Table } from './components/Table';
import { Modal } from './components/Modal';

export class App {
  private root: HTMLElement;
  private table: Table;
  private modal: Modal;
  private searchInput: HTMLInputElement;
  private addButton: HTMLButtonElement;

  constructor(root: HTMLElement) {
    this.root = root;
    this.root.innerHTML = `
      <div class="controls">
        <input type="text" id="search" placeholder="Найти по ФИО..." />
        <button id="add">Добавить</button>
      </div>
      <div id="table"></div>
    `;

    this.searchInput = this.root.querySelector('#search') as HTMLInputElement;
    this.addButton = this.root.querySelector('#add') as HTMLButtonElement;
    const tableContainer = this.root.querySelector('#table') as HTMLElement;

    this.table = new Table(tableContainer);
    this.modal = new Modal();

    if (recordsStore.records.length === 0) {
      recordsStore.setRecords(records);
    }

    this.addListeners();
  }

  private addListeners(): void {
    this.searchInput.addEventListener('input', () => {
      recordsStore.setFilter(this.searchInput.value);
    });

    this.addButton.addEventListener('click', () => this.modal.show());

    addTypedListener<RecordItem>(this.table.element, 'edit', (e) => {
      this.modal.show(e.detail);
    });

    addTypedListener<string>(this.table.element, 'remove', (e) => {
      recordsStore.remove(e.detail);
    });

    addTypedListener<RecordItem>(this.modal.element, 'save', (e: CustomEvent<RecordItem>) => {
      const record = e.detail;
      const index = recordsStore.records.findIndex((r) => r.id === record.id);
      if (index === -1) recordsStore.add(record);
      else recordsStore.update(record);
    });
  }
}
