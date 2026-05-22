"use client";

import * as React from "react";

import {
  createOrderAction,
  fetchOrdersAction,
  updateOrderStatusAction,
} from "@/app/(staff)/orders-actions";
import {
  loadOrdersFromStorage,
  ordersReducer,
  saveOrdersToStorage,
  type OrdersAction,
} from "@/lib/crm/orders-reducer";
import { normalizePhone } from "@/lib/crm/phone";
import { isSupabaseOrdersEnabled } from "@/lib/crm/supabase-mode";
import type { CreateOrderInput, Order, OrderStatus } from "@/lib/crm/types";

function scheduleApplyRemoteResult(
  r: { ok: true; orders: Order[] } | { ok: false; error: string },
  dispatch: React.Dispatch<OrdersAction>,
  setStorageError: React.Dispatch<React.SetStateAction<string | null>>
) {
  requestAnimationFrame(() => {
    if (r.ok) {
      dispatch({ type: "HYDRATE", orders: r.orders });
      setStorageError(null);
    } else {
      setStorageError(r.error);
    }
  });
}

type OrdersContextValue = {
  hydrated: boolean;
  orders: Order[];
  useSupabaseOrders: boolean;
  dispatch: React.Dispatch<OrdersAction>;
  getOrder: (id: string) => Order | undefined;
  findOrdersByPhoneQuery: (query: string) => Order[];
  storageError: string | null;
  clearStorageError: () => void;
  createOrderRemote: (
    payload: CreateOrderInput
  ) => Promise<{ ok: true; orders: Order[] } | { ok: false; error: string }>;
  updateStatusRemote: (
    orderId: string,
    status: OrderStatus
  ) => Promise<{ ok: true; orders: Order[] } | { ok: false; error: string }>;
};

const OrdersContext = React.createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(ordersReducer, { orders: [] });
  const [hydrated, setHydrated] = React.useState(false);
  const [storageError, setStorageError] = React.useState<string | null>(null);
  const useRemote = isSupabaseOrdersEnabled();

  React.useEffect(() => {
    if (useRemote) {
      void fetchOrdersAction().then((r) => {
        scheduleApplyRemoteResult(r, dispatch, setStorageError);
        setHydrated(true);
      });
      return;
    }

    const loaded = loadOrdersFromStorage();
    if (loaded?.length) {
      dispatch({ type: "HYDRATE", orders: loaded });
    }
    const t = window.setTimeout(() => {
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(t);
  }, [useRemote]);

  React.useEffect(() => {
    if (!hydrated || useRemote) {
      return;
    }
    const result = saveOrdersToStorage(state.orders);
    const id = requestAnimationFrame(() => {
      if (result.ok) {
        setStorageError(null);
      } else {
        setStorageError(result.message);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [state.orders, hydrated, useRemote]);

  const clearStorageError = React.useCallback(() => {
    setStorageError(null);
  }, []);

  const createOrderRemote = React.useCallback(
    async (payload: CreateOrderInput) => {
      const r = await createOrderAction(payload);
      scheduleApplyRemoteResult(r, dispatch, setStorageError);
      return r;
    },
    [dispatch]
  );

  const updateStatusRemote = React.useCallback(
    async (orderId: string, status: OrderStatus) => {
      const r = await updateOrderStatusAction(orderId, status);
      scheduleApplyRemoteResult(r, dispatch, setStorageError);
      return r;
    },
    [dispatch]
  );

  const getOrder = React.useCallback(
    (id: string) => state.orders.find((o) => o.id === id),
    [state.orders]
  );

  const findOrdersByPhoneQuery = React.useCallback(
    (query: string) => {
      const q = normalizePhone(query);
      if (!q) {
        return [];
      }
      return state.orders.filter((o) => o.clientPhone.includes(q));
    },
    [state.orders]
  );

  const value = React.useMemo(
    () => ({
      hydrated,
      orders: state.orders,
      useSupabaseOrders: useRemote,
      dispatch,
      getOrder,
      findOrdersByPhoneQuery,
      storageError,
      clearStorageError,
      createOrderRemote,
      updateStatusRemote,
    }),
    [
      hydrated,
      state.orders,
      useRemote,
      dispatch,
      getOrder,
      findOrdersByPhoneQuery,
      storageError,
      clearStorageError,
      createOrderRemote,
      updateStatusRemote,
    ]
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = React.useContext(OrdersContext);
  if (!ctx) {
    throw new Error("useOrders must be used within OrdersProvider");
  }
  return ctx;
}
