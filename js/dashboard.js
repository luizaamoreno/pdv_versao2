// Verificar se o usuário está logado e tem permissão
function checkAuth() {
    const loggedIn = localStorage.getItem('loggedIn');
    const userType = localStorage.getItem('userType');
    
    if (loggedIn !== 'true') {
        window.location.href = 'index.html';
        return false;
    }

    if (window.location.pathname.includes('dashboard') || window.location.pathname.includes('inventory')) {
        if (userType !== 'admin') {
            window.location.href = 'order.html';
            return false;
        }
    }

    return true;
}

// Chamar a função de verificação no início do script
if (!checkAuth()) {
    // Se a autenticação falhar, o script para aqui devido ao redirecionamento
    throw new Error('Autenticação falhou');
}

// Função para atualizar a data atual
function updateCurrentDate() {
    const currentDate = new Date().toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.textContent = currentDate;
    }
}

// Função para formatar valor em Real brasileiro
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

// Função para formatar data no padrão brasileiro
function formatDate(date) {
    return date.toLocaleString('pt-BR', { 
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Função para converter string de data DD/MM/AAAA, HH:MM para objeto Date
function parseDate(dateString) {
    if (!dateString) {
        console.warn('Data inválida recebida:', dateString);
        return new Date(); // Retorna a data atual como fallback
    }
    try {
        const [datePart, timePart] = dateString.split(', ');
        const [day, month, year] = datePart.split('/').map(Number);
        if (timePart) {
            const [hour, minute] = timePart.split(':').map(Number);
            return new Date(year, month - 1, day, hour, minute);
        } else {
            return new Date(year, month - 1, day);
        }
    } catch (error) {
        console.error('Erro ao analisar a data:', dateString, error);
        return new Date(); // Retorna a data atual como fallback
    }
}

// Função para obter a data atual no fuso horário de São Paulo
function getCurrentDateBR() {
    return new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

// Função para obter o histórico de vendas
function getSalesHistory() {
    return JSON.parse(localStorage.getItem('salesHistory')) || [];
}

// Função para obter os produtos
function getProducts() {
    return JSON.parse(localStorage.getItem('products')) || [];
}

// Função para comparar datas (apenas dia, mês e ano)
function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

// Função para calcular o total de vendas do dia
function getTotalSalesForDay(date) {
    const sales = getSalesHistory();
    const totalSales = sales.filter(sale => {
        if (!sale.date) {
            console.warn('Venda sem data encontrada:', sale);
            return false;
        }
        const saleDate = parseDate(sale.date);
        return isSameDay(saleDate, date);
    }).reduce((total, sale) => total + parseFloat(sale.total), 0);
    
    return totalSales;
}

// Função para obter vendas por hora do dia
function getSalesByHour(date) {
    const sales = getSalesHistory();
    const salesByHour = Array(24).fill(0);
    
    sales.filter(sale => {
        const saleDate = parseDate(sale.date);
        return isSameDay(saleDate, date);
    }).forEach(sale => {
        const saleDate = parseDate(sale.date);
        const hour = saleDate.getHours();
        salesByHour[hour] += parseFloat(sale.total);
    });
    
    console.log('Vendas por hora:', salesByHour);
    return salesByHour;
}

// Função para obter os 5 produtos mais vendidos
function getTopProducts() {
    const sales = getSalesHistory();
    const productSales = {};
    
    sales.forEach(sale => {
        sale.items.forEach(item => {
            if (productSales[item.code]) {
                productSales[item.code].quantity += item.quantity;
                productSales[item.code].total += item.price * item.quantity;
            } else {
                productSales[item.code] = {
                    name: item.name,
                    quantity: item.quantity,
                    total: item.price * item.quantity
                };
            }
        });
    });
    
    return Object.values(productSales)
                 .sort((a, b) => b.quantity - a.quantity)
                 .slice(0, 5);
}

// Função para obter produtos com estoque baixo
function getLowStockProducts() {
    const products = getProducts();
    const lowStockThreshold = 10; // Definir um limite para considerar estoque baixo
    
    return products.filter(product => product.quantity <= lowStockThreshold)
                   .sort((a, b) => a.quantity - b.quantity)
                   .slice(0, 5);
}

// Função para obter o número de clientes atendidos no dia
function getCustomersServedToday() {
    const sales = getSalesHistory();
    const today = new Date();
    
    return new Set(sales.filter(sale => isSameDay(parseDate(sale.date), today))
                        .map(sale => sale.client)).size;
}

// Função para obter o cliente que mais comprou (em valor)
function getTopCustomer() {
    const sales = getSalesHistory();
    const customerSales = {};
    
    sales.forEach(sale => {
        if (customerSales[sale.client]) {
            customerSales[sale.client] += sale.total;
        } else {
            customerSales[sale.client] = sale.total;
        }
    });
    
    const topCustomer = Object.entries(customerSales)
                              .sort((a, b) => b[1] - a[1])[0];
    
    return { name: topCustomer[0], total: topCustomer[1] };
}

// Função para obter a distribuição dos métodos de pagamento
function getPaymentMethodDistribution(startDate, endDate) {
    const sales = getSalesHistory();
    const distribution = {};
    
    sales.filter(sale => {
        const saleDate = parseDate(sale.date);
        return saleDate >= startDate && saleDate <= endDate;
    }).forEach(sale => {
        if (distribution[sale.paymentMethod]) {
            distribution[sale.paymentMethod].total += parseFloat(sale.total);
            distribution[sale.paymentMethod].count += 1;
        } else {
            distribution[sale.paymentMethod] = {
                total: parseFloat(sale.total),
                count: 1
            };
        }
    });
    
    return distribution;
}

// Função para obter o valor médio de compra por método de pagamento
function getAveragePurchaseByPaymentMethod(startDate, endDate) {
    const distribution = getPaymentMethodDistribution(startDate, endDate);
    const averageByMethod = {};
    
    for (const method in distribution) {
        averageByMethod[method] = distribution[method].total / distribution[method].count;
    }
    
    return averageByMethod;
}

// Função para obter comparativo de vendas
function getSalesComparison() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    
    return {
        today: getTotalSalesForDay(today),
        yesterday: getTotalSalesForDay(yesterday),
        lastWeek: getTotalSalesForDay(lastWeek),
        thisMonth: getTotalSalesForPeriod(thisMonth, today),
        lastMonth: getTotalSalesForPeriod(lastMonth, new Date(today.getFullYear(), today.getMonth(), 0))
    };
}

// Função auxiliar para obter o total de vendas para um período
function getTotalSalesForPeriod(startDate, endDate) {
    const sales = getSalesHistory();
    return sales.filter(sale => {
        const saleDate = parseDate(sale.date);
        return saleDate >= startDate && saleDate <= endDate;
    }).reduce((total, sale) => total + sale.total, 0);
}

// Função para obter produtos esgotados
function getOutOfStockProducts() {
    const products = getProducts();
    return products.filter(product => product.quantity === 0);
}

// Função para sugerir reposição de estoque
function suggestRestocking() {
    const products = getProducts();
    const lowStockThreshold = 10; // Definir um limite para considerar estoque baixo
    const restockSuggestions = products.filter(product => product.quantity <= lowStockThreshold)
                                       .map(product => ({
                                           name: product.name,
                                           currentStock: product.quantity,
                                           suggestedRestock: lowStockThreshold - product.quantity + 10 // Sugestão básica
                                       }));
    return restockSuggestions;
}

// Função para atualizar o dashboard
function updateDashboard() {
    updateSalesSummary();
    updateTopProducts();
    updateCustomerInfo();
    updatePaymentMethods();
    updateSalesComparison();
    updateAlerts();
    updatePredictions();
}

// Função para atualizar o resumo de vendas
function updateSalesSummary() {
    const today = new Date();
    const totalSales = getTotalSalesForDay(today);
    const salesByHour = getSalesByHour(today);
    
    document.getElementById('total-sales').innerHTML = `
        <h3>Total de Vendas Hoje</h3>
        <p>${formatCurrency(totalSales)}</p>
    `;
    
    // Atualizar gráfico de vendas por hora
    const ctx = document.getElementById('sales-chart');
    if (ctx) {
        if (window.salesChart) {
            window.salesChart.destroy();
        }
        
        window.salesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Array.from({length: 24}, (_, i) => `${i}h`),
                datasets: [{
                    label: 'Vendas por Hora',
                    data: salesByHour,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Vendas por Hora'
                    },
                    legend: {
                        display: false
                    }
                }
            }
        });
    } else {
        console.error('Elemento canvas para o gráfico de vendas não encontrado');
    }
}

