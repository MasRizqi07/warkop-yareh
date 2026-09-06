'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { getMyOrders, getOrder } from './orders.api';
import type { OrderDto } from '@/features/api/contracts';
import { useAuthStore } from '@/stores/auth.store';

export const orderKeys = {
  all: ['orders'] as const,
  detail: (orderId: string) => ['orders', orderId] as const,
};

export function useMyOrders(enabled = true) {
  return useQuery({
    queryKey: orderKeys.all,
    queryFn: getMyOrders,
    enabled,
    staleTime: 10_000,
  });
}

export function useOrder(orderId: string, enabled = true) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const query = useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => getOrder(orderId),
    enabled: enabled && Boolean(orderId),
    refetchInterval: (state) => {
      const status = state.state.data?.status;
      return status === 'COMPLETED' || status === 'CANCELLED' ? false : 15_000;
    },
  });

  useEffect(() => {
    const currentOrderId = query.data?.id;
    if (!accessToken || !currentOrderId) return;

    const socketUrl =
      process.env.NEXT_PUBLIC_WS_URL ||
      (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1').replace(
        /\/api\/v1\/?$/,
        '',
      );
    const socket = io(socketUrl, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    });
    const updateCache = (order: OrderDto) => {
      if (order.id === currentOrderId) {
        queryClient.setQueryData(orderKeys.detail(orderId), order);
        void queryClient.invalidateQueries({ queryKey: orderKeys.all });
      }
    };
    socket.on('connect', () => {
      socket.emit('joinOrder', { orderId: currentOrderId });
    });
    socket.on('order.updated', updateCache);
    socket.on('payment.success', updateCache);

    return () => {
      socket.emit('leaveRoom', { room: `order:${currentOrderId}` });
      socket.disconnect();
    };
  }, [accessToken, orderId, query.data?.id, queryClient]);

  return query;
}

