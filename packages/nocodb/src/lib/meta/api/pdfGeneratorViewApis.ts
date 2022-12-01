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
import PDFDocument from 'pdfkit';

export async function pdfGeneratorViewGet(
  req: Request,
  res: Response<PdfGeneratorType>
) {
  res.json(await PdfGeneratorView.get(req.params.pdfGeneratorViewId));
}

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

  const stream = res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment;filename=invoice.pdf`,
  });

  const doc = new PDFDocument({ bufferPages: true, font: 'Courier' });

  doc.on('data', (chunk) => stream.write(chunk));
  doc.on('end', () => stream.end());

  doc.fontSize(20).text(`A heading`);

  doc
    .fontSize(12)
    .text(
      `Lorem ipsum dolor, sit amet consectetur adipisicing elit. Maiores, saepe.`
    );
  doc.end();

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
