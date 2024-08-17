import * as Utils from './utils.js';
import { products, updateProductList } from './products.js';

let cart = [];
let discountPercentage = 0;

function addToCart(productCode) {
    const product = products.find(p => p.code === productCode);
    if (!product) {
        alert('Produto não encontrado.');
        return;
    }

    if (product.quantity <= 0) {
        alert('Produto fora de estoque!');
        return;
    }

    const quantityInput = document.getElementById(`quantity-${productCode}`);
    let quantity = parseFloat(quantityInput.value.replace(',', '.'));

    if (isNaN(quantity) || quantity <= 0) {
        alert('Por favor, insira uma quantidade válida.');
        return;
    }

    if (product.unit !== 'kg') {
        quantity = Math.floor(quantity);
    }

    if (quantity > product.quantity) {
        alert(`Quantidade indisponível no estoque. Disponível: ${Utils.formatQuantity(product.quantity, product.unit)} ${product.unit}.`);
        return;
    }
    
    const cartItem = cart.find(item => item.code === productCode);
    if (cartItem) {
        cartItem.quantity += quantity;
    } else {
        cart.push({ ...product, quantity: quantity });
    }

    updateCartDisplay();
    saveCart();
    updateProductList(document.getElementById('category-select')?.value);
    quantityInput.value = product.unit === 'kg' ? '0,1' : '1';

    alert(`${Utils.formatQuantity(quantity, product.unit)} ${product.unit} de ${product.name} adicionado${quantity > 1 ? 's' : ''} ao carrinho.`);
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartBadge = document.getElementById('cart-badge');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTotal = document.getElementById('cart-total');

    if (cartItems) {
        cartItems.innerHTML = '';
        let subtotal = 0;
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <span>${item.name} - ${Utils.formatQuantity(item.quantity, item.unit)} ${item.unit} x ${Utils.formatCurrency(item.price)}</span>
                <button class="remove-item" onclick="removeFromCart('${item.code}')" title="Remover item">
                    ×
                </button>
            `;
            cartItems.appendChild(itemElement);
            subtotal += item.price * item.quantity;
        });
        
        const discountAmount = subtotal * (discountPercentage / 100);
        const total = subtotal - discountAmount;

        if (cartSubtotal) cartSubtotal.textContent = `Subtotal: ${Utils.formatCurrency(subtotal)}`;
        if (cartTotal) cartTotal.textContent = `Total: ${Utils.formatCurrency(total)}`;
    }
    
    if (cartBadge) {
        cartBadge.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
}

function removeFromCart(productCode) {
    const cartItemIndex = cart.findIndex(item => item.code === productCode);
    if (cartItemIndex > -1) {
        cart.splice(cartItemIndex, 1);
        updateCartDisplay();
        saveCart();
        updateProductList(document.getElementById('category-select')?.value);
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
        cart = JSON.parse(storedCart);
        updateCartDisplay();
    }
}

function applyDiscount() {
    const discountInput = document.getElementById('discount-percentage');
    if (discountInput) {
        discountPercentage = parseFloat(discountInput.value) || 0;
        updateCartDisplay();
    } else {
        console.error('Elemento de desconto não encontrado');
    }
}

function clearCart() {
    if (cart.length === 0) {
        alert('O carrinho já está vazio.');
        return;
    }

    if (!confirm('Tem certeza que deseja limpar o carrinho?')) {
        return;
    }

    cart.forEach(item => {
        const product = products.find(p => p.code === item.code);
        if (product) {
            product.quantity += item.quantity;
        }
    });

    cart = [];
    updateCartDisplay();
    saveCart();
    localStorage.setItem('products', JSON.stringify(products));
    updateProductList(document.getElementById('category-select')?.value);

    alert('Carrinho limpo com sucesso.');
}

function toggleCart() {
    const cartMenu = document.getElementById('cart-menu');
    if (cartMenu) {
        cartMenu.style.display = cartMenu.style.display === 'none' || cartMenu.style.display === '' ? 'block' : 'none';
    }
}

function getCartTotal() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = subtotal * (discountPercentage / 100);
    return subtotal - discountAmount;
}

function getCartItems() {
    return [...cart];
}

document.getElementById('apply-discount').addEventListener('click', function() {
    const discountElement = document.getElementById('discount-percentage');
    if (discountElement) {
        applyDiscount(parseFloat(discountElement.value));
    } else {
        console.error('Elemento de desconto não encontrado');
    }
});

function applyDiscount(discount) {
    // Sua lógica de aplicar desconto aqui
    console.log('Aplicando desconto de ' + discount + '%');
    // Não se esqueça de atualizar a exibição do carrinho após aplicar o desconto
    updateCartDisplay();
}

// Exportar todas as funções e variáveis que precisam ser acessíveis de outros arquivos
export {
    addToCart,
    removeFromCart,
    updateCartDisplay,
    saveCart,
    loadCart,
    applyDiscount,
    clearCart,
    toggleCart,
    getCartTotal,
    getCartItems,
    cart,
    discountPercentage
};

