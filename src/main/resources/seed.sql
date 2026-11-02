-- Carga inicial para demonstração
-- Professor padrão: professor@ucsal.br / admin123 (hash SHA-256 da senha)
INSERT INTO professor (nome, email, senha_hash) VALUES
('Prof. Mario Jorge Pereira', 'professor@ucsal.br', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9')
ON CONFLICT (email) DO NOTHING;

-- Vagas de exemplo (distribuídas entre tipos, eixos e prazos; 1 já encerrada).
-- Só insere se a tabela estiver vazia, então rodar o seed duas vezes não duplica nada.
INSERT INTO oportunidade (titulo, tipo, eixo, departamento, descricao, requisitos, bolsa, data_limite, status, professor_id)
SELECT * FROM (VALUES
  ('Pesquisa em IA e Processamento de Linguagem Natural', 'Iniciação Científica', 'exatas', 'Engenharias | ADS', 'Desenvolvimento de algoritmos e modelos para análise semântica e processamento de textos acadêmicos.', 'Conhecimento prévio em lógica de programação e POO.', 'R$ 700', DATE '2026-11-15', 'ABERTA', 1),
  ('Monitoria de Programação Orientada a Objetos', 'Monitoria', 'exatas', 'ADS', 'Apoio pedagógico aos estudantes nos laboratórios práticos, resolução de exercícios em Java e mentoria de git.', 'Aprovação em POOA com média superior a 7.0.', '60h (AC)', DATE '2026-11-10', 'ABERTA', 1),
  ('Projeto Conecta Salvador: Inclusão e Direitos Digitais', 'Extensão', 'humanas', 'Direito', 'Oficinas comunitárias de cidadania digital, letramento informacional e acesso assistido a serviços públicos online.', 'Disponibilidade de 4h semanais para ações de campo.', 'Voluntário (60h)', DATE '2026-11-20', 'ABERTA', 1),
  ('Estágio em Desenvolvimento Web e Sistemas', 'Estágio/Emprego', 'exatas', 'Engenharia de Software | ADS', 'Atuação prática no desenvolvimento e manutenção de ferramentas institucionais e portais web.', 'Estar cursando a partir do 4º semestre.', 'R$ 1.200', DATE '2026-11-30', 'ABERTA', 1),
  ('Mapeamento de Saúde Mental no Ensino Superior', 'Iniciação Científica', 'saude', 'Psicologia | Enfermagem', 'Investigação quantitativa e qualitativa sobre bem-estar estudantil, rotina acadêmica e manejo do estresse.', 'Interesse por métodos de pesquisa comportamental.', 'Bolsa FAPESB', DATE '2026-11-25', 'ABERTA', 1),
  ('Grupo de Estudos em Psicologia Social e Comunidade', 'Grupo de Estudo', 'saude', 'Psicologia', 'Encontros quinzenais para debate de literatura contemporânea e reflexão sobre práticas em saúde pública.', 'Aberto a estudantes de todos os semestres.', 'Voluntário (Horas AC)', DATE '2026-12-05', 'ABERTA', 1),
  ('Semana Acadêmica de Inovação Jurídica', 'Evento', 'humanas', 'Direito', 'Organização do ciclo de palestras sobre inteligência artificial, privacidade de dados e novas fronteiras do direito.', 'Habilidade de comunicação e organização de eventos.', 'Certificado (30h)', DATE '2026-10-10', 'ENCERRADA', 1),
  ('Monitoria em Anatomia Humana Aplicada', 'Monitoria', 'saude', 'Ciências Biológicas e Saúde', 'Acompanhamento prático das turmas nos laboratórios de anatomia e auxílio no estudo de peças sintéticas.', 'Nota superior a 8.0 na disciplina de Anatomia.', 'Bolsa Institucional', DATE '2026-11-12', 'ABERTA', 1),
  ('Pesquisa em IA, Proteção de Dados (LGPD) e Ética Jurídica', 'Iniciação Científica', 'humanas', 'Direito', 'Investigação sobre os impactos da regulação algorítmica, privacidade e aplicação da inteligência artificial no ordenamento jurídico brasileiro.', 'Estar cursando a partir do 3º semestre de Direito e ter interesse em metodologia de pesquisa científica.', 'R$ 700 (FAPESB)', DATE '2026-11-28', 'ABERTA', 1),
  ('Monitoria em Teoria Geral do Direito e Prática Forense', 'Monitoria', 'humanas', 'Direito', 'Auxílio didático nas disciplinas propedêuticas, orientação de estudos de caso e apoio em simulações de audiências jurídicas.', 'Aprovação prévia na disciplina com nota igual ou superior a 8.5.', '60h (AC)', DATE '2026-11-18', 'ABERTA', 1)
) AS v(titulo, tipo, eixo, departamento, descricao, requisitos, bolsa, data_limite, status, professor_id)
WHERE NOT EXISTS (SELECT 1 FROM oportunidade)
  AND EXISTS (SELECT 1 FROM professor WHERE id = 1);
