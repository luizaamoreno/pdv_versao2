import { openNewOrderModal, showOrderDetails, showEditOrderModal, closeAllModals } from './modals.js';
import { viewOrderHistory, finalizeSale, filterOrders, editOrder, confirmDeleteOrder, viewReceipt } from './orders.js';
import { loadProducts, updateProductList } from './products.js';
import { loadCart, addToCart, removeFromCart, updateCartDisplay, applyDiscount, clearCart, toggleCart } from './cart.js';
import * as Utils from './utils.js';

document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário está logado
    if (!localStorage.getItem('loggedIn')) {
        window.location.href = 'index.html';
    }

    // Inicialização
    loadProducts();
    loadCart();
    
    // Event listeners para os botões principais
    const newOrderButton = document.getElementById('new-order-btn');
    if (newOrderButton) {
        newOrderButton.addEventListener('click', openNewOrderModal);
    } else {
        console.error('Botão de novo pedido não encontrado');
    }

    const viewHistoryButton = document.getElementById('view-history-btn');
    if (viewHistoryButton) {
        viewHistoryButton.addEventListener('click', viewOrderHistory);
    } else {
        console.error('Botão de visualizar histórico não encontrado');
    }

    // Event listener para o botão de finalizar pagamento
    const finishPaymentButton = document.getElementById('finish-payment');
    if (finishPaymentButton) {
        finishPaymentButton.addEventListener('click', finalizeSale);
    }

    // Event listener para o botão de limpar carrinho
    const clearCartButton = document.getElementById('clear-cart');
    if (clearCartButton) {
        clearCartButton.addEventListener('click', clearCart);
    }

    // Event listener para o botão de aplicar desconto
    const applyDiscountButton = document.getElementById('apply-discount');
    if (applyDiscountButton) {
        applyDiscountButton.addEventListener('click', () => {
            const discountInput = document.getElementById('discount-percentage');
            if (discountInput) {
                applyDiscount(parseFloat(discountInput.value));
            }
        });
    }

    // Event listener para o ícone do carrinho
    const cartIcon = document.getElementById('cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', toggleCart);
    }

    // Event listener para fechar o carrinho
    const closeCart = document.getElementById('close-cart');
    if (closeCart) {
        closeCart.addEventListener('click', toggleCart);
    }

    // Event listeners para filtros do histórico de pedidos
    const searchOrders = document.getElementById('search-orders');
    const filterOrdersSelect = document.getElementById('filter-orders');
    const filterDate = document.getElementById('filter-date');

    if (searchOrders) searchOrders.addEventListener('input', filterOrders);
    if (filterOrdersSelect) filterOrdersSelect.addEventListener('change', filterOrders);
    if (filterDate) filterDate.addEventListener('change', filterOrders);

    // Event listener para o botão de categoria
    const categorySelect = document.getElementById('category-select');
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            updateProductList(this.value);
        });
    }

    // Event listeners para fechar modais
    const closeButtons = document.querySelectorAll('.modal .close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) modal.style.display = 'none';
        });
    });

    // Fechar modal se clicar fora dele
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });

    // Event listener para o botão de logout
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            localStorage.removeItem('loggedIn');
            window.location.href = 'index.html';
        });
    }

    // Inicialização adicional
    updateCartDisplay();
    Utils.checkAndFixDates();
});

// Funções globais necessárias para interações do usuário
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.showOrderDetails = showOrderDetails;
window.editOrder = editOrder;
window.confirmDeleteOrder = confirmDeleteOrder;
window.viewReceipt = viewReceipt;