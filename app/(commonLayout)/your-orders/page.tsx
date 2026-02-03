import { userService } from '@/services/user.service';
import { orderService } from '@/services/order.service';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function YourOrdersPage() {
  const { data: session } = await userService.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: orders, error } = await orderService.getOrdersByUserId(session.user.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PREPARING':
        return 'bg-yellow-500';
      case 'READY':
        return 'bg-blue-500';
      case 'DELIVERED':
        return 'bg-green-500';
      case 'CANCELLED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>
      
      {error && (
        <div className="text-destructive">
          <p>Failed to load orders. Please try again later.</p>
        </div>
      )}

      {!orders || orders.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">You haven&apos;t placed any orders yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{order.meal.name}</CardTitle>
                    <CardDescription>
                      Provider: {order.meal.provider.user.name}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={order.meal.imageUrl}
                      alt={order.meal.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="grid gap-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Quantity:</span>
                        <span className="text-sm font-medium">{order.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Price per item:</span>
                        <span className="text-sm font-medium">${order.meal.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total:</span>
                        <span className="text-sm font-bold">${(order.meal.price * order.quantity).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Payment:</span>
                        <span className="text-sm">{order.paymentMethod === 'CASHONDELIVERY' ? 'Cash on Delivery' : order.paymentMethod}</span>
                      </div>
                    </div>
                    {order.reviews && order.reviews.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-medium">Your Review:</p>
                        <p className="text-sm text-muted-foreground">Rating: {order.reviews[0].reviewPoint}/5</p>
                        {order.reviews[0].comment && (
                          <p className="text-sm mt-1">{order.reviews[0].comment}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
