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
**Equipe, turma e integrantes:** Adryan Andrade (Product Owner), Allan Gonçalves (Desenvolvedor), Allan Maia (Desenvolvedor), Bianca Santos (Desenvolvedor Líder), Isabel Motta (Scrum Master) — Turma ADS - T1 (2026.2)

| Campo                 | Preenchimento                                                                                                                                                                                                                                                                                                        |
| :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Público**           | Corpo discente (estudantes de todos os semestres e cursos) e corpo docente (professores e coordenadores) da Universidade Católica do Salvador (UCSal).                                                                                                                                                              |
| **Situação**          | A comunicação sobre ofertas de emprego, projetos de extensão, bolsas, monitorias, iniciação científica e intercâmbios é fragmentada: circula por redes sociais (como o Instagram) e grupos informais de WhatsApp, sem um canal institucional centralizado de fácil acesso, no início e durante o semestre letivo.        |
| **Problema**          | Os estudantes tentam acompanhar e se inscrever em oportunidades acadêmicas, mas a informação é fragmentada entre redes sociais, WhatsApp e murais físicos. Os docentes tentam captar e selecionar discentes, mas sofrem com burocracia, baixo alcance e recebimento de inscrições desorganizadas por e-mail pessoal. |
| **Impacto**           | Alta perda de oportunidades: quase 89% dos alunos pesquisados já perderam ao menos uma oportunidade porque a informação chegou tarde demais (comprometendo bolsas e horas complementares). Para os professores, baixo alcance, falta de engajamento nas inscrições e retrabalho manual na consolidação dos inscritos. |
| **Alternativa atual** | Murais físicos e panfletos pelos campi, avisos verbais em sala de aula, grupos informais de WhatsApp de turmas e e-mails gerais.                                                                                                                                                                                     |
| **Hipótese crítica**  | Estudantes utilizariam ativamente um portal aberto com status em tempo real (aberto/fechado) e filtros por curso; e professores adotariam a plataforma se ela permitisse exportar facilmente a relação de candidatos em Excel/CSV.                                                                                   |
| **Evidência**         | Levantamento empírico realizado via questionários aplicados a **45 estudantes** e **8 professores** da UCSal entre 11/09/2026 e 17/09/2026.                                                                                                                                                                          |
| **Recorte**           | Mural público com filtros por modalidade e eixo, página de edital com status em tempo real e candidatura direta; painel do professor com triagem e exportação em CSV gerada via Java Streams API.                                                                                                                    |

### Hipóteses levantadas

1. **Oportunidades:** os alunos desconhecem as oportunidades oferecidas pela UCSal devido à pulverização dos canais de divulgação.
2. **Informação dissipada:** a comunicação descentralizada gera atrasos, sendo o fator principal para os alunos perderem prazos de editais.
3. **Dificuldade de adesão:** os professores enfrentam dificuldades sistêmicas para atrair o público ideal para projetos de pesquisa, extensão e monitoria.
4. **Centralização da informação:** um painel ou aplicativo centralizado terá alta adesão e será considerado de extrema utilidade por ambos os públicos.

### Método de investigação

Pesquisa exploratória e descritiva por **formulários online estruturados**, em dois fluxos: um para o corpo discente e outro para o corpo docente. Os questionários combinaram múltiplas escolhas, uma escala de utilidade de 1 a 5 e campos abertos, para medir aspectos quantitativos (frequência de perda de vagas) e qualitativos (preferências por funcionalidades). Os resultados são apresentados de forma agregada, sem identificar respondentes.

---

# Anexo B — Registro de validação

**Solução:** Radar de Oportunidades Acadêmicas (OportUni)

## 0. Resultado por hipótese

