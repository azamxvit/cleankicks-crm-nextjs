export const ORDERS_STORAGE_KEY = "cleankicks-crm-orders-v1";

export const MAX_SHOES_PER_ORDER = 6;

export const MAX_PHOTOS_PER_SHOE = 3;

export const MAX_PHOTO_COMPRESSED_BYTES = 220_000;

export const MAX_PHOTO_EDGE_PX = 1280;

export const ORDER_PHOTOS_BUCKET =
  process.env.NEXT_PUBLIC_ORDER_PHOTOS_BUCKET?.trim() || "order-photos";
