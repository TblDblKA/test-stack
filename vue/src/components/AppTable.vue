<template>
  <table class="table">
    <thead>
      <tr>
        <th
            @click="toggleSort('companyName')"
            class="table__clickable-header"
        >
          Название {{ sortBy === 'companyName' ? sortDirection === 'asc' ? '↑' : '↓' : '' }}
        </th>
        <th
            @click="toggleSort('directorName')"
            class="table__clickable-header"
        >
          ФИО директора {{ sortBy === 'directorName' ? sortDirection === 'asc' ? '↑' : '↓' : '' }}
        </th>
        <th>Номер телефона</th>
        <th>Адрес</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr
          v-for="row in pagedRecords"
          :key="row.id"
          @click="onRowClick(row)"
      >
        <td>{{ row.companyName }}</td>
        <td>{{ row.directorName }}</td>
        <td>{{ row.phone }}</td>
        <td>{{ fullAddress(row.address) }}</td>
        <td
            class="table__delete-cell"
            @click.stop="emit('delete', row.id)"
        >
          X
        </td>
      </tr>
    </tbody>
  </table>
   <div class="pagination">
     <button :disabled="pageNum === 1" @click="pageNum--">< Пред</button>
     <span>Страница {{ pageNum }} из {{ totalPages }}</span>
     <button :disabled="pageNum === totalPages" @click="pageNum++">След ></button>
     <select v-model="pageSize">
       <option :value="5">5 / стр</option>
       <option :value="10">10 / стр</option>
       <option :value="20">20 / стр</option>
     </select>
   </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { RecordItem } from "@/data/records.ts";

const props = defineProps<{
  search: string
  records: RecordItem[]
}>();
const emit = defineEmits<{
  click: [value: RecordItem]
  delete: [value: string]
}>()

const pageNum = ref<number>(1);
const pageSize = ref<5 | 10 | 20>(5);

const totalPages = computed<number>(() =>
    Math.max(1, Math.ceil(sortedRecords.value.length / pageSize.value))
);

function fullAddress(address: {city: string, street: string, building: string | number}): string {
  return `${address.city}, ${address.street}, д. ${address.building}`;
}

const filteredRecords = computed(() => {
  const s = props.search.trim().toLowerCase()
  if (!s) return props.records.slice()
  return props.records.filter(r => r.directorName.toLowerCase().includes(s))
})

const sortDirection = ref<'asc' | 'desc'>('asc');
const sortBy = ref<null | 'companyName' | 'directorName'>(null);

function toggleSort(sortType: 'companyName' | 'directorName'): void {
  if (sortBy.value === sortType) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    return;
  }
  sortBy.value = sortType;
  sortDirection.value = 'asc';
}

const sortedRecords = computed<RecordItem[]>(() => {
  if (sortBy.value === null) return filteredRecords.value
  const key = sortBy.value
  const arr = [...filteredRecords.value];
  arr.sort((a: RecordItem, b: RecordItem): number => {
    const firstVal = a[key].toLowerCase();
    const secondVal = b[key].toLowerCase();
    if (firstVal > secondVal) {
      return sortDirection.value === 'asc' ? 1 : -1;
    }
    if (secondVal > firstVal) {
      return sortDirection.value === 'asc' ? -1: 1;
    }
    return 0;
  })
  return arr;
})

const pagedRecords = computed(() => {
  const start = (pageNum.value - 1) * pageSize.value;
  return sortedRecords.value.slice(start, start + pageSize.value);
})

function onRowClick(row: RecordItem): void {
  emit('click', row)
}

watch(pageSize, () => {
  pageNum.value = 1;
})
</script>

<style scoped lang="scss">
.table {
  width: 100%;
  border-collapse: collapse;
  & th, & td {
    border: 1px solid #ddd;
    padding: 8px;
  }
  &__clickable-header {
    cursor: pointer;
    background: #f7f7f7;
  }
  &__delete-cell {
    cursor: pointer;
    text-align: center;
  }
}

.pagination {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 12px;
}
</style>