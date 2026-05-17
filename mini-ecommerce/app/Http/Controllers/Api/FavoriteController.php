<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        $favorites = $request->user()
            ->favorites()
            ->with('product.category')
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $favorites,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $favorite = Favorite::firstOrCreate([
            'user_id' => $request->user()->id,
            'product_id' => $validated['product_id'],
        ]);

        $favorite->load('product.category');

        return response()->json([
            'status' => 'success',
            'message' => 'Produto adicionado aos favoritos.',
            'data' => $favorite,
        ]);
    }

    public function destroy(Request $request, $productId)
    {
        $request->user()
            ->favorites()
            ->where('product_id', $productId)
            ->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Produto removido dos favoritos.',
        ]);
    }
}
