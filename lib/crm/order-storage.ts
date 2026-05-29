import { ORDER_PHOTOS_BUCKET } from "@/lib/crm/constants";
import { createAdminClient } from "@/utils/supabase/admin";

/** Removes all objects under `{orderId}/` in the order-photos bucket. */
export async function deleteOrderPhotosFromStorage(
  orderId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createAdminClient();
  const paths: string[] = [];

  const { data: itemFolders, error: listErr } = await supabase.storage
    .from(ORDER_PHOTOS_BUCKET)
    .list(orderId, { limit: 200 });

  if (listErr) {
    return { ok: false, error: listErr.message };
  }

  for (const folder of itemFolders ?? []) {
    if (!folder.name) {
      continue;
    }
    const prefix = `${orderId}/${folder.name}`;
    const { data: files, error: filesErr } = await supabase.storage
      .from(ORDER_PHOTOS_BUCKET)
      .list(prefix, { limit: 50 });
    if (filesErr) {
      return { ok: false, error: filesErr.message };
    }
    for (const file of files ?? []) {
      if (file.name) {
        paths.push(`${prefix}/${file.name}`);
      }
    }
  }

  if (paths.length === 0) {
    return { ok: true };
  }

  const { error: removeErr } = await supabase.storage.from(ORDER_PHOTOS_BUCKET).remove(paths);
  if (removeErr) {
    return { ok: false, error: removeErr.message };
  }
  return { ok: true };
}
