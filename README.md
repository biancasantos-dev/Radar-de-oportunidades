# Radar de Oportunidades Acadêmicas (OportUni)

[![Java 21 LTS](https://img.shields.io/badge/Java-21%20LTS-orange.svg?logo=openjdk)](https://openjdk.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg?logo=postgresql)](https://www.postgresql.org/)
[![Maven 3.9](https://img.shields.io/badge/Maven-3.9+-red.svg?logo=apache-maven)](https://maven.apache.org/)

> Sistema centralizado para publicação, descoberta e gestão de oportunidades acadêmicas e científicas (Iniciação Científica, Monitorias, Projetos de Extensão, Grupos de Estudo e Estágios) da **Universidade Católica do Salvador (UCSal)**.

---

## Sumário

1. [Visão Geral e Propósito](#visao-geral-e-proposito)
2. [Principais Funcionalidades](#principais-funcionalidades)
3. [Arquitetura e Tecnologias](#arquitetura-e-tecnologias)
4. [Estrutura do Projeto](#estrutura-do-projeto)
5. [Pré-requisitos](#pre-requisitos)
6. [Instalação e Execução](#instalacao-e-execucao)
7. [Execução dos Testes Automatizados](#execucao-dos-testes-automatizados)
8. [Documentação da API REST](#documentacao-da-api-rest)
9. [Credenciais de Teste para Avaliação](#credenciais-de-teste-para-avaliacao)
10. [Destaques Técnicos do Projeto](#destaques-tecnicos-do-projeto)
11. [Documentação Complementar (Anexos)](#documentacao-complementar-anexos)
12. [Equipe de Desenvolvimento](#equipe-de-desenvolvimento)

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

- **Autenticação Institucional:** Login seguro exclusivo para domínios `@ucsal.br` ou `@prof.ucsal.br` com armazenamento de hash criptográfico em **SHA-256**.
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
|   |   |   |-- dao/             # Data Access Objects (consultas JDBC)
|   |   |   |-- model/           # Entidades de domínio (Professor, Oportunidade, Interesse)
|   |   |   |-- service/         # Regras de negócio e validações
|   |   |   |-- security/        # Utilitários de segurança e Criptografia SHA-256
|   |   |   |-- csv/             # Gerador de relatórios via Java Streams API
|   |   |   |-- database/        # Gerenciamento de conexões JDBC (ConexaoBD)
|   |   |   `-- Main.java        # Ponto de entrada do servidor HTTP
|   |   `-- resources/
|   |       |-- application.properties  # Configuração de portas e credenciais
|   |       `-- seed.sql                # Carga inicial com 4 docentes e 20 inscrições
|   `-- test/java/br/edu/ucsal/radar/   # 15 Testes de unidade JUnit 5
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
|   |-- definicao-mvp.md                # Anexo C (MVP, MoSCoW e User Stories)
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
3. **PostgreSQL 16** (opcional para rodar com banco conectado; caso esteja offline, o sistema ativa automaticamente o modo de contingência local):
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

## Execução dos Testes Automatizados

O projeto conta com **21 testes de unidade automatizados** desenvolvidos com JUnit 5, cobrindo:

- Regras de validação e restrições de criação de oportunidades;
- Atualização, exclusão e alternância de status de oportunidades com validação de autoria docente (Bug 2);
- Validação, autenticação e hashing de senhas de professores (SHA-256);
- Geração correta e performance da planilha de candidatos via **Java Streams API** (`CsvWriter`).

Para executar a suíte completa de testes:

```bash
# Windows
.\mvnw.cmd test

# Linux / macOS
./mvnw test
```

Saída esperada:

```
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running br.edu.ucsal.radar.CsvWriterTest
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running br.edu.ucsal.radar.OportunidadeTest
[INFO] Tests run: 16, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running br.edu.ucsal.radar.ProfessorTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
[INFO]
[INFO] Results: Tests run: 21, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

---

## Documentação da API REST

A aplicação expõe os seguintes endpoints HTTP sob o prefixo `/api`:

| Método | Endpoint                               |    Protegido?    | Descrição                                                                             |
| :----: | :------------------------------------- | :--------------: | :------------------------------------------------------------------------------------ |
| `POST` | `/api/login`                           |       Não        | Autentica o professor com e-mail institucional e senha, retornando o token de sessão. |
| `GET`  | `/api/oportunidades`                   |       Não        | Retorna a lista completa de oportunidades cadastradas.                                |
| `GET`  | `/api/oportunidades/{id}`              |       Não        | Retorna os detalhes de uma oportunidade específica.                                   |
| `POST` | `/api/oportunidades`                   | **Sim** (Bearer) | Cadastra uma nova oportunidade vinculada ao professor autenticado.                    |
| `PUT`  | `/api/oportunidades/{id}`              | **Sim** (Bearer) | Atualiza os dados de uma oportunidade existente (restrito ao docente criador).        |
| `DELETE`| `/api/oportunidades/{id}`             | **Sim** (Bearer) | Exclui a oportunidade e remove suas candidaturas vinculadas (restrito ao criador).    |
| `PATCH`| `/api/oportunidades/{id}`              | **Sim** (Bearer) | Alterna o status da oportunidade entre ABERTA e ENCERRADA (restrito ao criador).      |
| `GET`  | `/api/oportunidades/{id}/inscritos`    | **Sim** (Bearer) | Retorna a relação de discentes inscritos na vaga especificada (restrito ao criador).  |
| `GET`  | `/api/oportunidades/{id}/exportar-csv` |       Não        | Gera e transmite o relatório de inscritos em formato CSV processado via Java Streams. |
| `GET`  | `/api/interesses`                      | **Sim** (Bearer) | Retorna todas as candidaturas registradas para o docente.                             |
| `POST` | `/api/interesses`                      |       Não        | Registra a candidatura de um estudante em uma oportunidade aberta.                    |

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

## Destaques Técnicos do Projeto

1. **Uso Avançado de Java Streams API:** O componente `br.edu.ucsal.radar.csv.CsvWriter` utiliza pipelines com `.stream()`, `.map()` e `.collect(Collectors.joining())` para processar a exportação de candidatos de maneira limpa, imutável e funcional.
2. **Segurança de Senhas com SHA-256:** As credenciais dos professores utilizam hash com algoritmo padrão SHA-256 (`br.edu.ucsal.radar.security.HashUtil`), garantindo que senhas em texto plano nunca sejam salvas no banco.
3. **Resiliência e Contingência Offline:** O front-end foi arquitetado para consultar os endpoints REST da API Java prioritariamente; caso o servidor ou banco não estejam em execução, o sistema aciona dados locais em JSON e `localStorage`, garantindo que apresentações e avaliações nunca sejam interrompidas.
4. **Sem Dependência de Frameworks Pesados:** Toda a camada de roteamento HTTP, parsing de cabeçalhos e serialização foi desenvolvida de forma enxuta com o `HttpServer` nativo do Java 21.

---

## Documentação Complementar (Anexos)

- [**Anexo A e B: Ficha do Problema e Validação**](docs/problema-validacao.md) — Dores dos discentes e docentes, metodologia e resultados reais da pesquisa com 45 estudantes e 8 professores da UCSal.
- [**Anexo C: Definição do MVP**](docs/definicao-mvp.md) — Matriz MoSCoW, Personas e Histórias de Usuário com critérios BDD / Gherkin.
- [**Anexo D: Roteiro de Demonstração (Pitch 5 Minutos)**](demo/roteiro-demonstracao.md) — Roteiro cronometrado minuto a minuto para apresentação.
- [**Anexo E: Declaração de Uso de IA e Recursos de Terceiros**](docs/declaracao-ia-terceiros.md) — Declaração formal de transparência e integridade acadêmica.

---

## Equipe de Desenvolvimento

Projeto desenvolvido para a disciplina **Programação Orientada a Objetos Avançada e Laboratório (POOALAB)** do curso de graduação da **Universidade Católica do Salvador (UCSal)** — Semestre 2026.2.

- **Adryan Andrade** — Product Owner
- **Allan Gonçalves** — Desenvolvedor
- **Allan Maia** — Desenvolvedor
- **Bianca Santos** — Desenvolvedor Lider
- **Isabel Motta** — Scrum Master
