<!doctype html>
<html lang="pt-AO">
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        @page { margin: 0; }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            background: #f4f4f4;
            color: #1a1c1c;
            font-family: DejaVu Sans, Helvetica, Arial, sans-serif;
            font-size: 12px;
        }
        .header {
            background: #b22204;
            color: #ffffff;
            padding: 26px 34px;
        }
        .brand {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 4px;
        }
        .header-title {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 12px;
        }
        .meta {
            width: 100%;
            border-collapse: collapse;
            color: #ffffff;
        }
        .meta td {
            padding: 2px 0;
            border: 0;
            color: #ffffff;
            font-size: 11px;
        }
        .container {
            padding: 24px 34px 28px;
        }
        .section-title {
            color: #b22204;
            font-size: 15px;
            font-weight: 700;
            margin: 0 0 10px;
        }
        .cards {
            width: 100%;
            border-collapse: separate;
            border-spacing: 10px;
            margin: 0 -10px 18px;
        }
        .card {
            width: 25%;
            background: #ffffff;
            border: 1px solid #e6e6e6;
            border-radius: 8px;
            padding: 14px;
            vertical-align: top;
        }
        .card-label {
            color: #6b7280;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: .3px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .card-value {
            color: #b22204;
            font-size: 20px;
            font-weight: 700;
            line-height: 1.2;
        }
        .panel {
            background: #ffffff;
            border: 1px solid #e6e6e6;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 18px;
        }
        .chart-row {
            margin-bottom: 12px;
        }
        .chart-label {
            width: 125px;
            display: inline-block;
            font-weight: 700;
            color: #334155;
        }
        .chart-track {
            display: inline-block;
            width: 330px;
            height: 16px;
            background: #f0f1f1;
            border-radius: 999px;
            overflow: hidden;
            vertical-align: middle;
        }
        .chart-fill {
            display: block;
            height: 16px;
            background: #b22204;
            border-radius: 999px;
        }
        .chart-value {
            display: inline-block;
            width: 120px;
            padding-left: 10px;
            color: #5e5e5e;
            font-size: 11px;
            vertical-align: middle;
        }
        table.summary {
            width: 100%;
            border-collapse: collapse;
            background: #ffffff;
            border: 1px solid #e6e6e6;
            border-radius: 8px;
            overflow: hidden;
        }
        .summary th {
            background: #fff0ed;
            color: #8d1600;
            text-align: left;
            padding: 11px 12px;
            font-size: 11px;
            text-transform: uppercase;
        }
        .summary td {
            padding: 12px;
            border-top: 1px solid #eeeeee;
        }
        .summary td:last-child {
            font-weight: 700;
            color: #1a1c1c;
        }
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 10px 34px;
            background: #ffffff;
            border-top: 1px solid #e6e6e6;
            color: #6b7280;
            font-size: 10px;
            text-align: center;
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="brand">{{ $store_name }}</div>
        <div class="header-title">{{ $title }}</div>
        <table class="meta">
            <tr>
                <td>Data/hora de exportacao: {{ $exported_at }}</td>
                <td style="text-align: right;">Admin: {{ $admin_name }}</td>
            </tr>
        </table>
    </header>

    <main class="container">
        <h2 class="section-title">Resumo geral</h2>
        <table class="cards">
            <tr>
                <td class="card">
                    <div class="card-label">Total de produtos</div>
                    <div class="card-value">{{ number_format((float) $products, 0, ',', ' ') }}</div>
                </td>
                <td class="card">
                    <div class="card-label">Total de pedidos</div>
                    <div class="card-value">{{ number_format((float) $orders, 0, ',', ' ') }}</div>
                </td>
                <td class="card">
                    <div class="card-label">Total de utilizadores</div>
                    <div class="card-value">{{ number_format((float) $users, 0, ',', ' ') }}</div>
                </td>
                <td class="card">
                    <div class="card-label">Total de vendas</div>
                    <div class="card-value" style="font-size: 15px;">{{ $sales_formatted }}</div>
                </td>
            </tr>
        </table>

        <section class="panel">
            <h2 class="section-title">Grafico de indicadores</h2>
            @foreach ($chart as $item)
                <div class="chart-row">
                    <span class="chart-label">{{ $item['label'] }}</span>
                    <span class="chart-track">
                        <span class="chart-fill" style="width: {{ $item['percent'] }}%;"></span>
                    </span>
                    <span class="chart-value">{{ $item['formatted'] }}</span>
                </div>
            @endforeach
        </section>

        <h2 class="section-title">Tabela resumida</h2>
        <table class="summary">
            <thead>
                <tr>
                    <th>Indicador</th>
                    <th>Valor</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($summary as $row)
                    <tr>
                        <td>{{ $row['label'] }}</td>
                        <td>{{ $row['value'] }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </main>

    <footer class="footer">Gerado automaticamente pelo sistema Shope Ngola</footer>
</body>
</html>
