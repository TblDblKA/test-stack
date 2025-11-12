import type { RecordItem } from '../models/RecordItem.ts';

export class Modal {
  private readonly modal: HTMLDivElement;
  private readonly form: HTMLFormElement;
  private currentId: string | null = null;

  constructor() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal hidden';
    this.modal.innerHTML = `
      <div class="modal-wrapper">
        <div class="modal-content">
          <h3 id="modal-title">Добавить организацию</h3>
          <form id="modal-form" novalidate>
            <div class="form-row">
              <label>Название</label>
              <input class="form-input" name="companyName" required />
            </div>
            <div class="form-row">
              <label>ФИО директора</label>
              <input class="form-input" name="directorName" required />
            </div>
            <div class="form-row">
              <label>Номер телефона</label>
              <input class="form-input" name="phone" required />
            </div>
            <fieldset>
              <legend>Адрес</legend>
              <div class="form-row">
                <label>Город</label>
                <input class="form-input" name="city" required />
              </div>
              <div class="form-row">
                <label>Улица</label>
                <input class="form-input" name="street" required />
              </div>
              <div class="form-row">
                <label>Дом</label>
                <input class="form-input" name="building" required />
              </div>
            </fieldset>
            <div class="buttons">
              <button type="submit">OK</button>
              <button type="button" id="cancel">Отмена</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);

    this.form = this.modal.querySelector<HTMLFormElement>('#modal-form')!;
    this.form.addEventListener('submit', (event) => this.handleSubmit(event));

    const cancelButton = this.modal.querySelector<HTMLButtonElement>('#cancel');
    cancelButton?.addEventListener('click', () => this.hide());
  }

  show(record?: RecordItem) {
    this.currentId = record?.id ?? null;

    const titleElement = this.modal.querySelector('#modal-title') as HTMLElement;
    titleElement.textContent = record ? 'Редактировать организацию' : 'Добавить организацию';

    this.form.reset();

    if (record) {
      (this.form.elements.namedItem('companyName') as HTMLInputElement).value = record.companyName;
      (this.form.elements.namedItem('directorName') as HTMLInputElement).value =
        record.directorName;
      (this.form.elements.namedItem('phone') as HTMLInputElement).value = record.phone;
      (this.form.elements.namedItem('city') as HTMLInputElement).value = record.address.city;
      (this.form.elements.namedItem('street') as HTMLInputElement).value = record.address.street;
      (this.form.elements.namedItem('building') as HTMLInputElement).value = String(
        record.address.building
      );
    }

    this.modal.classList.remove('hidden');
  }

  hide(): void {
    this.modal.classList.add('hidden');
  }

  private validate(): boolean {
    const inputFields = Array.from(this.form.querySelectorAll('input'));
    let isValid = true;

    for (const input of inputFields) {
      const value = input.value.trim();
      if (!value) {
        isValid = false;
        input.classList.add('invalid');
      } else {
        input.classList.remove('invalid');
      }
    }

    return isValid;
  }

  private handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (!this.validate()) return;

    const formData = new FormData(this.form);

    const record: RecordItem = {
      id: this.currentId ?? Date.now().toString(),
      companyName: (formData.get('companyName') ?? '').toString().trim(),
      directorName: (formData.get('directorName') ?? '').toString().trim(),
      phone: (formData.get('phone') ?? '').toString().trim(),
      address: {
        city: (formData.get('city') ?? '').toString().trim(),
        street: (formData.get('street') ?? '').toString().trim(),
        building: (formData.get('building') ?? '').toString().trim(),
      },
    };

    this.modal.dispatchEvent(new CustomEvent<RecordItem>('save', { detail: record }));
    this.hide();
  }

  get element(): HTMLElement {
    return this.modal;
  }
}
