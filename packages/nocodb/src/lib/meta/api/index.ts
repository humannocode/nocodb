import { Tele } from 'nc-help';
import orgLicenseApis from './orgLicenseApis';
import orgTokenApis from './orgTokenApis';
import orgUserApis from './orgUserApis';
import projectApis from './projectApis';
import tableApis from './tableApis';
import columnApis from './columnApis';
import { Request, Response, Router } from 'express';
import sortApis from './sortApis';
import filterApis from './filterApis';
import viewColumnApis from './viewColumnApis';
import gridViewApis from './gridViewApis';
import viewApis from './viewApis';
import galleryViewApis from './galleryViewApis';
import formViewApis from './formViewApis';
import formViewColumnApis from './formViewColumnApis';
import attachmentApis from './attachmentApis';
import exportApis from './exportApis';
import auditApis from './auditApis';
import hookApis from './hookApis';
import pluginApis from './pluginApis';
import gridViewColumnApis from './gridViewColumnApis';
import kanbanViewApis from './kanbanViewApis';
import { userApis } from './userApi';
// import extractProjectIdAndAuthenticate from './helpers/extractProjectIdAndAuthenticate';
import utilApis from './utilApis';
import projectUserApis from './projectUserApis';
import sharedBaseApis from './sharedBaseApis';
import { initStrategies } from './userApi/initStrategies';
import modelVisibilityApis from './modelVisibilityApis';
import metaDiffApis from './metaDiffApis';
import cacheApis from './cacheApis';
import apiTokenApis from './apiTokenApis';
import hookFilterApis from './hookFilterApis';
import testApis from './testApis';
import {
  bulkDataAliasApis,
  dataAliasApis,
  dataAliasExportApis,
  dataAliasNestedApis,
  dataApis,
  oldDataApis,
} from './dataApis';
import {
  publicDataApis,
  publicDataExportApis,
  publicMetaApis,
} from './publicApis';
import { Server, Socket } from 'socket.io';
import passport from 'passport';

import crypto from 'crypto';
import swaggerApis from './swagger/swaggerApis';
import importApis from './sync/importApis';
import syncSourceApis from './sync/syncSourceApis';
import pdfGeneratorViewApis from './pdfGeneratorViewApis';

import PDFDocument from 'pdfkit';
import View from '../../models/View';
import Model from '../../models/Model';
import Base from '../../models/Base';
import NcConnectionMgrv2 from '../../utils/common/NcConnectionMgrv2';
import getAst from '../../db/sql-data-mapper/lib/sql/helpers/getAst';
import { nocoExecute } from 'nc-help';
// import fs from 'fs';

const clients: { [id: string]: Socket } = {};

export default function (router: Router, server) {
  initStrategies(router);
  projectApis(router);
  utilApis(router);

  if (process.env['PLAYWRIGHT_TEST'] === 'true') {
    router.use(testApis);
  }
  router.use(columnApis);
  router.use(exportApis);
  router.use(dataApis);
  router.use(bulkDataAliasApis);
  router.use(dataAliasApis);
  router.use(dataAliasNestedApis);
  router.use(dataAliasExportApis);
  router.use(oldDataApis);
  router.use(sortApis);
  router.use(filterApis);
  router.use(viewColumnApis);
  router.use(gridViewApis);
  router.use(formViewColumnApis);
  router.use(publicDataApis);
  router.use(publicDataExportApis);
  router.use(publicMetaApis);
  router.use(gridViewColumnApis);
  router.use(tableApis);
  router.use(galleryViewApis);
  router.use(formViewApis);
  router.use(viewApis);
  router.use(attachmentApis);
  router.use(auditApis);
  router.use(hookApis);
  router.use(pluginApis);
  router.use(projectUserApis);
  router.use(orgUserApis);
  router.use(orgTokenApis);
  router.use(orgLicenseApis);
  router.use(sharedBaseApis);
  router.use(modelVisibilityApis);
  router.use(metaDiffApis);
  router.use(cacheApis);
  router.use(apiTokenApis);
  router.use(hookFilterApis);
  router.use(swaggerApis);
  router.use(syncSourceApis);
  router.use(kanbanViewApis);
  router.use(pdfGeneratorViewApis);

  const FOOpdfExampleRouter = Router({ mergeParams: true });

  FOOpdfExampleRouter.get(
    '/FOO/:viewId',
    // metaApiMetrics,
    // ncMetaAclMw(columnAdd, 'columnAdd')
    async (req: Request, res: Response, next) => {
      console.log(JSON.stringify(req.hostname));
      // let pdfDoc = new PDFDocument();
      // pdfDoc.pipe(fs.createWriteStream('SampleDocument.pdf'));
      // pdfDoc.text('My Sample PDF Document');
      // pdfDoc.end();
      // res.send('TEST');
      // res.writeHead(200, {
      //   'Content-Type': 'application/pdf',
      //   'Content-Disposition': `attachment;filename=invoice.pdf`,
      // });

      // const { model, view } = await getViewAndModelFromRequestByAliasOrId(req);

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
  );

  router.use(FOOpdfExampleRouter);

  userApis(router);

  const io = new Server(server, {
    cors: {
      origin: '*',
      allowedHeaders: ['xc-auth'],
      credentials: true,
    },
  });
  io.use(function (socket, next) {
    passport.authenticate(
      'jwt',
      { session: false },
      (_err, user, _info): any => {
        if (!user) {
          socket.disconnect();
          return next(new Error('Unauthorized'));
        }
        (socket.handshake as any).user = user;
        next();
      }
    )(socket.handshake, {}, next);
  }).on('connection', (socket) => {
    clients[socket.id] = socket;
    const id = getHash(
      (process.env.NC_SERVER_UUID || Tele.id) +
        (socket?.handshake as any)?.user?.id
    );

    socket.on('page', (args) => {
      Tele.page({ ...args, id });
    });
    socket.on('event', (args) => {
      Tele.event({ ...args, id });
    });
  });

  importApis(router, clients);
}

function getHash(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}
