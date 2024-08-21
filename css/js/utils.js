// Função para obter a data e hora atual no fuso horário de Brasília
export function getCurrentDateTimeBrasilia() {
    const now = new Date();
    return now.toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Função para formatar data e hora no formato brasileiro
export function formatDateTimeBR(dateString) {
    if (!dateString) return 'Data inválida';
    
    let date;
    if (typeof dateString === 'string') {
        if (dateString.includes('/')) {
            // Já está no formato brasileiro
            const [day, month, year, time] = dateString.split(/[/, ]/);
            date = new Date(year, month - 1, day);
            if (time) {
                const [hour, minute, second] = time.split(':');
                date.setHours(hour, minute, second);
            }
        } else {
            // Tenta parse padrão
            date = new Date(dateString);
        }
    } else {
        date = new Date(dateString);
    }

    if (isNaN(date.getTime())) {
        console.error('Data inválida:', dateString);
        return 'Data inválida';
    }

    return date.toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Função para verificar se duas datas são do mesmo dia
export function isSameDay(date1, date2) {
    const d1 = typeof date1 === 'string' ? new Date(date1.split(',')[0].split('/').reverse().join('-')) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2.split(',')[0].split('/').reverse().join('-')) : date2;
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
}

// Função para formatar moeda em formato brasileiro
export function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Função para formatar quantidade com base na unidade
export function formatQuantity(value, unit) {
    if (unit === 'kg') {
        return value.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
    }
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// Função para verificar e corrigir datas no histórico de vendas
export function checkAndFixDates() {
    let salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
    let hasChanges = false;

    salesHistory = salesHistory.map(sale => {
        if (!sale.date) {
            sale.date = getCurrentDateTimeBrasilia();
            hasChanges = true;
        }
        return sale;
    });

    if (hasChanges) {
        localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
        console.log('Datas no histórico de vendas foram corrigidas.');
    }
}

// Função para formatar a data para comparação
export function formatDateForComparison(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

// Função para gerar um código único para produtos
export function generateUniqueCode() {
    return 'PROD' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Função para validar um endereço de e-mail
export function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Função para validar um número de telefone brasileiro
export function validatePhoneNumber(phone) {
    const re = /^(\+55|55)?(\d{2})?\d{8,9}$/;
    return re.test(phone.replace(/\D/g, ''));
}

// Função para formatar um número de telefone brasileiro
export function formatPhoneNumber(phone) {
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
    if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return null;
}

// Função para validar um CPF
export function validateCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g,'');	
    if (cpf.length !== 11 || 
        cpf === "00000000000" || 
        cpf === "11111111111" || 
        cpf === "22222222222" || 
        cpf === "33333333333" || 
        cpf === "44444444444" || 
        cpf === "55555555555" || 
        cpf === "66666666666" || 
        cpf === "77777777777" || 
        cpf === "88888888888" || 
        cpf === "99999999999")
            return false;		
    let add = 0;	
    for (let i=0; i < 9; i++)		
        add += parseInt(cpf.charAt(i)) * (10 - i);	
        let rev = 11 - (add % 11);	
        if (rev === 10 || rev === 11)		
            rev = 0;	
        if (rev !== parseInt(cpf.charAt(9)))		
            return false;		
    add = 0;	
    for (let i = 0; i < 10; i++)		
        add += parseInt(cpf.charAt(i)) * (11 - i);	
    rev = 11 - (add % 11);	
    if (rev === 10 || rev === 11)	
        rev = 0;	
    if (rev !== parseInt(cpf.charAt(10)))
        return false;		
    return true;
}

// Função para formatar um CPF
export function formatCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function checkAdminPermission() {
    if (localStorage.getItem('userType') !== 'admin') {
        alert('Você não tem permissão para realizar esta ação.');
        return false;
    }
    return true;
}

// Função para gerar código do produto
export function generateProductCode(category) {
    let categoryCounts = JSON.parse(localStorage.getItem('categoryCounts')) || {};
    const categoryCode = category.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substr(0, 3);
    
    if (!categoryCounts[categoryCode]) {
        categoryCounts[categoryCode] = 0;
    }
    
    categoryCounts[categoryCode]++;
    
    const sequentialNumber = categoryCounts[categoryCode].toString().padStart(4, '0');
    localStorage.setItem('categoryCounts', JSON.stringify(categoryCounts));
    return `${categoryCode}${sequentialNumber}`;
}

// Função para validar entrada numérica
export function validateNumericInput(input) {
    return !isNaN(parseFloat(input)) && isFinite(input);
}

// Função para limpar campos de formulário
export function clearForm(formId) {
    document.getElementById(formId).reset();
}