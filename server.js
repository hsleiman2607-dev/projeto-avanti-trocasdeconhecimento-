import express from "express";

const app = express();
app.use(express.json());

// --- ARRAY DE SIMULAÇÃO (Cadastro de Pessoas) ---
let usuarios = [
    {
        id: "1",
        nome: "Ricardo Souza",
        email: "ricardo.dev@email.com",
        telefone: "85999999999",
        descricao: "Estudante de Análise de Sistemas. Posso ajudar com lógica de programação."
    },
    {
        id: "2",
        nome: "Mariana Costa",
        email: "mari.design@email.com",
        telefone: "11988887777",
        descricao: "Designer de UI. Posso ensinar princípios de design."
    },
    {
        id: "3",
        nome: "Carlos Eduardo",
        email: "carlos.cad@email.com",
        telefone: "21977776666",
        descricao: "Engenheiro Civil. Conheço AutoCAD e cálculos."
    }
];

// ROTA BUSCAR: Listar todos ou filtrar por habilidade/descrição
app.get("/usuarios", (request, response) => {
    const { busca } = request.query; // Pega o termo de busca da URL

    if (busca) {
        // Filtra os usuários onde a descrição contém o termo pesquisado (sem diferenciar maiúsculas)
        const filtrados = usuarios.filter(user => 
            user.descricao.toLowerCase().includes(busca.toLowerCase())
        );
        return response.status(200).json(filtrados);
    }

    // Se não houver filtro, retorna a lista completa 
    return response.status(200).json(usuarios);
});

// ROTA CRIAR: Adicionar um novo usuário com validação
app.post("/usuarios", (request, response) => {
    const { nome, email, telefone, descricao } = request.body;
    
    // Validação: Impede o cadastro se faltar informações essenciais
    if (!nome || !email || !descricao) {
        return response.status(400).json({ error: "Nome, Email e Descrição são obrigatórios." });
    }

    const novoUsuario = {
        id: String(usuarios.length + 1), // Gera ID sequencial
        nome,
        email,
        telefone,
        descricao
    };

    usuarios.push(novoUsuario);
    return response.status(201).json(novoUsuario);
});

// ROTA EDITAR: Atualizar os dados de um usuário existente
app.put("/usuarios/:id", (request, response) => {
  const { id } = request.params; 
  const { nome, email, telefone, descricao } = request.body; 

  const usuarioIndex = usuarios.findIndex(user => user.id === id);

  if (usuarioIndex < 0) {
    return response.status(404).json({ error: "Usuário não encontrado." });
  }

  const usuarioAtualizado = {
    id,
    nome: nome || usuarios[usuarioIndex].nome,
    email: email || usuarios[usuarioIndex].email,
    telefone: telefone || usuarios[usuarioIndex].telefone,
    descricao: descricao || usuarios[usuarioIndex].descricao
  };

  usuarios[usuarioIndex] = usuarioAtualizado;
  return response.status(200).json(usuarioAtualizado);
});

// ROTA DELETAR: Remover um usuário através do ID
app.delete("/usuarios/:id", (request, response) => {
    const { id } = request.params;
    usuarios = usuarios.filter(user => user.id !== id);
    return response.status(204).send();
});

app.listen(8080, () => {
    console.log("Servidor rodando no arquivo server.js (Porta 8080)");
});