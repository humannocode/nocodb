import * as pdfMake from 'pdfmake/build/pdfmake'
import * as pdfFonts from 'pdfmake/build/vfs_fonts'
import type { ColumnType } from 'nocodb-sdk'
import { UITypes } from 'nocodb-sdk'
import type { Content, ContentQr, TDocumentDefinitions } from 'pdfmake/interfaces'
import JsBarcode from 'jsbarcode'

import { useAttachment, useI18n } from '#imports'
;(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs

export function usePdfExport() {
  const { t } = useI18n()
  const { getAttachmentSrc } = useAttachment()

  const marginBottomDefault = 20
  const graphicsDefaultWidth = 100

  const defaultValueStyle = {
    marginBottom: marginBottomDefault,
    style: {
      bold: false,
      fontSize: 10,
    },
  }

  // const qrDefaultOptions = {
  //   eccLevel: 'M',
  //   margin: 1,
  //   // marginBottom: marginBottomDefault,
  //   version: 4,
  //   // fit: graphicsDefaultWidth,
  //   fit: '300',
  //   // width: graphicsDefaultWidth,
  // }
  // // as Omit<ContentQr, 'qr'>

  const simpleValueRendering = (cellValue: string): Content => ({
    text: `${cellValue}`,
    ...defaultValueStyle,
  })

  const getContentDefinitionForColumn = async (col: ColumnType, cellValue: any) => {
    switch (col.uidt) {
      case UITypes.SingleLineText: {
        return simpleValueRendering(cellValue)
      }
      case UITypes.LongText: {
        return simpleValueRendering(cellValue)
      }
      case UITypes.ID: {
        return simpleValueRendering(cellValue)
      }
      case UITypes.AutoNumber: {
        return simpleValueRendering(cellValue)
      }
      case UITypes.Number: {
        return simpleValueRendering(cellValue)
      }
      case UITypes.ForeignKey: {
        return simpleValueRendering(cellValue)
      }
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
      case UITypes.Barcode: {
        // Create a new SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

        // Generate the barcode and add it to the SVG element
        JsBarcode(svg, cellValue, {
          format: col?.meta?.barcodeFormat || 'CODE128',
          displayValue: true,
        })

        const svgString = new XMLSerializer().serializeToString(svg)

        return {
          svg: svgString,
          width: graphicsDefaultWidth,
        } as Content
      }
      case UITypes.QrCode: {
        // alert(cellValue)
        return {
          qr: `${cellValue}`,
          // qr: '1',
          fit: `${graphicsDefaultWidth}`,
          // errorCorrectionLevel: 'M',
          // margin: 1,
          // version: 1,
          // fit: 500,
          // mode: 'alphanumeric',
          // rendererOpts: {
          //   quality: 1,
          // },
          // ...qrDefaultOptions,
          // ...defaultValueStyle,
          marginBottom: marginBottomDefault,
        }
        // return {
        //   qr: 'text in Qasdaskdas dalskdaj dkljaslkd jaslkd jaslkdj adsasda dasdk ajsldkaj sdlkaj ldkajsdlk ajdlkaj ldkaj dR',
        // ...qrDefaultOptions,
        // fit: '500',
        // }
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
        console.log('cellValue', cellValue)
        const [latitude, longitude] = cellValue.split(';')
        console.log('latitude', latitude)
        console.log('longitude', longitude)
        const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`

        // return {
        //   // qr: 'text in Qasdaskdas dalskdaj dkljaslkd jaslkd jaslkdj adsasda dasdk ajsldkaj sdlkaj ldkajsdlk ajdlkaj ldkaj dR',
        //   // qr: 'https://www.google.com/maps/search/?api=1&query=52.5610523,13.3843785',
        //   qr: `${googleMapsLink}`,
        //   // ...qrDefaultOptions,
        //   fit: '200',
        // }
        return {
          ul: [
            {
              text: `Lat: ${latitude}; Long: ${longitude}`,
              ...defaultValueStyle,
              marginBottom: 3,
            },
            {
              text: 'Open in Google Maps',
              link: googleMapsLink,
              decoration: 'underline',
              ...defaultValueStyle,
              marginBottom: 3,
            } as Content,
            {
              // qr: 'text in Qasdaskdas dalskdaj dkljaslkd jaslkd jaslkdj adsasda dasdk ajsldkaj sdlkaj ldkajsdlk ajdlkaj ldkaj dR',
              // qr: 'https://www.google.com/maps/search/?api=1&query=52.5610523,13.3843785',
              qr: `${googleMapsLink}`,
              // ...qrDefaultOptions,
              fit: `${graphicsDefaultWidth}`,
            },
            //     // {
            //     //   qr: googleMapsLink,
            //     //   ...qrDefaultOptions,
            //     // } as Content,
            //     {
            //       // qr: 'text in Qasdaskdas dalskdaj dkljaslkd jaslkd jaslkdj adsasda dasdk ajsldkaj sdlkaj ldkajsdlk ajdlkaj ldkaj dR',
            //       // qr: 'https://www.google.com/maps/search/?api=1&query=52.5610523,13.3843785',
            //       qr: googleMapsLink,
            //       fit: '500',
            //     },
          ],
          marginBottom: marginBottomDefault,
        }
        // return simpleValueRendering(cellValue)
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
            ...defaultValueStyle,
            marginBottom: 3,
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
              ...defaultValueStyle,
              marginBottom: 3,
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

  const getContentDefinitionAndImageDictionaryForAttachmentColumn = async (
    col: ColumnType,
    cellValue: any,
    imageDictionaryKeyPrefix: string,
  ): Promise<[Content, { [key: string]: string }]> => {
    const imageContentDefinitionList: Content[] = []
    const imageDictionaryEntries: { [key: string]: string } = {}
    const imgAttachments = cellValue?.filter?.((attObj: any) => isImage(attObj.attObj, attObj.mimetype))
    if (imgAttachments?.length > 0) {
      for (let imgAttachmentIdx = 0; imgAttachmentIdx < imgAttachments.length; imgAttachmentIdx++) {
        const imgAttachment = imgAttachments[imgAttachmentIdx]
        if (!imgAttachment) {
          continue
        }
        const imageSrc = await getAttachmentSrc(imgAttachment)
        const imageDictionaryKey = `${imageDictionaryKeyPrefix}_${imgAttachmentIdx}`
        imageDictionaryEntries[imageDictionaryKey] = imageSrc
        imageContentDefinitionList.push(
          {
            text: imgAttachment.title || imageSrc,
            link: imageSrc,
            marginBottom: 10,
            style: {
              bold: false,
              fontSize: 10,
            },
          },
          {
            image: imageDictionaryKey,
            marginBottom: 10,
            width: graphicsDefaultWidth,
          },
        )
      }
    }
    return [
      {
        ul: imageContentDefinitionList,
        marginBottom: marginBottomDefault,
      } as Content,
      imageDictionaryEntries,
    ]
  }

  const getDocDefinitionForSelectedRows = async (selectedRows: Record<string, any>[], fieldsForPdf: ColumnType[]) => {
    const docDefinitionContent: Content = []
    let imagesDictionary: { [key: string]: string } = {}

    for (let rowIdx = 0; rowIdx < selectedRows.length; rowIdx++) {
      const row = selectedRows[rowIdx]
      for (let colIdx = 0; colIdx < fieldsForPdf.length; colIdx++) {
        const col = fieldsForPdf[colIdx]
        const cellValue = row[col.title!]

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
          let contentDefinitionForCell: Content
          if (col.uidt === UITypes.Attachment) {
            const imageDictionaryKeyPrefix = `${rowIdx}-${colIdx}`
            const [contentDefinitionForAttachmentCell, entriesForImageDictionary] =
              await getContentDefinitionAndImageDictionaryForAttachmentColumn(col, cellValue, imageDictionaryKeyPrefix)
            imagesDictionary = { ...imagesDictionary, ...entriesForImageDictionary }
            contentDefinitionForCell = contentDefinitionForAttachmentCell
          } else {
            contentDefinitionForCell = await getContentDefinitionForColumn(col, cellValue)
          }
          docDefinitionContent.push(contentDefinitionForCell)
        }
      }
    }

    const docDefinition: TDocumentDefinitions = {
      // content: docDefinitionContent,
      content: [...docDefinitionContent],
      images: imagesDictionary,
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
