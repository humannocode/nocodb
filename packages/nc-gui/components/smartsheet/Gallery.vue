<script lang="ts" setup>
import 'leaflet/dist/leaflet.css'
import { ViewTypes, isVirtualCol } from 'nocodb-sdk'
import {
  ActiveViewInj,
  ChangePageInj,
  FieldsInj,
  IsFormInj,
  IsGalleryInj,
  IsGridInj,
  MetaInj,
  OpenNewRecordFormHookInj,
  PaginationDataInj,
  ReadonlyInj,
  ReloadRowDataHookInj,
  ReloadViewDataHookInj,
  ReloadViewMetaHookInj,
  computed,
  createEventHook,
  extractPkFromRow,
  inject,
  nextTick,
  onMounted,
  provide,
  ref,
  useUIPermission,
  useViewData,
} from '#imports'
import type { Row as RowType } from '~/lib'

const meta = inject(MetaInj, ref())
const view = inject(ActiveViewInj, ref())
const reloadViewMetaHook = inject(ReloadViewMetaHookInj)
const reloadViewDataHook = inject(ReloadViewDataHookInj)
const openNewRecordFormHook = inject(OpenNewRecordFormHookInj, createEventHook())

const expandedFormDlg = ref(false)
const expandedFormRow = ref<RowType>()
const expandedFormRowState = ref<Record<string, any>>()

const {
  loadData,
  paginationData,
  formattedData: data,
  loadGalleryData,
  galleryData,
  changePage,
  addEmptyRow,
} = useViewData(meta, view)

const { isUIAllowed } = useUIPermission()

provide(IsFormInj, ref(false))
provide(IsGalleryInj, ref(true))
provide(IsGridInj, ref(false))
provide(PaginationDataInj, paginationData)
provide(ChangePageInj, changePage)
provide(ReadonlyInj, !isUIAllowed('xcDatatableEditable'))

const route = useRoute()

const router = useRouter()

const markerRef = ref()
const myMapRef = ref()
const latitude = ref()
const longitude = ref()
const markersRef = ref()

function addMarker() {
  // marker([latitude.value, longitude.value]).addTo(myMap);
  // console.log("myMapRef", myMapRef);
  const markerNew = markerRef.value([parseFloat(latitude.value), parseFloat(longitude.value)])
  console.log(markersRef.value)
  markersRef.value.addLayer(markerNew)

  myMapRef.value.addLayer(markersRef.value)
}

onMounted(async () => {
  const { map, tileLayer, marker } = await import('leaflet')
  await import('leaflet.markercluster')

  const myMap = map('map').setView([51.505, -0.09], 13)
  markerRef.value = marker
  myMapRef.value = myMap
  console.log('markerClusterGroup', L.markerClusterGroup)
  markersRef.value = L.markerClusterGroup()

  tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(myMap)
})

const expandForm = (row: RowType, state?: Record<string, any>) => {
  const rowId = extractPkFromRow(row.row, meta.value!.columns!)

  if (rowId) {
    router.push({
      query: {
        ...route.query,
        rowId,
      },
    })
  } else {
    expandedFormRow.value = row
    expandedFormRowState.value = state
    expandedFormDlg.value = true
  }
}

openNewRecordFormHook?.on(async () => {
  const newRow = await addEmptyRow()
  expandForm(newRow)
})

const expandedFormOnRowIdDlg = computed({
  get() {
    return !!route.query.rowId
  },
  set(val) {
    if (!val)
      router.push({
        query: {
          ...route.query,
          rowId: undefined,
        },
      })
  },
})

const reloadAttachments = ref(false)

reloadViewMetaHook?.on(async () => {
  await loadGalleryData()

  reloadAttachments.value = true

  nextTick(() => {
    reloadAttachments.value = false
  })
})
reloadViewDataHook?.on(async () => {
  await loadData()
})

onMounted(async () => {
  await loadData()

  await loadGalleryData()
})

// provide view data reload hook as fallback to row data reload
provide(ReloadRowDataHookInj, reloadViewDataHook)

watch(view, async (nextView) => {
  if (nextView?.type === ViewTypes.GALLERY) {
    await loadData()
    await loadGalleryData()
  }
})
</script>

<template>
  <div class="flex flex-col h-full w-full nounderline">
    <div class="flex m-4 gap-4">
      <label :for="latitude">latitude</label>
      <input v-model="latitude" />
      <label :for="longitude">longitude</label>
      <input v-model="longitude" />
      <button class="bg-blue" @click="addMarker">Submit</button>
    </div>
    <client-only placeholder="Loading...">
      <div id="map"></div>
    </client-only>

    <div class="flex-1" />

    <LazySmartsheetPagination />

    <Suspense>
      <LazySmartsheetExpandedForm
        v-if="expandedFormRow && expandedFormDlg"
        v-model="expandedFormDlg"
        :row="expandedFormRow"
        :state="expandedFormRowState"
        :meta="meta"
        :view="view"
      />
    </Suspense>

    <Suspense>
      <LazySmartsheetExpandedForm
        v-if="expandedFormOnRowIdDlg"
        :key="route.query.rowId"
        v-model="expandedFormOnRowIdDlg"
        :row="{ row: {}, oldRow: {}, rowMeta: {} }"
        :meta="meta"
        :row-id="route.query.rowId"
        :view="view"
      />
    </Suspense>
  </div>
</template>

<style scoped>
.nc-gallery-container {
  grid-auto-rows: 1fr;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
}

:deep(.slick-dots li button) {
  background-color: black;
}

.ant-carousel.gallery-carousel :deep(.slick-dots) {
  position: relative;
  height: auto;
  bottom: 0px;
}

.ant-carousel.gallery-carousel :deep(.slick-dots li div > div) {
  background: #000;
  border: 0;
  border-radius: 1px;
  color: transparent;
  cursor: pointer;
  display: block;
  font-size: 0;
  height: 3px;
  opacity: 0.3;
  outline: none;
  padding: 0;
  transition: all 0.5s;
  width: 100%;
}

.ant-carousel.gallery-carousel :deep(.slick-dots li.slick-active div > div) {
  opacity: 1;
}

.ant-carousel.gallery-carousel :deep(.slick-prev) {
  left: 0;
  height: 100%;
  top: 12px;
  width: 50%;
}

.ant-carousel.gallery-carousel :deep(.slick-next) {
  right: 0;
  height: 100%;
  top: 12px;
  width: 50%;
}
#map {
  height: 100vh;
}
.nounderline {
  text-decoration: none;
}
</style>
