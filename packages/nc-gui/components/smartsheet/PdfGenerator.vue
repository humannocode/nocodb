<script lang="ts" setup>
// TODO: remove this local/temp auth token for testing
// replace with real/dybamic auth token header used for other API calls

const { token } = $(useGlobal())

function saveBlob(blob: string, fileName: string) {
  const a = document.createElement('a')
  a.href = window.URL.createObjectURL(blob)
  a.download = fileName
  a.dispatchEvent(new MouseEvent('click'))
}
const downloadPdf = () => {
  const postData = new FormData()
  // postData.append('cells', JSON.stringify(output))

  const xhr = new XMLHttpRequest()
  xhr.open('GET', 'http://localhost:8080/api/v1/db/meta/pdf-generators/vw_byojjt2scf1qj4/export', true)
  xhr.setRequestHeader('xc-auth', token)
  xhr.responseType = 'blob'
  xhr.onload = function (e) {
    if (e.currentTarget.status === 200) {
      const blob = e.currentTarget.response
      // const contentDispo = e.currentTarget.getResponseHeader('Content-Disposition')
      // // https://stackoverflow.com/a/23054920/
      // const fileName = contentDispo.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)[1]
      const fileName = 'test.pdf'
      saveBlob(blob, fileName)
    }
  }
  xhr.send(postData)
}

</script>

<template>
  <div class="flex h-full bg-white px-2" data-testid="nc-pdf-generator-wrapper">
    <div ref="pdfGeneratorContainerRef"
      class="nc-pdf-generator-container flex my-4 px-3 overflow-x-scroll overflow-y-hidden"
      @click="downloadPdf"
    >
      Download PDF now
    </div>
  </div>
</template>

<style lang="scss" scoped>
// override ant design style
</style>
