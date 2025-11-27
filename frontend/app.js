// URL base da API
const API_URL = 'http://localhost:3000/api/expenses';

// Elementos DOM
const expenseForm = document.getElementById('expenseForm');
const expensesTableBody = document.getElementById('expensesTableBody');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const confirmDeleteBtn = document.getElementById('confirmDelete');

// Instância do gráfico
let summaryChart = null;

// Inicializa a aplicação
document.addEventListener('DOMContentLoaded', () => {
    loadExpenses();
    loadSummary();
    setupEventListeners();
    
    // Define a data padrão para hoje
    document.getElementById('date').valueAsDate = new Date();
});

// Configura os ouvintes de eventos
function setupEventListeners() {
    // Envio do formulário
    expenseForm.addEventListener('submit', handleFormSubmit);
    
    // Funcionalidade de busca
    searchButton.addEventListener('click', loadExpenses);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            loadExpenses();
        }
    });
    
    // Confirmação de exclusão
    confirmDeleteBtn.addEventListener('click', confirmDelete);
}

// Manipula o envio do formulário
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const expenseId = document.getElementById('expenseId').value;
    const expenseData = {
        description: document.getElementById('description').value,
        amount: parseFloat(document.getElementById('amount').value),
        category: document.getElementById('category').value,
        date: document.getElementById('date').value
    };
    
    try {
        if (expenseId) {
            // Atualiza despesa existente
            await updateExpense(expenseId, expenseData);
        } else {
            // Cria nova despesa
            await createExpense(expenseData);
        }
        
        // Redefine o formulário e recarrega os dados
        resetForm();
        loadExpenses();
        loadSummary();
    } catch (error) {
        console.error('Erro ao salvar despesa:', error);
        alert('Erro ao salvar a despesa. Por favor, tente novamente.');
    }
}

// Carrega todas as despesas
async function loadExpenses() {
    try {
        const searchTerm = searchInput.value.trim();
        let url = API_URL;
        
        if (searchTerm) {
            // Se houver termo de busca, filtraremos no lado do cliente para simplificar
            // Em um app de produção, você implementaria busca no lado do servidor
            url = API_URL;
        }
        
        const response = await fetch(url);
        let expenses = await response.json();
        
        // Filtragem no lado do cliente se houver termo de busca
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            expenses = expenses.filter(expense => 
                expense.description.toLowerCase().includes(searchLower) ||
                expense.category.toLowerCase().includes(searchLower) ||
                expense.amount.toString().includes(searchTerm)
            );
        }
        
        renderExpenses(expenses);
    } catch (error) {
        console.error('Erro ao carregar despesas:', error);
        alert('Erro ao carregar as despesas. Por favor, recarregue a página.');
    }
}

// Carrega dados do resumo
async function loadSummary() {
    try {
        const response = await fetch(`${API_URL}/summary/categories`);
        const summaryData = await response.json();
        renderSummaryChart(summaryData);
    } catch (error) {
        console.error('Erro ao carregar resumo:', error);
    }
}

// Cria uma nova despesa
async function createExpense(expenseData) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData)
    });
    
    if (!response.ok) {
        throw new Error('Falha ao criar despesa');
    }
    
    return await response.json();
}

// Atualiza uma despesa existente
async function updateExpense(id, expenseData) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData)
    });
    
    if (!response.ok) {
        throw new Error('Falha ao atualizar despesa');
    }
    
    return await response.json();
}

// Exclui uma despesa
async function deleteExpense(id) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });
    
    if (!response.ok) {
        throw new Error('Falha ao excluir despesa');
    }
    
    return true;
}

// Renderiza as despesas na tabela
function renderExpenses(expenses) {
    expensesTableBody.innerHTML = '';
    
    if (expenses.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" class="text-center">Nenhuma despesa encontrada</td>';
        expensesTableBody.appendChild(row);
        return;
    }
    
    expenses.forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${expense.description}</td>
            <td>R$ ${parseFloat(expense.amount).toFixed(2)}</td>
            <td>${expense.category}</td>
            <td>${formatDate(expense.date)}</td>
            <td class="actions">
                <button class="btn btn-sm btn-warning edit-btn" data-id="${expense.id}">Editar</button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${expense.id}" data-bs-toggle="modal" data-bs-target="#confirmDeleteModal">
                    Excluir
                </button>
            </td>
        `;
        
        expensesTableBody.appendChild(row);
    });
    
    // Adiciona ouvintes de eventos aos botões de editar e excluir
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => editExpense(e.target.dataset.id));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Armazena o ID da despesa no atributo de dados do botão de confirmação
            confirmDeleteBtn.dataset.id = e.target.dataset.id;
        });
    });
}

// Editar despesa
async function editExpense(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const expense = await response.json();
        
        // Preenche o formulário com os dados da despesa
        document.getElementById('expenseId').value = expense.id;
        document.getElementById('description').value = expense.description;
        document.getElementById('amount').value = expense.amount;
        document.getElementById('category').value = expense.category;
        document.getElementById('date').value = expense.date.split('T')[0]; // Formata data para input
        
        // Rola para o formulário
        document.getElementById('expenseForm').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Erro ao carregar despesa para edição:', error);
        alert('Erro ao carregar a despesa para edição.');
    }
}

// Confirmar exclusão
async function confirmDelete() {
    const expenseId = confirmDeleteBtn.dataset.id;
    
    if (!expenseId) return;
    
    try {
        await deleteExpense(expenseId);
        
        // Fecha o modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal'));
        modal.hide();
        
        // Recarrega os dados
        loadExpenses();
        loadSummary();
    } catch (error) {
        console.error('Erro ao excluir despesa:', error);
        alert('Erro ao excluir a despesa. Por favor, tente novamente.');
    }
}

// Renderiza o gráfico de resumo
function renderSummaryChart(summaryData) {
    const ctx = document.createElement('canvas');
    const container = document.getElementById('summaryChart');
    
    // Limpa o gráfico anterior se existir
    if (summaryChart) {
        summaryChart.destroy();
    }
    
    // Limpa o contêiner e adiciona novo canvas
    container.innerHTML = '';
    container.appendChild(ctx);
    
    // Prepara os dados para o gráfico
    const labels = summaryData.map(item => item.category);
    const data = summaryData.map(item => parseFloat(item.total));
    
    // Gera cores aleatórias para o gráfico
    const backgroundColors = generateColors(summaryData.length);
    
    // Cria o gráfico
    summaryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: R$ ${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Gera cores aleatórias para o gráfico
function generateColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
        const hue = (i * 137.508) % 360; // Usa ângulo dourado para cores distintas
        colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    return colors;
}

// Formata data para dd/mm/yyyy
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Redefine o formulário
function resetForm() {
    expenseForm.reset();
    document.getElementById('expenseId').value = '';
    document.getElementById('date').valueAsDate = new Date();
}
