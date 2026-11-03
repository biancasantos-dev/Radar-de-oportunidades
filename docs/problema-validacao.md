# Anexos A e B: Ficha do Problema e Registro de Validação

**Disciplina:** Programação Orientada a Objetos Avançada e Laboratório (POOALAB)  
**Semestre:** 2026.2  
**Instituição:** Universidade Católica do Salvador (UCSal)  
**Professor Orientador:** Mario Jorge Pereira  
**Solução:** Radar de Oportunidades Acadêmicas (OportUni)  
**Equipe:** Adryan Andrade, Allan Gonçalves, Allan Maia, Bianca Santos, Isabel Motta

---

# Anexo A — Ficha do problema

**Solução:** Radar de Oportunidades Acadêmicas (OportUni)  
**Equipe, turma e integrantes:** Adryan Andrade (Product Owner), Allan Gonçalves (Desenvolvedor), Allan Maia (Desenvolvedor), Bianca Santos (Desenvolvedor Líder), Isabel Motta (Scrum Master) — Turma ADS / BES (2026.2)

| Campo                 | Preenchimento                                                                                                                                                                                                                                                                                                        |
| :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Público**           | Estudantes de graduação e docentes da Universidade Católica do Salvador (UCSal).                                                                                                                                                                                                                                     |
| **Situação**          | No início e durante o semestre letivo, no momento da abertura e inscrição de editais de Iniciação Científica (IC), Monitorias, Projetos de Extensão e Estágios.                                                                                                                                                      |
| **Problema**          | Os estudantes tentam acompanhar e se inscrever em oportunidades acadêmicas, mas a informação é fragmentada entre redes sociais, WhatsApp e murais físicos. Os docentes tentam captar e selecionar discentes, mas sofrem com burocracia, baixo alcance e recebimento de inscrições desorganizadas por e-mail pessoal. |
| **Impacto**           | Perda frequente de prazos de editais por parte dos estudantes (comprometendo bolsas e horas complementares) e retrabalho manual para os professores na consolidação dos inscritos em planilhas.                                                                                                                      |
| **Alternativa atual** | Murais físicos e panfletos pelos campi, avisos verbais em sala de aula, grupos informais de WhatsApp de turmas e e-mails gerais.                                                                                                                                                                                     |
| **Hipótese crítica**  | Estudantes utilizariam ativamente um portal aberto com status em tempo real (aberto/fechado) e filtros por curso; e professores adotariam a plataforma se ela permitisse exportar facilmente a relação de candidatos em Excel/CSV.                                                                                   |
| **Evidência**         | Levantamento empírico realizado via questionários aplicados a **45 estudantes** e **8 professores** da UCSal entre 11/09/2026 e 17/09/2026.                                                                                                                                                                          |
| **Recorte**           | Mural público com filtros por modalidade e eixo, página de edital com status em tempo real e candidatura direta; painel do professor com triagem e exportação em CSV gerada via Java Streams API.                                                                                                                    |

---

# Anexo B — Registro de validação

**Solução:** Radar de Oportunidades Acadêmicas (OportUni)

## 1. Dados Reais Coletados na Pesquisa de Campo (Google Forms)

A equipe realizou a coleta de dados primários entre **11 e 17 de setembro de 2026** com discentes e docentes da UCSal:

### A) Levantamento com Discentes (Total: 45 estudantes da UCSal)

- **Cursos representados:** Análise e Desenvolvimento de Sistemas (ADS), Engenharia de Software (BES), Direito, Psicologia, Biomedicina, Nutrição, Fisioterapia e Ciências Biológicas.
- **Faixa etária:** 100% dos respondentes entre 18 e 23 anos.
- **Perda de oportunidades por atraso na informação:** **40 de 45 estudantes (88,9%)** responderam expressamente: _"Sim, já aconteceu uma ou mais vezes"_.
- **Necessidade de um local exclusivo centralizado:** **45 de 45 estudantes (100%)** responderam: _"Sim, me ajudaria muito."_
- **Avaliação de utilidade (escala 1 a 5):**
  - **Nota 5 (Essencial):** 41 estudantes (91,1%)
  - **Nota 4:** 2 estudantes (4,4%)
  - **Nota 3:** 2 estudantes (4,4%)
  - _(Média: 4,87 de 5,0)_
- **Necessidade de uma aplicação para consolidar as informações:** **45 de 45 (100%) responderam "Sim"**.
- **Canais onde atualmente encontram informações (múltipla escolha):**
  - Redes sociais da faculdade (Instagram): 24 respostas
  - Grupos de WhatsApp de turma/amigos: 22 respostas
  - _"Eu raramente fico sabendo dessas oportunidades"_: 17 respostas
  - Murais físicos / Panfletos pelo campus: 7 respostas
  - Avisos verbais de professores: 3 respostas
- **Recursos essenciais mais votados pelos discentes para o sistema:**
  1. _Status em tempo real (mostrar se o edital está aberto ou fechado)_ — 37 votos
  2. _Cards com informações curtas e botão "saiba mais" para detalhes_ — 29 votos
  3. _Termômetro / contador de vagas restantes_ — 28 votos
  4. _Filtros personalizados para mostrar oportunidades do curso/eixo_ — 26 votos
  5. _Contato direto por e-mail ou WhatsApp com o professor orientador_ — 24 votos

