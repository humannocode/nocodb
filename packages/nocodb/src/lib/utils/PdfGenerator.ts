import { generate, Template } from '@pdfme/generator';
import { Request } from 'express';
import { UITypes } from 'nocodb-sdk';
import getAst from '../db/sql-data-mapper/lib/sql/helpers/getAst';
import Column from '../models/Column';
import Model from '../models/Model';
import View from '../models/View';
import { nocoExecute } from 'nc-help';
import NcConnectionMgrv2 from './common/NcConnectionMgrv2';
import Base from '../models/Base';

const basePdf =
  'data:application/pdf;base64,JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PAovRmlsdGVyIC9GbGF0ZURlY29kZQovTGVuZ3RoIDM4Cj4+CnN0cmVhbQp4nCvkMlAwUDC1NNUzMVGwMDHUszRSKErlCtfiyuMK5AIAXQ8GCgplbmRzdHJlYW0KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL01lZGlhQm94IFswIDAgNTk1LjQ0IDg0MS45Ml0KL1Jlc291cmNlcyA8PAo+PgovQ29udGVudHMgNSAwIFIKL1BhcmVudCAyIDAgUgo+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvUGFnZXMKL0tpZHMgWzQgMCBSXQovQ291bnQgMQo+PgplbmRvYmoKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL3RyYXBwZWQgKGZhbHNlKQovQ3JlYXRvciAoU2VyaWYgQWZmaW5pdHkgRGVzaWduZXIgMS4xMC40KQovVGl0bGUgKFVudGl0bGVkLnBkZikKL0NyZWF0aW9uRGF0ZSAoRDoyMDIyMDEwNjE0MDg1OCswOScwMCcpCi9Qcm9kdWNlciAoaUxvdmVQREYpCi9Nb2REYXRlIChEOjIwMjIwMTA2MDUwOTA5WikKPj4KZW5kb2JqCjYgMCBvYmoKPDwKL1NpemUgNwovUm9vdCAxIDAgUgovSW5mbyAzIDAgUgovSUQgWzwyODhCM0VENTAyOEU0MDcyNERBNzNCOUE0Nzk4OUEwQT4gPEY1RkJGNjg4NkVERDZBQUNBNDRCNEZDRjBBRDUxRDlDPl0KL1R5cGUgL1hSZWYKL1cgWzEgMiAyXQovRmlsdGVyIC9GbGF0ZURlY29kZQovSW5kZXggWzAgN10KL0xlbmd0aCAzNgo+PgpzdHJlYW0KeJxjYGD4/5+RUZmBgZHhFZBgDAGxakAEP5BgEmFgAABlRwQJCmVuZHN0cmVhbQplbmRvYmoKc3RhcnR4cmVmCjUzMgolJUVPRgo=';

type KeyValueLabelTransformer = (key: string, value: string) => string;

type PdfTemplateTypeDefinition = {
  type: 'text' | 'qrcode';
  fontSize?: number;
  height: number;
  width: number;
  keyValueLabelTransformer: KeyValueLabelTransformer;
};

const defaultKeyValueLabelTransformers = {
  onlyValue: (_k, v) => v,
  withKeyLabel: (k, v) => `${k}: ${v}`,
};

type UiTypesToPdfTemplateTypesMapping = {
  [key in UITypes]: PdfTemplateTypeDefinition;
};
const uiTypesToPdfTemplateTypesMapping: Partial<UiTypesToPdfTemplateTypesMapping> =
  {
    // TODO: think here about how in general more generic types could be mapped to specific sub types most elegantly
    // e.g. attachments can be images but also other file types
    // but PDF templates only understand images
    // [UITypes.Attachment]: {
    //   type: ''
    // }
    [UITypes.QrCode]: {
      type: 'qrcode',
      height: 50,
      width: 50,
      keyValueLabelTransformer: defaultKeyValueLabelTransformers.onlyValue,
    },
    [UITypes.SingleLineText]: {
      type: 'text',
      fontSize: 20,
      height: 20,
      width: 80,
      keyValueLabelTransformer: defaultKeyValueLabelTransformers.withKeyLabel,
    },
    // [UITypes.QrCode]: {
    //   type: '',
    //   fontSize: 20,
    //   height: 20,
    //   width: 80,
    // },
  };

const createTemplateConfigForActualColumn = (col: Column, idx: number) => ({
  position: { x: 10, y: idx * 20 },
  ...uiTypesToPdfTemplateTypesMapping[col.uidt],
});

export async function generatePdfForModelData(
  model: Model,
  req: Request,
  view: View
) {
  const base = await Base.get(model.base_id);

  const baseModel = await Model.getBaseModelSQL({
    id: model.id,
    viewId: view?.id,
    dbDriver: NcConnectionMgrv2.get(base),
  });

  const requestObj = await getAst({ model, query: req.query, view });

  const listArgs: any = { ...req.query };
  try {
    listArgs.filterArr = JSON.parse(listArgs.filterArrJson);
  } catch (e) {}
  try {
    listArgs.sortArr = JSON.parse(listArgs.sortArrJson);
  } catch (e) {}

  let data = [];
  // let count = 0;
  try {
    data = await nocoExecute(
      requestObj,
      await baseModel.list(listArgs),
      {},
      listArgs
    );
    // count = await baseModel.count(listArgs);
  } catch (e) {
    // show empty result instead of throwing error here
    // e.g. search some text in a numeric field
  }

  const supportedUiTypesInPdf = Object.keys(uiTypesToPdfTemplateTypesMapping);
  const templateSchema = Object.fromEntries(
    model.columns
      .filter((col) => supportedUiTypesInPdf.includes(col.uidt))
      .map((col, i) => {
        return [
          `value__${col.title}`,
          createTemplateConfigForActualColumn(col, i),
        ] as [string, any];
      })
  );

  const template: Template = {
    schemas: [templateSchema],
    basePdf: basePdf,
  };

  type ColIdToKeyValueTransformer = {
    [colId: string]: KeyValueLabelTransformer;
  };

  const colIdToKeyValueTransformer: ColIdToKeyValueTransformer =
    Object.fromEntries(
      model.columns.map((col) => {
        return [
          col.title,
          uiTypesToPdfTemplateTypesMapping[col.uidt]
            ?.keyValueLabelTransformer ||
            defaultKeyValueLabelTransformers.onlyValue,
        ];
      })
    );

  const pdfInputs: Record<string, string>[] = data.map((row) =>
    Object.fromEntries(
      Object.keys(row).map((key) => {
        const value = row[key];

        // const uidtOfCol = model.columns.find((c) => c.title === key).uidt;
        const transformedValueToPrint = colIdToKeyValueTransformer[key]?.(
          key,
          value
        );
        return [`value__${key}`, transformedValueToPrint];
      })
    )
  );

  const pdf = await generate({ template, inputs: pdfInputs });
  return pdf;
}
