import type { RecordItem, SortableKeys } from '../models/RecordItem.ts';
import { recordsStore } from '../store/recordsStore.ts';

export class Table {
  private readonly container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    recordsStore.subscribe((records: RecordItem[]) => this.render(records));
  }

  public get element(): HTMLElement {
    return this.container;
  }

  private getFullAddress({ city, street, building }: RecordItem['address']): string {
    return `${city}, ${street}, д. ${building}`;
  }

  private render(data: RecordItem[]) {
    const total = recordsStore.totalPages;
    const current = recordsStore.page;
    this.container.innerHTML = `
      <table class="org-table">
        <thead>
          <tr>
            <th class="clickable-header" data-key="companyName">Название</th>
            <th data-key="directorName">ФИО директора</th>
            <th>Номер телефона</th>
            <th>Адрес</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (record) => `
                <tr data-id="${record.id}">
                  <td>${record.companyName}</td>
                  <td>${record.directorName}</td>
                  <td>${record.phone}</td>
                  <td>${this.getFullAddress(record.address)}</td>
                  <td><button class="delete-cell">X</button></td>
                </tr>
              `
            )
            .join('')}
        </tbody>
        </table>
          <div class="pagination">
            <button class="prev" ${current === 1 ? 'disabled' : ''}>< Пред</button>
            <span>Страница ${current} из ${total}</span>
            <button class="next" ${current === total ? 'disabled' : ''}>След ></button>
            <select id="page-size">
              <option value="5" ${recordsStore.pageSize === 5 ? 'selected' : ''}>5</option>
              <option value="10" ${recordsStore.pageSize === 10 ? 'selected' : ''}>10</option>
              <option value="20" ${recordsStore.pageSize === 20 ? 'selected' : ''}>20</option>
            </select>
          </div>
      `;

    // sorting
    this.container.querySelectorAll('th[data-key]').forEach((elem): void => {
      elem.addEventListener('click', () => {
        this.sort(elem.getAttribute('data-key') as SortableKeys);
      });
    });

    // delete row
    this.container.querySelectorAll('.delete-cell').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const id = button.closest('tr')?.getAttribute('data-id');
        if (id) {
          recordsStore.remove(id);
        }
      });
    });

    // editing
    this.container.querySelectorAll('tr[data-id]').forEach((row) => {
      row.addEventListener('click', (event) => {
        if ((event.target as HTMLElement).classList.contains('.delete-cell')) return;
        const id = row.getAttribute('data-id') as string;
        const record = recordsStore.records.find((r) => r.id === id);
        if (!record) return;
        this.container.dispatchEvent(new CustomEvent<RecordItem>('edit', { detail: record }));
      });
    });

    // pagination
    this.container
      .querySelector('.prev')
      ?.addEventListener('click', () => recordsStore.setPage(current - 1));
    this.container
      .querySelector('.next')
      ?.addEventListener('click', () => recordsStore.setPage(current + 1));

    const sizeSelect = this.container.querySelector<HTMLSelectElement>('#page-size');
    sizeSelect?.addEventListener('change', () =>
      recordsStore.setPageSize(Number(sizeSelect?.value))
    );
  }

  private sort(sortKey: SortableKeys): void {
    recordsStore.setSort(sortKey);
  }
}
