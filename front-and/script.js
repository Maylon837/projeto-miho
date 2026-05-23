const API_URL = "http://localhost:8080/api/produtos";

const form = document.getElementById('produto-form');
const tabelaBody = document.getElementById('produtos-lista');
const btnSalvar = document.getElementById('btn-salvar');
let produtoEditando = null;

// Mensagem de feedback
function mostrarMensagem(texto, tipo = "sucesso") {
    const msg = document.createElement('div');
    msg.style.position = 'fixed';
    msg.style.top = '20px';
    msg.style.right = '20px';
    msg.style.padding = '15px 20px';
    msg.style.borderRadius = '8px';
    msg.style.color = 'white';
    msg.style.fontWeight = 'bold';
    msg.style.zIndex = '1000';
    msg.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
    
    if (tipo === "sucesso") {
        msg.style.backgroundColor = '#219150';
    } else {
        msg.style.backgroundColor = '#dc3545';
    }
    
    msg.textContent = texto;
    document.body.appendChild(msg);

    setTimeout(() => {
        msg.style.transition = 'opacity 0.5s';
        msg.style.opacity = '0';
        setTimeout(() => msg.remove(), 500);
    }, 3000);
}

// Carregar produtos
document.addEventListener('DOMContentLoaded', () => {
    carregarProdutos();
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const preco = parseFloat(document.getElementById('preco').value);
    const quantidade = parseInt(document.getElementById('quantidade').value);

    if (!nome || isNaN(preco) || isNaN(quantidade)) {
        mostrarMensagem("Preencha todos os campos corretamente!", "erro");
        return;
    }

    const produto = { nome, preco, quantidade };

    try {
        btnSalvar.disabled = true;
        btnSalvar.textContent = produtoEditando ? "Atualizando..." : "Salvando...";

        let response;
        if (produtoEditando) {
            response = await fetch(`${API_URL}/${produtoEditando.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(produto)
            });
        } else {
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(produto)
            });
        }

        if (response.ok) {
            form.reset();
            produtoEditando = null;
            btnSalvar.textContent = "Salvar Produto";
            mostrarMensagem(produtoEditando ? "Produto atualizado com sucesso!" : "Produto cadastrado com sucesso!");
            carregarProdutos();
        }
    } catch (error) {
        console.error("Erro:", error);
        mostrarMensagem("Erro ao salvar produto. Verifique se o back-end está rodando.", "erro");
    } finally {
        btnSalvar.disabled = false;
    }
});

// Carregar produtos
async function carregarProdutos() {
    try {
        const response = await fetch(API_URL);
        const produtos = await response.json();

        tabelaBody.innerHTML = '';

        if (produtos.length === 0) {
            tabelaBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:#666;">Nenhum produto cadastrado ainda.</td></tr>`;
            return;
        }

        produtos.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.id}</td>
                <td>${p.nome}</td>
                <td>R$ ${p.preco.toFixed(2)}</td>
                <td>${p.quantidade}</td>
                <td>
                    <button class="btn-editar" onclick="editarProduto(${p.id})">Editar</button>
                    <button class="btn-excluir" onclick="excluirProduto(${p.id})">Excluir</button>
                </td>
            `;
            tabelaBody.appendChild(tr);
        });
    } catch (error) {
        console.error("Erro ao carregar:", error);
    }
}

// Editar
window.editarProduto = async function(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const produto = await response.json();

        document.getElementById('nome').value = produto.nome;
        document.getElementById('preco').value = produto.preco;
        document.getElementById('quantidade').value = produto.quantidade;

        produtoEditando = produto;
        btnSalvar.textContent = "Atualizar Produto";

        document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        mostrarMensagem("Erro ao carregar produto para edição.", "erro");
    }
};

// Excluir
window.excluirProduto = async function(id) {
    if (confirm("Deseja realmente excluir este produto?")) {
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            
            if (response.ok) {
                mostrarMensagem("Produto excluído com sucesso!");
                carregarProdutos();
            }
        } catch (error) {
            mostrarMensagem("Erro ao excluir produto.", "erro");
        }
    }
};