<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

    // No topo do ficheiro, garante que tens estas importações:
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;


class CartController extends Controller
{
    // GET /api/cart - Ver Carrinho
    public function index()
    {
        $cart = Cart::with('items.product')->firstOrCreate(['user_id' => Auth::id()]);
        
        $total = 0;
        foreach ($cart->items as $item) {
            $total += $item->product->price * $item->quantity;
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'items' => $cart->items,
                'total_price' => round($total, 2)
            ]
        ]);
    }

    // POST /api/cart/add - Adicionar Produto
    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'integer|min:1'
        ]);

        $cart = Cart::firstOrCreate(['user_id' => Auth::id()]);
        
        // Verificar se o produto já está no carrinho
        $cartItem = $cart->items()->where('product_id', $request->product_id)->first();

        $quantity = $request->quantity ?? 1;

        if ($cartItem) {
            $cartItem->increment('quantity', $quantity);
            $cartItem->refresh();
        } else {
            $cartItem = CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $request->product_id,
                'quantity' => $quantity
            ]);
        }

        $cart->load('items.product');
        $cartCount = $cart->items->sum('quantity');

        return response()->json([
            'status' => 'success',
            'message' => 'Produto adicionado!',
            'data' => [
                'cart_count' => $cartCount,
                'item' => $cartItem->load('product'),
            ],
        ]);
    }

    // DELETE /api/cart/remove/{id} - Remover Item
    public function remove($id)
    {
        $cartItem = CartItem::whereHas('cart', function ($query) {
            $query->where('user_id', Auth::id());
        })->findOrFail($id);

        $cartItem->delete();

        return response()->json(['status' => 'success', 'message' => 'Item removido.']);
    }

    // PUT /api/cart/items/{id} - Atualizar quantidade
    public function updateQuantity(Request $request, $id)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cartItem = CartItem::whereHas('cart', function ($query) {
            $query->where('user_id', Auth::id());
        })->findOrFail($id);

        $cartItem->update([
            'quantity' => $validated['quantity'],
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Quantidade atualizada.',
            'data' => $cartItem->load('product'),
        ]);
    }
    
    

// ... dentro da classe CartController

public function checkout(Request $request)
{
    $user = Auth::user();

    $validated = $request->validate([
        'payment_method' => 'nullable|string|in:card,cash_on_delivery,multicaixa',
    ]);

    $paymentMethod = $validated['payment_method'] ?? 'cash_on_delivery';
    
    // 1. Pegar o carrinho do utilizador com os itens e produtos
    $cart = Cart::where('user_id', $user->id)->with('items.product')->first();

    // Verificação de segurança: se não houver carrinho ou se estiver vazio
    if (!$cart || $cart->items->isEmpty()) {
        return response()->json([
            'status' => 'error',
            'message' => 'O teu carrinho está vazio!'
        ], 400);
    }

    // 2. Usar uma Transaction (se algo falhar, o banco volta atrás e não estraga nada)
    return DB::transaction(function () use ($user, $cart, $paymentMethod) {
        
        // Calcular o total da encomenda
        $total = 0;
        foreach ($cart->items as $item) {
            $total += $item->product->price * $item->quantity;
        }

        // 3. Criar a Encomenda (Order)
        $order = Order::create([
            'user_id' => $user->id,
            'total_amount' => $total,
            'status' => 'pending', // Fica como pendente até ser paga
            'payment_method' => $paymentMethod,
            'payment_status' => 'pending',
        ]);

        // 4. Mover cada item do Carrinho para a tabela de Itens da Encomenda
        foreach ($cart->items as $item) {
            OrderItem::create([
                'order_id'   => $order->id,
                'product_id' => $item->product_id,
                'quantity'   => $item->quantity,
                'price'      => $item->product->price // Guardamos o preço atual (histórico)
            ]);
            
            // Opcional: Se quiseres baixar o stock do produto agora:
            // $item->product->decrement('stock', $item->quantity);
        }

        // 5. LIMPAR O CARRINHO (Apagar os itens, já que viraram uma encomenda)
        $cart->items()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Compra finalizada com sucesso!',
            'order_id' => $order->id,
            'total' => $total
        ]);
    });
}
}
