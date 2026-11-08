-- Carga inicial para demonstração do Radar de Oportunidades (OportUni)
-- Executar após schema.sql: psql -U postgres -d radar_oportunidades -f src/main/resources/seed.sql

-- 1. Contas de Professores para demonstração e avaliação
-- Senhas:
--   - 'ucsal123' -> 3a54bdad11097c6aecc59babb9c66ed9ed2df8a1fc59fcdc8f3a327188a4d3c5
--   - 'admin123' -> 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
INSERT INTO professor (nome, email, senha_hash) VALUES
('Prof. Mario Jorge Pereira', 'professor@ucsal.br', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'),
('Prof. Dr. Marcelo Ribeiro', 'marcelo.ribeiro@ucsal.br', '3a54bdad11097c6aecc59babb9c66ed9ed2df8a1fc59fcdc8f3a327188a4d3c5'),
('Prof. Dr. Carlos Eduardo', 'carlos.eduardo@ucsal.br', '3a54bdad11097c6aecc59babb9c66ed9ed2df8a1fc59fcdc8f3a327188a4d3c5'),
('Profa. Dra. Renata Silveira', 'renata.silveira@ucsal.br', '3a54bdad11097c6aecc59babb9c66ed9ed2df8a1fc59fcdc8f3a327188a4d3c5'),
('Prof. Dr. Fernando Rocha', 'fernando.rocha@ucsal.br', '3a54bdad11097c6aecc59babb9c66ed9ed2df8a1fc59fcdc8f3a327188a4d3c5')
ON CONFLICT (email) DO NOTHING;

-- 2. Vagas de exemplo distribuídas entre tipos, eixos e prazos
-- Associadas ao docente responsável de acordo com credenciais-teste.md e professores.json
INSERT INTO oportunidade (id, titulo, tipo, eixo, departamento, descricao, requisitos, bolsa, data_limite, status, professor_id)
SELECT * FROM (VALUES
  (1, 'Pesquisa em IA e Processamento de Linguagem Natural', 'Iniciação Científica', 'exatas', 'Engenharias | ADS', 'Desenvolvimento de algoritmos e modelos para análise semântica e processamento de textos acadêmicos.', 'Conhecimento prévio em lógica de programação e POO.', 'R$ 700', DATE '2026-11-15', 'ABERTA', (SELECT id FROM professor WHERE email = 'carlos.eduardo@ucsal.br')),
  (2, 'Monitoria de Programação Orientada a Objetos', 'Monitoria', 'exatas', 'ADS', 'Apoio pedagógico aos estudantes nos laboratórios práticos, resolução de exercícios em Java e mentoria de git.', 'Aprovação em POOA com média superior a 7.0.', '60h (AC)', DATE '2026-11-10', 'ABERTA', (SELECT id FROM professor WHERE email = 'carlos.eduardo@ucsal.br')),
  (3, 'Projeto Conecta Salvador: Inclusão e Direitos Digitais', 'Extensão', 'humanas', 'Direito', 'Oficinas comunitárias de cidadania digital, letramento informacional e acesso assistido a serviços públicos online.', 'Disponibilidade de 4h semanais para ações de campo.', 'Voluntário (60h)', DATE '2026-11-20', 'ABERTA', (SELECT id FROM professor WHERE email = 'marcelo.ribeiro@ucsal.br')),
  (4, 'Estágio em Desenvolvimento Web e Sistemas', 'Estágio/Emprego', 'exatas', 'Engenharia de Software | ADS', 'Atuação prática no desenvolvimento e manutenção de ferramentas institucionais e portais web.', 'Estar cursando a partir do 4º semestre.', 'R$ 1.200', DATE '2026-11-30', 'ABERTA', (SELECT id FROM professor WHERE email = 'carlos.eduardo@ucsal.br')),
  (5, 'Mapeamento de Saúde Mental no Ensino Superior', 'Iniciação Científica', 'saude', 'Psicologia | Enfermagem', 'Investigação quantitativa e qualitativa sobre bem-estar estudantil, rotina acadêmica e manejo do estresse.', 'Interesse por métodos de pesquisa comportamental.', 'Bolsa FAPESB', DATE '2026-11-25', 'ABERTA', (SELECT id FROM professor WHERE email = 'renata.silveira@ucsal.br')),
  (6, 'Grupo de Estudos em Psicologia Social e Comunidade', 'Grupo de Estudo', 'saude', 'Psicologia', 'Encontros quinzenais para debate de literatura contemporânea e reflexão sobre práticas em saúde pública.', 'Aberto a estudantes de todos os semestres.', 'Voluntário (Horas AC)', DATE '2026-12-05', 'ABERTA', (SELECT id FROM professor WHERE email = 'renata.silveira@ucsal.br')),
  (7, 'Semana Acadêmica de Inovação Jurídica', 'Evento', 'humanas', 'Direito', 'Organização do ciclo de palestras sobre inteligência artificial, privacidade de dados e novas fronteiras do direito.', 'Habilidade de comunicação e organização de eventos.', 'Certificado (30h)', DATE '2026-10-10', 'ENCERRADA', (SELECT id FROM professor WHERE email = 'marcelo.ribeiro@ucsal.br')),
  (8, 'Monitoria em Anatomia Humana Aplicada', 'Monitoria', 'saude', 'Ciências Biológicas e Saúde', 'Acompanhamento prático das turmas nos laboratórios de anatomia e auxílio no estudo de peças sintéticas.', 'Nota superior a 8.0 na disciplina de Anatomia.', 'Bolsa Institucional', DATE '2026-11-12', 'ABERTA', (SELECT id FROM professor WHERE email = 'fernando.rocha@ucsal.br')),
  (9, 'Pesquisa em IA, Proteção de Dados (LGPD) e Ética Jurídica', 'Iniciação Científica', 'humanas', 'Direito', 'Investigação sobre os impactos da regulação algorítmica, privacidade e aplicação da inteligência artificial no ordenamento jurídico brasileiro.', 'Estar cursando a partir do 3º semestre de Direito e ter interesse em metodologia de pesquisa científica.', 'R$ 700 (FAPESB)', DATE '2026-11-28', 'ABERTA', (SELECT id FROM professor WHERE email = 'marcelo.ribeiro@ucsal.br')),
  (10, 'Monitoria em Teoria Geral do Direito e Prática Forense', 'Monitoria', 'humanas', 'Direito', 'Auxílio didático nas disciplinas propedêuticas, orientação de estudos de caso e apoio em simulações de audiências jurídicas.', 'Aprovação prévia na disciplina com nota igual ou superior a 8.5.', '60h (AC)', DATE '2026-11-18', 'ABERTA', (SELECT id FROM professor WHERE email = 'marcelo.ribeiro@ucsal.br'))
) AS v(id, titulo, tipo, eixo, departamento, descricao, requisitos, bolsa, data_limite, status, professor_id)
WHERE NOT EXISTS (SELECT 1 FROM oportunidade);

-- Sincroniza a sequence da tabela oportunidade caso novos cadastros sejam feitos
SELECT setval('oportunidade_id_seq', (SELECT COALESCE(MAX(id), 1) FROM oportunidade));

-- 3. Candidaturas de alunos (Interesse) para demonstração de inscritos e exportação CSV
INSERT INTO interesse (id_oportunidade, nome, email, matricula, curso, semestre, justificativa, data_registro)
SELECT * FROM (VALUES
  (9, 'Lucas Brandão Silveira', 'lucas.brandao@ucsal.edu.br', '202310452', 'Direito', '5º Período', 'Tenho grande interesse em direito digital e LGPD, tendo participado de grupos de estudos sobre regulação de inteligência artificial.', TIMESTAMP '2026-10-18 14:32:00'),
  (7, 'Lucas Brandão Silveira', 'lucas.brandao@ucsal.edu.br', '202310452', 'Direito', '5º Período', 'Responsável pela divulgação nos centros acadêmicos e elaboração dos certificados dos participantes.', TIMESTAMP '2026-09-27 12:40:00'),
  (9, 'Mariana Castro de Alencar', 'mariana.alencar@ucsal.edu.br', '202220198', 'Direito', '7º Período', 'Meu TCC é focado em responsabilidade civil algorítmica e busco uma vaga de IC para aprofundar minha fundamentação teórica.', TIMESTAMP '2026-10-19 09:15:00'),
  (3, 'Mariana Castro de Alencar', 'mariana.alencar@ucsal.edu.br', '202220198', 'Direito', '7º Período', 'Gostaria de aplicar os conhecimentos práticos em oficinas sobre direitos digitais nas comunidades parceiras.', TIMESTAMP '2026-10-20 16:30:00'),
  (10, 'Carolina Ferreira Bastos', 'carolina.bastos@ucsal.edu.br', '202310115', 'Direito', '6º Período', 'Obtive nota 9.5 em Teoria Geral e Prática Forense. Tenho experiência com mediação e facilidade em apoiar os colegas nos estudos.', TIMESTAMP '2026-10-15 10:11:00'),
  (10, 'Thiago Mendes Queiroz', 'thiago.queiroz@ucsal.edu.br', '202320491', 'Direito', '5º Período', 'Disponibilidade nas noites e plantões de dúvidas no NPJ para revisão de peças didáticas e resolução de exercícios.', TIMESTAMP '2026-10-17 17:05:00'),
  (3, 'Thiago Mendes Queiroz', 'thiago.queiroz@ucsal.edu.br', '202320491', 'Direito', '5º Período', 'Interesse em atuar na extensão aos sábados com letramento digital e acesso ao portal do INSS e TJBA.', TIMESTAMP '2026-10-18 10:40:00'),
  (3, 'Matheus Cavalcanti Rios', 'matheus.rios@ucsal.edu.br', '202310884', 'Direito', '5º Período', 'Já atuo com movimentos sociais e gostaria muito de contribuir com as oficinas comunitárias de cidadania e direitos digitais.', TIMESTAMP '2026-10-16 11:30:00'),
  (7, 'Matheus Cavalcanti Rios', 'matheus.rios@ucsal.edu.br', '202310884', 'Direito', '5º Período', 'Colaborei na organização dos debates temáticos e logística das salas de videoconferência do evento.', TIMESTAMP '2026-09-28 14:15:00'),
  (9, 'Beatriz Muniz Barreto', 'beatriz.muniz@ucsal.edu.br', '202320340', 'Direito', '4º Período', 'Possuo artigo publicado na semana de iniciação científica sobre governança de dados e gostaria de integrar o projeto de pesquisa.', TIMESTAMP '2026-10-22 11:05:00'),
  (7, 'Vinícius Andrade Teles', 'vinicius.teles@ucsal.edu.br', '202210777', 'Direito', '8º Período', 'Participei da comissão organizadora das edições anteriores da semana jurídica e coordenei o credenciamento.', TIMESTAMP '2026-09-25 18:00:00'),
  (10, 'Vinícius Andrade Teles', 'vinicius.teles@ucsal.edu.br', '202210777', 'Direito', '8º Período', 'Como formando, gostaria de auxiliar os estudantes dos primeiros períodos na elaboração de petições iniciais e peças básicas.', TIMESTAMP '2026-10-21 15:40:00'),
  (1, 'Daniel Santos Oliveira', 'daniel.santos@ucsal.edu.br', '202310672', 'Análise e Desenvolvimento de Sistemas', '4º Período', 'Forte interesse em PLN e algoritmos de processamento de texto com Python e HuggingFace.', TIMESTAMP '2026-10-18 10:20:00'),
  (2, 'Daniel Santos Oliveira', 'daniel.santos@ucsal.edu.br', '202310672', 'Análise e Desenvolvimento de Sistemas', '4º Período', 'Aprovado em POOA com nota 9.8. Desejo ajudar os calouros no laboratório de programação.', TIMESTAMP '2026-10-19 14:05:00'),
  (1, 'Camila Rocha Guimarães', 'camila.rocha@ucsal.edu.br', '202410915', 'Engenharia de Software', '3º Período', 'Desejo participar da pesquisa para desenvolver modelos de embeddings semânticos para acervos acadêmicos.', TIMESTAMP '2026-10-20 11:30:00'),
  (4, 'Pedro Henrique Albuquerque', 'pedro.albuquerque@ucsal.edu.br', '202320504', 'Análise e Desenvolvimento de Sistemas', '5º Período', 'Experiência prática em desenvolvimento web full-stack com HTML5, CSS3, JavaScript e Java.', TIMESTAMP '2026-10-21 16:15:00'),
  (2, 'Amanda Costa Ferreira', 'amanda.costa@ucsal.edu.br', '202410311', 'Engenharia de Software', '4º Período', 'Facilidade em ensinar conceitos fundamentais de POO (herança, polimorfismo e encapsulamento).', TIMESTAMP '2026-10-22 09:40:00'),
  (5, 'Letícia Ferreira Ramos', 'leticia.ramos@ucsal.edu.br', '202310238', 'Psicologia', '6º Período', 'Interesse por delineamentos de pesquisa em saúde mental e análise estatística descritiva.', TIMESTAMP '2026-10-17 15:20:00'),
  (6, 'Bruno Carvalho Siqueira', 'bruno.siqueira@ucsal.edu.br', '202320761', 'Psicologia', '4º Período', 'Disponibilidade para mediação de debates quinzenais e fichamento de artigos científicos.', TIMESTAMP '2026-10-19 17:10:00'),
  (8, 'Larissa Nogueira Diniz', 'larissa.diniz@ucsal.edu.br', '202310992', 'Enfermagem', '5º Período', 'Aprovada em Anatomia Humana com média 9.5. Disponibilidade para aulas práticas no laboratório.', TIMESTAMP '2026-10-18 11:45:00')
) AS i(id_oportunidade, nome, email, matricula, curso, semestre, justificativa, data_registro)
WHERE NOT EXISTS (SELECT 1 FROM interesse);

-- Sincroniza a sequence da tabela interesse
SELECT setval('interesse_id_seq', (SELECT COALESCE(MAX(id), 1) FROM interesse));
