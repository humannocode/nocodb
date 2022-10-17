<script setup lang="ts">
import { useVModel } from '#imports'

const props = defineProps<{
  value: any
}>()

const emit = defineEmits(['update:value'])

const vModel = useVModel(props, 'value', emit)

// cater existing v1 cases

// const picked = computed({
//   get: () => vModel.value.meta.color,
//   set: (val) => {
//     vModel.value.meta.color = val
//   },
// })

// set default value
vModel.value.meta = {
  iconIdx: 0,
  icon: {
    full: 'mdi-star',
    empty: 'mdi-star-outline',
  },
  color: '#fcb401',
  max: 5,
  ...vModel.value.meta,
}

// antdv doesn't support object as value
// use iconIdx as value and update back in watch
</script>

<template>
  <a-row :gutter="8">
    <a-col :span="12"> Placeholder for options (e.g. default geo data format) </a-col>
  </a-row>
</template>

<style scoped lang="scss">
.color-selector:hover {
  @apply brightness-90;
}

.color-selector.selected {
  @apply py-[5px] px-[10px] brightness-90;
}
</style>
