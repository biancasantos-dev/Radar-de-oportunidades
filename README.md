# Radar de Oportunidades Acadêmicas (OportUni)

[![Java 21 LTS](https://img.shields.io/badge/Java-21%20LTS-orange.svg?logo=openjdk)](https://openjdk.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg?logo=postgresql)](https://www.postgresql.org/)
[![Maven 3.9](https://img.shields.io/badge/Maven-3.9+-red.svg?logo=apache-maven)](https://maven.apache.org/)

> Sistema centralizado para publicação, descoberta e gestão de oportunidades acadêmicas e científicas (Iniciação Científica, Monitorias, Projetos de Extensão, Grupos de Estudo e Estágios) da **Universidade Católica do Salvador (UCSal)**.

---

## Sumário

1. [Equipe de Desenvolvimento](#equipe-de-desenvolvimento)
2. [Resumo, Problema e Proposta de Valor](#resumo-problema-e-proposta-de-valor)
3. [Visão Geral e Propósito](#visão-geral-e-propósito)
4. [Principais Funcionalidades](#principais-funcionalidades)
   - [Para os Estudantes (Mural Público)](#para-os-estudantes-mural-público)
   - [Para os Professores (Portal Restrito)](#para-os-professores-portal-restrito)
5. [Arquitetura e Tecnologias](#arquitetura-e-tecnologias)
   - [Tecnologias Utilizadas](#tecnologias-utilizadas)
6. [Estrutura do Projeto](#estrutura-do-projeto)
7. [Pré-requisitos](#pré-requisitos)
8. [Instalação e Execução](#instalação-e-execução)
   - [1. Clonar o Repositório](#1-clonar-o-repositório)
   - [2. Configurar o Banco de Dados (PostgreSQL)](#2-configurar-o-banco-de-dados-postgresql)
   - [3. Compilar e Gerar o Pacote Executável](#3-compilar-e-gerar-o-pacote-executável)
   - [4. Iniciar o Servidor HTTP](#4-iniciar-o-servidor-http)
   - [5. Acessar no Navegador](#5-acessar-no-navegador)
9. [Roteiro Rápido do Fluxo Principal](#roteiro-rápido-do-fluxo-principal)
10. [Execução dos Testes Automatizados](#execução-dos-testes-automatizados)
11. [Documentação da API REST](#documentação-da-api-rest)
12. [Credenciais de Teste para Avaliação](#credenciais-de-teste-para-avaliação)
13. [Destaques Técnicos e Relação com POOA](#destaques-técnicos-e-relação-com-pooa)
14. [Privacidade, Segurança e Acessibilidade](#privacidade-segurança-e-acessibilidade)
15. [Limitações Conhecidas e Próximos Passos](#limitações-conhecidas-e-próximos-passos)
16. [Fontes, Licenças, Terceiros e Uso de IA](#fontes-licenças-terceiros-e-uso-de-ia)
17. [Documentação Complementar (Anexos)](#documentação-complementar-anexos)

---

## Equipe de Desenvolvimento

Projeto desenvolvido para a disciplina **Programação Orientada a Objetos Avançada e Laboratório (POOALAB)** do curso de graduação da **Universidade Católica do Salvador (UCSal)** — Semestre 2026.2.

**Turma:** ADS- T1

- **Adryan Andrade** — Product Owner
- **Allan Gonçalves** — Back-End 1 (infraestrutura, banco, vagas e executável)
- **Allan Maia** — Back-End 2 (autenticação, candidaturas, métricas e CSV)
- **Bianca Santos** — Front-End e Desenvolvedora Líder
- **Isabel Motta** — Scrum Master

---

## Resumo, Problema e Proposta de Valor

**OportUni** é um mural web único de oportunidades acadêmicas da UCSal: iniciação científica, monitoria, extensão, estágio e eventos.
O estudante encontra as vagas, filtra por eixo e tipo e se inscreve **sem criar conta**.
O professor faz login, publica e edita vagas, acompanha as inscrições e **baixa a lista de candidatos em CSV**.
O backend é Java 21 com o `HttpServer` nativo e PostgreSQL; o front-end é HTML, CSS e JavaScript puros.
A aplicação é empacotada em um único `radar-oportunidades.jar`.

- **Problema:** as ofertas circulam fragmentadas entre Instagram, grupos de WhatsApp e murais físicos, sem um canal institucional centralizado.
- **Público:** estudantes de todos os cursos e semestres e professores/coordenadores da UCSal.
- **Impacto observado:** na pesquisa com 45 estudantes e 8 professores, quase 89% dos alunos já perderam uma oportunidade por informação tardia e 100% consideram necessário um local único (ver [Anexos A e B](docs/problema-validacao.md)).
- **Proposta de valor:** consolidar as oportunidades em um canal único e acessível, para que estudantes não percam prazos e professores consigam captar e organizar candidatos (ver [Anexo C](docs/definicao-mvp.md)).

---

## Visão Geral e Propósito

Nas universidades, editais de bolsas e projetos frequentemente sofrem com a descentralização: murais físicos nos blocos de salas, correntes de e-mails institucionais perdidos e grupos informais de mensagens. O **OportUni** foi desenvolvido como o canal oficial único da universidade, oferecendo:

- **Para Estudantes:** Um mural aberto, intuitivo e com filtros por eixo acadêmico, valores de bolsa e prazos, permitindo candidaturas com poucos cliques sem burocracia.
- **Para Professores:** Um portal de governança onde é possível redigir editais com prévia interativa ao vivo, gerenciar inscrições com indicadores em tempo real e exportar a lista de candidatos em CSV compatível com Excel via **Java Streams API**.

---

## Principais Funcionalidades

### Para os Estudantes (Mural Público)

- **Mural estilo "Ticket" por Eixo Acadêmico:** Navegação visual pelas abas de Exatas & TI, Humanas & Direito, Saúde & Biológicas e Geral.
- **Busca e Filtro em Tempo Real:** Filtragem instantânea por texto (título, descrição, departamento) ou modalidade (Iniciação Científica, Monitoria, Extensão, etc.).
- **Página Completa do Edital:** Apresentação clara de objetivos, requisitos, atividades, cronograma, remuneração/bolsa e contato do orientador.
- **Formulário de Inscrição Ágil:** Envio de dados acadêmicos (matrícula, curso, período, CR e mensagem de justificativa) persistidos diretamente no PostgreSQL.

### Para os Professores (Portal Restrito)

- **Autenticação Docente:** login por e-mail institucional e senha, com token Bearer e senha armazenada como hash **SHA-256**. As contas de demonstração vêm do `seed.sql`. A tela de cadastro valida o domínio `@ucsal.br`/`@prof.ucsal.br` apenas no navegador (ver [Limitações](#limitações-conhecidas-e-próximos-passos)).
- **Painel de Controle com Bento KPIs:** Métricas dinâmicas com contagem de vagas totais, abertas, encerradas e o número exato de discentes únicos inscritos.
- **Cadastro e Edição com Live Preview:** Formulário reativo onde o cartão de divulgação atualiza em tempo real enquanto o professor digita.
- **Triagem Reversível de Candidatos:** Avaliação com um clique para marcar estudantes como **Aprovado**, **Em Análise** ou **Rejeitado**, além de atalho direto para envio de e-mail institucional (`mailto`).
- **Exportação em CSV com Java Streams:** Download de planilha formatada em UTF-8 com BOM e separador ponto e vírgula (`;`), processada via Streams API no servidor Java.

---

## Arquitetura e Tecnologias

A aplicação adota o padrão arquitetural **MVC (Model-View-Controller)** com separação estrita de responsabilidades, privilegiando o uso das APIs nativas do JDK para máxima performance e baixo consumo de recursos:

```
[ Navegador Web (HTML5 / CSS3 / JavaScript Vanilla) ]
                          |
                   HTTP / REST (JSON)
                          |
  +--------------------------------------------------+
  |         Java 21 LTS - HttpServer Nativo         |
  |                                                  |
  |  [Controllers]                                   |
  |    * LoginController (/api/login)                |
  |    * OportunidadeController (/api/oportunidades) |
  |    * InteresseController (/api/interesses)       |
  |                                                  |
  |  [Services & Business Logic]                     |
  |    * ProfessorService (Hash SHA-256 & Auth)      |
  |    * OportunidadeService (Validações de Vagas)   |
  |    * InteresseService (Gestão de Candidaturas)   |
  |    * CsvWriter (Java Streams API)                |
  |                                                  |
  |  [Data Access Layer (DAO / JDBC)]                |
  |    * ProfessorDAO, OportunidadeDAO, InteresseDAO |
  +-----------------------+--------------------------+
                          |
                        JDBC
                          |
                 [ PostgreSQL 16 ]
```

### Tecnologias Utilizadas

- **Linguagem Backend:** Java 21 LTS (OpenJDK).
- **Servidor Web:** `com.sun.net.httpserver.HttpServer` nativo (sem dependência de frameworks pesados como Spring ou Quarkus).
- **Banco de Dados:** PostgreSQL 16.
- **Serialização JSON:** Google Gson 2.10.1.
- **Testes de Unidade:** JUnit Jupiter 5.10.2.
- **Build & Empacotamento:** Apache Maven 3.9+ com plugin `maven-shade-plugin` (gera um Fat JAR executável autocontido).
- **Frontend:** HTML5 semântico, CSS3 moderno (Flexbox / CSS Grid) e JavaScript puro (ES6+) desacoplado com contingência offline.

---

## Estrutura do Projeto

```
radar-oportunidades/
|-- src/
|   |-- main/
|   |   |-- java/br/edu/ucsal/radar/
|   |   |   |-- controller/      # Controladores HTTP (REST Handlers)
|   |   |   |-- dao/             # Interfaces *Repository e implementações *DAO (JDBC)
|   |   |   |-- model/           # Entidades e enums (Professor, Oportunidade, Interesse, ...)
|   |   |   |-- service/         # Regras de negócio e validações
|   |   |   |-- util/            # ConexaoBD, HashUtil (SHA-256), TokenManager, CsvWriter (Streams), Json, StaticFileHandler
|   |   |   `-- Main.java        # Ponto de entrada do servidor HTTP
|   |   `-- resources/
|   |       |-- application.properties.example  # Modelo de configuração (opcional)
|   |       |-- schema.sql                      # Criação das tabelas
|   |       `-- seed.sql                        # Carga: 5 professores, 10 vagas e 20 inscrições
|   `-- test/java/br/edu/ucsal/radar/   # 27 testes de unidade JUnit 5
|-- web/                                # Camada de apresentação estática
|   |-- assets/                         # Ícones SVG e dados de contingência JSON
|   |-- css/                            # Folhas de estilo modularizadas
|   |-- js/                             # Scripts JavaScript documentados
|   |-- index.html                      # Mural público de oportunidades
|   |-- detalhe.html                    # Visualização de edital e candidatura
|   |-- login.html                      # Autenticação institucional docente
|   |-- painel.html                     # Portal do professor e KPIs
|   |-- oportunidade.html               # Cadastro/edição com Live Preview
|   `-- inscritos.html                  # Triagem de candidatos e exportação CSV
|-- docs/                               # Anexos obrigatórios da disciplina
|   |-- problema-validacao.md           # Anexos A e B (Problema e Validação)
|   |-- definicao-mvp.md                # Anexo C (definição do MVP)
|   `-- declaracao-ia-terceiros.md      # Anexo E (Uso de IA e Recursos de Terceiros)
|-- demo/
|   |-- roteiro-demonstracao.md         # Anexo D (Roteiro do Pitch de 5 minutos)
|   `-- credenciais-teste.md            # Tabela de credenciais para avaliação
|-- pom.xml                             # Configuração Maven e dependências
`-- README.md                           # Documentação central do projeto
```

---

## Pré-requisitos

Para compilar e executar o projeto em sua máquina local, certifique-se de possuir instalado:

1. **Java Development Kit (JDK) 21** ou superior:
   ```bash
   java -version
   ```
2. **Apache Maven 3.9+** (ou utilize o wrapper `./mvnw` incluso):
   ```bash
   mvn -version
   ```
3. **PostgreSQL 16**, necessário para o fluxo real (publicar vagas, inscrever, exportar CSV). Sem o banco, a API responde erro 500 e o front-end exibe apenas dados locais de contingência, somente para visualização:
   ```bash
   psql --version
   ```

---

## Instalação e Execução

### 1. Clonar o Repositório

```bash
git clone https://github.com/SEU_USUARIO/Radar-de-oportunidades.git
cd "Radar de oportunidades"
```

### 2. Configurar o Banco de Dados (PostgreSQL)

Crie o banco de dados no PostgreSQL e execute o script de carga inicial:

```sql
CREATE DATABASE radar_oportunidades;
```

Em seguida, execute o arquivo de semente localizado em `src/main/resources/seed.sql`:

```bash
psql -U postgres -d radar_oportunidades -f src/main/resources/seed.sql
```

> **Configuração de Credenciais:** As configurações de porta e banco podem ser ajustadas no arquivo `src/main/resources/application.properties` ou através de variáveis de ambiente (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`).

### 3. Compilar e Gerar o Pacote Executável

Execute o build do Maven com o empacotamento completo:

```bash
# Windows
.\mvnw.cmd clean package

# Linux / macOS
./mvnw clean package
```

### 4. Iniciar o Servidor HTTP

Inicie a aplicação utilizando o Fat JAR gerado na pasta `target/`:

```bash
java -jar target/radar-oportunidades.jar
```

_(Ou execute em modo desenvolvimento com `.\mvnw.cmd compile exec:java` ou `.\mvnw.cmd exec:java`)_

O servidor iniciará na porta **8080**:

```
[INFO] Servidor HTTP iniciado em http://localhost:8080/
[INFO] Servindo arquivos web em http://localhost:8080/index.html
[INFO] API REST disponível sob /api/
```

### 5. Acessar no Navegador

Abra seu navegador em:
**`http://localhost:8080/index.html`**

---

## Roteiro Rápido do Fluxo Principal

Com o servidor rodando e o `seed.sql` carregado (todos os dados são fictícios):

1. Abra `http://localhost:8080/login.html` e entre como `marcelo.ribeiro@ucsal.br` / `ucsal123`.
2. No **Painel**, clique em **Nova Vaga**, preencha o formulário e publique: a vaga é gravada no PostgreSQL.
3. Em outra aba, abra `http://localhost:8080/index.html` (mural público), filtre por eixo ou tipo, abra a vaga e preencha o formulário de **candidatura**.
4. Volte ao Painel: o número de **inscritos** da vaga foi atualizado. Abra a lista de **Inscritos** e use o botão de exportar.
5. Abra o arquivo **CSV** baixado no Excel ou no LibreOffice (UTF-8 com BOM e separador `;`).

O roteiro da apresentação está em [`demo/roteiro-demonstracao.md`](demo/roteiro-demonstracao.md).

---

## Execução dos Testes Automatizados

O projeto conta com **27 testes de unidade automatizados** desenvolvidos com JUnit 5, cobrindo:

- Regras de validação e restrições de criação de oportunidades;
- Atualização, exclusão e alternância de status de oportunidades com validação de autoria docente;
- Regras de negócio de candidaturas e proteção contra inscrições em vagas encerradas (`InteresseTest`);
- Isolamento de dados entre professores para conformidade com a LGPD;
- Validação, autenticação e hashing de senhas de professores (SHA-256);
- Geração segura e performance da planilha de candidatos via **Java Streams API** com proteção contra CSV Injection (`CsvWriter`).

Para executar a suíte completa de testes:

```bash
# Windows
.\mvnw.cmd test

# Linux / macOS
sh mvnw test
```

> Use o wrapper. Em alguns ambientes o `mvn` instalado no sistema usa um plugin de testes antigo e executa **0 testes** com `BUILD SUCCESS`, o que engana. Os testes são de unidade e não precisam do PostgreSQL.

Saída esperada:

```
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running br.edu.ucsal.radar.CsvWriterTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running br.edu.ucsal.radar.InteresseTest
[INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running br.edu.ucsal.radar.OportunidadeTest
[INFO] Tests run: 16, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running br.edu.ucsal.radar.ProfessorTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
[INFO]
[INFO] Results: Tests run: 27, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

---

## Documentação da API REST

A aplicação expõe os seguintes endpoints HTTP sob o prefixo `/api`:

|  Método  | Endpoint                               |    Protegido?    | Descrição                                                                                |
| :------: | :------------------------------------- | :--------------: | :--------------------------------------------------------------------------------------- |
|  `POST`  | `/api/login`                           |       Não        | Autentica o professor com e-mail institucional e senha, retornando o token de sessão.    |
|  `GET`   | `/api/oportunidades`                   |       Não        | Retorna a lista completa de oportunidades cadastradas.                                   |
|  `GET`   | `/api/oportunidades/{id}`              |       Não        | Retorna os detalhes de uma oportunidade específica.                                      |
|  `POST`  | `/api/oportunidades`                   | **Sim** (Bearer) | Cadastra uma nova oportunidade vinculada ao professor autenticado.                       |
|  `PUT`   | `/api/oportunidades/{id}`              | **Sim** (Bearer) | Atualiza os dados de uma oportunidade existente (restrito ao docente criador).           |
| `DELETE` | `/api/oportunidades/{id}`              | **Sim** (Bearer) | Exclui a oportunidade e remove suas candidaturas vinculadas (restrito ao criador).       |
| `PATCH`  | `/api/oportunidades/{id}`              | **Sim** (Bearer) | Alterna o status da oportunidade entre ABERTA e ENCERRADA (restrito ao criador).         |
|  `GET`   | `/api/oportunidades/{id}/inscritos`    | **Sim** (Bearer) | Retorna a relação de discentes inscritos na vaga especificada (restrito ao criador).     |
|  `GET`   | `/api/oportunidades/{id}/exportar-csv` | **Sim** (Bearer) | Gera e transmite o relatório de inscritos em CSV via Java Streams (restrito ao criador). |
|  `GET`   | `/api/interesses`                      | **Sim** (Bearer) | Retorna apenas as candidaturas registradas para as vagas do docente logado.              |
|  `POST`  | `/api/interesses`                      |       Não        | Registra a candidatura de um estudante em uma oportunidade aberta.                       |

---

## Credenciais de Teste para Avaliação

Para facilitar a simulação de múltiplos perfis docentes durante a banca avaliadora, o banco de dados já possui 4 professores cadastrados:

| Professor(a)                    | E-mail de Acesso           | Senha Padrão | Departamento / Eixo     |      Vagas e Inscritos       |
| :------------------------------ | :------------------------- | :----------: | :---------------------- | :--------------------------: |
| **Prof. Dr. Marcelo Ribeiro**   | `marcelo.ribeiro@ucsal.br` |  `ucsal123`  | **Direito**             | 4 vagas • 7 alunos inscritos |
| **Prof. Dr. Carlos Eduardo**    | `carlos.eduardo@ucsal.br`  |  `ucsal123`  | **Exatas & TI**         | 3 vagas • 4 alunos inscritos |
| **Profa. Dra. Renata Silveira** | `renata.silveira@ucsal.br` |  `ucsal123`  | **Psicologia**          | 2 vagas • 2 alunos inscritos |
| **Prof. Dr. Fernando Rocha**    | `fernando.rocha@ucsal.br`  |  `ucsal123`  | **Ciências Biológicas** |  1 vaga • 1 aluno inscrito   |

> _Consulte [credenciais-teste.md](demo/credenciais-teste.md) para o guia detalhado de teste por perfil._

---

## Destaques Técnicos e Relação com POOA

1. **Uso Avançado de Java Streams API:** O componente `br.edu.ucsal.radar.util.CsvWriter` utiliza pipelines com `.stream()`, `.map()` e `.collect(Collectors.joining())` para processar a exportação de candidatos de maneira limpa, imutável e funcional.
2. **Segurança de Senhas com SHA-256:** As credenciais dos professores utilizam hash com algoritmo padrão SHA-256 (`br.edu.ucsal.radar.util.HashUtil`), garantindo que senhas em texto plano nunca sejam salvas no banco.
3. **Resiliência e Contingência Offline:** O front-end foi arquitetado para consultar os endpoints REST da API Java prioritariamente; caso o servidor ou banco não estejam em execução, o sistema aciona dados locais em JSON e `localStorage`, garantindo que apresentações e avaliações nunca sejam interrompidas.
4. **Sem Dependência de Frameworks Pesados:** Toda a camada de roteamento HTTP, parsing de cabeçalhos e serialização foi desenvolvida de forma enxuta com o `HttpServer` nativo do Java 21.

---

## Privacidade, Segurança e Acessibilidade

- **Dados fictícios:** professores, vagas e alunos do `seed.sql` são inventados. Nenhuma base institucional, credencial real ou dado pessoal real foi usado.
- **Coleta mínima:** a inscrição pede apenas nome, e-mail, matrícula, curso, semestre e justificativa, o necessário para o professor avaliar o candidato.
- **Segredos:** `application.properties` está no `.gitignore`; os valores padrão do banco servem apenas para ambiente local.
- **Controle de acesso:** rotas de gestão exigem token Bearer, e cada professor só edita, exclui, vê inscritos e exporta CSV das **próprias** vagas.
- **Exportação segura:** o `CsvWriter` neutraliza células que começam com `=`, `+`, `-` ou `@` (CSV/Formula Injection).
- **Acessibilidade:** páginas com `lang="pt-BR"`, textos alternativos nas imagens, ícones decorativos com `aria-hidden`, rótulos `aria-label` em menus e botões e status da vaga indicado também por texto, não só por cor.
- **Riscos conhecidos que não foram resolvidos:** ver [Limitações](#limitações-conhecidas-e-próximos-passos).

---

## Limitações Conhecidas e Próximos Passos

- Os tokens de sessão ficam em memória: reiniciar o servidor encerra as sessões dos professores.
- Apenas existe login de professores no MVP, mas deverá ter login e cadastro de alunos também.
- O cadastro de novos professores valida o domínio `@ucsal.br` apenas no navegador e não cria conta no banco; os docentes de demonstração vêm do `seed.sql`.
- O mural filtra as vagas no navegador; a Streams API é usada no servidor (CSV e listagens).
- Itens planejados na Etapa 3 que dependem de confirmação na implementação: links de edital e de imagem na vaga, pergunta customizada, favoritos, sininho de notificações e controle numérico de vagas (ver [Anexo C](docs/definicao-mvp.md)).
- A validação por formulário mede interesse e não uso real; o teste do protótipo com usuários está descrito como pendência no [Anexo B](docs/problema-validacao.md).

**Próximos passos:** links de edital e imagem, pergunta customizada por vaga, cadastro de docentes com verificação, hash com salt, persistência das sessões e favoritos locais.

---

## Fontes, Licenças, Terceiros e Uso de IA

- **Bibliotecas (Maven):** PostgreSQL JDBC 42.7.2 (BSD-2-Clause), Gson 2.10.1 (Apache-2.0) e JUnit Jupiter 5.10.2 (EPL-2.0); plugins Maven Shade e Exec (Apache-2.0).
- **Recursos visuais:** ícones SVG e a fonte Poppins via Google Fonts (OFL).
- **Uso de IA:** declarado em [`docs/declaracao-ia-terceiros.md`](docs/declaracao-ia-terceiros.md) (Anexo E).
- **Dados:** todos os dados de demonstração são fictícios.

---

## Documentação Complementar (Anexos)

- [**Anexo A e B: Ficha do Problema e Validação**](docs/problema-validacao.md) — Problema, hipóteses, método e resultados da pesquisa com 45 estudantes e 8 professores da UCSal.
- [**Anexo C: Definição do MVP**](docs/definicao-mvp.md) — Proposta de valor, fluxo de ponta a ponta, backlog, responsáveis, critérios de pronto, riscos e limitações.
- [**Anexo D: Roteiro de Demonstração (Pitch 5 Minutos)**](demo/roteiro-demonstracao.md) — Roteiro cronometrado minuto a minuto para apresentação.
- [**Anexo E: Declaração de Uso de IA e Recursos de Terceiros**](docs/declaracao-ia-terceiros.md) — Declaração formal de transparência e integridade acadêmica.
