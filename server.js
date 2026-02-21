import express from "express";
import pg from "pg";



const app = express();
app.use(express.json());

const { Pool } = pg;
const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "2607admin",
    database: "trocasdeconhecimento"
});

// --- ARRAY DE SIMULAÇÃO (Cadastro de Pessoas) ---
/*let usuarios = [
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
];*/


// 1. CADASTRAR NOVA OFERTA
app.post("/ofertas", async (req, res) => {
    const { titulo, descrição, categoria_ID, nivel, pessoa_ID } = req.body;
    try {
        // Importante: Usar aspas duplas para nomes de tabelas/colunas com maiúsculas
        const query = `
            INSERT INTO "Ofertas" ("titulo", "descrição", "categoria_ID", "nivel", "pessoa_ID") 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *`;
        
        const values = [titulo, descrição, categoria_ID, nivel, pessoa_ID];
        const result = await pool.query(query, values);
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// 2. LISTAR OFERTAS COM ASSOCIAÇÃO (JOIN)
app.get("/ofertas", async (req, res) => {
    try {
        const query = `
            SELECT 
                o."oferta_ID", o."titulo", o."descrição", o."nivel",
                p."nome_completo" AS "autor",
                c."CatNome" AS "categoria"
            FROM "Ofertas" o
            LEFT JOIN "Pessoas" p ON o."pessoa_ID" = p."pessoa_ID"
            LEFT JOIN "Categorias" c ON o."categoria_ID" = c."categoria_ID"
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// 3. EDITAR INFORMAÇÕES DE UMA OFERTA
app.put("/ofertas/:id", async (req, res) => {
    const { id } = req.params;
    const { titulo, descrição, nivel } = req.body;
    try {
        const query = `
            UPDATE "Ofertas" 
            SET "titulo" = $1, "descrição" = $2, "nivel" = $3 
            WHERE "oferta_ID" = $4 
            RETURNING *`;
            
        const result = await pool.query(query, [titulo, descrição, nivel, id]);
        
        if (result.rowCount === 0) return res.status(404).json({ erro: "Oferta não encontrada" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// 4. REMOÇÃO DE OFERTA
app.delete("/ofertas/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM "Ofertas" WHERE "oferta_ID" = $1', [id]);
        if (result.rowCount === 0) return res.status(404).json({ erro: "Oferta não encontrada" });
        
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});


// Cadastrar uma Pessoa (Necessário para vincular à Oferta)
app.post("/pessoas", async (req, res) => {
    const { nome_completo, email, telefone, descrição } = req.body;
    try {
        const query = `
            INSERT INTO "Pessoas" ("nome_completo", "email", "telefone", "descrição") 
            VALUES ($1, $2, $3, $4) RETURNING *`;
        const result = await pool.query(query, [nome_completo, email, telefone, descrição]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});
//categorias (CRUD) - Necessário para vincular às Ofertas 
// Cadastrar uma Categoria
app.post("/categorias", async (req, res) => {
    const { CatNome } = req.body;
    try {
        const result = await pool.query('INSERT INTO "Categorias" ("CatNome") VALUES ($1) RETURNING *', [CatNome]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});
// Rota para listar todas as Categorias
app.get("/categorias", async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "Categorias"');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// Rota para filtror ofertas por categoria
app.get("/ofertas/categoria/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT
                o."oferta_ID", o."titulo", o."descrição", o."nivel",
                p."nome_completo" AS "autor",
                c."CatNome" AS "categoria"
            FROM "Ofertas" o
            LEFT JOIN "Pessoas" p ON o."pessoa_ID" = p."pessoa_ID"
            LEFT JOIN "Categorias" c ON o."categoria_ID" = c."categoria_ID"
            WHERE o."categoria_ID" = $1
        `;
        const result = await pool.query(query, [id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// Rota para editar informações de uma Categoria
app.put("/categorias/:id", async (req, res) => {
    const { id } = req.params;
    const { CatNome } = req.body;
    try {
        const query = 'UPDATE "Categorias" SET "CatNome" = $1 WHERE "categoria_ID" = $2 RETURNING *';
        const result = await pool.query(query, [CatNome, id]);
        if (result.rowCount === 0) return res.status(404).json({ erro: "Categoria não encontrada" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }

});

// Rota para remover uma Categoria
app.delete("/categorias/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM "Categorias" WHERE "categoria_ID" = $1', [id]);
        if (result.rowCount === 0) return res.status(404).json({ erro: "Categoria não encontrada" });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// Rotas de pessoas (CRUD) - Necessário para vincular às Ofertas

// Rota para listar todas as Pessoas
app.get("/pessoas", async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "Pessoas"');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// Rota para editar informações de uma Pessoa
app.put("/pessoas/:id", async (req, res) => {
    const { id } = req.params;
    const { nome_completo, email, telefone, descrição } = req.body;
    try {
        const query = `
            UPDATE "Pessoas" 
            SET "nome_completo" = $1, "email" = $2, "telefone" = $3, "descrição" = $4 
            WHERE "pessoa_ID" = $5 
            RETURNING *`;
        const result = await pool.query(query, [nome_completo, email, telefone, descrição, id]);
        if (result.rowCount === 0) return res.status(404).json({ erro: "Pessoa não encontrada" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// Rota para remover uma Pessoa
app.delete("/pessoas/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM "Pessoas" WHERE "pessoa_ID" = $1', [id]);
        if (result.rowCount === 0) return res.status(404).json({ erro: "Pessoa não encontrada" });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.listen(8080, () => {
    console.log("Servidor rodando no arquivo server.js (Porta 8080)");
});

