<script lang="ts" setup>
import { computed, inject, ref } from '#imports'

const { $api, $e } = useNuxtApp()

const meta = inject(MetaInj, ref())
const { project } = useProject()
console.log('meta', meta)
watch(meta, () => {
  console.log('meta', meta)
})
const { selectedRows } = useViewDataOrThrow()

const columns = computed(() =>
  meta.value?.columns?.map((c) => ({
    value: c.id,
    label: c.title,
  })),
)

const selectedColumn = ref()

const showBulkOperationModal = ref(false)

const onShowBulkOperationModal = () => (showBulkOperationModal.value = true)

const handleBulkOperationModalOkClick = () => {
  // reloadData.trigger()
  showBulkOperationModal.value = false
}

const onApply = () => {
  // bulkUpdate: (orgs: string, projectName: string, tableName: string, data: any, params?: RequestParams) => Promise<any>;
  const rowsToUpdate = selectedRows.value.map((row) => {
    return {
      // TODO: make this generic (get primary key, probably from meta data object)
      id: row.row.Id,
      // TODO: make the key/columnName definition generic (get column that user selected)
      // TODO: make the value setting generic (get value from user)
      // TODO: then also allow more operations - not just setting it
      // to a 'static' value (dynamically set by the user), but e.g. also '+ n' or '- n' etc
      title5: 1234,
    }
  })
  console.log(rowsToUpdate)
  $api.dbTableRow.bulkUpdate(NOCO, project.value.title as string, meta!.value!.title, rowsToUpdate)

  //   projectName: meta.value?.project_id,
  //   tableId: meta.value?.tableId,
  //   rowIds: selectedRows.value.map((r) => r.id),
  //   columnId: selectedColumn.value,
  //   value: 'test',
  // )
}

const bulkOperationButtonDisabled = computed(() => selectedRows.value.length < 1)
</script>

<template>
  <div class="flex flex-row border-1 rounded-sm">
    <a-button :disabled="bulkOperationButtonDisabled" @click="onShowBulkOperationModal">Bulk Operation</a-button>
    <a-modal
      v-model:visible="showBulkOperationModal"
      title="Bulk Operation"
      footer
      @ok="handleBulkOperationModalOkClick"
      :bodyStyle="{ padding: '0px' }"
    >
      <!-- <a-form-item v-bind="validateInfos['meta.currency_code']" label="Currency Code"> -->
      <a-select v-model:value="selectedColumn" class="w-52" dropdown-class-name="nc-dropdown-checkbox-icon">
        <a-select-option v-for="(column, i) of columns" :key="i" :value="column.value">
          {{ column.label }}
        </a-select-option>
      </a-select>
      <!-- </a-form-item> -->
      <a-button @click="onApply">Apply</a-button>
    </a-modal>
  </div>
</template>
