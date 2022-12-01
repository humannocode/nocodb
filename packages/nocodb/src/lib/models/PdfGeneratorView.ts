import Noco from '../Noco';
import { PdfGeneratorType } from 'nocodb-sdk';
import { CacheGetType, CacheScope, MetaTable } from '../utils/globals';
import View from './View';
import NocoCache from '../cache/NocoCache';

export default class PdfGeneratorView implements PdfGeneratorType {
  fk_view_id: string;
  title: string;
  project_id?: string;
  base_id?: string;
  meta?: string | object;

  // below fields are not in use at this moment
  // keep them for time being
  show?: boolean;
  uuid?: string;
  public?: boolean;
  password?: string;
  show_all_fields?: boolean;

  constructor(data: PdfGeneratorView) {
    Object.assign(this, data);
  }

  public static async get(viewId: string, ncMeta = Noco.ncMeta) {
    let view =
      viewId &&
      (await NocoCache.get(
        `${CacheScope.PDF_GENERATOR_VIEW}:${viewId}`,
        CacheGetType.TYPE_OBJECT
      ));
    if (!view) {
      view = await ncMeta.metaGet2(null, null, MetaTable.PDF_GENERATOR_VIEW, {
        fk_view_id: viewId,
      });
      await NocoCache.set(`${CacheScope.PDF_GENERATOR_VIEW}:${viewId}`, view);
    }

    return view && new PdfGeneratorView(view);
  }

  static async insert(view: Partial<PdfGeneratorView>, ncMeta = Noco.ncMeta) {
    const insertObj = {
      project_id: view.project_id,
      base_id: view.base_id,
      fk_view_id: view.fk_view_id,
      meta: view.meta,
    };

    if (!(view.project_id && view.base_id)) {
      const viewRef = await View.get(view.fk_view_id);
      insertObj.project_id = viewRef.project_id;
      insertObj.base_id = viewRef.base_id;
    }

    await ncMeta.metaInsert2(
      null,
      null,
      MetaTable.PDF_GENERATOR_VIEW,
      insertObj,
      true
    );

    return this.get(view.fk_view_id, ncMeta);
  }

  static async update(
    pdfGeneratorId: string,
    body: Partial<PdfGeneratorView>,
    ncMeta = Noco.ncMeta
  ) {
    // get existing cache
    const key = `${CacheScope.PDF_GENERATOR_VIEW}:${pdfGeneratorId}`;
    let o = await NocoCache.get(key, CacheGetType.TYPE_OBJECT);
    const updateObj = {
      ...body,
      meta:
        typeof body.meta === 'string'
          ? body.meta
          : JSON.stringify(body.meta ?? {}),
    };
    if (o) {
      o = { ...o, ...updateObj };
      // set cache
      await NocoCache.set(key, o);
    }
    // update meta
    return await ncMeta.metaUpdate(
      null,
      null,
      MetaTable.PDF_GENERATOR_VIEW,
      updateObj,
      {
        fk_view_id: pdfGeneratorId,
      }
    );
  }
}
