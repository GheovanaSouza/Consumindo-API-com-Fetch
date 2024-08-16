let produtos = []; // array para armazenar os produtos da api e produtos criados
let produtosExcluidos = new Set(); // guarda o id dos produtos que forams excluido pra eles nao voltarem de novo quando clicar no get, o set serve pra evitar q o id nao seja repitido
let produtosCriadosAtualizados = new Map(); // guarda os produtos criados e atualizados, map serve pra acessar um produto mais rapido usando id

// get
document.getElementById('botaoBuscar').addEventListener('click', () => { //adiciona um evento de click no botao do get
  fetch('https://fakestoreapi.com/products') // requisição para obter dados da api
    .then(res => res.json()) // transforma a resposta em json
    .then(json => { //pega os dados da resposta convertida e executa
      //passa por todos os dados da api, se o id dos produtos forem diferentes do id dos produtos excluidos eles sao adicionadas na lista dos nao excluidos
      const produtosNaoExcluidos = json.filter(produto => !produtosExcluidos.has(produto.id));

      // lista final dos produtos, olha cada produto e ve precisa colocar uma versao que foi atualizada de algum deles
      produtos = produtosNaoExcluidos.map(produto => { 
        return produtosCriadosAtualizados.get(produto.id) || produto; //ve se tem alguma atualizaçao e usa ela se tiver , se nao o || vai retornar o produto original da lista produtosNaoExcluidos
      });

      atualizarInterface(); //mostrar a lista mais recente de produtos, sincronizando com os dados mais recentes
    })

});

// Função para criar um novo produto
document.getElementById('botaoCriar').addEventListener('click', () => { //adiciona um evento de click no botao do post
  //pegando as informaçoes colocadas no formulario
  const novoTitulo = document.getElementById('novoTituloCriar').value; 
  const novoPreco = document.getElementById('novoPrecoCriar').value;
  const novaDescricao = document.getElementById('novaDescricaoCriar').value;
  const novaImagem = document.getElementById('novaImagemCriar').value;
  const novaCategoria = document.getElementById('novaCategoriaCriar').value;



  fetch('https://fakestoreapi.com/products', { //fazendo a requisiçao
    method: 'POST', //metodo HTTP como POST, que é usado para enviar dados ao servidor 
    headers: {
      'Content-Type': 'application/json' //o tipo de conteudo que está sendo enviado, no caso json
    },
    body: JSON.stringify({ //dados que está sendo enviado para o servidor, em json 
      title: novoTitulo,
      price: parseFloat(novoPreco),
      description: novaDescricao,
      image: novaImagem,
      category: novaCategoria
    })
  })
    .then(res => res.json()) // transforma a resposta em json
    .then(produtoCriado => { //produtoCriado é a resposta do servidor ja convertida 
      alert(`O produto ${produtoCriado.title} foi criado!`); //avisa que foi criado

      // adiciona o novo produto ao array de produtos e no map (lista) de criados/atualizados
      produtosCriadosAtualizados.set(produtoCriado.id, produtoCriado);

      // se o produto criado não estava na lista de produtos, adiciona
      const index = produtos.findIndex(produto => produto.id === produtoCriado.id); // encontrar a posição do produto com o mesmo id que o produto criado
      if (index === -1) { // se o id nao estiver na lista 
        produtos.push(produtoCriado); //adiciona o produto na lista produtos
      } else {
        produtos[index] = produtoCriado; //produto já está na lista, então atualiza o produto existente na lista com as novas informações do produto criado
      }

      atualizarInterface();
    })
    .catch(error => {
      console.error('Erro ao criar produto:', error);
    });
});

