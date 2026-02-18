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

// ROTA BUSCAR: Listar todos os usuários registrados
app.get("/usuarios", (request, response) => {
    return response.status(200).json(usuarios);
});

// ROTA CRIAR: Adicionar um novo usuário ao sistema
app.post("/usuarios", (request, response) => {
    const { nome, email, telefone, descricao } = request.body;
    
    const novoUsuario = {
        id: String(usuarios.length + 1),
        nome,
        email,
        telefone,
        descricao
    };

    usuarios.push(novoUsuario);
    return response.status(201).json(novoUsuario);
});

// ROTA DELETAR: Remover um usuário específico através do ID
app.delete("/usuarios/:id", (request, response) => {
    const { id } = request.params;
    usuarios = usuarios.filter(user => user.id !== id);
    return response.status(204).send();
});

// Inicialização do servidor na porta 8080
app.listen(8080, () => {
    console.log("Servidor rodando no arquivo server.js (Porta 8080)");
});