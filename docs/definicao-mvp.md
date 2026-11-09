# Anexo C — Definição do MVP

**Disciplina:** Programação Orientada a Objetos Avançada e Laboratório (POOALAB)  
**Semestre:** 2026.2  
**Instituição:** Universidade Católica do Salvador (UCSal)  
**Professor Orientador:** Mario Jorge Pereira  
**Solução:** Radar de Oportunidades Acadêmicas (OportUni)  
**Equipe:** Adryan Andrade, Allan Gonçalves, Allan Maia, Bianca Santos, Isabel Motta

## Proposta de valor

Consolidar a comunicação sobre oportunidades acadêmicas (ofertas de emprego, pesquisa, extensão e monitoria) em um canal único e acessível. A solução centraliza informações fragmentadas para evitar que estudantes percam prazos de editais e resolve a dificuldade de captação e engajamento enfrentada pelo corpo docente.

## Usuário principal

- **Estudante universitário:** usa o mural público sem precisar de conta no sistema.
- **Professor:** autentica-se com login e senha para publicar e acompanhar vagas.

## Resultado principal

- **Estudante:** descobrir vagas filtradas por curso, avaliar editais e inscrever-se rapidamente por um formulário nativo, sem precisar de conta.
- **Professor:** autenticar-se (login e senha), com validação sem necessidade de dados sensíveis; depois, publicar editais parametrizados, acompanhar métricas consolidadas e exportar a lista de candidatos interessados em CSV.

## Fluxo de ponta a ponta (entrada → processamento → resultado)

1. O **professor** faz login e cadastra uma vaga, fornecendo as diretrizes (título, links externos para imagem e edital e uma pergunta customizada opcional). O sistema salva os dados no banco PostgreSQL.
2. O **estudante** acessa o mural público, usa os filtros de curso e tipo de vaga (processados pela Java Streams API) e abre os detalhes da vaga, com o atalho externo para o edital.
3. O **estudante** preenche o formulário de candidatura. Na primeira vez ele preenche seus dados, que ficam salvos para os próximos preenchimentos. Ele acrescenta a resposta à justificativa específica exigida pelo professor e registra a inscrição diretamente no sistema.
4. O **professor** acessa seu painel, confere as métricas atualizadas da vaga no dashboard e baixa os inscritos processados em formato CSV.

## Backlog e responsabilidades

### Indispensável (MVP)

- Configuração do servidor HTTP e do banco PostgreSQL.
- Login de professor protegido por token Bearer e criptografia SHA-256.
- Mural com filtros.
- Exibição de detalhes da vaga.
- Formulário de cadastro de oportunidade pelo docente.
- Submissão de interesse pelo estudante.
- Painel numérico de métricas.
- Exportação de relatórios em CSV.

### Desejável

Nenhum item desejável foi implementado nesta entrega. Os três previstos originalmente foram movidos para "Fora do escopo" (abaixo).

### Fora do escopo

- Sistema de chat integrado.
- Anexação física de currículo em PDF.
- Disparo de notificações por e-mail.
- Login do perfil aluno.
- Marcador para salvar vagas favoritas no navegador _(desejável previsto, não implementado)_.
- Alerta visual em formato de sininho para notificações locais _(desejável previsto, não implementado)_.
- Controle numérico interativo de vagas (+/−) em tempo real _(desejável previsto, não implementado)_.

### Responsáveis

| Integrante | Função | Responsabilidades |
| :-- | :-- | :-- |
| Isabel Motta | Scrum Master | Facilitação do processo da equipe, organização e acompanhamento das entregas, remoção de impedimentos e apoio na execução de tarefas quando os integrantes não puderem ou não conseguirem realizá-las. |
| Adryan Andrade | Product Owner | Definição do problema e da proposta de valor, validação com o público e priorização do backlog. |
| Allan Gonçalves | Back-End 1 | Infraestrutura base, banco de dados (esquema e conexão), rotas do módulo de criação de vagas e geração do executável. |
| Allan Maia | Back-End 2 | Módulo de autenticação docente, gerenciamento do registro de candidaturas, cálculo de métricas com Streams API e utilitário de exportação `CsvWriter`. |
| Bianca Santos | Front-End | Estrutura e estilização das interfaces visuais, integração de chamadas assíncronas (`fetch`) e manipulação do armazenamento local do navegador. |

## Critérios de pronto (MVP funcional e demonstrável)

1. O sistema é integralmente executável pelo acionamento de um único arquivo empacotado, `radar-oportunidades.jar`, sem exigir a instalação prévia de servidores auxiliares como o Tomcat.
2. O roteiro de validação permite o acesso de um professor (cujas credenciais constam no `seed.sql`) e o sucesso na publicação e edição de editais.
3. O fluxo principal comprova a recepção de inscrições de estudantes pelo mural, com os dados capturados no banco e gerados com legibilidade no arquivo CSV resultante.

## Maior risco

- A mudança de hábito: sair do acesso às informações por redes sociais e grupos informais de WhatsApp para uma aplicação centralizada.
- **Banco de dados em outra máquina (maior risco técnico para a demonstração):** o `radar-oportunidades.jar` não leva o banco junto. Em outro computador é preciso ter o PostgreSQL instalado, criar o banco `radar_oportunidades`, executar `schema.sql` e depois `seed.sql`, e informar a conexão correta.

## Teste principal

Seguir o fluxo de ponta a ponta acima com os dados de demonstração do `seed.sql`: login do professor, publicação de uma vaga, inscrição de um estudante pelo mural e download do CSV com o inscrito. Os três critérios de pronto devem ser observados nessa execução.

## Funcionalidades ainda não implementadas

Chat integrado, anexação física de currículo em PDF, notificações por e-mail, login do perfil aluno e os três itens desejáveis não implementados: favoritos no navegador, sininho de notificações locais e controle numérico de vagas (+/−).

## Limitações conhecidas

- O sistema usa apenas o `HttpServer` nativo do Java e tecnologias web puras, sem frameworks externos pesados nem serviços de nuvem pagos.
- A aplicação não exige login para alunos. O navegador (`localStorage`) guarda apenas os dados do formulário de candidatura, para preenchimento automático nas próximas inscrições; não há favoritos nem notificações.