// Função para atualizar o produto
document.getElementById('botaoAtualizar').addEventListener('click', () => {
  const produtoId = document.getElementById('produtoId').value;
  const novoTitulo = document.getElementById('novoTitulo').value;
  const novoPreco = document.getElementById('novoPreco').value;
  const novaDescricao = document.getElementById('novaDescricao').value;
  const novaImagem = document.getElementById('novaImagem').value;
  const novaCategoria = document.getElementById('novaCategoria').value;

  if (!produtoId || !novoTitulo || !novoPreco || !novaDescricao || !novaImagem || !novaCategoria) {
    alert('Por favor, preencha todos os campos.');
    return;
  }

  fetch(`https://fakestoreapi.com/products/${produtoId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: novoTitulo,
      price: parseFloat(novoPreco),
      description: novaDescricao,
      image: novaImagem,
      category: novaCategoria
    })
  })
    .then(res => res.json())
    .then(produtoAtualizado => {
      alert(`Produto atualizado: ${produtoAtualizado.title}`);

      // Atualiza o produto na lista de produtos criados/atualizados
      produtosCriadosAtualizados.set(produtoAtualizado.id, produtoAtualizado);

      // Atualiza o produto na lista de produtos
      const index = produtos.findIndex(produto => produto.id == produtoAtualizado.id);
      if (index > -1) {
        produtos[index] = produtoAtualizado;
      } else {
        produtos.push(produtoAtualizado); // Adiciona o produto se não estiver presente
      }

      atualizarInterface();
    })
    .catch(error => {
      console.error('Erro ao atualizar produto:', error);
    });
});

// Função para atualizar parcialmente o produto
document.getElementById('botaoAtualizarParcial').addEventListener('click', () => {
  const produtoId = document.getElementById('produtoIdParcial').value;
  const novoTitulo = document.getElementById('novoTituloParcial').value;
  const novoPreco = document.getElementById('novoPrecoParcial').value;
  const novaDescricao = document.getElementById('novaDescricaoParcial').value;
  const novaImagem = document.getElementById('novaImagemParcial').value;
  const novaCategoria = document.getElementById('novaCategoriaParcial').value;

  if (!produtoId) {
    alert('Por favor, forneça o ID do produto.');
    return;
  }

  // Obtém o produto existente para garantir que apenas os campos fornecidos sejam atualizados
  const produtoExistente = produtos.find(produto => produto.id == produtoId);
  if (!produtoExistente) {
    alert('Produto não encontrado.');
    return;
  }

  // Cria um objeto com as propriedades que foram fornecidas, mantendo os valores existentes para as propriedades não fornecidas
  const atualizacoes = {
    title: novoTitulo || produtoExistente.title,
    price: novoPreco ? parseFloat(novoPreco) : produtoExistente.price,
    description: novaDescricao || produtoExistente.description,
    image: novaImagem || produtoExistente.image,
    category: novaCategoria || produtoExistente.category
  };

  fetch(`https://fakestoreapi.com/products/${produtoId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(atualizacoes)
  })
    .then(res => res.json())
    .then(produtoAtualizado => {
      alert(`Produto parcialmente atualizado: ${produtoAtualizado.title}`);

      // Atualiza o produto na lista de produtos criados/atualizados
      produtosCriadosAtualizados.set(produtoAtualizado.id, produtoAtualizado);

      // Atualiza o produto na lista de produtos
      const index = produtos.findIndex(produto => produto.id == produtoAtualizado.id);
      if (index > -1) {
        produtos[index] = produtoAtualizado;
      } else {
        produtos.push(produtoAtualizado); // Adiciona o produto se não estiver presente
      }

      atualizarInterface();
    })
    .catch(error => {
      console.error('Erro ao atualizar parcialmente produto:', error);
    });
});

// Função para excluir o produto
document.getElementById('botaoExcluir').addEventListener('click', () => {
  const produtoId = document.getElementById('excluirProdutoId').value;

  if (!produtoId) {
    alert('Por favor, forneça o ID do produto.');
    return;
  }

  fetch(`https://fakestoreapi.com/products/${produtoId}`, {
    method: 'DELETE'
  })
    .then(res => res.json())
    .then(() => {
      alert(`Produto ${produtoId} excluído com sucesso!`);
      
      // Remove o produto da lista de produtos criados/atualizados
      produtosCriadosAtualizados.delete(Number(produtoId));

      // Adiciona o produto à lista de produtos excluídos
      produtosExcluidos.add(Number(produtoId));

      // Remove o produto da lista de produtos
      produtos = produtos.filter(produto => produto.id != produtoId);

      atualizarInterface();
    })
    .catch(error => {
      console.error('Erro ao excluir produto:', error);
    });
});

// Função para atualizar a interface
function atualizarInterface() {
  const container = document.getElementById('containerProdutos');
  container.innerHTML = '';

  // Combina produtos criados/atualizados e produtos não excluídos
  const todosProdutos = produtos.concat(Array.from(produtosCriadosAtualizados.values()).filter(produto => !produtosExcluidos.has(produto.id)));

  // Remove produtos duplicados, mantendo a versão mais atualizada
  const produtosUnicos = new Map(todosProdutos.map(produto => [produto.id, produto]));

  // Exibe os produtos únicos
  produtosUnicos.forEach(produto => {
    const produtoDiv = document.createElement('div');
    produtoDiv.className = 'produto';

    produtoDiv.innerHTML = `
      <h2>${produto.title}</h2>
      <p>${produto.description}</p>
      <p><strong>Preço:</strong> $${produto.price}</p>
      <img src="${produto.image}" alt="${produto.title}" width="100" />
    `;

    container.appendChild(produtoDiv);
  });
}
