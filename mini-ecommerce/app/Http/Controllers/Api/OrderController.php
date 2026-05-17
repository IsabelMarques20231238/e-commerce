<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request; // ESTA LINHA É OBRIGATÓRIA
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = $request->user()
            ->orders()
            ->latest()
            ->get(['id', 'total_amount', 'status', 'payment_method', 'payment_status', 'created_at']);

        return response()->json([
            'status' => 'success',
            'data' => $orders,
        ]);
    }

    public function show(Request $request, $id)
    {
        $order = $request->user()
            ->orders()
            ->with(['items.product', 'user'])
            ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $order,
        ]);
    }

    public function checkout(Request $request) {
        $user = auth()->user();
        
        // Carregar o carrinho com os itens para evitar erro de "null"
        $cart = $user->cart()->with('items.product')->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json(['message' => 'Carrinho vazio'], 400);
        }

        try {
            return DB::transaction(function () use ($user, $cart) {
                $total = 0;
                $orderItems = [];

                foreach ($cart->items as $item) {
                    $product = $item->product;

                    if ($product->stock < $item->quantity) {
                        throw new \Exception("Stock insuficiente para o produto: {$product->name}");
                    }

                    $total += $product->price * $item->quantity;
                    $product->decrement('stock', $item->quantity);

                    $orderItems[] = [
                        'product_id' => $product->id,
                        'quantity'   => $item->quantity,
                        'price'      => $product->price,
                    ];
                }

                $order = $user->orders()->create([
                    'total_amount' => $total,
                    'status' => 'pending'
                ]);

                $order->items()->createMany($orderItems);
                $cart->items()->delete(); // Limpa os itens do carrinho

                return response()->json([
                    'status' => 'success',
                    'message' => 'Compra realizada e stock atualizado!',
                    'order_id' => $order->id
                ]);
            });
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