| Hipótese | Resultado | Evidência observada |
| :-- | :-- | :-- |
| **1 — Oportunidades** | Validada | Quase **73%** dos alunos relataram desinformação: **49%** conhecem apenas "poucos" projetos e cerca de **24%** disseram não conhecer as bolsas e ofertas. |
| **2 — Informação dissipada** | Confirmada | Quase **89%** (40 de 45) dos estudantes já perderam oportunidades acadêmicas por atraso no recebimento da informação. |
| **3 — Adesão dos professores** | Confirmada | Os docentes apontaram "falta de engajamento (os alunos veem, mas não se inscrevem)" e "baixo alcance" como principais dificuldades de captação. |
| **4 — Centralização** | Validada | **100%** dos respondentes (45 alunos e 8 professores) disseram ser necessário um aplicativo que consolide as informações. A utilidade de um painel institucional exclusivo teve média **4,86/5** entre os alunos e **4,75/5** entre os professores. |

> **Limites da evidência:** a amostra é pequena (45 alunos e 8 professores) e autodeclarada. Os resultados indicam que o problema existe e que há interesse na solução, mas **não** medem o uso real do sistema.

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
  - _(Média: 4,87 de 5,0, calculada pela distribuição acima; o relatório da Etapa 2 registra 4,86)_
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
- **Escopo do MVP guiado pelas hipóteses:** o recorte priorizou o fluxo central (mural, inscrição sem conta, painel e CSV) e deixou de fora chat, anexo físico de currículo e e-mails automáticos (ver [Anexo C](definicao-mvp.md)).

---

## 5. Testes realizados (unitários e de fluxo)

A pesquisa validou o **problema** e o **interesse** (hipóteses 1 a 4). Para verificar que **a proposta funciona**, a equipe realizou testes técnicos sobre o MVP. Eles **não foram feitos com usuários finais** (estudantes ou docentes): foram executados pela própria equipe e verificam o comportamento do sistema, não a percepção ou o uso real do público.

### A) Testes unitários (JUnit 5)

Foram escritos **27 testes automatizados** com JUnit 5, executados com `mvnw test` (resultado: 27 testes, 0 falhas, 0 erros). Os repositórios são substituídos por implementações em memória, de modo que os testes não dependem do PostgreSQL.

| Classe de teste | Testes | O que verifica |
| :-- | :-: | :-- |
| `OportunidadeTest` | 16 | Ordenação por data de encerramento; filtros por tipo e por curso (ignorando acento e maiúscula) e sua combinação; erro para tipo inválido; cadastro com campos obrigatórios e padrões; bloqueio de vaga aberta com prazo no passado; edição, exclusão e alternância de status permitidas **somente ao docente criador**. |
| `InteresseTest` | 5 | Inscrição em vaga aberta; bloqueio em vaga inexistente ou encerrada; campos obrigatórios; listagem de candidatos restrita às vagas do próprio professor. |
| `CsvWriterTest` | 3 | CSV com cabeçalho e linhas; lista vazia gera apenas o cabeçalho; neutralização de *CSV/formula injection*. |
| `ProfessorTest` | 3 | Conferência de senha (correta e incorreta) e gerenciamento de tokens de sessão. |

### B) Testes dos fluxos gerais

Além dos testes unitários, a equipe percorreu manualmente os fluxos principais do sistema, de ponta a ponta, com a API e o banco em execução, seguindo o passo a passo do [roteiro de demonstração](../demo/roteiro-demonstracao.md):

| Fluxo testado | Perfil simulado | Passos cobertos |
| :-- | :-- | :-- |
| Publicação de vaga | Docente (conta de teste) | Login, criação de nova vaga e exibição no painel docente. |
| Consulta e candidatura | Estudante fictício | Filtro por eixo/tipo no mural, abertura do edital, envio da inscrição sem conta. |
| Triagem e exportação | Docente (conta de teste) | Lista de inscritos da vaga e download do CSV aberto no Excel/LibreOffice. |

### C) O que esses testes comprovam e o que não comprovam

- **Comprovam:** que as regras de negócio (status, prazo, permissão do docente criador, validação de campos) e o fluxo central (publicar, filtrar, inscrever-se, exportar CSV) funcionam como especificado.
- **Não comprovam:** que estudantes e professores conseguem usar a interface com facilidade, nem que adotariam a plataforma. Isso exigiria um teste de usabilidade com o público, que **não foi realizado** e fica como próximo passo.
