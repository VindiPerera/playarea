<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\CoinController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\SettingController;
use Illuminate\Support\Facades\Route;

// Public
Route::post('/login', [AuthController::class, 'login']);

// Protected
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Customers
    Route::get('/customers',               [CustomerController::class, 'index']);
    Route::post('/customers',              [CustomerController::class, 'store']);
    Route::delete('/customers/{customer}', [CustomerController::class, 'destroy']);

    // Games
    Route::get('/games',            [GameController::class, 'index']);
    Route::post('/games',           [GameController::class, 'store']);
    Route::put('/games/{game}',     [GameController::class, 'update']);
    Route::delete('/games/{game}',  [GameController::class, 'destroy']);

    // Coins
    Route::get('/coins',            [CoinController::class, 'index']);
    Route::post('/coins',           [CoinController::class, 'store']);
    Route::delete('/coins/{coin}',  [CoinController::class, 'destroy']);

    // Services
    Route::get('/services',                [ServiceController::class, 'index']);
    Route::post('/services',               [ServiceController::class, 'store']);
    Route::put('/services/{service}',      [ServiceController::class, 'update']);
    Route::delete('/services/{service}',   [ServiceController::class, 'destroy']);

    // Settings
    Route::get('/settings',         [SettingController::class, 'index']);
    Route::put('/settings',         [SettingController::class, 'update']);

    // Billing
    Route::get('/bills',            [BillingController::class, 'index']);
    Route::get('/bills/open',       [BillingController::class, 'openBills']);
    Route::post('/bills',           [BillingController::class, 'store']);
    Route::post('/bills/open',      [BillingController::class, 'openBill']);
    Route::get('/bills/{bill}',     [BillingController::class, 'show']);
    Route::post('/bills/{bill}/coins',    [BillingController::class, 'addCoins']);
    Route::post('/bills/{bill}/services', [BillingController::class, 'addService']);
    Route::post('/bills/{bill}/services/{billService}/stop',   [BillingController::class, 'stopService']);
    Route::delete('/bills/{bill}/services/{billService}',       [BillingController::class, 'removeService']);
    Route::post('/bills/{bill}/close',    [BillingController::class, 'closeBill']);
    Route::delete('/bills/{bill}',  [BillingController::class, 'destroy']);

    // Reports
    Route::get('/reports',                   [ReportController::class, 'index']);
    Route::get('/reports/today',             [ReportController::class, 'today']);
    Route::get('/reports/summary',           [ReportController::class, 'summary']);
    Route::get('/reports/billing',           [ReportController::class, 'billingReport']);
    Route::post('/reports/save-coin-count',  [ReportController::class, 'saveCoinCount']);
    Route::get('/reports/export-pdf',        [ReportController::class, 'exportPdf']);
});
