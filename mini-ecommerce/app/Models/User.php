<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // 1. IMPORTA ESTA LINHA

class User extends Authenticatable
{
    // 2. ADICIONA O "HasApiTokens" DENTRO DO USE DA CLASSE
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'avatar',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];
    
    public function cart() { return $this->hasOne(Cart::class); }

    public function orders() { return $this->hasMany(Order::class); }

    public function favorites() { return $this->hasMany(Favorite::class); }
}
