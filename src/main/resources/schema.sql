-- Criação de tabelas do Radar de Oportunidades
CREATE TABLE IF NOT EXISTS professor (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash VARCHAR(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS oportunidade (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    requisitos TEXT,
    bolsa VARCHAR(50) DEFAULT 'Voluntário',
    data_limite DATE,
    data_publicacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ABERTA',
    professor_id INT REFERENCES professor(id)
);

CREATE TABLE IF NOT EXISTS interesse (
    id SERIAL PRIMARY KEY,
    oportunidade_id INT REFERENCES oportunidade(id),
    nome_aluno VARCHAR(150) NOT NULL,
    email_aluno VARCHAR(150) NOT NULL,
    matricula VARCHAR(50) NOT NULL,
    mensagem TEXT,
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
