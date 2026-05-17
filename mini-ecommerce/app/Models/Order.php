<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    // Campos que permitimos inserir na base de dados
    protected $fillable = ['user_id', 'total_amount', 'status', 'payment_method', 'payment_status'];

    // Uma Encomenda tem muitos Itens
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    // Uma Encomenda pertence a um Utilizador
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