// Função para atualizar os produtos mais vendidos e com estoque baixo
function updateTopProducts() {
    const topProducts = getTopProducts();
    const lowStockProducts = getLowStockProducts();
    
    let topProductsHtml = '<h3>Top 5 Produtos Mais Vendidos</h3><ul class="product-list">';
    topProducts.forEach(product => {
        topProductsHtml += `<li><span>${product.name}</span><span>${product.quantity} unidades</span></li>`;
    });
    topProductsHtml += '</ul>';
    
    let lowStockHtml = '<h3>Produtos com Estoque Baixo</h3><ul class="product-list">';
    lowStockProducts.forEach(product => {
        lowStockHtml += `<li><span>${product.name}</span><span>${product.quantity} unidades</span></li>`;
    });
    lowStockHtml += '</ul>';
    
    document.getElementById('top-5-products').innerHTML = topProductsHtml;
    document.getElementById('low-stock-products').innerHTML = lowStockHtml;
}

// Função para atualizar as informações dos clientes
function updateCustomerInfo() {
    const customersServed = getCustomersServedToday();
    const topCustomer = getTopCustomer();
    
    document.getElementById('customers-served').innerHTML = `
        <h3>Clientes Atendidos Hoje</h3>
        <p>${customersServed}</p>
    `;
    
    document.getElementById('top-customer').innerHTML = `
        <h3>Cliente que Mais Comprou</h3>
        <p>${topCustomer.name} - ${formatCurrency(topCustomer.total)}</p>
    `;
}

