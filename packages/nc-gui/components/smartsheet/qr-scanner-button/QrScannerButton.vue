<script setup lang="ts">
import type { SelectProps } from 'ant-design-vue'
import { ref } from 'vue'
import { StreamBarcodeReader } from 'vue-barcode-reader'
import { NOCO } from '#imports'
import QrCodeScan from '~icons/mdi/qrcode-scan'

const meta = inject(MetaInj, ref())

const route = useRoute()
const router = useRouter()

const { $api } = useNuxtApp()
const { project } = useProject()

const view = inject(ActiveViewInj, ref())

const qrCodeFieldOptions = ref<SelectProps['options']>([])

onBeforeMount(init)

async function init() {
  qrCodeFieldOptions.value = meta?.value?.columns!.map((field) => {
    return {
      value: field.id,
      label: field.title,
    }
  })
}

const showQrCodeScannerOverlay = ref(false)

const selectedCodeColumnIdToScanFor = ref('')
const lastScannedQrCode = ref('')

const scannerIsReady = ref(false)

const onLoaded = async () => {
  scannerIsReady.value = true
}

const showScannerField = computed(() => scannerIsReady.value && selectedCodeColumnIdToScanFor.value !== '')
const showPleaseSelectColumnMessage = computed(() => !selectedCodeColumnIdToScanFor.value)
const showScannerIsLoadingMessage = computed(() => selectedCodeColumnIdToScanFor.value && !scannerIsReady.value)

const onDecode = async (qrCodeValue: string) => {
  if (!showScannerField.value || qrCodeValue === lastScannedQrCode.value) {
    return
  }
  try {
    const nameOfSelectedColumnToScanFor = meta.value?.columns?.find(
      (column) => column.id === selectedCodeColumnIdToScanFor.value,
    )?.title
    const whereClause = `(${nameOfSelectedColumnToScanFor},eq,${qrCodeValue})`
    const foundRowsForQrCode = (
      await $api.dbViewRow.list(NOCO, project.value!.id!, meta.value!.id!, view.value!.title!, {
        where: whereClause,
      })
    ).list

    if (foundRowsForQrCode.length !== 1) {
      showQrCodeScannerOverlay.value = true
      lastScannedQrCode.value = qrCodeValue
      setTimeout(() => {
        lastScannedQrCode.value = ''
      }, 4000)
      if (foundRowsForQrCode.length === 0) {
        // extract into localisation file
        message.info(`No row found for this QR code for column '${nameOfSelectedColumnToScanFor}'.`)
      }
      if (foundRowsForQrCode.length > 1) {
        // extract into localisation file
        message.warn('More than one row found for this QR code. Currently only unique QR codes are supported.')
      }
      return
    }

    showQrCodeScannerOverlay.value = false
    lastScannedQrCode.value = ''
    const primaryKeyValueForFoundRow = extractPkFromRow(foundRowsForQrCode[0], meta!.value!.columns!)

    router.push({
      query: {
        ...route.query,
        rowId: primaryKeyValueForFoundRow,
      },
    })
  } catch (error) {
    console.error(error)
  }
}

</script>

<template>
  <div>
    <a-button class="nc-btn-share-view nc-toolbar-btn" @click="showQrCodeScannerOverlay = true">
      <div class="flex items-center gap-1">
        <QrCodeScan />
        <span class="!text-sm font-weight-normal"> {{ $t('activity.scanQrCode') }}</span>
      </div>
    </a-button>
    <a-modal
      v-model:visible="showQrCodeScannerOverlay"
      :class="{ active: showQrCodeScannerOverlay }"
      :closable="false"
      width="28rem"
      centered
      :footer="null"
      wrap-class-name="nc-modal-generate-token"
      destroy-on-close
    >
      <div class="relative flex flex-col h-full">
        <a-form-item :label="$t('labels.columnToScanFor')">
          <a-select
            v-model:value="selectedCodeColumnIdToScanFor"
            class="w-full"
            :options="qrCodeFieldOptions"
            placeholder="Select a Code Field (QR or Barcode)"
            not-found-content="No Code Field can be found. Please create one first."
          />
        </a-form-item>

        <div>
          <StreamBarcodeReader v-show="showScannerField" @decode="onDecode" @loaded="onLoaded"></StreamBarcodeReader>
          <div v-if="showPleaseSelectColumnMessage" class="text-left text-wrap mt-2 text-[#e65100] text-xs">
            Please select a column
          </div>
          <div v-if="showScannerIsLoadingMessage" class="text-left text-wrap mt-2 text-[#e65100] text-xs">
            Loading the scanner...
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>
