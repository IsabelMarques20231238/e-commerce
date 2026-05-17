<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = ['order_id', 'product_id', 'quantity', 'price'];

    // Um item de encomenda pertence a uma Encomenda pai
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    // Um item de encomenda refere-se a um Produto
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}