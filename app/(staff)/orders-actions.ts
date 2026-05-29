"use server";

import { Buffer } from "node:buffer";

import { type SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

import { createLocalId } from "@/lib/crm/create-id";
import { MAX_PHOTOS_PER_SHOE, MAX_SHOES_PER_ORDER, ORDER_PHOTOS_BUCKET } from "@/lib/crm/constants";
import { mapDbOrderToOrder, type DbOrderRow } from "@/lib/crm/map-db-order";
import { deleteOrderPhotosFromStorage } from "@/lib/crm/order-storage";
import { normalizePhone } from "@/lib/crm/phone";
import type { CreateOrderInput, Order, OrderStatus } from "@/lib/crm/types";
import { createAdminClient } from "@/utils/supabase/admin";

const ORDERS_SELECT = `
  id,
  status,
  ticket_code,
  created_at,
  updated_at,
  clients ( id, name, phone ),
  order_items ( id, brand, model, color, notes, photo_urls, created_at )
`;

function parseDataUrl(dataUrl: string): { mime: string; base64: string } | null {
  const m = /^data:([^;]+);base64,([\s\S]+)$/.exec(dataUrl);
  if (!m) {
    return null;
  }
  return { mime: m[1].trim(), base64: m[2].trim() };
}

async function allocateTicketCode(
  supabase: SupabaseClient
): Promise<{ ok: true; code: string } | { ok: false; error: string }> {
  for (let i = 0; i < 30; i += 1) {
    const code = `CK-${String(Math.floor(10000 + Math.random() * 90000))}`;
    const { data, error } = await supabase
      .from("orders")
      .select("id")
      .eq("ticket_code", code)
      .maybeSingle();
    if (error) {
      return { ok: false, error: error.message };
    }
    if (!data) {
      return { ok: true, code };
    }
  }
  return { ok: true, code: `CK-${Date.now().toString(36).toUpperCase()}` };
}

async function uploadPhotoDataUrls(
  supabase: SupabaseClient,
  orderId: string,
  itemId: string,
  dataUrls: string[]
): Promise<{ ok: true; urls: string[] } | { ok: false; error: string }> {
  const urls: string[] = [];
  for (let i = 0; i < dataUrls.length; i += 1) {
    const parsed = parseDataUrl(dataUrls[i]);
    if (!parsed) {
      return { ok: false, error: `Некорректный формат фото #${i + 1}` };
    }
    const body = Buffer.from(parsed.base64, "base64");
    const isPng = parsed.mime === "image/png";
    const ext = isPng ? "png" : "jpg";
    const contentType = isPng ? "image/png" : "image/jpeg";
    const path = `${orderId}/${itemId}/${i}.${ext}`;
    const { error } = await supabase.storage.from(ORDER_PHOTOS_BUCKET).upload(path, body, {
      contentType,
      upsert: true,
    });
    if (error) {
      return { ok: false, error: `Не удалось загрузить фото (${error.message}).` };
    }
    const { data: pub } = supabase.storage.from(ORDER_PHOTOS_BUCKET).getPublicUrl(path);
    urls.push(pub.publicUrl);
  }
  return { ok: true, urls };
}

export async function fetchOrdersAction(): Promise<
  { ok: true; orders: Order[] } | { ok: false; error: string }
> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("orders")
      .select(ORDERS_SELECT)
      .order("created_at", { ascending: false });
    if (error) {
      return { ok: false, error: error.message };
    }
    const rows = (data ?? []) as DbOrderRow[];
    return { ok: true, orders: rows.map(mapDbOrderToOrder) };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Неизвестная ошибка";
    return { ok: false, error: msg };
  }
}

