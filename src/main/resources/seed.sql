-- Carga inicial com professor padrao: professor@ucsal.br / admin123
INSERT INTO professor (nome, email, senha_hash) VALUES 
('Prof. Mario Jorge Pereira', 'professor@ucsal.br', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9')
ON CONFLICT (email) DO NOTHING;

INSERT INTO oportunidade (titulo, tipo, departamento, descricao, requisitos, bolsa, professor_id) VALUES
('Pesquisa em IA e PLN', 'Iniciação Científica', 'Ciência da Computação', 'Desenvolvimento de algoritmos para análise textual.', 'Conhecimento em Java e POO', 'Remunerada (R$ 700)', 1),
('Monitoria de POOA', 'Monitoria', 'Informática', 'Apoio pedagógico nos laboratórios práticos.', 'Aprovação com média >= 7.0', 'Bolsa Institucional', 1),
('Projeto Conecta Salvador', 'Extensão', 'Sistemas de Informação', 'Oficinas de inclusão digital.', 'Boa comunicação', 'Voluntário', 1);