// Função para atualizar as informações dos métodos de pagamento
function updatePaymentMethods() {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    const distribution = getPaymentMethodDistribution(lastMonth, today);
    
    const startDateFormatted = formatDate(lastMonth);
    const endDateFormatted = formatDate(today);
    
    // Atualizar o período no elemento HTML
    document.getElementById('payment-period').innerHTML = `
        <p>Período: ${startDateFormatted} - ${endDateFormatted}</p>
    `;

    // Criar gráfico de pizza para distribuição
    const ctx = document.getElementById('payment-distribution-chart');
    if (ctx) {
        if (window.paymentChart) {
            window.paymentChart.destroy();
        }
        
        const labels = Object.keys(distribution);
        const data = labels.map(method => distribution[method].total);
        const total = data.reduce((sum, value) => sum + value, 0);
        const percentages = data.map(value => ((value / total) * 100).toFixed(2));

        window.paymentChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribuição dos Métodos de Pagamento por Valor Total'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const percentage = percentages[context.dataIndex];
                                return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    },
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                }
            }
        });
    } else {
        console.error('Elemento canvas para o gráfico de métodos de pagamento não encontrado');
    }
    
    // Criar tabela para valor médio, total e contagem de compras
    let tableHtml = `
        <h3>Detalhes por Método de Pagamento</h3>
        <table class="payment-table">
            <thead>
                <tr>
                    <th>Método de Pagamento</th>
                    <th>Valor Total</th>
                    <th>Valor Médio</th>
                    <th>Número de Vendas</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    for (const method in distribution) {
        const totalValue = distribution[method].total;
        const count = distribution[method].count;
        const averageValue = totalValue / count;
        
        tableHtml += `
            <tr>
                <td>${method}</td>
                <td>${formatCurrency(totalValue)}</td>
                <td>${formatCurrency(averageValue)}</td>
                <td>${count}</td>
            </tr>
        `;
    }
    
    tableHtml += `
            </tbody>
        </table>
    `;
    
    document.getElementById('average-purchase-table').innerHTML = tableHtml;
}

// Função para atualizar os comparativos de vendas
function updateSalesComparison() {
    const comparison = getSalesComparison();
    
    const dailyComparison = `
        <h3>Comparativo Diário</h3>
        <ul class="comparison-list">
            <li><span>Hoje:</span><span>${formatCurrency(comparison.today)}</span></li>
            <li><span>Ontem:</span><span>${formatCurrency(comparison.yesterday)}</span></li>
            <li><span>Semana passada:</span><span>${formatCurrency(comparison.lastWeek)}</span></li>
        </ul>
    `;
    
    const monthlyComparison = `
        <h3>Comparativo Mensal</h3>
        <ul class="comparison-list">
            <li><span>Este mês:</span><span>${formatCurrency(comparison.thisMonth)}</span></li>
            <li><span>Mês passado:</span><span>${formatCurrency(comparison.lastMonth)}</span></li>
        </ul>
    `;
    
    let salesGoal = localStorage.getItem('salesGoal') ? parseFloat(localStorage.getItem('salesGoal')) : 100000;
    const progress = (comparison.thisMonth / salesGoal) * 100;
    
    const salesGoalProgress = `
        <h3>Progresso da Meta Mensal</h3>
        <div class="progress-bar">
            <div class="progress-bar-fill" style="width: ${progress}%;"></div>
        </div>
        <p>${progress.toFixed(2)}% da meta atingida</p>
        <p>Meta atual: ${formatCurrency(salesGoal)}</p>
        <form id="sales-goal-form">
            <label for="new-sales-goal">Nova meta mensal:</label>
            <input type="number" id="new-sales-goal" name="new-sales-goal" min="0" step="1000" required>
            <button type="submit">Atualizar Meta</button>
        </form>
    `;
    
    document.getElementById('daily-comparison').innerHTML = dailyComparison;
    document.getElementById('monthly-comparison').innerHTML = monthlyComparison;
    document.getElementById('sales-goal-progress').innerHTML = salesGoalProgress;
    
    // Adicionar evento de submissão do formulário
    document.getElementById('sales-goal-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const newGoal = document.getElementById('new-sales-goal').value;
        localStorage.setItem('salesGoal', newGoal);
        updateSalesComparison(); // Atualizar a exibição
    });
}

// Função para atualizar os alertas
function updateAlerts() {
    const outOfStock = getOutOfStockProducts();
    
    let alertsHtml = '<h3>Produtos Esgotados</h3>';
    if (outOfStock.length > 0) {
        alertsHtml += '<ul class="alert-list">';
        outOfStock.forEach(product => {
            alertsHtml += `<li class="alert alert-item">${product.name}</li>`;
        });
        alertsHtml += '</ul>';
    } else {
        alertsHtml += '<p>Nenhum produto esgotado no momento.</p>';
    }
    
    document.getElementById('out-of-stock').innerHTML = alertsHtml;
}

// Função para atualizar as previsões
function updatePredictions() {
    const restockSuggestions = suggestRestocking();
    
    let suggestionsHtml = '<h3>Sugestões de Reposição de Estoque</h3>';
    if (restockSuggestions.length > 0) {
        suggestionsHtml += '<ul class="suggestion-list">';
        restockSuggestions.forEach(suggestion => {
            suggestionsHtml += `
                <li class="suggestion suggestion-item">
                    <span>${suggestion.name}</span>
                    <div class="stock-info">
                        <span class="stock-label">Estoque atual: ${suggestion.currentStock}</span>
                        <span class="stock-label">Sugestão de reposição: ${suggestion.suggestedRestock}</span>
                    </div>
                </li>
            `;
        });
        suggestionsHtml += '</ul>';
    } else {
        suggestionsHtml += '<p>Nenhuma sugestão de reposição no momento.</p>';
    }
    
    document.getElementById('restock-suggestions').innerHTML = suggestionsHtml;
}

// Inicialização do dashboard
document.addEventListener('DOMContentLoaded', function() {
    updateDashboard();
    
    // Atualizar o dashboard a cada 5 minutos
    setInterval(updateDashboard, 300000);

    // Atualizar a data atual
    updateCurrentDate();

    // Atualizar a data a cada minuto
    setInterval(updateCurrentDate, 60000);

    // Adicionar evento de logout ao botão
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(event) {
            event.preventDefault(); // Previne o comportamento padrão do link
            logout();
        });
    } else {
        console.error('Botão de logout não encontrado');
    }
});

// Função de logout
function logout() {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('userType');
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', function() {
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const generateReportBtn = document.getElementById('generate-report');

    // Definir a data inicial como o primeiro dia do mês atual
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    startDateInput.value = firstDayOfMonth.toISOString().split('T')[0];

    // Definir a data final como o dia atual
    const today = new Date();
    endDateInput.value = today.toISOString().split('T')[0];

    generateReportBtn.addEventListener('click', function() {
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);

        if (startDate > endDate) {
            alert('A data de início deve ser anterior ou igual à data de fim.');
            return;
        }

        // Ajustar a data de fim para incluir todo o último dia
        endDate.setHours(23, 59, 59, 999);

        downloadSalesReport(startDate, endDate);
    });
});

function downloadSalesReport(startDate, endDate) {
    const salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];

    console.log('Total de vendas no histórico:', salesHistory.length);

    // Filtrar vendas pelo intervalo de datas
    const filteredSales = salesHistory.filter(sale => {
        const saleDate = parseDate(sale.date);
        return saleDate >= startDate && saleDate <= endDate;
    });

    console.log('Vendas filtradas:', filteredSales.length);

    const workbookData = [
        ['Data', 'Número do Pedido', 'Cliente', 'Itens', 'Subtotal', 'Desconto', 'Total', 'Método de Pagamento']
    ];

    filteredSales.forEach(sale => {
        const itemsDescription = sale.items.map(item => `${item.name} (${item.quantity})`).join(', ');
        workbookData.push([
            sale.date,
            sale.orderNumber,
            sale.client,
            itemsDescription,
            parseFloat(sale.subtotal),
            sale.discountPercentage + '%',
            parseFloat(sale.total),
            sale.paymentMethod
        ]);
    });

    console.log('Linhas de dados geradas:', workbookData.length - 1);

    const ws = XLSX.utils.aoa_to_sheet(workbookData);

    // Aplicar estilos
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + "1";
        if (!ws[address]) continue;
        ws[address].s = { font: { bold: true }, fill: { fgColor: { rgb: "FFFFAA00" } } };
    }

    // Formatar colunas de valores como moeda
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        ['E', 'G'].forEach(col => {
            const address = col + R;
            if (ws[address]) ws[address].z = '"R$"#,##0.00';
        });
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório de Vendas");

    XLSX.writeFile(wb, `relatorio_vendas_${startDate.toISOString().split('T')[0]}_a_${endDate.toISOString().split('T')[0]}.xlsx`);
}

// Para fins de depuração, você pode manter estes logs
console.log(JSON.parse(localStorage.getItem('salesHistory')));
console.log(JSON.parse(localStorage.getItem('products')));
console.log(localStorage.getItem('loggedIn'));