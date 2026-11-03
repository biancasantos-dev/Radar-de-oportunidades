-- Criação de tabelas do Radar de Oportunidades (PostgreSQL 16)
-- Banco esperado: radar_oportunidades  ->  psql -U postgres -d radar_oportunidades -f schema.sql
CREATE TABLE IF NOT EXISTS professor (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash VARCHAR(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS oportunidade (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    tipo VARCHAR(50) NOT NULL,           -- rótulo do enum TipoOportunidade (ex.: 'Monitoria')
    eixo VARCHAR(20) NOT NULL,           -- exatas | humanas | saude
    departamento VARCHAR(100) NOT NULL,  -- curso/área que o aluno filtra no mural
    descricao TEXT NOT NULL,
    atividades TEXT,
    requisitos TEXT,
    bolsa VARCHAR(50) DEFAULT 'Voluntário',
    data_limite DATE,
    data_publicacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ABERTA', -- ABERTA | ENCERRADA
    professor_id INT REFERENCES professor(id)
);

-- Colunas alinhadas com o InteresseDAO (nome, email, curso, semestre, justificativa, id_oportunidade)
CREATE TABLE IF NOT EXISTS interesse (
    id SERIAL PRIMARY KEY,
    id_oportunidade INT NOT NULL REFERENCES oportunidade(id) ON DELETE CASCADE,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    matricula VARCHAR(50) NOT NULL,
    curso VARCHAR(100) NOT NULL,
    semestre VARCHAR(20) NOT NULL,
    justificativa TEXT NOT NULL,
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
