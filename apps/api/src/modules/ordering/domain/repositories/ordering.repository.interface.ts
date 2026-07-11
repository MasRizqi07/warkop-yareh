export interface IOrderingRepository {
  getProductsByIds(ids: string[]): Promise<any[]>;
  createOrder(data: any, orderItems: any[], outboxPayload: any): Promise<any>;
  getOrder(id: string): Promise<any>;
  listOrders(params: {
    userId?: string;
    branchId?: string;
    status?: string;
    page: number;
    limit: number;
  }): Promise<{ data: any[]; total: number }>;
  updateOrderStatus(id: string, status: string): Promise<any>;
  updatePaymentStatus(id: string, paymentStatus: string): Promise<any>;
  createFeedback(id: string, data: any): Promise<any>;
}
