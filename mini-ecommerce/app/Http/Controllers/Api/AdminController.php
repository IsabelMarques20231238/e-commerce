<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request; 
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Dompdf\Dompdf;
use Illuminate\Support\Facades\Auth;

class AdminController extends Controller
{
    public function dashboard()
    {
        $totalSales = Order::where(function ($query) {
            $query->where('status', 'paid')
                ->orWhere('payment_status', 'paid');
        })->sum('total_amount');

        return response()->json([
            'status' => 'success',
            'data' => [
                'totalProducts' => Product::count(),
                'totalOrders' => Order::count(),
                'totalUsers' => User::count(),
                'totalSales' => (float) $totalSales,
                'total_revenue' => Order::where('status', 'paid')->sum('total_amount'),
                'total_orders'  => Order::count(),
                'total_users'   => User::where('role', 'user')->count(),
                'low_stock'     => Product::where('stock', '<', 3)->get(),
                'recent_orders' => Order::with('user')->latest()->limit(5)->get(),
                'best_sellers'  => DB::table('order_items')
                    ->select('product_id', DB::raw('SUM(quantity) as total_sold'))
                    ->groupBy('product_id')
                    ->orderBy('total_sold', 'desc')
                    ->limit(5)
                    ->get()
            ]
        ]);
    }

    public function products()
    {
        return response()->json([
            'status' => 'success',
            'data' => Product::with('category')->latest()->get(),
        ]);
    }

    public function storeProduct(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0.01',
            'stock' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product = Product::create($validated)->load('category');

        return response()->json([
            'status' => 'success',
            'message' => 'Produto criado com sucesso.',
            'data' => $product,
        ], 201);
    }

