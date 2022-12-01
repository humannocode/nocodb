import { Request, Response, Router } from 'express';
import { PdfGeneratorType, ViewTypes } from 'nocodb-sdk';
import View from '../../models/View';
import { Tele } from 'nc-help';
import ncMetaAclMw from '../helpers/ncMetaAclMw';
import { nocoExecute } from 'nc-help';
import { metaApiMetrics } from '../helpers/apiMetrics';
import PdfGeneratorView from '../../models/PdfGeneratorView';
import NcConnectionMgrv2 from '../../utils/common/NcConnectionMgrv2';
import Model from '../../models/Model';
import getAst from '../../db/sql-data-mapper/lib/sql/helpers/getAst';
import Base from '../../models/Base';
import { generate, Template } from '@pdfme/generator';

export async function pdfGeneratorViewGet(
  req: Request,
  res: Response<PdfGeneratorType>
) {
  res.json(await PdfGeneratorView.get(req.params.pdfGeneratorViewId));
}

const BLANK_PDF =
  'data:application/pdf;base64,JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PAovRmlsdGVyIC9GbGF0ZURlY29kZQovTGVuZ3RoIDM4Cj4+CnN0cmVhbQp4nCvkMlAwUDC1NNUzMVGwMDHUszRSKErlCtfiyuMK5AIAXQ8GCgplbmRzdHJlYW0KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL01lZGlhQm94IFswIDAgNTk1LjQ0IDg0MS45Ml0KL1Jlc291cmNlcyA8PAo+PgovQ29udGVudHMgNSAwIFIKL1BhcmVudCAyIDAgUgo+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvUGFnZXMKL0tpZHMgWzQgMCBSXQovQ291bnQgMQo+PgplbmRvYmoKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL3RyYXBwZWQgKGZhbHNlKQovQ3JlYXRvciAoU2VyaWYgQWZmaW5pdHkgRGVzaWduZXIgMS4xMC40KQovVGl0bGUgKFVudGl0bGVkLnBkZikKL0NyZWF0aW9uRGF0ZSAoRDoyMDIyMDEwNjE0MDg1OCswOScwMCcpCi9Qcm9kdWNlciAoaUxvdmVQREYpCi9Nb2REYXRlIChEOjIwMjIwMTA2MDUwOTA5WikKPj4KZW5kb2JqCjYgMCBvYmoKPDwKL1NpemUgNwovUm9vdCAxIDAgUgovSW5mbyAzIDAgUgovSUQgWzwyODhCM0VENTAyOEU0MDcyNERBNzNCOUE0Nzk4OUEwQT4gPEY1RkJGNjg4NkVERDZBQUNBNDRCNEZDRjBBRDUxRDlDPl0KL1R5cGUgL1hSZWYKL1cgWzEgMiAyXQovRmlsdGVyIC9GbGF0ZURlY29kZQovSW5kZXggWzAgN10KL0xlbmd0aCAzNgo+PgpzdHJlYW0KeJxjYGD4/5+RUZmBgZHhFZBgDAGxakAEP5BgEmFgAABlRwQJCmVuZHN0cmVhbQplbmRvYmoKc3RhcnR4cmVmCjUzMgolJUVPRgo=';
// const template: Template = {
//   basePdf: BLANK_PDF,
//   schemas: [
//     {
//       Id: {
//         type: 'text',
//         position: { x: 0, y: 0 },
//         width: 10,
//         height: 10,
//       },
//       cool2: {
//         type: 'text',
//         position: { x: 10, y: 10 },
//         width: 10,
//         height: 10,
//       },
//       // c: {
//       //   type: 'text',
//       //   position: { x: 20, y: 20 },
//       //   width: 10,
//       //   height: 10,
//       // },
//     },
//   ],
// };

const template: Template = {
  basePdf: BLANK_PDF,
  schemas: [
    {
      a: {
        type: 'text',
        position: { x: 0, y: 0 },
        width: 10,
        height: 10,
      },
      b: {
        type: 'text',
        position: { x: 10, y: 10 },
        width: 10,
        height: 10,
      },
      c: {
        type: 'text',
        position: { x: 20, y: 20 },
        width: 10,
        height: 10,
      },
    },
  ],
};

