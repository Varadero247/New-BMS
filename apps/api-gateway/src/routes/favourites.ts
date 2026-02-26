// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router } from 'express';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-gateway:favourites');
const router = Router();

// ─── In-memory store (keyed by userId) ────────────────────────────────────────
// In production this would be backed by Redis or a DB table.

interface FavouriteItem {
  id: string;
  userId: string;
  itemType: string;
  itemId: string;
  title: string;
  url: string;
  module: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

const store = new Map<string, FavouriteItem[]>();

function getUserFavourites(userId: string): FavouriteItem[] {
  return store.get(userId) ?? [];
}

function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

// ─── GET /api/favourites ───────────────────────────────────────────────────────
router.get('/api/favourites', (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, data: null, error: 'Unauthorised' });
    }
    const items = getUserFavourites(userId);
    const sorted = [...items].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return res.json({ success: true, data: { items: sorted, total: sorted.length }, error: null });
  } catch (err) {
    logger.error('GET /api/favourites error', { err });
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
});

// ─── POST /api/favourites ──────────────────────────────────────────────────────
router.post('/api/favourites', (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, data: null, error: 'Unauthorised' });
    }

    const { itemType, itemId, title, url, module: moduleName, metadata } = req.body ?? {};

    if (!itemType || typeof itemType !== 'string' || itemType.trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, data: null, error: 'itemType is required' });
    }
    if (!itemId || typeof itemId !== 'string' || !isValidUuid(itemId)) {
      return res
        .status(400)
        .json({ success: false, data: null, error: 'itemId must be a valid UUID' });
    }
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, data: null, error: 'title is required' });
    }
    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return res.status(400).json({ success: false, data: null, error: 'url is required' });
    }
    if (!moduleName || typeof moduleName !== 'string' || moduleName.trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, data: null, error: 'module is required' });
    }

    const items = getUserFavourites(userId);

    // Check for duplicates
    const existing = items.find(
      (i) => i.itemType === itemType.trim() && i.itemId === itemId.trim()
    );
    if (existing) {
      return res.status(409).json({
        success: false,
        data: null,
        error: 'Item is already in favourites',
      });
    }

    const newItem: FavouriteItem = {
      id: `fav-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      userId,
      itemType: itemType.trim(),
      itemId: itemId.trim(),
      title: title.trim(),
      url: url.trim(),
      module: moduleName.trim(),
      createdAt: new Date(),
      metadata: metadata ?? undefined,
    };

    store.set(userId, [...items, newItem]);
    logger.info('Favourite added', { userId, itemType: newItem.itemType, itemId: newItem.itemId });

    return res.status(201).json({ success: true, data: newItem, error: null });
  } catch (err) {
    logger.error('POST /api/favourites error', { err });
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
});

// ─── DELETE /api/favourites ────────────────────────────────────────────────────
router.delete('/api/favourites', (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, data: null, error: 'Unauthorised' });
    }
    store.delete(userId);
    return res.json({ success: true, data: { message: 'All favourites cleared' }, error: null });
  } catch (err) {
    logger.error('DELETE /api/favourites error', { err });
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
});

// ─── DELETE /api/favourites/:itemId ───────────────────────────────────────────
router.delete('/api/favourites/:itemId', (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, data: null, error: 'Unauthorised' });
    }
    const { itemId } = req.params;
    const items = getUserFavourites(userId);
    const index = items.findIndex((i) => i.itemId === itemId || i.id === itemId);
    if (index === -1) {
      return res.status(404).json({ success: false, data: null, error: 'Favourite not found' });
    }
    const updated = items.filter((_, i) => i !== index);
    store.set(userId, updated);
    return res.json({ success: true, data: { message: 'Favourite removed' }, error: null });
  } catch (err) {
    logger.error('DELETE /api/favourites/:itemId error', { err });
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
});

// ─── GET /api/favourites/check/:itemType/:itemId ───────────────────────────────
// Named routes MUST be registered before /:itemId to avoid being caught by it.
router.get('/api/favourites/check/:itemType/:itemId', (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, data: null, error: 'Unauthorised' });
    }
    const { itemType, itemId } = req.params;
    const items = getUserFavourites(userId);
    const matchingItem = items.find(
      (i) => i.itemType === itemType && i.itemId === itemId
    ) ?? null;
    const isFavourited = !!matchingItem;
    return res.json({ success: true, data: { isFavourited, isFavourite: isFavourited, favourite: matchingItem }, error: null });
  } catch (err) {
    logger.error('GET /api/favourites/check error', { err });
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
});

export { store as _favouritesStore };
export default router;