    public function updateProduct(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'price' => 'sometimes|required|numeric|min:0.01',
            'stock' => 'sometimes|required|integer|min:0',
            'category_id' => 'sometimes|required|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($request->hasFile('image')) {
            if ($product->image && !filter_var($product->image, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($product->image);
            }

            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Produto atualizado com sucesso.',
            'data' => $product->fresh('category'),
        ]);
    }

    public function destroyProduct($id)
    {
        $product = Product::findOrFail($id);

        if ($product->image && !filter_var($product->image, FILTER_VALIDATE_URL)) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Produto removido com sucesso.',
        ]);
    }

    public function orders()
    {
        return response()->json([
            'status' => 'success',
            'data' => Order::with('user')->latest()->get(),
        ]);
    }

    public function orderShow($id)
    {
        return response()->json([
            'status' => 'success',
            'data' => Order::with(['items.product', 'user'])->findOrFail($id),
        ]);
    }

    public function updateOrderStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['pending', 'paid', 'shipped', 'delivered', 'cancelled'])],
        ]);

        $order = Order::findOrFail($id);
        $order->update(['status' => $validated['status']]);

        if ($validated['status'] === 'paid') {
            $order->update(['payment_status' => 'paid']);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Status do pedido atualizado.',
            'data' => $order->fresh('user'),
        ]);
    }

    public function exportCsv(Request $request)
    {
        $data = $this->reportData($request);

        $rows = ["Indicador,Valor"];
        $rows[] = 'Produtos,"' . $data['products'] . '"';
        $rows[] = 'Pedidos,"' . $data['orders'] . '"';
        $rows[] = 'Utilizadores,"' . $data['users'] . '"';
        $rows[] = 'Vendas,"' . $data['sales_formatted'] . '"';

        return response("\xEF\xBB\xBF" . implode("\n", $rows), 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="shope-ngola-report.csv"',
        ]);
    }

    public function exportPdf(Request $request)
    {
        $data = [
            'title' => 'Shope Ngola - Relatório Administrativo',
            'products' => Product::count(),
            'orders' => Order::count(),
            'users' => User::count(),
            'sales' => Order::where('payment_status', 'paid')->sum('total_amount'),
            'exported_at' => now()->format('d/m/Y H:i:s'),
            'admin_name' => Auth::user()?->name ?? 'Administrador',
        ];

        // Se Dompdf estiver disponível, renderiza a view; caso contrário, mantém fallback simples
        if (class_exists(Dompdf::class)) {
            $html = view('admin.report', $data)->render();

            $dompdf = new Dompdf();
            $dompdf->loadHtml($html);
            $dompdf->setPaper('A4', 'portrait');
            $dompdf->render();

            return response($dompdf->output(), 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="shope-ngola-report.pdf"',
            ]);
        }

        // Fallback: texto simples em PDF binário (antigo)
        $content = "Shope Ngola - Relatorio Admin\n"
            . "Produtos: " . $data['products'] . "\n"
            . "Pedidos: " . $data['orders'] . "\n"
            . "Utilizadores: " . $data['users'] . "\n"
            . "Vendas: " . $data['sales'] . " Kz";

        return response($this->simplePdf($content), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="shope-ngola-report.pdf"',
        ]);
    }

    public function exportPdfProfessional(Request $request)
    {
        $data = $this->reportData($request);

        if (class_exists(Dompdf::class)) {
            $html = view('admin.report', $data)->render();

            $dompdf = new Dompdf();
            $dompdf->getOptions()->set('isRemoteEnabled', true);
            $dompdf->getOptions()->set('defaultFont', 'DejaVu Sans');
            $dompdf->loadHtml($html);
            $dompdf->setPaper('A4', 'portrait');
            $dompdf->render();

            return response($dompdf->output(), 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="shope-ngola-report.pdf"',
            ]);
        }

        $content = "Shope Ngola - Relatorio Administrativo\n"
            . "Produtos: " . $data['products'] . "\n"
            . "Pedidos: " . $data['orders'] . "\n"
            . "Utilizadores: " . $data['users'] . "\n"
            . "Vendas: " . $data['sales_formatted'];

        return response($this->simplePdf($content), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="shope-ngola-report.pdf"',
        ]);
    }

    private function reportData(Request $request): array
    {
        $sales = (float) Order::where(function ($query) {
            $query->where('payment_status', 'paid')
                ->orWhere('status', 'paid');
        })->sum('total_amount');

        $products = Product::count();
        $orders = Order::count();
        $users = User::count();

        $chartValues = [
            'Produtos' => $products,
            'Pedidos' => $orders,
            'Utilizadores' => $users,
            'Vendas' => $sales,
        ];

        $maxValue = max(1, max(array_values($chartValues)));
        $chart = [];

        foreach ($chartValues as $label => $value) {
            $chart[] = [
                'label' => $label,
                'value' => $value,
                'formatted' => $label === 'Vendas'
                    ? $this->formatKwanza($value)
                    : number_format((float) $value, 0, ',', ' '),
                'percent' => max(4, round(($value / $maxValue) * 100, 2)),
            ];
        }

        return [
            'title' => 'Shope Ngola - Relatório Administrativo',
            'store_name' => 'Shope Ngola',
            'products' => $products,
            'orders' => $orders,
            'users' => $users,
            'sales' => $sales,
            'sales_formatted' => $this->formatKwanza($sales),
            'exported_at' => now()->format('d/m/Y H:i:s'),
            'admin_name' => $request->user()?->name ?? Auth::user()?->name ?? 'Administrador',
            'chart' => $chart,
            'summary' => [
                ['label' => 'Produtos', 'value' => number_format((float) $products, 0, ',', ' ')],
                ['label' => 'Pedidos', 'value' => number_format((float) $orders, 0, ',', ' ')],
                ['label' => 'Utilizadores', 'value' => number_format((float) $users, 0, ',', ' ')],
                ['label' => 'Vendas', 'value' => $this->formatKwanza($sales)],
            ],
        ];
    }

    private function formatKwanza(float|int $value): string
    {
        return number_format((float) $value, 2, ',', ' ') . ' Kz';
    }
    
    // Rota: PATCH /api/admin/products/{id}/add-stock
public function addStock(Request $request, $id) {
    $request->validate(['amount' => 'required|integer|min:1']);
    
    $product = Product::findOrFail($id);
    $product->increment('stock', $request->amount);

    return response()->json([
        'status' => 'success',
        'message' => "Stock atualizado! Novo stock: {$product->stock}"
    ]);
}

private function simplePdf(string $text): string
{
    $safeText = str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $text);
    $stream = "BT /F1 16 Tf 50 780 Td 18 TL (" . str_replace("\n", ") Tj T* (", $safeText) . ") Tj ET";
    $objects = [
        "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
        "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
        "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
        "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
        "5 0 obj << /Length " . strlen($stream) . " >> stream\n{$stream}\nendstream endobj",
    ];

    $pdf = "%PDF-1.4\n";
    $offsets = [0];

    foreach ($objects as $object) {
        $offsets[] = strlen($pdf);
        $pdf .= $object . "\n";
    }

    $xref = strlen($pdf);
    $pdf .= "xref\n0 " . (count($objects) + 1) . "\n0000000000 65535 f \n";

    for ($i = 1; $i <= count($objects); $i++) {
        $pdf .= sprintf("%010d 00000 n \n", $offsets[$i]);
    }

    return $pdf . "trailer << /Size " . (count($objects) + 1) . " /Root 1 0 R >>\nstartxref\n{$xref}\n%%EOF";
}
}
