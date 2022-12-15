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
import fs from 'fs';
// import path from 'path';
import axios from 'axios';

const basePdf =
  'data:application/pdf;base64,JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PAovRmlsdGVyIC9GbGF0ZURlY29kZQovTGVuZ3RoIDM4Cj4+CnN0cmVhbQp4nCvkMlAwUDC1NNUzMVGwMDHUszRSKErlCtfiyuMK5AIAXQ8GCgplbmRzdHJlYW0KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL01lZGlhQm94IFswIDAgNTk1LjQ0IDg0MS45Ml0KL1Jlc291cmNlcyA8PAo+PgovQ29udGVudHMgNSAwIFIKL1BhcmVudCAyIDAgUgo+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvUGFnZXMKL0tpZHMgWzQgMCBSXQovQ291bnQgMQo+PgplbmRvYmoKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL3RyYXBwZWQgKGZhbHNlKQovQ3JlYXRvciAoU2VyaWYgQWZmaW5pdHkgRGVzaWduZXIgMS4xMC40KQovVGl0bGUgKFVudGl0bGVkLnBkZikKL0NyZWF0aW9uRGF0ZSAoRDoyMDIyMDEwNjE0MDg1OCswOScwMCcpCi9Qcm9kdWNlciAoaUxvdmVQREYpCi9Nb2REYXRlIChEOjIwMjIwMTA2MDUwOTA5WikKPj4KZW5kb2JqCjYgMCBvYmoKPDwKL1NpemUgNwovUm9vdCAxIDAgUgovSW5mbyAzIDAgUgovSUQgWzwyODhCM0VENTAyOEU0MDcyNERBNzNCOUE0Nzk4OUEwQT4gPEY1RkJGNjg4NkVERDZBQUNBNDRCNEZDRjBBRDUxRDlDPl0KL1R5cGUgL1hSZWYKL1cgWzEgMiAyXQovRmlsdGVyIC9GbGF0ZURlY29kZQovSW5kZXggWzAgN10KL0xlbmd0aCAzNgo+PgpzdHJlYW0KeJxjYGD4/5+RUZmBgZHhFZBgDAGxakAEP5BgEmFgAABlRwQJCmVuZHN0cmVhbQplbmRvYmoKc3RhcnR4cmVmCjUzMgolJUVPRgo=';