export async function pdfGeneratorViewGetExport(
  req: Request,
  res: Response<PdfGeneratorType>,
  next
) {
  console.log('req.params.viewId', req.params.viewId);
  const view = await View.get(req.params.viewId);
  console.log('view', JSON.stringify(view));

  const model = await Model.getByIdOrName({
    id: view?.fk_model_id || req.params.viewId,
  });

  if (!model) return next(new Error('Table not found'));

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

  // return new PagedResponseImpl(data, {
  //   ...req.query,
  //   count,
  // });

  // res.json(await getDataList(model, view, req));

  console.log('data', data);

  // const pdfInputs = data.map((row) => ({
  //   Id: row.Id,
  //   cool2: row.cool2,
  // }));
  const pdfInputs = [{ a: 'a1', b: 'b1', c: 'c1' }];

  console.log('pdfInputs', pdfInputs);

  const stream = res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment;filename=invoice.pdf`,
  });

  const pdf = await generate({ template, inputs: pdfInputs });
  // .then((pdf) => {
  console.log(pdf);

  // Browser
  // const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
  // window.open(URL.createObjectURL(blob));

  // Node.js
  // fs.writeFileSync(path.join(__dirname, `test.pdf`), pdf);
  await stream.write(pdf);
  // });

  stream.end();
  next();

  // const doc = new PDFDocument({ bufferPages: true, font: 'Courier' });

  // doc.on('data', (chunk) => stream.write(chunk));
  // doc.on('end', () => stream.end());

  // // TODO: get fields to render from view config
  // const columnIdAndTitlesToRender = [
  //   { id: 'Title', label: 'Title' },
  //   { id: 'cool2', label: 'Label for field cool2' },
  // ];
  // data.forEach((row, i) => {
  //   doc.fontSize(20).text(`Label for row id '${row['Id']}'`);
  //   columnIdAndTitlesToRender.forEach((col) => {
  //     doc.fontSize(12).text(`${col.label}: ${row[col.id]}`);
  //   });
  //   if (i + 1 < data.length) doc.addPage();
  // });

  // doc.end();

  next();
}

export async function pdfGeneratorViewCreate(req: Request<any, any>, res) {
  Tele.emit('evt', { evt_type: 'vtable:created', show_as: 'pdf-generator' });
  const view = await View.insert({
    ...req.body,
    // todo: sanitize
    fk_model_id: req.params.tableId,
    type: ViewTypes.PDF_GENERATOR_VIEW,
  });
  res.json(view);
}

export async function pdfGeneratorViewUpdate(req, res) {
  Tele.emit('evt', { evt_type: 'view:updated', type: 'pdf-generator' });
  res.json(
    await PdfGeneratorView.update(req.params.pdfGeneratorViewId, req.body)
  );
}

const router = Router({ mergeParams: true });

router.post(
  '/api/v1/db/meta/tables/:tableId/pdf-generators',
  metaApiMetrics,
  ncMetaAclMw(pdfGeneratorViewCreate, 'pdfGeneratorViewCreate')
);
router.patch(
  '/api/v1/db/meta/pdf-generators/:pdfGeneratorViewId',
  metaApiMetrics,
  ncMetaAclMw(pdfGeneratorViewUpdate, 'pdfGeneratorViewUpdate')
);
router.get(
  '/api/v1/db/meta/pdf-generators/:pdfGeneratorViewId',
  metaApiMetrics,
  ncMetaAclMw(pdfGeneratorViewGet, 'pdfGeneratorViewGet')
);
// TODO: Consider to use mime types as URL extensions instead of a new sub path for the PDF version of the view
router.get(
  '/api/v1/db/meta/pdf-generators/:pdfGeneratorViewId/export',
  metaApiMetrics,
  ncMetaAclMw(pdfGeneratorViewGetExport, 'pdfGeneratorViewGet')
);
export default router;
