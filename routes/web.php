<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'Welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'Dashboard')->name('dashboard');
    Route::inertia('rh/indicadores', 'Rh/Indicadores')->name('rh.indicadores');
});

require __DIR__.'/settings.php';
