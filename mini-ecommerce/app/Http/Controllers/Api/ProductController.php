<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product; // Importante: importar o modelo
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
public function index(Request $request) {
    $query = Product::with('category');

    if ($request->filled('category_id')) {
        $query->where('category_id', $request->category_id);
    }

    if ($request->filled('category')) {
        $query->whereHas('category', function ($categoryQuery) use ($request) {
            $categoryQuery->where('name', $request->category);
        });
    }

    if ($request->search) {
        $query->where('name', 'like', '%' . $request->search . '%');
    }

    return response()->json(['status' => 'success', 'data' => $query->orderBy('id')->get()]);
}

public function show($id)
{
    $product = Product::with('category')->find($id);

    if (!$product) {
        return response()->json([
            'status'  => 'error',
            'message' => 'Produto não encontrado.'
        ], 404);
    }

    return response()->json([
        'status' => 'success',
        'data'   => $product
    ], 200);
}
    /**
     * Store a newly created resource in storage.
     */
   /**
     * FASE 2.2: Criar um novo produto
     */
public function store(Request $request)
{
    try {
        // FASE 3: Validação (Se falhar, o Laravel lança uma exceção automaticamente)
        $validatedData = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'required|string',
            'price'       => 'required|numeric|min:0.01', // Preço tem de ser > 0
            'category_id' => 'required|exists:categories,id',
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048'
        ]);
        if ($request->hasFile('image')) {

    $path = $request->file('image')->store('products', 'public');

    $validatedData['image'] = $path;
}

        // FASE 4: Criar e responder com sucesso padronizado
        $product = Product::create($validatedData);

        return response()->json([
            'status'  => 'success',
            'message' => 'Produto criado com sucesso!',
            'data'    => $product
        ], 201);

    } catch (\Illuminate\Validation\ValidationException $e) {
        // FASE 4: Resposta de erro de validação padronizada
        return response()->json([
            'status'  => 'error',
            'message' => 'Erro de validação',
            'errors'  => $e->errors()
        ], 422);
    }
}

public function importFromExternalApi()
{
    try {
        $response = Http::timeout(15)->get('https://dummyjson.com/products', [
            'limit' => 200,
        ]);
    } catch (ConnectionException $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Não foi possível conectar à API externa.',
        ], 502);
    }

    if (!$response->successful()) {
        return response()->json([
            'status' => 'error',
            'message' => 'Não foi possível importar produtos da API externa.',
        ], 502);
    }

    $productsByExternalCategory = collect($response->json('products', []))->groupBy('category');
    $imported = 0;
    $skipped = 0;
    $usedExternalProductIds = [];

    foreach ($this->categoryMapping() as $categoryName => $externalCategories) {
        $category = Category::where('name', $categoryName)->first();

        if (!$category) {
            $skipped += 10;
            continue;
        }

        $externalProducts = collect($externalCategories)
            ->flatMap(fn ($externalCategory) => $productsByExternalCategory->get($externalCategory, collect()))
            ->reject(fn ($product) => in_array($product['id'] ?? null, $usedExternalProductIds))
            ->unique('id')
            ->unique('title')
            ->take(10);

        if ($externalProducts->count() < 10) {
            $skipped += 10 - $externalProducts->count();
        }

        foreach ($externalProducts as $externalProduct) {
            $usedExternalProductIds[] = $externalProduct['id'];

            Product::updateOrCreate(
                ['name' => $externalProduct['title']],
                [
                    'description' => $externalProduct['description'] ?? '',
                    'price' => $this->priceInKwanza($externalProduct['price'] ?? 0),
                    'stock' => $externalProduct['stock'] ?? 0,
                    'category_id' => $category->id,
                    'image' => $externalProduct['thumbnail'] ?? null,
                ]
            );

            $imported++;
        }
    }

    return response()->json([
        'status' => 'success',
        'imported' => $imported,
        'skipped' => $skipped,
    ]);
}

private function categoryMapping(): array
{
    return [
        'Telemóveis' => ['smartphones'],
        'Computadores' => ['laptops', 'tablets', 'mobile-accessories'],
        'Tecnologia' => ['mobile-accessories', 'tablets'],
        'Moda' => ['mens-shirts', 'womens-dresses', 'tops', 'mens-shoes', 'womens-shoes'],
        'Beleza' => ['beauty', 'fragrances', 'skin-care'],
        'Alimentação' => ['groceries'],
        'Desporto' => ['sports-accessories'],
        'Acessórios' => ['mens-watches', 'womens-watches', 'womens-bags', 'womens-jewellery', 'sunglasses', 'mobile-accessories', 'sports-accessories'],
        'Casa' => ['furniture', 'home-decoration', 'kitchen-accessories'],
        'Outros' => ['vehicle', 'motorcycle'],
    ];
}

private function priceInKwanza(float|int $price): int
{
    return (int) round($price * 950);
}
   
  
    /**
     * Update the specified resource in storage.
     */
   /**
     * FASE 2.4: Atualizar um produto existente
     */
public function update(Request $request, $id)
{
    $product = Product::find($id);

    if (!$product) {
        return response()->json([
            'status'  => 'error',
            'message' => 'Produto não encontrado.',
            'category_id' => 'sometimes|required|exists:categories,id'
        ], 404);
    }

    try {
        // FASE 3: Validação parcial
        $validatedData = $request->validate([
            'name'        => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'price'       => 'sometimes|required|numeric|min:0.01',
            'stock'       => 'sometimes|required|integer|min:0',
        ]);

        $product->update($validatedData);

        return response()->json([
            'status'  => 'success',
            'message' => 'Produto atualizado com sucesso!',
            'data'    => $product
        ], 200);

    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'status'  => 'error',
            'message' => 'Dados inválidos para atualização.',
            'errors'  => $e->errors()
        ], 422);
    }
}

    /**
     * Remove the specified resource from storage.
     */
   /**
     * FASE 2.5: Eliminar um produto
     */
    public function destroy($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Produto não encontrado.'
            ], 404);
        }

        $product->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Produto eliminado com sucesso!'
        ], 200);
    }
    


public function updateImage(Request $request, $id)
{
    // 1. Validação (Apenas imagens reais até 2MB)
    $request->validate([
        'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
    ]);

    $product = Product::findOrFail($id);

    // 2. Lógica de Upload
    if ($request->hasFile('image')) {
        // Apagar imagem antiga se existir para não encher o disco
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        // Guarda na pasta 'products' dentro de storage/app/public
        $path = $request->file('image')->store('products', 'public');
        
        // Atualiza o caminho no banco de dados
        $product->update(['image' => $path]);
    }

    return response()->json([
        'status' => 'success',
        'message' => 'Imagem atualizada com sucesso!',
        'image_url' => $product->image_url
    ]);
}
}
