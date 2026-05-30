export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// Auth
export interface LoginResponse {
  token: string;
  tokenType: string;
  userId: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  firstName: string;
  lastName: string;
}

// Product
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  active: boolean;
  inStock: boolean;
  createdAt: string;
}

// Customer
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  createdAt: string;
}

// Cart
export interface CartItem {
  product: Product;
  quantity: number;
}

// Order
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Payment
export interface InitializePaymentResponse {
  reference: string;
  authorizationUrl: string;
  accessCode: string;
}

// Invoice
export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  customerId: string;
  customerName: string;
  amount: number;
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'VOID';
  generatedAt: string;
}

// Dashboard
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  ordersThisMonth: number;
}