const placeholderImageBase64 =
  'data:image/png;base64,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rzzzhYAbAnXfgNZGQEhB3bxA9AoBCIjUdX1JXkDqvkPg5YYABKolUKcKR5ICUicHVvtqMBoEIJCHQOob2GQEpK4pZJ5gpi0EIOCHQKrrU/QCkrrC+wl3RoUABFwRSKlCEqWApOQAV0FKvxCAQPgEYt8ARyMgqaaA4Yc4FkIAAq4JxLq+BS8gsSu068CjfwhAIC0CMVVYghSQmACmFbrMBgIQCIlA6BvoYAQk1hQupGDDFghAIE0Coa6P3gUkdIVNMxyZFQQgECuBkCo0XgQkJACxBhF2QwACaRB4//33Zb311pOtt956woQ+/vhj6e3tNT+Tr6+//lpGRkZkgw02EN2E65raaNvT07NWMKOjo/LJJ5/IDjvs0Gzzxx9/yI8//jjhmfb2dtlwww2bn/3666/y+eefy3bbbSfrrrtu8/PKBCTUFCyNEGQWEIBAjAQ++ugjmTlzplx11VVyxRVXmCnoQn3wwQfLhx9+aH4/+eST5Z577pF11llHfv/9d5kzZ44888wz5t7OO+8sr732mqhoNKo5+nlDTDo6OiZgefTRR2Xu3Lny008/NT9/9913Zdddd53Q7vDDD5fnnnvOfHbttdfKZZddZv5bBUvH22233czvzgWEElWMYY3NEICAawK6qd5nn33k7bffniAgRx99tHz11Vfy1FNPmWzhgAMOkNtvv90s/DfffLMRmldeeUX6+vrksMMOk1122UUee+yxprlTVXhUjO6//355+OGHTbvxAvLkk0/KpZdeau43rhkzZsj2229vbNtjjz3kvvvuExWV8847T15++WVZs2aNaJbiREAoUbkOPfqHAARiJ3D55ZebXb6WhI466igjDN98841svvnm8tJLL8lBBx1kpnjssccaQVmyZInsuOOOJgPRjEWv2267Tc4880yTfZx00kmmDHbLLbeYe/PnzzelqauvvtoIzNKlS+XTTz+Vzz77bIKA3HDDDbJixYqmuIznunDhQiMir7/+uvl4YGDAZD2vvvqqHHjggeUJCCWq2MMZ+yEAgaoIqBjsv//+8sEHH8gZZ5xhxEIF5M0335S9997bLPwbbbSRMefKK6+Um266yYiE7vpVdDQb0EuzAS13aT96ZqJC9Pjjj4uedZx44olGNDSDaKzPKjg33nijaatlLi1xaWazePFi87ueh5xyyily3HHHycYbbyyHHHKIKW9df/31Zjw9C1l//fXl7rvvltNOO611AaFEVVXIMQ4EIJACgR9++MGUh6677jqzCO+3335NAdEzihNOOEH+/PNPaWtrM9PV8tGpp55qMgfNMN544w3Za6+9zL3GGYpmCbvvvrssWLBAHnzwQXNPy1IXX3zxBGRaCrvgggvkvffeM4KkZyd6xvLtt9/KNddcYzId/VfHeeutt2SbbbaRs846Sy666KJmP5ohab+anRQqYVGiSiGMmQMEIOCDgJaWXnzxRbn11lvNwbguxHqOMW/ePFPO0gxkaGhINtlkE2Oetrv33nvNgt7Z2WkO0PWcRK+VK1eaZ1UMNGNolMD0sFv7mHyIrgJy4YUXNktY+tzg4KAMDw/LFltsYbKQJ554wmQh+u2wc88915TNNGtpXCpszz77rBx55JHZBYQSlY9QY0wIQCA1Auecc44Rg8al2cNmm21mhOOhhx4yJaJG6UnbqOBoaenOO+80h+7HHHOMnH/++ebxRYsWmYziiy++ML+fffbZ5jD8559/Nou+HnqPvyYLiAqHHqzrQX3jm1xq2+mnn24Oyu+66y5ZtmyZEQy99LOtttrKnKVolmLNQChRpRa+zAcCEAiJgJ4zqDA0vsarZxaaDagQPP/886ak9cgjj8jxxx8vl1xyiclGVGC03KQlMH32jjvuMG31bEQX+1WrVplMQzMUPfRuXJMFRD/X8VVw9GBchUEFS89a9HB9+fLlRkxeeOEFmTVrlsmWtE89Q9FMZEoBoUQVUnhhCwQgkDKByQKii79+w0nLUXrpGUTjm1X69dsjjjjCnIPoteeee5pymP59iJ6rHHroofLAAw+Y3/fdd19TqtJvWKkg6KVCoxnL+K/xvvPOO+YgX//Va9ttt5Wnn35adtppJ/nuu+9MFqN96rXpppsaoZk9e7b5vSkg+p3iLH+IkrIjmRsEIACBEAhoyWr16tXS398v+jcZky89UNfzEy0nlXXpHzDqteWWW5q+x1+a7eiBvZ6RaObR+ENFPWdpGxgY+GtsbEy6urqku7v7fwcvZRlIPxCAAAQgEDcBPQ/XsxP9X6loZvM3n5FgD7cQHokAAAAASUVORK5CYII=';

type KeyValueLabelTransformer = (key: string, value: string) => Promise<string>;

