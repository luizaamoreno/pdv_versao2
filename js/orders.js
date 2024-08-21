import * as Utils from './utils.js';
import { cart, clearCart, updateCartDisplay, saveCart } from './cart.js';
import { products, updateProductList } from './products.js';
import { showSuccessModal } from './modals.js';

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

const paymentMethods = {
    'credit': 'Cartão de Crédito',
    'debit': 'Cartão de Débito',
    'pix': 'PIX',
    'cash': 'Dinheiro',
    'food-voucher': 'Vale-alimentação'
};

function finalizeSale() {
    const paymentMethodElement = document.getElementById('payment-method');
    const customerNameElement = document.getElementById('customer-name');
    const discountPercentageElement = document.getElementById('discount-percentage');

    if (!paymentMethodElement || !customerNameElement || !discountPercentageElement) {
        console.error('Um ou mais elementos necessários não foram encontrados');
        return;
    }

    const paymentMethod = paymentMethodElement.value;
    const nomeCliente = customerNameElement.value.trim();

    if (!paymentMethod) {
        alert('Por favor, selecione um método de pagamento.');
        return;
    }

    if (!nomeCliente) {
        alert('Por favor, insira o nome do cliente.');
        customerNameElement.focus();
        return;
    }

    if (cart.length === 0) {
        alert('O carrinho está vazio. Adicione itens antes de finalizar a venda.');
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountPercentage = parseFloat(discountPercentageElement.value) || 0;
    const discountAmount = subtotal * (discountPercentage / 100);
    const total = subtotal - discountAmount;

    let change = 0;
    if (paymentMethod === 'cash') {
        const cashAmountElement = document.getElementById('cash-amount');
        if (!cashAmountElement) {
            console.error('Elemento cash-amount não encontrado');
            return;
        }
        const cashAmount = parseFloat(cashAmountElement.value);
        if (isNaN(cashAmount) || cashAmount < total) {
            alert('Valor em dinheiro inválido ou insuficiente.');
            return;
        }
        change = cashAmount - total;
    }

    const orderNumber = generateOrderNumber();
    const orderDetails = {
        orderNumber: orderNumber,
        items: [...cart],
        subtotal: subtotal,
        discountPercentage: discountPercentage,
        total: total,
        paymentMethod: paymentMethods[paymentMethod] || paymentMethod,
        change: change,
        date: Utils.getCurrentDateTimeBrasilia(),
        client: nomeCliente
    };

    addSaleToHistory(orderDetails);
    generateReceipt(orderDetails);

    cart.forEach(item => {
        const product = products.find(p => p.code === item.code);
        if (product) {
            product.quantity -= item.quantity;
        }
    });

    // Limpar o carrinho
    clearCart();
    
    // Atualizar a exibição do carrinho
    updateCartDisplay();
    
    // Fechar o modal do carrinho, se estiver aberto
    const cartMenu = document.getElementById('cart-menu');
    if (cartMenu) {
        cartMenu.style.display = 'none';
    }
    
    // Resetar campos
    customerNameElement.value = '';
    discountPercentageElement.value = '0';
    
    localStorage.setItem('products', JSON.stringify(products));
    updateProductList(document.getElementById('category-select')?.value);

    showSuccessModal(orderNumber, total, discountPercentage, paymentMethods[paymentMethod]);
}

function generateOrderNumber() {
    let lastOrderNumber = localStorage.getItem('lastOrderNumber') || 0;
    lastOrderNumber = parseInt(lastOrderNumber) + 1;
    localStorage.setItem('lastOrderNumber', lastOrderNumber);
    return `PED${lastOrderNumber.toString().padStart(6, '0')}`;
}

function addSaleToHistory(sale) {
    let salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
    salesHistory.push(sale);
    localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
}

function viewOrderHistory() {
    console.log('Visualizando histórico de pedidos');
    Utils.checkAndFixDates();
    filterOrders();
    
    const historyModal = document.getElementById('history-modal');
    if (historyModal) {
        historyModal.style.display = 'block';
    } else {
        console.error('Modal de histórico não encontrado');
    }
}

function renderOrders(orders) {
    const historyContainer = document.getElementById('order-history-body');
    historyContainer.innerHTML = '';
    if (orders.length === 0) {
        historyContainer.innerHTML = '<tr><td colspan="5">Nenhum pedido encontrado.</td></tr>';
    } else {
        const currentDate = Utils.getCurrentDateTimeBrasilia().split(',')[0].trim();
        const isAdmin = localStorage.getItem('userType') === 'admin';
        orders.forEach((order) => {
            const orderDate = order.date.split(',')[0].trim();
            const isToday = orderDate === currentDate;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.orderNumber}</td>
                <td>${order.date}</td>
                <td>${order.client}</td>
                <td>${Utils.formatCurrency(order.total)}</td>
                <td>
                    <button class="btn-action" onclick="showOrderDetails('${order.orderNumber}')" title="Ver Detalhes">
                        <i class="fas fa-eye"></i><span>Detalhes</span>
                    </button>
                    ${isAdmin ? `
                    <button class="btn-action" onclick="editOrder('${order.orderNumber}')" ${isToday ? '' : 'disabled'} title="${isToday ? 'Alterar' : 'Não editável'}">
                        <i class="fas fa-edit"></i><span>Alterar</span>
                    </button>
                    <button class="btn-action" onclick="confirmDeleteOrder('${order.orderNumber}')" ${isToday ? '' : 'disabled'} title="${isToday ? 'Excluir' : 'Não excluível'}">
                        <i class="fas fa-trash"></i><span>Excluir</span>
                    </button>
                    ` : ''}
                    <button class="btn-action" onclick="viewReceipt('${order.orderNumber}')" title="Visualizar Recibo">
                        <i class="fas fa-file-alt"></i><span>Recibo</span>
                    </button>
                </td>
            `;
            historyContainer.appendChild(row);
        });
    }
}

function filterOrders() {
    const searchTerm = document.getElementById('search-orders').value.toLowerCase();
    const filterValue = document.getElementById('filter-orders').value;
    const filterDateValue = document.getElementById('filter-date').value;

    const salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
    const currentDate = Utils.getCurrentDateTimeBrasilia().split(',')[0].trim();
    
    let filteredOrders = salesHistory.filter(order => {
        const orderDate = order.date.split(',')[0].trim();
        const formattedFilterDate = filterDateValue ? Utils.formatDateForComparison(filterDateValue) : '';
        
        const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm) ||
                              order.client.toLowerCase().includes(searchTerm);
        const matchesFilter = filterValue === 'all' || 
                              (filterValue === 'editable' && orderDate === currentDate) ||
                              (filterValue === 'non-editable' && orderDate !== currentDate);
        const matchesDate = !filterDateValue || orderDate === formattedFilterDate;

        return matchesSearch && matchesFilter && matchesDate;
    });

    renderOrders(filteredOrders);
}

// Função auxiliar para formatar a data do filtro
function formatDateForComparison(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

function editOrder(orderNumber) {
    if (!checkAdminPermission()) return;
    const salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
    const order = salesHistory.find(order => order.orderNumber === orderNumber);

    if (!order) {
        alert('Pedido não encontrado.');
        return;
    }

    const currentDate = Utils.getCurrentDateTimeBrasilia();
    if (!Utils.isSameDay(order.date, currentDate)) {
        alert('Não é possível editar pedidos de dias anteriores.');
        return;
    }

    // Preencher o modal de edição com os detalhes do pedido
    document.getElementById('editOrderNumber').textContent = order.orderNumber;
    document.getElementById('editOrderDate').textContent = order.date;
    document.getElementById('editClientName').value = order.client;
    document.getElementById('editDiscount').value = order.discountPercentage;
    document.getElementById('editPaymentMethod').value = Object.keys(paymentMethods).find(key => paymentMethods[key] === order.paymentMethod) || '';

    // Exibir o modal de edição
    const editModal = document.getElementById('editOrderModal');
    if (editModal) {
        editModal.style.display = 'block';
    } else {
        console.error('Modal de edição não encontrado');
    }
}

function saveOrderChanges(orderNumber) {
    const salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
    const orderIndex = salesHistory.findIndex(order => order.orderNumber === orderNumber);

    if (orderIndex === -1) {
        alert('Pedido não encontrado.');
        return;
    }

    const newClient = document.getElementById('editClientName').value;
    const newDiscount = parseFloat(document.getElementById('editDiscount').value);
    const newPaymentMethod = document.getElementById('editPaymentMethod').value;

    if (newClient && !isNaN(newDiscount) && newPaymentMethod) {
        const order = salesHistory[orderIndex];
        const subtotal = order.subtotal;
        const discountAmount = subtotal * (newDiscount / 100);
        const newTotal = subtotal - discountAmount;

        order.client = newClient;
        order.discountPercentage = newDiscount;
        order.total = newTotal;
        order.paymentMethod = paymentMethods[newPaymentMethod];

        localStorage.setItem('salesHistory', JSON.stringify(salesHistory));

        alert('Pedido atualizado com sucesso!');
        document.getElementById('editOrderModal').style.display = 'none';
        viewOrderHistory();
    } else {
        alert('Por favor, preencha todos os campos corretamente.');
    }
}

function confirmDeleteOrder(orderNumber) {
    if (confirm('Tem certeza que deseja excluir este pedido?')) {
        deleteOrder(orderNumber);
    }
}

function deleteOrder(orderNumber) {
    if (!checkAdminPermission()) return;
    let salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
    const orderIndex = salesHistory.findIndex(order => order.orderNumber === orderNumber);

    if (orderIndex === -1) {
        alert('Pedido não encontrado.');
        return;
    }

    const order = salesHistory[orderIndex];
    const currentDate = Utils.getCurrentDateTimeBrasilia();

    if (!Utils.isSameDay(order.date, currentDate)) {
        alert('Não é possível excluir pedidos de dias anteriores.');
        return;
    }

    order.items.forEach(item => {
        const product = products.find(p => p.code === item.code);
        if (product) {
            product.quantity += item.quantity;
        }
    });

    salesHistory.splice(orderIndex, 1);

    localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
    localStorage.setItem('products', JSON.stringify(products));

    alert('Pedido excluído com sucesso!');
    viewOrderHistory();
    updateProductList();
}

function viewReceipt(orderNumber) {
    const salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
    const order = salesHistory.find(sale => sale.orderNumber === orderNumber);

    if (!order) {
        alert('Pedido não encontrado');
        return;
    }

    generateReceipt(order);
}

function generateReceipt(orderDetails) {
    // Implementação da geração do recibo (PDF)
    console.log('Gerando recibo para o pedido:', orderDetails.orderNumber);
    // Aqui você implementaria a lógica para gerar o PDF do recibo
    // Por exemplo, usando uma biblioteca como jsPDF
    if (typeof jspdf === 'undefined') {
        console.error('jsPDF não está carregado. Verifique se a biblioteca está incluída corretamente.');
        alert('Não foi possível gerar o recibo. Por favor, tente novamente mais tarde.');
        return;
    }

    const { jsPDF } = jspdf;
    const doc = new jsPDF({
        unit: 'mm',
        format: [80, 150 + (orderDetails.items.length * 10)]
    });

    const width = doc.internal.pageSize.getWidth();
    let y = 10;

    function centerText(text, y) {
        doc.text(text, width / 2, y, { align: 'center' });
    }
    
    function leftText(text, y) {
        doc.text(text, 5, y);
    }
    
    function rightText(text, y) {
        doc.text(text, width - 5, y, { align: 'right' });
    }
    
    function line(y) {
        doc.setLineWidth(0.1);
        doc.line(5, y, width - 5, y);
    }

    // Cabeçalho
    doc.setFontSize(12);
    centerText("MINI MERCADINHOS", y);
    y += 5;
    doc.setFontSize(10);
    centerText("CNPJ: 00.000.000/0001-00", y);
    y += 5;
    centerText("Rua Exemplo, 123 - Cidade - Estado", y);
    y += 5;
    centerText("CEP: 12345-678 - Tel: (11) 1234-5678", y);
    y += 7;

    line(y);
    y += 5;

    // Detalhes do pedido
    doc.setFontSize(10);
    leftText(`Pedido: ${orderDetails.orderNumber}`, y);
    y += 5;
    leftText(`Data: ${orderDetails.date}`, y);
    y += 5;
    leftText(`Cliente: ${orderDetails.client}`, y);
    y += 5;
    leftText(`Atendente: ${localStorage.getItem('loggedIn')}`, y);
    y += 7;

    line(y);
    y += 5;

    // Itens do pedido
    doc.setFontSize(10);
    centerText("RESUMO DO PEDIDO", y);
    y += 5;

    orderDetails.items.forEach((item) => {
        y += 5;
        leftText(`${item.name}`, y);
        y += 4;
        leftText(`${Utils.formatQuantity(item.quantity, item.unit)} ${item.unit} x ${Utils.formatCurrency(item.price)}`, y);
        rightText(Utils.formatCurrency(item.quantity * item.price), y);
    });

    y += 7;
    line(y);
    y += 7;

    // Total e pagamento
    doc.setFontSize(10);
    leftText("Subtotal:", y);
    rightText(Utils.formatCurrency(orderDetails.subtotal), y);
    y += 5;
    leftText(`Desconto (${orderDetails.discountPercentage.toLocaleString('pt-BR')}%):`, y);
    rightText(Utils.formatCurrency(orderDetails.subtotal * orderDetails.discountPercentage / 100), y);
    y += 5;
    doc.setFontSize(12);
    leftText("TOTAL:", y);
    rightText(Utils.formatCurrency(orderDetails.total), y);
    y += 7;

    doc.setFontSize(10);
    leftText(`Forma de Pagamento: ${orderDetails.paymentMethod}`, y);
    y += 5;
    if (orderDetails.paymentMethod === 'Dinheiro' && orderDetails.change > 0) {
        leftText("Troco:", y);
        rightText(Utils.formatCurrency(orderDetails.change), y);
        y += 5;
    }

    y += 7;
    line(y);
    y += 7;

    // Mensagem final
    doc.setFontSize(8);
    centerText("Obrigado pela preferência!", y);
    y += 4;
    centerText("Volte sempre!", y);

    // Salva o PDF
    doc.save(`cupom_fiscal_${orderDetails.orderNumber}.pdf`);
}

function checkAdminPermission() {
    if (localStorage.getItem('userType') !== 'admin') {
        alert('Você não tem permissão para realizar esta ação.');
        return false;
    }
    return true;
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    Utils.checkAndFixDates();
    // Adicione aqui outros event listeners necessários
});

export {
    finalizeSale,
    viewOrderHistory,
    filterOrders,
    editOrder,
    saveOrderChanges,
    confirmDeleteOrder,
    deleteOrder,
    viewReceipt,
    renderOrders
};