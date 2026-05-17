<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    // Esta linha diz ao Laravel: "Podes deixar o utilizador preencher estes 4 campos"
    
// 1. ADICIONADO 'image' AQUI - Sem isto o banco de dados não grava!
    protected $fillable = ['name', 'description', 'price', 'stock', 'image', 'category_id'];

    // Isto cria automaticamente a URL completa para o Angular
protected $appends = ['image_url']; // Isto força o Laravel a incluir o campo no JSON

public function getImageUrlAttribute()
{
    // Se o campo 'image' não estiver vazio, cria a URL completa
    if ($this->image) {
        if (filter_var($this->image, FILTER_VALIDATE_URL)) {
            return $this->image;
        }

        return asset('storage/' . $this->image);
    }
    return null;
}



public function category()
{
    return $this->belongsTo(Category::class);
}

public function favorites()
{
    return $this->hasMany(Favorite::class);
}
}
