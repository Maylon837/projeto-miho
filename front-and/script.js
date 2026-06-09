const API_URL = "http://localhost:8080/api/produtos";

// Elementos do DOM
const form = document.getElementById('produto-form');
const tabelaBody = document.getElementById('produtos-lista');
const btnSalvar = document.getElementById('btn-salvar');
let produtoEditando = null;

// ==================== NAVEGAÇÃO ENTRE TELAS ====================
function mostrarHome() {
    esconderTodasTelas();
    document.getElementById('home-screen').classList.add('active');
}

function mostrarCadastro() {
    esconderTodasTelas();
    document.getElementById('cadastro-screen').classList.add('active');
    form.reset();
    produtoEditando = null;
    btnSalvar.textContent = "Salvar Produto";
}

function mostrarLista() {
    esconderTodasTelas();
    document.getElementById('lista-screen').classList.add('active');
    carregarProdutos();
}

function esconderTodasTelas() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
}

// ==================== CADASTRO E EDIÇÃO ====================
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const preco = parseFloat(document.getElementById('preco').value);
    const quantidade = parseInt(document.getElementById('quantidade').value);

    if (!nome || isNaN(preco) || isNaN(quantidade)) {
        alert("Preencha todos os campos corretamente!");
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
            alert(produtoEditando ? "Produto atualizado com sucesso!" : "Produto cadastrado com sucesso!");
            form.reset();
            produtoEditando = null;
            btnSalvar.textContent = "Salvar Produto";
            mostrarLista(); // Vai direto para a lista após salvar
        }
    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao salvar produto. Verifique se o back-end está rodando.");
    } finally {
        btnSalvar.disabled = false;
    }
});

// ==================== LISTAGEM ====================
async function carregarProdutos() {
    try {
        const response = await fetch(API_URL);
        const produtos = await response.json();

        tabelaBody.innerHTML = '';

        if (produtos.length === 0) {
            tabelaBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:30px; color:#666;">Nenhum produto cadastrado ainda.</td></tr>`;
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
        console.error("Erro ao carregar produtos:", error);
    }
}

// ==================== EDITAR E EXCLUIR ====================
window.editarProduto = async function(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        
        if (!response.ok) throw new Error("Produto não encontrado");

        const produto = await response.json();

        // Primeiro muda para a tela de cadastro
        mostrarCadastro();

        // Depois preenche os campos (com pequeno delay para garantir que o DOM está visível)
        setTimeout(() => {
            document.getElementById('nome').value = produto.nome || '';
            document.getElementById('preco').value = produto.preco || '';
            document.getElementById('quantidade').value = produto.quantidade || '';

            produtoEditando = produto;
            btnSalvar.textContent = "Atualizar Produto";
        }, 100);

        console.log("✅ Produto carregado para edição:", produto);

    } catch (error) {
        console.error("Erro ao editar:", error);
        alert("Erro ao carregar os dados do produto para edição.");
    }
};

window.excluirProduto = async function(id) {
    if (confirm("Deseja realmente excluir este produto?")) {
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (response.ok) {
                alert("Produto excluído com sucesso!");
                carregarProdutos();
            }
        } catch (error) {
            alert("Erro ao excluir produto");
        }
    }
};

// Inicia na tela principal
mostrarHome();