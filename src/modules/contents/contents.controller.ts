import { Request, Response, NextFunction } from 'express';
import * as contentsService from './contents.service';

import { getActor } from '../../shared/helpers/get-actor';

export async function listGlobal(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await contentsService.listGlobal(
      getActor(req),
      req.query,
    );
    res.json({ success: true, data: result.contents, meta: result.meta });
  } catch (err) {
    next(err);
  }
}

export async function listByCompany(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await contentsService.listByCompany(
      req.params.companyId as string,
      getActor(req),
      req.query,
    );
    res.json({ success: true, data: result.contents, meta: result.meta });
  } catch (err) {
    next(err);
  }
}

export async function getWorkflowSnapshot(req: Request, res: Response, next: NextFunction) {
  try {
    const snapshot = await contentsService.getWorkflowSnapshot(
      req.params.companyId as string,
      getActor(req),
    );
    res.json({ success: true, data: snapshot });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const content = await contentsService.create(
      req.params.companyId as string,
      req.body,
      getActor(req),
    );
    res.status(201).json({ success: true, data: { content } });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const content = await contentsService.getById(
      req.params.id as string,
      getActor(req),
    );
    res.json({ success: true, data: { content } });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const content = await contentsService.update(
      req.params.id as string,
      req.body,
      getActor(req),
    );
    res.json({ success: true, data: { content } });
  } catch (err) {
    next(err);
  }
}

export async function softDelete(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await contentsService.softDelete(
      req.params.id as string,
      getActor(req),
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function changeStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const content = await contentsService.changeStatus(
      req.params.id as string,
      req.body,
      getActor(req),
    );
    res.json({ success: true, data: { content } });
  } catch (err) {
    next(err);
  }
}

export async function assign(req: Request, res: Response, next: NextFunction) {
  try {
    const content = await contentsService.assign(
      req.params.id as string,
      req.body,
      getActor(req),
    );
    res.json({ success: true, data: { content } });
  } catch (err) {
    next(err);
  }
}

export async function approve(req: Request, res: Response, next: NextFunction) {
  try {
    const content = await contentsService.approve(
      req.params.id as string,
      getActor(req),
      req.body?.comment,
    );
    res.json({ success: true, data: { content } });
  } catch (err) {
    next(err);
  }
}

export async function reject(req: Request, res: Response, next: NextFunction) {
  try {
    const content = await contentsService.reject(
      req.params.id as string,
      getActor(req),
      req.body?.comment,
    );
    res.json({ success: true, data: { content } });
  } catch (err) {
    next(err);
  }
}

export async function listVersions(req: Request, res: Response, next: NextFunction) {
  try {
    const versions = await contentsService.listVersions(
      req.params.id as string,
      getActor(req),
    );
    res.json({ success: true, data: { versions } });
  } catch (err) {
    next(err);
  }
}

export async function listComments(req: Request, res: Response, next: NextFunction) {
  try {
    const comments = await contentsService.listComments(
      req.params.id as string,
      getActor(req),
    );
    res.json({ success: true, data: { comments } });
  } catch (err) {
    next(err);
  }
}

export async function addComment(req: Request, res: Response, next: NextFunction) {
  try {
    const comment = await contentsService.addComment(
      req.params.id as string,
      req.body,
      getActor(req),
    );
    res.status(201).json({ success: true, data: { comment } });
  } catch (err) {
    next(err);
  }
}

export async function getPresignedUrl(req: Request, res: Response, next: NextFunction) {
  try {
    const { filename, mimetype } = req.body;
    // Actor permission is verified via the route middleware, similar to addMedia.
    // For a real app, we should check `assertMutationRights` in the service.
    const result = await contentsService.getPresignedUrl(
      req.params.id as string,
      filename,
      mimetype,
      getActor(req)
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function addMedia(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      throw new Error('Dosya bulunamadı.');
    }

    // Type-specific file size enforcement
    const isImage = req.file.mimetype.startsWith('image/');
    const IMAGE_LIMIT = 10 * 1024 * 1024; // 10MB
    if (isImage && req.file.size > IMAGE_LIMIT) {
      throw new Error('Görsel dosyaları en fazla 10MB olabilir.');
    }

    const media = await contentsService.addMedia(
      req.params.id as string,
      req.file,
      getActor(req)
    );
    res.status(201).json({ success: true, data: { media } });
  } catch (err) {
    next(err);
  }
}

export async function confirmMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const { url, fileType, sizeBytes } = req.body;
    const media = await contentsService.confirmMedia(
      req.params.id as string,
      { url, fileType, sizeBytes },
      getActor(req)
    );
    res.status(201).json({ success: true, data: { media } });
  } catch (err) {
    next(err);
  }
}


export async function removeMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const media = await contentsService.removeMedia(
      req.params.id as string,
      req.params.mediaId as string,
      getActor(req)
    );
    res.json({ success: true, data: { media } });
  } catch (err) {
    next(err);
  }
}

export async function getCalendar(req: Request, res: Response, next: NextFunction) {
  try {
    const query = { ...req.query };
    if (req.params.companyId) {
      query.companyId = req.params.companyId;
    }
    const contents = await contentsService.getCalendar(
      query,
      getActor(req),
    );
    res.json({ success: true, data: { contents } });
  } catch (err) {
    next(err);
  }
}
