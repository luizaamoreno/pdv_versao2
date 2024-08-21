// Verifica se já existe um usuário logado
function checkExistingLogin() {
    const loggedIn = localStorage.getItem('loggedIn');
    if (loggedIn === 'true') {
        window.location.href = 'dashboard.html';
    }
}

// Função para realizar o login
function login(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Simular uma verificação de credenciais
    let userType;
    if (username === 'admin' && password === 'senha123') {
        userType = 'admin';
    } else if (username === 'user' && password === 'user123') {
        userType = 'common';
    } else {
        alert('Credenciais inválidas. Tente novamente.');
        return;
    }

    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('userType', userType);
    localStorage.setItem('username', username);

    // Redirecionar com base no tipo de usuário
    if (userType === 'admin') {
        window.location.href = 'dashboard.html';
    } else {
        window.location.href = 'order.html';
    }
}

// Adiciona o event listener ao formulário de login
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('.input-group input');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.setAttribute('placeholder', ' ');
        });
        
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.removeAttribute('placeholder');
            }
        });
    });

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', login);
    }
    
    // Verifica o login existente apenas uma vez quando a página carrega
    checkExistingLogin();
});

// Função para fazer logout (adicione esta função)
function logout() {
    localStorage.removeItem('loggedIn');
    window.location.href = 'index.html';
}

// Torna a função logout globalmente acessível
window.logout = logout;