### B) Levantamento com Docentes (Total: 8 professores da UCSal)

- **Áreas / Cursos lecionados:** Direito, Psicologia, Museologia, Pedagogia e Filosofia.
- **Dificuldades apontadas no processo atual:** Falta de engajamento, baixo alcance e burocracia/lentidão (_"publicar edital e recolher inscrições é muito trabalhoso"_).
- **Recursos considerados mais úteis pelos docentes em uma plataforma centralizada:**
  - **Baixar um Excel/CSV com os contatos e currículos básicos dos inscritos:** **6 de 8 docentes (75%)** assinalaram como prioridade máxima.
  - **A vaga sumir ou mudar de status automaticamente na data final:** 4 de 8 docentes (50%).
  - **Métricas de visualização e candidaturas:** 4 de 8 docentes (50%).
- **Adesão à plataforma:** **7 de 8 docentes** afirmaram: _"Sim, com certeza. Acredito que facilitaria muito"_.
- **Necessidade de consolidação das informações:** **8 de 8 docentes (100%)** responderam _"Sim"_.

---

## 2. Tabela de Evidências e Decisões (Modelo Oficial do Manual POOALAB)

| Data e perfil                                               | Hipótese                                                                           | Evidência observada                                                                                                                                             | Decisão                                                                                                         |
| :---------------------------------------------------------- | :--------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------- |
| **11/09/2026** — Estudante de ADS (18-23 anos)              | Estudantes de tecnologia buscam editais na web e perdem prazos por dispersão.      | Relatou conhecer poucas oportunidades, informou que já perdeu prazos e apontou como essencial o status aberto/fechado e filtros por curso.                      | **Manter:** Desenvolver mural aberto com badges de status claros e abas por eixos acadêmicos.                   |
| **11/09/2026** — Estudante de Direito (18-23 anos)          | Discentes de cursos tradicionais dependem de murais físicos nos blocos.            | Relatou que busca informações em murais físicos/panfletos, já perdeu editais e solicitou filtros específicos para o curso de Direito.                           | **Manter:** Incluir o eixo de Humanas & Direito com destaque no mural e filtros temáticos.                      |
| **12/09/2026** — Docente de Museologia / Extensão           | Professores que coordenam IC e extensão precisam de relatórios consolidados.       | Informou gerenciar múltiplos projetos via WhatsApp e e-mail e apontou como recurso mais útil poder baixar um Excel/CSV dos inscritos.                           | **Acrescentar:** Implementar exportação de planilha CSV dos candidatos via Java Streams API no backend.         |
| **17/09/2026** — Docente de Psicologia (Coordena Monitoria) | Publicar edital e receber dados soltos por e-mail é burocrático e moroso.          | Declarou: _"Burocracia e lentidão: publicar edital e recolher inscrições é muito trabalhoso"_; votou nota 4/5 para utilidade do sistema e pediu exportação CSV. | **Manter:** Criar formulário simplificado de criação de vagas e painel com triagem imediata.                    |
| **17/09/2026** — Estudante de Biomedicina (18-23 anos)      | Estudantes priorizam visualizar prazo e status sem precisar baixar anexos.         | Relatou nunca ficar sabendo a tempo e solicitou cards resumidos com status em tempo real e botão de contato com o orientador.                                   | **Manter:** Adotar layout de cartões estilo "ticket" com prazo em destaque e botão direto de e-mail (`mailto`). |
| **17/09/2026** — Docente de Direito (Pesquisa e Monitoria)  | Docentes recebem muitas inscrições, mas precisam de triagem rápida por requisitos. | Apontou necessidade de limitar inscrições por requisitos, encerramento automático e download de planilha CSV consolidada.                                       | **Manter:** Incluir botão de encerramento rápido de vaga e persistência das candidaturas no banco PostgreSQL.   |

---

## 3. Síntese dos Aprendizados

1. **Confirmação da Dor:** 88,9% dos estudantes da amostra confirmaram já ter perdido oportunidades por atraso na informação, e 100% manifestaram desejo de um local único centralizado.
2. **Prioridade Máxima do Docente (Exportação CSV):** 75% dos professores participantes elegeram o download de planilha em Excel/CSV como a ferramenta mais necessária, orientando a decisão de implementar o componente `CsvWriter` no backend em Java Streams.
3. **Foco no Status em Tempo Real:** O recurso mais votado pelos discentes (37 votos) foi a visibilidade clara do status (ABERTA / ENCERRADA), evitando candidaturas em editais expirados.

---

## 4. Mudanças Realizadas no Projeto Decorrentes da Validação

- **Exportação CSV Direta no Backend:** Atendimento direto à solicitação de 6 dos 8 docentes, desenvolvendo a rota `/api/oportunidades/{id}/exportar-csv` com codificação UTF-8 com BOM e separador `;` para compatibilidade com o Excel.
- **Cards Estilo "Ticket" com Status em Destaque:** Implementação visual na página inicial (`index.html`) e de detalhes (`detalhe.html`) atendendo aos recursos mais solicitados pelos alunos (status em tempo real e resumo claro de bolsa e prazos).
- **Atalho de Contato Direto:** Inclusão de link de contato via e-mail institucional do orientador (`mailto`) tanto no edital quanto nos cards de inscritos.