export async function createOrderAction(
  payload: CreateOrderInput
): Promise<{ ok: true; orders: Order[] } | { ok: false; error: string }> {
  try {
    if (payload.items.length < 1 || payload.items.length > MAX_SHOES_PER_ORDER) {
      return { ok: false, error: "Некорректное число пар в заказе." };
    }
    for (const it of payload.items) {
      if (it.photoUrls.length < 1 || it.photoUrls.length > MAX_PHOTOS_PER_SHOE) {
        return { ok: false, error: "У каждой пары должно быть от 1 до 3 фото." };
      }
    }

    const supabase = createAdminClient();
    const phone = normalizePhone(payload.clientPhone);
    if (!phone) {
      return { ok: false, error: "Укажите телефон." };
    }

    const { data: existingClient, error: findErr } = await supabase
      .from("clients")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();
    if (findErr) {
      return { ok: false, error: findErr.message };
    }

    let clientId = existingClient?.id as string | undefined;
    if (!clientId) {
      const { data: inserted, error: insErr } = await supabase
        .from("clients")
        .insert({ name: payload.clientName.trim(), phone })
        .select("id")
        .single();
      if (insErr || !inserted) {
        return { ok: false, error: insErr?.message ?? "Не удалось создать клиента." };
      }
      clientId = inserted.id as string;
    } else {
      await supabase.from("clients").update({ name: payload.clientName.trim() }).eq("id", clientId);
    }

    const ticket = await allocateTicketCode(supabase);
    if (!ticket.ok) {
      return { ok: false, error: ticket.error };
    }

    const { data: ord, error: ordErr } = await supabase
      .from("orders")
      .insert({
        client_id: clientId,
        status: "received",
        ticket_code: ticket.code,
      })
      .select("id")
      .single();

    if (ordErr || !ord) {
      return { ok: false, error: ordErr?.message ?? "Не удалось создать заказ." };
    }

    const orderId = ord.id as string;

    try {
      for (const item of payload.items) {
        const itemId = createLocalId();
        const up = await uploadPhotoDataUrls(supabase, orderId, itemId, item.photoUrls);
        if (!up.ok) {
          throw new Error(up.error);
        }
        const { error: itemErr } = await supabase.from("order_items").insert({
          id: itemId,
          order_id: orderId,
          brand: item.brand.trim(),
          model: item.model.trim(),
          color: item.color.trim(),
          notes: item.notes.trim(),
          photo_urls: up.urls,
        });
        if (itemErr) {
          throw new Error(itemErr.message);
        }
      }
    } catch (e) {
      await deleteOrderPhotosFromStorage(orderId);
      await supabase.from("order_items").delete().eq("order_id", orderId);
      await supabase.from("orders").delete().eq("id", orderId);
      const msg = e instanceof Error ? e.message : "Ошибка при сохранении пар.";
      return { ok: false, error: msg };
    }

    revalidatePath("/orders");
    revalidatePath("/intake");
    const refreshed = await fetchOrdersAction();
    if (!refreshed.ok) {
      return refreshed;
    }
    return { ok: true, orders: refreshed.orders };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Неизвестная ошибка";
    return { ok: false, error: msg };
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus
): Promise<{ ok: true; orders: Order[] } | { ok: false; error: string }> {
  try {
    const supabase = createAdminClient();

    if (status === "completed") {
      const removed = await deleteOrderPhotosFromStorage(orderId);
      if (!removed.ok) {
        return { ok: false, error: `Не удалось удалить фото: ${removed.error}` };
      }
      const { error: itemsErr } = await supabase
        .from("order_items")
        .delete()
        .eq("order_id", orderId);
      if (itemsErr) {
        return { ok: false, error: itemsErr.message };
      }
      const { error: orderErr } = await supabase.from("orders").delete().eq("id", orderId);
      if (orderErr) {
        return { ok: false, error: orderErr.message };
      }
    } else {
      const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
      if (error) {
        return { ok: false, error: error.message };
      }
    }

    revalidatePath("/orders");
    revalidatePath("/pickup");
    revalidatePath(`/orders/${orderId}`);
    const refreshed = await fetchOrdersAction();
    if (!refreshed.ok) {
      return refreshed;
    }
    return { ok: true, orders: refreshed.orders };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Неизвестная ошибка";
    return { ok: false, error: msg };
  }
}
