import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, MapPin, Phone, Package, Star } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { ordersApi } from '../api/orders';
import { reviewsApi } from '../api/reviewsApi';
import { formatNGN, formatDateTime } from '../utils/format';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import ProductImage from '../components/ui/ProductImage';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getById(id!),
    enabled: !!id,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ productId, rating, comment }: { productId: string; rating: number; comment: string }) =>
      reviewsApi.submit(productId, { rating, comment: comment || undefined }),
    onSuccess: (_, { productId }) => {
      setSubmitted((s) => ({ ...s, [productId]: true }));
      qc.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('Review submitted — thank you!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Could not submit review');
    },
  });

  const order = data?.data.data;

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-gray-500 mb-4">Order not found.</p>
        <Link to="/orders" className="btn-primary">Back to orders</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/orders" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ChevronLeft size={16} />
        Back to orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Order #{order.id.substring(0, 8).toUpperCase()}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <Badge label={order.paymentStatus} />
          <Badge label={order.orderStatus} />
        </div>
      </div>

      {/* Items */}
      <div className="card p-5 mb-4">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package size={16} className="text-brand-600" />
          Items
        </h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-3 items-center">
              <ProductImage
                src={item.productImageUrl}
                alt={item.productName}
                className="w-14 h-14 rounded-xl object-cover bg-gray-50 border border-gray-100 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                {item.variantLabel && (
                  <p className="text-xs text-brand-600">{item.variantLabel}</p>
                )}
                <p className="text-xs text-gray-500">×{item.quantity} · {formatNGN(item.unitPrice)} each</p>
              </div>
              <p className="text-sm font-semibold text-gray-900 shrink-0">{formatNGN(item.subtotal)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Order summary */}
      <div className="card p-5 mb-4">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Order summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span><span>{formatNGN(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Service fee</span><span>{formatNGN(order.serviceFee)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Delivery</span><span>{formatNGN(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
            <span>Total</span><span>{formatNGN(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Delivery details */}
      <div className="card p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <MapPin size={16} className="text-brand-600" />
          Delivery details
        </h2>
        <div className="space-y-2 text-sm text-gray-700">
          <p>{order.deliveryAddress}</p>
          <p>{order.deliveryCity}{order.deliveryCity && order.deliveryState ? ', ' : ''}{order.deliveryState}</p>
          {order.phone && (
            <div className="flex items-center gap-1.5 text-gray-500 pt-1">
              <Phone size={13} />
              <span>{order.phone}</span>
              {order.alternatePhone && (
                <span className="text-gray-400">· {order.alternatePhone}</span>
              )}
            </div>
          )}
          {order.notes && (
            <p className="text-gray-500 italic pt-1">"{order.notes}"</p>
          )}
        </div>
      </div>

      {/* Rate your items — only for delivered orders */}
      {order.orderStatus === 'DELIVERED' && (
        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star size={16} className="text-brand-600" />
            Rate your items
          </h2>
          <div className="space-y-5">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <ProductImage
                  src={item.productImageUrl}
                  alt={item.productName}
                  className="w-12 h-12 rounded-xl object-cover bg-gray-50 border border-gray-100 shrink-0"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                  {item.variantLabel && <p className="text-xs text-brand-600">{item.variantLabel}</p>}

                  {submitted[item.productId] ? (
                    <p className="text-xs text-green-600 mt-2 font-medium">✓ Review submitted</p>
                  ) : (
                    <div className="mt-2 space-y-2">
                      {/* Star picker */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} type="button" onClick={() => setRatings((r) => ({ ...r, [item.productId]: s }))}>
                            <Star className={`h-5 w-5 transition-colors ${s <= (ratings[item.productId] ?? 0) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200 hover:fill-amber-200 hover:text-amber-200'}`} />
                          </button>
                        ))}
                        {ratings[item.productId] && (
                          <span className="text-xs text-gray-500 ml-1">{['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'][ratings[item.productId]]}</span>
                        )}
                      </div>
                      <textarea
                        value={comments[item.productId] ?? ''}
                        onChange={(e) => setComments((c) => ({ ...c, [item.productId]: e.target.value }))}
                        placeholder="Leave a comment (optional)"
                        className="input resize-none text-sm"
                        rows={2}
                      />
                      <button
                        disabled={!ratings[item.productId] || reviewMutation.isPending}
                        onClick={() => reviewMutation.mutate({
                          productId: item.productId,
                          rating: ratings[item.productId],
                          comment: comments[item.productId] ?? '',
                        })}
                        className="btn-primary text-sm py-1.5 disabled:opacity-40"
                      >
                        Submit review
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
