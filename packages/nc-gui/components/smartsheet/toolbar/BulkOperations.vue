<script lang="ts" setup>
import { computed, inject, ref } from '#imports'

const view = inject(ActiveViewInj, ref())
const meta = inject(MetaInj, ref())
console.log('meta', meta)
watch(meta, () => {
  console.log('meta', meta)
})
const { selectedRows } = useProvideViewData(meta, view)

const columns = computed(() =>
  meta.value?.columns?.map((c) => ({
    value: c.id,
    label: c.title,
  })),
)

const showBulkOperationModal = ref(false)

const onShowBulkOperationModal = () => (showBulkOperationModal.value = true)

const handleBulkOperationModalOkClick = () => {
  // reloadData.trigger()
  showBulkOperationModal.value = false
}

// const FOO = computed(() => {
//   return selectedRows
// })
</script>

<template>
  <div class="flex flex-row border-1 rounded-sm">
    selectedRows: {{ JSON.stringify(selectedRows) }} <br />
    columns: {{ JSON.stringify(columns) }} <br />
    <a-button @click="onShowBulkOperationModal">Bulk Operation</a-button>
    <a-modal
      v-model:visible="showBulkOperationModal"
      title="Bulk Operation"
      footer
      @ok="handleBulkOperationModalOkClick"
      :bodyStyle="{ padding: '0px' }"
    >
    </a-modal>
  </div>
</template>
