<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;
class CategoryController extends Controller
{
    //
    
    // Listar todas
public function index() {
    return response()->json(['status' => 'success', 'data' => Category::all()]);
}

// Criar nova
public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string',
        'slug' => 'required|string|unique:categories'
    ]);

    $category = Category::create($validated);

    return response()->json([
        'status' => 'success',
        'data' => $category
    ]);
}

// Apagar
public function destroy($id) {
    Category::findOrFail($id)->delete();
    return response()->json(['status' => 'success', 'message' => 'Categoria removida']);
}
}
