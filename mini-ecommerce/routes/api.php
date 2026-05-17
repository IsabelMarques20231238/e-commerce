<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\FavoriteController;


// --- ROTAS PÚBLICAS ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/products', [ProductController::class, 'index']); // Visitante vê produtos
Route::get('/products/{id}', [ProductController::class, 'show']);
// No routes/api.php, podes dar o nome à rota para o Laravel não se queixar
Route::post('/login', [AuthController::class, 'login'])->name('login');

 //categorias
  Route::get('/categories', [CategoryController::class, 'index']);
// --- ROTAS PROTEGIDAS (Exige Token) ---
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);
    Route::post('/logout', [AuthController::class, 'logout']);
   
    // Produtos
    Route::post('/products', [ProductController::class, 'store']);
    Route::post('/products/import', [ProductController::class, 'importFromExternalApi']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    Route::post('/products/{id}/image', [ProductController::class, 'updateImage']);
    //order
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    // Carrinho (Removi o middleware repetido)
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::post('/cart/checkout', [CartController::class, 'checkout']);
    Route::put('/cart/items/{id}', [CartController::class, 'updateQuantity']);
    Route::delete('/cart/remove/{id}', [CartController::class, 'remove']);

    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{product_id}', [FavoriteController::class, 'destroy']);

    
    
});

//Adim

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // Dashboard
    Route::get('/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/products', [AdminController::class, 'products']);
    Route::post('/products', [AdminController::class, 'storeProduct']);
    Route::post('/products/{id}', [AdminController::class, 'updateProduct']);
    Route::put('/products/{id}', [AdminController::class, 'updateProduct']);
    Route::delete('/products/{id}', [AdminController::class, 'destroyProduct']);
    Route::get('/orders', [AdminController::class, 'orders']);
    Route::get('/orders/{id}', [AdminController::class, 'orderShow']);
    Route::patch('/orders/{id}/status', [AdminController::class, 'updateOrderStatus']);
    Route::get('/reports/export-csv', [AdminController::class, 'exportCsv']);
    Route::get('/reports/export-pdf', [AdminController::class, 'exportPdfProfessional']);
    Route::patch('/products/{id}/add-stock', [AdminController::class, 'addStock']);
    Route::post('/products/import', [ProductController::class, 'importFromExternalApi']);
    // O CRUD de produtos que já tinhas pode ser "reutilizado" aqui para o admin
    // CRUD de Categorias
    Route::apiResource('categories', CategoryController::class);
});
