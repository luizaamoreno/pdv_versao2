// Importações (ajuste o caminho conforme necessário)
import * as Utils from './utils.js';
import * as Products from './products.js';
import * as Cart from './cart.js';
import * as Orders from './orders.js';
import * as Modals from './modals.js';

// Verificar se o usuário está logado
if (!localStorage.getItem('loggedIn')) {
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', function() {
    // Inicialização
    Products.loadProducts();
    Cart.loadCart();
    
    // Event listeners
    const newOrderButton = document.getElementById('new-order-btn');
    if (newOrderButton) {
        newOrderButton.addEventListener('click', Modals.openNewOrderModal);
    } else {
        console.error('Botão de novo pedido não encontrado');
    }

    const viewHistoryButton = document.getElementById('view-history-btn');
    if (viewHistoryButton) {
        viewHistoryButton.addEventListener('click', Orders.viewOrderHistory);
    } else {
        console.error('Botão de visualizar histórico não encontrado');
    }

    const categorySelect = document.getElementById('category-select');
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            Products.updateProductList(this.value);
        });
    }

    const cartIcon = document.getElementById('cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', Cart.toggleCart);
    }

    const closeCart = document.getElementById('close-cart');
    if (closeCart) {
        closeCart.addEventListener('click', Cart.toggleCart);
    }

    const finishPayment = document.getElementById('finish-payment');
    if (finishPayment) {
        finishPayment.addEventListener('click', Orders.finalizeSale);
    }

    const clearCartButton = document.getElementById('clear-cart');
    if (clearCartButton) {
        clearCartButton.addEventListener('click', Cart.clearCart);
    }

    const applyDiscountButton = document.getElementById('apply-discount');
    if (applyDiscountButton) {
        applyDiscountButton.addEventListener('click', Cart.applyDiscount);
    }

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            localStorage.removeItem('loggedIn');
            window.location.href = 'index.html';
        });
    }

    // Fechar modais
    document.querySelectorAll('.modal .close').forEach(closeButton => {
        closeButton.addEventListener('click', () => {
            closeButton.closest('.modal').style.display = 'none';
        });
    });

    // Fechar modal se clicar fora dele
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });

    Utils.checkAndFixDates();
    window.addToCart = Cart.addToCart;
    window.removeFromCart = Cart.removeFromCart;
    window.showOrderDetails = Modals.showOrderDetails;
    window.editOrder = Orders.editOrder;
    window.confirmDeleteOrder = Orders.confirmDeleteOrder;
    window.viewReceipt = Orders.viewReceipt;
});