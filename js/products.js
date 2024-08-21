import * as Utils from './utils.js';

let products = [];
let categories = [];

function loadProducts() {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
        products = JSON.parse(storedProducts);
        updateCategoryFilter();
    } else {
        console.error('Nenhum produto encontrado no armazenamento local');
    }
}

function updateCategoryFilter() {
    categories = [...new Set(products.map(p => p.category))];
    const categorySelect = document.getElementById('category-select');
    if (categorySelect) {
        categorySelect.innerHTML = '<option value="">Todas as categorias</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }
}

function updateProductList(category = '') {
    const list = document.getElementById('product-list');
    if (list) {
        list.innerHTML = '';
        
        let filteredProducts = category ? products.filter(p => p.category === category) : products;
        let sortedProducts = sortProductsAlphabetically(filteredProducts);

        if (sortedProducts.length === 0) {
            list.innerHTML = '<p>Nenhum produto encontrado.</p>';
        } else {
            sortedProducts.forEach(product => {
                const productElement = document.createElement('div');
                productElement.className = 'product-card';
                productElement.innerHTML = `
                    <img src="${product.image || 'placeholder.jpg'}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p>Preço: ${Utils.formatCurrency(product.price)}${product.unit === 'kg' ? '/kg' : ''}</p>
                    <p>Quantidade disponível: ${Utils.formatQuantity(product.quantity, product.unit)} ${product.unit}</p>
                    <p>Categoria: ${product.category}</p>
                    <div class="quantity-input">
                        <label for="quantity-${product.code}">Quantidade:</label>
                        <input type="text" 
                               id="quantity-${product.code}" 
                               value="${product.unit === 'kg' ? '0,1' : '1'}" 
                               ${product.quantity <= 0 ? 'disabled' : ''}>
                        <span>${product.unit}</span>
                    </div>
                    <button onclick="addToCart('${product.code}')" ${product.quantity <= 0 ? 'disabled' : ''}>
                        ${product.quantity <= 0 ? 'Fora de Estoque' : 'Adicionar ao Carrinho'}
                    </button>
                `;
                list.appendChild(productElement);
            });
        }
    } else {
        console.error('Elemento product-list não encontrado');
    }
}

function sortProductsAlphabetically(products) {
    return products.sort((a, b) => a.name.localeCompare(b.name));
}

function getProductByCode(code) {
    return products.find(p => p.code === code);
}

function updateProductQuantity(code, quantity) {
    const product = getProductByCode(code);
    if (product) {
        product.quantity = quantity;
        saveProducts();
    }
}

function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
}

function addProduct(product) {
    products.push(product);
    saveProducts();
    updateCategoryFilter();
    updateProductList();
}

function editProduct(code, updatedProduct) {
    const index = products.findIndex(p => p.code === code);
    if (index !== -1) {
        products[index] = { ...products[index], ...updatedProduct };
        saveProducts();
        updateCategoryFilter();
        updateProductList();
    }
}

function deleteProduct(code) {
    products = products.filter(p => p.code !== code);
    saveProducts();
    updateCategoryFilter();
    updateProductList();
}

// Exportar todas as funções e variáveis que precisam ser acessíveis de outros arquivos
export {
    loadProducts,
    updateProductList,
    getProductByCode,
    updateProductQuantity,
    addProduct,
    editProduct,
    deleteProduct,
    products,
    categories
};