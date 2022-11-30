import { Request, Response, Router } from 'express';
import { PdfGeneratorType, ViewTypes } from 'nocodb-sdk';
import View from '../../models/View';
import { Tele } from 'nc-help';
import ncMetaAclMw from '../helpers/ncMetaAclMw';
import { metaApiMetrics } from '../helpers/apiMetrics';
import PdfGeneratorView from '../../models/PdfGeneratorView';

export async function pdfGeneratorViewGet(
  req: Request,
  res: Response<PdfGeneratorType>
) {
  res.json(await PdfGeneratorView.get(req.params.pdfGeneratorViewId));
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
export default router;