type PdfTemplateTypeDefinition = {
  type: 'text' | 'qrcode' | 'image';
  fontSize?: number;
  // fontName?: string;
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

// const getFilePathFromImageUrl = (imgUrl: string) => {
//   const imgUrlSegments = imgUrl.split('/');
//   console.log(imgUrlSegments);
//   console.log('JSON.stringify(process.env)', JSON.stringify(process.env));
//   // const port = process.env['PORT'];

//   return path.join(
//     __dirname,
//     '..',
//     '..',
//     '..',
//     'nc',
//     'uploads',
//     'noco',
//     'Foo',
//     'Foo',
//     'Attachment',
//     'H-PeR8.jpg'
//   );
// };

const getBase64OfAttachmentImageOrPlaceholderImage = async (value: any) => {
  const firstAttachment = value?.[0];
  if (firstAttachment == null || firstAttachment['mimetype'] !== 'image/jpeg') {
    return placeholderImageBase64;
  }
  const imgUrl = firstAttachment?.['url'];
  if (imgUrl) {
    console.log('fs', await fs.promises.realpath('.'));
    // TODO: make base, project, table, view and column names dynamic
    // console.log('__dirname', __dirname);
    // console.log('path', path);
    // const imgFilePath = getFilePathFromImageUrl(imgUrl);
    // // path.join(__dirname)
    // const imgFile = await fs.promises.readFile(imgFilePath);

    // return Buffer.from(imgFile.buffer).toString('base64');

    const image = await axios.get(imgUrl, {
      responseType: 'arraybuffer',
    });
    return Buffer.from(image.data).toString('base64');
  } else {
    return placeholderImageBase64;
  }
};

const uiTypesToPdfTemplateTypesMapping: Partial<UiTypesToPdfTemplateTypesMapping> =
  {
    // TODO: think here about how in general more generic types could be mapped to specific sub types most elegantly
    // e.g. attachments can be images but also other file types
    // but PDF templates only understand images
    [UITypes.Attachment]: {
      type: 'image',
      height: 50,
      width: 50,
      keyValueLabelTransformer: async (_key: string, value: any) => {
        // let imgAsBase64: string;
        // const firstAttachment = value?.[0];
        // const imgUrl = firstAttachment?.['url'];
        // if (imgUrl) {
        //   console.log('fs', fs);
        //   const imgFilePath = getFilePathFromImageUrl(imgUrl);
        //   const imgFile = await fs.promises.readFile(imgFilePath);
        //   // fs.readFile(imgFilePath);
        //   // const image = await axios.get(imgUrl, {
        //   //   responseType: 'arraybuffer',
        //   // });
        //   imgAsBase64 = Buffer.from(imgFile.buffer).toString('base64');
        //   // imgAsBase64 = placeholderImageBase64;
        // } else {
        //   imgAsBase64 = placeholderImageBase64;
        // }

        // value[]
        return getBase64OfAttachmentImageOrPlaceholderImage(value);
        // return sampleImage;
        // return Promise.resolve(sampleImage);
        // value[]
        // return value?.[0]?.['url'] ?? 'https://freesvg.org/img/Placeholder.png';
      },
    },
    [UITypes.QrCode]: {
      type: 'qrcode',
      height: 50,
      width: 50,
      keyValueLabelTransformer: defaultKeyValueLabelTransformers.onlyValue,
    },
    [UITypes.SingleLineText]: {
      type: 'text',
      fontSize: 20,
      // fontName: 'Courier-Bold',
      height: 50,
      width: 80,
      // keyValueLabelTransformer: defaultKeyValueLabelTransformers.withKeyLabel,
      keyValueLabelTransformer: defaultKeyValueLabelTransformers.onlyValue,
    },
    // [UITypes.QrCode]: {
    //   type: '',
    //   fontSize: 20,
    //   height: 20,
    //   width: 80,
    // },
  };

const globalMarginTop = 20;

const createTemplateConfigForLabel = (idx: number) => ({
  position: { x: 20, y: globalMarginTop + idx * 80 },
  type: 'text',
  fontSize: 20,
  height: 20,
  width: 80,
});

const createTemplateConfigForValue = (col: Column, idx: number) => ({
  position: { x: 100, y: globalMarginTop + idx * 80 },
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

  const visibleViewColumns = await (
    await view.getColumns()
  ).filter((c) => c.show);
  const selectedColumns = visibleViewColumns.map((c) => {
    return model.columns?.find((c2) => c2.id === c.fk_column_id);
  });

  const supportedUiTypesInPdf = Object.keys(uiTypesToPdfTemplateTypesMapping);
  const templateSchema = Object.fromEntries(
    selectedColumns
      .filter((col) => supportedUiTypesInPdf.includes(col.uidt))
      .flatMap((col, i) => {
        return [
          [`label__${col.title}`, createTemplateConfigForLabel(i)],
          [`value__${col.title}`, createTemplateConfigForValue(col, i)],
        ] as [string, any][];
      })
  );

  // const FOO_ENRICHED_WITH_LABELS = templateSchema;
  // label__${key}

  const template: Template = {
    schemas: [templateSchema],
    basePdf: basePdf,
  };

  type ColIdToKeyValueTransformer = {
    [colId: string]: KeyValueLabelTransformer;
  };

  const colIdToKeyValueTransformer: ColIdToKeyValueTransformer =
    Object.fromEntries(
      selectedColumns.map((col) => {
        return [
          col.title,
          uiTypesToPdfTemplateTypesMapping[col.uidt]?.keyValueLabelTransformer,
          //  ||
          // defaultKeyValueLabelTransformers.onlyValue,
        ];
      })
    );

  const FOO_MAP_FUNC = async (row) => {
    const FOO = async (key) => {
      const value = row[key];

      // const uidtOfCol = model.columns.find((c) => c.title === key).uidt;
      const transformedValueToPrint = await colIdToKeyValueTransformer[key]?.(
        key,
        value
      );
      const colIdValueMapping = [`value__${key}`, transformedValueToPrint];
      const colIdLabelMapping = [`label__${key}`, key];
      return [colIdLabelMapping, colIdValueMapping];
    };
    const FOO_2 = Object.keys(row).flatMap(FOO);
    const FOO_3 = await Promise.all(FOO_2);
    const FOO_4 = FOO_3.flat();
    return (await Object.fromEntries(FOO_4)) as Record<string, string>;
  };

  const FOO_10 = Promise.all(data.map(FOO_MAP_FUNC));
  const pdfInputs = await FOO_10;

  const pdf = await generate({ template, inputs: pdfInputs });
  return pdf;
}
