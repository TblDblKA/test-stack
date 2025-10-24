<template>
  <header class="controls">
    <input placeholder="Найти по ФИО..." v-model="search"/>
    <button @click="openModal()">Добавить</button>
  </header>
  <main>
    <AppTable
        :records="records"
        :search="search"
        @click="openModal"
        @delete="onDeleteRow"
    />
  </main>
  <AppModal
      v-model:open="isModalOpen"
      :form="form"
      :action="action"
      @edit="onSaveRow"
  />
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import AppTable from '@/components/AppTable.vue';
import AppModal from '@/components/AppModal.vue'
import type { RecordItem } from '@/data/records.ts';
import { records as data } from "@/data/records.ts";

const records = reactive<RecordItem[]>(data)

const search = ref<string>('');
const isModalOpen = ref<boolean>(false);
let form = reactive<RecordItem>({
  id: '',
  companyName: '',
  directorName: '',
  phone: '',
  address: {
    city: '',
    street: '',
    building: '',
  }
})

const action = ref<'create' | 'modify'>('create')

function openModal(row?: RecordItem) {
  if (row === undefined) {
    form = {
      id: Date.now().toString(),
      companyName: '',
      directorName: '',
      phone: '',
      address: {
        city: '',
        street: '',
        building: '',
      }
    }
    action.value = 'create';
  } else {
    form = row;
    console.log(row)
    action.value = 'modify'
  }
  isModalOpen.value = true;
}
function onSaveRow(value: RecordItem, action: 'create' | 'modify'): void {
  if (action === 'create') {
    records.unshift(value);
    return;
  }
  const index = records.findIndex(el => el.id === value.id);
  if (index !== -1) {
    records[index] = value;
  }
}
function onDeleteRow(id: string): void {
  const index = records.findIndex(el => el.id === id);
  if (index !== -1) {
    records.splice(index, 1);
  }
}
</script>

<style scoped>
.controls {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;

  & input {
    padding: 8px;
    flex: 1;
  }
  & button {
    padding: 8px 12px;
  }
}
</style>