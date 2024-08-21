import { updateProductList } from './products.js';
import { renderOrders } from './orders.js';
import * as Utils from './utils.js';

function openNewOrderModal() {
    console.log('Abrindo modal de novo pedido');
    const modal = document.getElementById('new-order-modal');
    if (modal) {
        modal.style.display = 'block';
        
        // Carregar e exibir os produtos
        updateProductList();
        
        // Atualizar o filtro de categorias
        updateCategoryFilter();
    } else {
        console.error('Modal de novo pedido não encontrado');
    }
}

function updateCategoryFilter() {
    const categorySelect = document.getElementById('category-select');
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            updateProductList(this.value);
        });
    } else {
        console.error('Elemento de seleção de categoria não encontrado');
    }
}

function closeNewOrderModal() {
    const modal = document.getElementById('new-order-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function showOrderDetails(orderNumber) {
    const salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
    const order = salesHistory.find(sale => sale.orderNumber === orderNumber);

    if (!order) {
        alert('Pedido não encontrado');
        return;
    }

    const detailsContainer = document.getElementById('order-details');
    if (!detailsContainer) {
        console.error('Elemento order-details não encontrado');
        return;
    }

    let detailsHTML = `
        <h3>Pedido ${order.orderNumber}</h3>
        <div class="order-info">
            <p><strong>Data:</strong> ${order.date}</p>
            <p><strong>Cliente:</strong> ${order.client}</p>
            <p><strong>Método de Pagamento:</strong> ${order.paymentMethod}</p>
        </div>
        <h4>Itens do Pedido:</h4>
        <ul class="items-list">
    `;

    order.items.forEach(item => {
        detailsHTML += `
            <li>
                <span class="item-name">${item.name}</span>
                <span class="item-quantity">${Utils.formatQuantity(item.quantity, item.unit)} ${item.unit}</span>
                <span class="item-price">${Utils.formatCurrency(item.price)}</span>
                <span class="item-total">${Utils.formatCurrency(item.price * item.quantity)}</span>
            </li>
        `;
    });

    detailsHTML += `
        </ul>
        <div class="order-summary">
            <p><strong>Subtotal:</strong> ${Utils.formatCurrency(order.subtotal)}</p>
            <p><strong>Desconto:</strong> ${order.discountPercentage}%</p>
            <p class="order-total"><strong>Total:</strong> ${Utils.formatCurrency(order.total)}</p>
        </div>
    `;

    if (order.paymentMethod === 'Dinheiro' && order.change > 0) {
        detailsHTML += `
            <p><strong>Troco:</strong> ${Utils.formatCurrency(order.change)}</p>
        `;
    }

    detailsContainer.innerHTML = detailsHTML;

    const modal = document.getElementById('order-details-modal');
    modal.style.display = 'block';
}

function showSuccessModal(orderNumber, total, discountPercentage, paymentMethod) {
    const modal = document.getElementById('successModal');
    const orderNumberSpan = document.getElementById('successOrderNumber');
    const orderTotalSpan = document.getElementById('successOrderTotal');
    const orderDiscountSpan = document.getElementById('successOrderDiscount');
    const orderPaymentSpan = document.getElementById('successOrderPayment');

    orderNumberSpan.textContent = orderNumber;
    orderTotalSpan.textContent = Utils.formatCurrency(total);
    orderDiscountSpan.textContent = discountPercentage + '%';
    orderPaymentSpan.textContent = paymentMethod;

    modal.style.display = 'block';

    const closeBtn = modal.querySelector('.close');
    const closeModalBtn = document.getElementById('closeSuccessModal');
    
    const closeModal = function() {
        modal.style.display = 'none';
    };

    closeBtn.onclick = closeModal;
    closeModalBtn.onclick = closeModal;

    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    }
}

function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function showEditOrderModal(orderNumber) {
    const salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
    const order = salesHistory.find(order => order.orderNumber === orderNumber);

    if (!order) {
        alert('Pedido não encontrado.');
        return;
    }

    const editOrderNumber = document.getElementById('editOrderNumber');
    const editOrderDate = document.getElementById('editOrderDate');
    const editClientName = document.getElementById('editClientName');
    const editDiscount = document.getElementById('editDiscount');
    const editPaymentMethod = document.getElementById('editPaymentMethod');

    if (editOrderNumber) editOrderNumber.textContent = order.orderNumber;
    if (editOrderDate) editOrderDate.textContent = order.date;
    if (editClientName) editClientName.value = order.client;
    if (editDiscount) editDiscount.value = order.discountPercentage;
    if (editPaymentMethod) editPaymentMethod.value = order.paymentMethod;

    const modal = document.getElementById('editOrderModal');
    if (modal) {
        modal.style.display = 'block';
    } else {
        console.error('Modal de edição não encontrado');
    }
}

function closeEditOrderModal() {
    const modal = document.getElementById('editOrderModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

// Exportar todas as funções que precisam ser acessíveis de outros arquivos
export {
    openNewOrderModal,
    closeNewOrderModal,
    showOrderDetails,
    showSuccessModal,
    closeSuccessModal,
    showEditOrderModal,
    closeEditOrderModal,
    closeAllModals
};