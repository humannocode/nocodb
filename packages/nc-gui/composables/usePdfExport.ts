import * as pdfMake from 'pdfmake/build/pdfmake'
import * as pdfFonts from 'pdfmake/build/vfs_fonts'
import type { ColumnType } from 'nocodb-sdk'
import { UITypes } from 'nocodb-sdk'
import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces'

import { useI18n } from '#imports'
;(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs

export function usePdfExport() {
  const { t } = useI18n()

  const marginBottomDefault = 20

  const defaultValueStyle = {
    marginBottom: marginBottomDefault,
    style: {
      bold: false,
      fontSize: 10,
    },
  }

  const simpleValueRendering = (cellValue: string): Content => ({
    text: `${cellValue}`,
    ...defaultValueStyle,
  })

  const getContentDefinitionForColumn = (col: ColumnType, cellValue: any) => {
    console.log('FOO getContentDefinitionForColumn - col', col)
    switch (col.uidt) {
      case UITypes.SingleLineText: {
        return simpleValueRendering(cellValue)
      }
      case UITypes.LongText: {
        return simpleValueRendering(cellValue)
      }
      case UITypes.Number: {
        return simpleValueRendering(cellValue)
      }
      // case UITypes.Attachment: {
      //   const imgAttachments = cellValue?.filter?.((attObj: any) => isImage(attObj.attObj, attObj.mimetype))
      //   if (!imgAttachments?.length) {
      //     break
      //   }
      //   console.log('imgAttachments', imgAttachments)
      //   for (let imgAttachmentIdx = 0; imgAttachmentIdx < imgAttachments.length; imgAttachmentIdx++) {
      //     const imgAttachment = imgAttachments[imgAttachmentIdx]
      //     if (!imgAttachment) {
      //       continue
      //     }
      //     const imgDataUrl = await toDataURL(imgAttachment.url)
      //     console.log('FOO imgDataUrl', imgDataUrl)
      //     // { qr: 'text in QR' },

      //     docDefinitionContent.push({
      //       image: imgDataUrl,
      //       width: 100,
      //     })

      //   }
      //   // const firstImgAttachment = imgAttachments?.[0]
      //   // if (!firstImgAttachment) {
      //   //   break
      //   // }

      //   break
      // }
      case UITypes.SingleSelect: {
        return simpleValueRendering(cellValue)
      }
      case UITypes.MultiSelect: {
        const multiSelectValuesAsListContentConfig: Content = {
          ul: cellValue.split(',').map((multiSelectValue: string) => ({
            text: `${multiSelectValue}`,
            marginBottom: 3,
            style: {
              bold: false,
              fontSize: 10,
            },
          })),
          marginBottom: marginBottomDefault,
        }
        return multiSelectValuesAsListContentConfig
      }
      case UITypes.Checkbox: {
        const checkboxValueAsYesOrNo = cellValue ? 'Yes' : 'No'
        return simpleValueRendering(checkboxValueAsYesOrNo)
      }
      case UITypes.QrCode: {
        return {
          qr: cellValue,
          eccLevel: 'M',
          version: 4,
          marginBottom: marginBottomDefault,
        } as Content
      }
      case UITypes.Formula: {
        return simpleValueRendering(cellValue)
      }
      case UITypes.Date: {
        return simpleValueRendering(cellValue)
      }
      case UITypes.DateTime: {
        return simpleValueRendering(cellValue)
      }
      case UITypes.Year: {
        return simpleValueRendering(cellValue)
      }
      case UITypes.Time: {
        return simpleValueRendering(cellValue)
      }
      case UITypes.PhoneNumber: {
        return simpleValueRendering(cellValue)
      }
      case UITypes.Decimal: {
        return simpleValueRendering(cellValue)
      }
      case UITypes.Currency: {
        let formattedCurrency: string
        try {
          formattedCurrency =
            !cellValue || isNaN(cellValue)
              ? cellValue
              : new Intl.NumberFormat(col?.meta?.currency_locale || 'en-US', {
                  style: 'currency',
                  currency: col?.meta?.currency_code || 'USD',
                }).format(cellValue)
        } catch (e) {
          formattedCurrency = cellValue
        }
        return simpleValueRendering(formattedCurrency)
      }
      case UITypes.Percent: {
        return simpleValueRendering(`${cellValue}%`)
      }
      case UITypes.Duration: {
        // const duration = dayjs.duration(parseInt(cellValue), 'seconds')
        // const days = duration.days().toString().padStart(2, '0');
        // const hours = duration.hours().toString().padStart(2, '0');
        // const minutes = duration.minutes().toString().padStart(2, '0');
        // const seconds = duration.seconds().toString().padStart(2, '0');

        // const formatedDuration = `${days}:${hours}:${minutes}:${seconds} (DD:HH:MM:SS))`;
        // const formatedDuration = `${duration.format('hh:mm:ss')} (hh:mm:ss))`
        const durationOptionId = col.meta?.duration
        const formatedDuration = convertMS2Duration(parseInt(cellValue), durationOptionId)

        return simpleValueRendering(`${formatedDuration} (${durationOptions[durationOptionId].title})`)
        break
      }
      case UITypes.Rating: {
        const ratingValueAsStars = `${cellValue} (out of ${col?.meta?.max || 5})`
        return simpleValueRendering(ratingValueAsStars)
        break
      }
      case UITypes.GeoData: {
        return simpleValueRendering(cellValue)
      }
      case UITypes.Geometry: {
        return simpleValueRendering(cellValue)
      }
      case UITypes.JSON: {
        return simpleValueRendering(cellValue)
      }
      case UITypes.SpecificDBType: {
        return simpleValueRendering(cellValue)
      }
      case UITypes.Lookup: {
        const lookupEntriesAsListContentConfig: Content = {
          ul: cellValue.map((lookupEntryValue: string) => ({
            text: `${lookupEntryValue}`,
            marginBottom: 3,
            style: {
              bold: false,
              fontSize: 10,
            },
          })),
          marginBottom: marginBottomDefault,
        }
        return lookupEntriesAsListContentConfig
        break
      }
      case UITypes.LinkToAnotherRecord: {
        let contentDefinitionForCell: Content
        if (Array.isArray(cellValue)) {
          contentDefinitionForCell = {
            ul: cellValue.map((ltarEntry) => ({
              text: `${ltarEntry.Title} (${ltarEntry.Id})`,
              marginBottom: 3,
              style: {
                bold: false,
                fontSize: 10,
              },
            })),
            marginBottom: marginBottomDefault,
          }
        } else {
          contentDefinitionForCell = simpleValueRendering(`${cellValue.Title} (${cellValue.Id})`)
        }
        return contentDefinitionForCell
      }
      case UITypes.Rollup: {
        return simpleValueRendering(cellValue)
      }
      case UITypes.Email: {
        return {
          text: cellValue,
          link: cellValue,
          ...defaultValueStyle,
        }
      }
      case UITypes.URL: {
        return {
          text: cellValue,
          link: cellValue,
          ...defaultValueStyle,
        }
      }
      default: {
        return {
          text: `[PDF export for column type '${col.uidt}' not supported]`,
          marginBottom: marginBottomDefault,
          style: {
            bold: false,
            fontSize: 10,
          },
        }
      }
    }
  }

  // const toDataURL = async (url: string): Promise<string> => {
  //   const xhr = new XMLHttpRequest()
  //   xhr.open('GET', url)
  //   xhr.responseType = 'blob'
  //   xhr.send()

  //   return new Promise((resolve, _reject) => {
  //     xhr.onload = function () {
  //       const reader = new FileReader()
  //       reader.onloadend = function () {
  //         resolve(reader.result?.toString() || '')
  //       }
  //       reader.readAsDataURL(xhr.response)
  //     }
  //   })
  // }

  // const FOO_IMG_URL = 'https://www.gravatar.com/avatar/d50c83cc0c6523b4d3f6085295c953e0'
  // const FOO_IMG_DATA_URL: string = await toDataURL(FOO_IMG_URL)
  // console.log('FOO', FOO_IMG_DATA_URL)

  // var docDefinition: TDocumentDefinitions = {
  //   content: [
  //     // if you don't need styles, you can use a simple string to define a paragraph
  //     'This is a standard paragraph, using default style',

  //     // using a { text: '...' } object lets you set styling properties
  //     { text: 'This paragraph will have a bigger font', fontSize: 15 },

  //     // if you set the value of text to an array instead of a string, you'll be able
  //     // to style any part individually
  //     {
  //       text: [
  //         'This paragraph is defined as an array of elements to make it possible to ',
  //         { text: 'restyle part of it and make it bigger ', fontSize: 15 },
  //         'than the rest.'
  //       ]
  //     },
  //     {
  //       image: FOO_IMG_DATA_URL,
  //       width: 100,
  //       height: 100,
  //     }
  //   ]
  // };

  // const svgRulerLine = {
  //   svg: '<svg width="300" height="5" viewBox="0 0 300 5"><line x1="0" x2="100%" stroke="black" stroke-width="2" /></svg>',
  //   // fit: [150, 100]
  //   width: 300,
  //   marginTop: 10,
  //   marginBottom: 20,
  // }

  const getDocDefinitionForSelectedRows = async (selectedRows: Record<string, any>[], fieldsForPdf: ColumnType[]) => {
    const docDefinitionContent: Content = []

    // TODO: to make the image to data url processing (which also includes downloading images) in parallel:
    // use a promise/await approach here
    // But to respect the order of images/attachments/qr codes etc:
    // 1. Extract the images out int keyed/named images array (PdfMake.js supports this)
    // and do the processing with Promise.all, map and async/await
    // 2. The image config entries will still be created in order (and synchronously)
    // For linking them, an idea for an image key could be `${rowIdx}-${columnName}`
    //
    for (let rowIdx = 0; rowIdx < selectedRows.length; rowIdx++) {
      const row = selectedRows[rowIdx]
      for (let colIdx = 0; colIdx < fieldsForPdf.length; colIdx++) {
        const col = fieldsForPdf[colIdx]
        const cellValue = row[col.title!]

        // if (colIdx === 0) {
        //   docDefinitionContent.push(svgRulerLine)
        // }
        docDefinitionContent.push({
          text: col.title || '',
          marginBottom: 7,
          decoration: colIdx === 0 ? 'underline' : undefined,
          style: {
            bold: true,
            fontSize: 20,
          },
          pageBreak: colIdx === 0 && rowIdx !== 0 ? 'before' : undefined,
        })

        if (cellValue == null || cellValue === '') {
          docDefinitionContent.push({
            text: `[EMPTY]`,
            italics: true,
            marginBottom: marginBottomDefault,
          })
        } else {
          const contentDefinitionForCell = getContentDefinitionForColumn(col, cellValue)
          docDefinitionContent.push(contentDefinitionForCell)
        }
      }
    }

    const docDefinition: TDocumentDefinitions = {
      content: docDefinitionContent,
    }

    return docDefinition
  }

  const exportPdfForRowsAndColumns = async (rows: Record<string, any>[], columns: ColumnType[], pdfFileName: string) => {
    if (rows.length && columns?.length) {
      const docDefinition = await getDocDefinitionForSelectedRows(rows, columns)
      pdfMake.createPdf(docDefinition).download(pdfFileName)
    } else {
      message.error(t('Please select at least one row and column'))
    }
  }

  return { exportPdfForRowsAndColumns }
}
