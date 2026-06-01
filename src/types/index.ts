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

// Vendor
export interface Vendor {
  id: string;
  userId: string;
  businessName: string;
  description: string;
  phone: string;
  email: string;
  active: boolean;
  createdAt: string;
}

// Auth
export interface LoginResponse {
  token: string;
  tokenType: string;
  userId: string;
  email: string;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
  firstName: string;
  lastName: string;
}

export type ApprovalStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

// Product
export interface ProductVariant {
  id: string;
  label: string;
  price: number;
  stock: number;
  active: boolean;
  inStock: boolean;
  sortOrder: number;
}

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
  variants: ProductVariant[];
  vendorId: string | null;
  vendorBusinessName: string | null;
  approvalStatus: ApprovalStatus;
  rejectionReason: string | null;
  reviewCount: number;
  averageRating: number;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string | null;
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
  variant: ProductVariant | null;
  quantity: number;
}

// Order
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'ONLINE' | 'PAY_ON_DELIVERY';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  variantId: string | null;
  variantLabel: string | null;
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
  paymentMethod: PaymentMethod;
  orderStatus: OrderStatus;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  phone: string;
  alternatePhone: string;
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

// Admin product form
export interface ProductVariantInput {
  id?: string;
  label: string;
  price: number;
  stock: number;
  active: boolean;
  sortOrder: number;
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  active: boolean;
  variants: ProductVariantInput[];
}

// Dashboard
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  ordersThisMonth: number;
}
