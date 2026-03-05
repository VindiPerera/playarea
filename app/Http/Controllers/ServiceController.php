<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index()
    {
        return Service::latest()->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'            => 'required|string|max:255',
            'base_price'      => 'required|numeric|min:0',
            'base_duration'   => 'required|integer|min:1',
            'stage1_duration' => 'nullable|integer|min:1',
            'stage1_price'    => 'nullable|numeric|min:0',
            'stage2_duration' => 'nullable|integer|min:1',
            'stage2_price'    => 'nullable|numeric|min:0',
        ]);

        $service = Service::create($request->only([
            'name', 'base_price', 'base_duration',
            'stage1_duration', 'stage1_price',
            'stage2_duration', 'stage2_price',
        ]));

        return response()->json($service, 201);
    }

    public function update(Request $request, Service $service)
    {
        $request->validate([
            'name'            => 'required|string|max:255',
            'base_price'      => 'required|numeric|min:0',
            'base_duration'   => 'required|integer|min:1',
            'stage1_duration' => 'nullable|integer|min:1',
            'stage1_price'    => 'nullable|numeric|min:0',
            'stage2_duration' => 'nullable|integer|min:1',
            'stage2_price'    => 'nullable|numeric|min:0',
        ]);

        $service->update($request->only([
            'name', 'base_price', 'base_duration',
            'stage1_duration', 'stage1_price',
            'stage2_duration', 'stage2_price',
        ]));

        return response()->json($service);
    }

    public function destroy(Service $service)
    {
        $service->delete();
        return response()->json(null, 204);
    }
}
