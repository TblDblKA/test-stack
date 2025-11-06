<template>
  <div v-if="open" class="modal__wrapper">
    <div class="modal">
      <h2>{{ action === 'create' ? 'Добавить организацию' : 'Редактировать организацию' }}</h2>
      <form class="modal__form">
        <div class="form__row">
          <label>Название</label>
          <input v-model="localForm.companyName" />
        </div>
        <div class="form__row">
          <label>ФИО Директора</label>
          <input v-model="localForm.directorName" />
        </div>
        <div class="form__row">
          <label>Номер телефона</label>
          <input v-model="localForm.phone" />
        </div>
        <fieldset class="form__fieldset">
          <legend>Адрес</legend>
          <div class="form__row">
            <label>Город</label>
            <input v-model="localForm.address.city" />
          </div>
          <div class="form__row">
            <label>Улица</label>
            <input v-model="localForm.address.street" />
          </div>
          <div class="form__row">
            <label>Дом</label>
            <input v-model="localForm.address.building" />
          </div>
        </fieldset>
      </form>
      <div class="modal__actions">
        <button @click="closeModal">Отмена</button>
        <button :disabled="!canSave" @click="onSave">OK</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { RecordItem } from '@/data/records.ts';

const props = defineProps<{
  open: boolean
  form: RecordItem
  action: 'create' | 'modify'
}>();
const emit = defineEmits<{
  'update:open': [value: boolean]
  edit: [value: RecordItem, action: 'create' | 'modify']
}>()

const localForm = ref(JSON.parse(JSON.stringify(props.form)));

function closeModal() {
  emit('update:open', false)
}

const canSave = computed<boolean>(() => {
  return [
    localForm.value.companyName,
    localForm.value.directorName,
    localForm.value.phone,
    localForm.value.address.city,
    localForm.value.address.street,
    localForm.value.address.building
  ].every(val => String(val).trim() !== '');
})

function onSave(): void {
  if (!canSave.value) return
  emit('edit', localForm.value, props.action)
  closeModal();
}

watch(
  [() => props.form, () => props.open],
  () => {
    localForm.value = JSON.parse(JSON.stringify(props.form));
  },
  {
    deep: true,
    immediate: true
  }
);
</script>

<style scoped lang="scss">
.modal {
  &__wrapper {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  background: white;
  padding: 16px;
  width: 420px;
  border-radius: 6px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;

    & button {
      padding: 8px;
      &[disabled] {
        opacity: 0.5;
      }
    }
  }
}

.form {
  &__row {
    display: flex;
    flex-direction: column;
    margin-bottom: 8px;
    gap: 4px;
    & label {
      font-size: 16px;
    }
    & input {
      font-size: 16px;
      padding: 8px;
    }
  }
  & fieldset {
    border: 1px solid #ddd;
    padding:8px;
    margin-bottom:8px;
  }
}
</style>