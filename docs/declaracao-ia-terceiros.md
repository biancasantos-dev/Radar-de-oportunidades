# Anexo E — Declaração de uso de inteligência artificial e de componentes de terceiros

**Disciplina:** Programação Orientada a Objetos Avançada
**Semestre Letivo:** 2026.2  
**Instituição:** Universidade Católica do Salvador (UCSal)  
**Professor Responsável:** Mario Jorge Pereira  
**Projeto:** Radar de Oportunidades Acadêmicas (OportUni)  
**Equipe:** Adryan Andrade (PO), Allan Gonçalves (Dev), Allan Maia (Dev), Bianca Santos (Dev Líder), Isabel Motta (SM)

---

## 1. Declaração de Integridade Acadêmica

Em consonância com as diretrizes da disciplina POOA e o compromisso ético da Universidade Católica do Salvador, esta declaração tem por objetivo apresentar com total transparência e rigor acadêmico como ferramentas de Inteligência Artificial (IA) e recursos de terceiros foram integrados ao fluxo de trabalho do projeto **Radar de Oportunidades (OportUni)**.

---

## 2. Escopo do Uso de Ferramentas de Inteligência Artificial

O uso de ferramentas de IA generativa deu-se estritamente como suporte técnico auxiliar, concentrando-se em apoio redacional, refinamento visual e apoio pontual à depuração e à compreensão de trechos do código Java. Em todos os casos, a ferramenta utilizada foi o **Claude (Anthropic)** e o resultado foi revisado, compreendido e validado pelos integrantes antes de ser incorporado ao projeto. O uso esteve focado nas seguintes frentes:

### 2.1. Auxílio na Redação e Polimento de Textos

- **Revisão e síntese textual:** Apoio na estruturação da redação das narrativas de documentação (Anexos A, B, C e D), adequando o tom acadêmico e técnico.
- **Enriquecimento dos editais simulados:** Elaboração das descrições textuais, requisitos e atividades das vagas acadêmicas simuladas no banco de dados e arquivos de dados (ex.: projetos de Iniciação Científica, monitorias e projetos de extensão), conferindo verossimilhança ao contexto universitário da UCSal.
- **Correção de comentários explicativos:** Apoio na correção de comentários didáticos, tornando o código mais acessível e simples de entender.

### 2.2. Apoio no Alinhamento e Estilização de CSS

- **Ajustes de alinhamento e flexibilidade visual:** Sugestões e correções pontuais para alinhamento de caixas e elementos via Flexbox e CSS Grid (como o alinhamento de crachás/badges de status, centralização de ícones em botões de ação e ajuste de margens internas em formulários).
- **Consistência de espaçamentos:** Ajustes de padding, gaps e hierarquia tipográfica no arquivo `web/css/index.css` e folhas complementares, garantindo que os cartões estilo "ticket" mantivessem alinhamento coerente em resoluções desktop e telas móveis.

### 2.3. Apoio na Depuração das Conexões da Camada DAO

- **Ferramenta ou modelo:** Claude (Anthropic).
- **Finalidade ou tarefa:** Auxílio na identificação de problemas nas conexões das classes com o banco de dados.
- **Parte afetada:** Classes da subpasta `dao` (`src/main/java/br/edu/ucsal/radar/dao`), principalmente o tratamento das conexões com o banco de dados PostgreSQL.
- **Revisão e validação realizadas:** O Claude apontou os erros encontrados; a refatoração do código foi realizada pelo integrante responsável, que analisou o código resultante e verificou o seu funcionamento.

### 2.4. Apoio na Construção do `CsvWriter`

- **Ferramenta ou modelo:** Claude (Anthropic).
- **Finalidade ou tarefa:** Auxílio na construção dos métodos da classe `CsvWriter`, parte em que o integrante teve maior dificuldade de entendimento das estruturas utilizadas.
- **Parte afetada:** Classe `br.edu.ucsal.radar.util.CsvWriter` (geração de planilhas CSV).
- **Revisão e validação realizadas:** Revisão dos métodos e do modo como cada funcionalidade trata o texto/objeto recebido.

---

## 3. Autoria Intelectual Exclusiva da Equipe

A concepção conceitual, arquitetural e a lógica de programação do projeto constituem trabalho autoral dos integrantes da equipe. Especificamente, as seguintes decisões e implementações foram definidas e desenvolvidas pelos alunos, ressalvados os apoios pontuais de IA descritos nas seções 2.3 e 2.4 e o trecho de terceiros descrito na seção 4:

1. **Definição e Validação do Problema:** Aplicação e consolidação de pesquisa empírica real com 45 estudantes e 8 docentes da UCSal, identificação das dores concretas e definição do recorte do MVP.
2. **Arquitetura de Software em Java:** Implementação do padrão MVC (Model-View-Controller) sem uso de frameworks pesados (Spring/Quarkus), utilizando exclusivamente o servidor nativo do JDK (`com.sun.net.httpserver.HttpServer`).
3. **Modelagem Relacional de Dados:** Criação do modelo entidade-relacionamento (MER), estrutura das tabelas (`professor`, `oportunidade`, `interesse`) e scripts SQL de inicialização e carga (`src/main/resources/seed.sql`).
4. **Camada de Dados e Lógica de Negócio:** Desenvolvimento das classes DAO (`ProfessorDAO`, `OportunidadeDAO`, `InteresseDAO`), com apoio do Claude na identificação de problemas de conexão com o banco, e dos Services com regras de validação de e-mail institucional e criptografia de senhas em SHA-256 (`br.edu.ucsal.radar.util.HashUtil`, a partir de exemplo de terceiros, conforme seção 4).
5. **Aplicação Avançada de Java Streams:** Implementação do gerador de planilhas CSV (`br.edu.ucsal.radar.util.CsvWriter`) com o uso obrigatório e idiomático da Java Streams API (`.stream()`, `.map()`, `.collect()`), atendendo ao requisito avaliativo de POOALAB, com apoio do Claude na construção dos métodos (seção 2.4).
6. **Projeto Visual e Experiência do Usuário (UX/UI):** Concepção da metáfora do "Radar de Oportunidades", do design dos cartões "ticket", da paleta de cores institucional da UCSal e da navegação entre os eixos acadêmicos.

---

## 4. Recursos de Terceiros Utilizados

Para viabilizar a entrega técnica dentro dos prazos da disciplina, foram utilizados os seguintes recursos públicos e de código aberto:

| Recurso / Biblioteca        |             Versão / Origem              | Finalidade no Projeto                                                           |       Tipo de Licença       |
| :-------------------------- | :--------------------------------------: | :------------------------------------------------------------------------------ | :-------------------------: |
| **PostgreSQL JDBC Driver**  |                 `42.7.2`                 | Conectividade entre a aplicação Java 21 e o banco de dados relacional.          |        BSD-2-Clause         |
| **JUnit Jupiter (JUnit 5)** |                 `5.10.2`                 | Framework para implementação e execução dos 15 testes de unidade automatizados. | Eclipse Public License 2.0  |
| **Ícones Vetoriais SVG**    |          Lucide / Feather Icons          | Ícones da interface gráfica (lupa, usuário, cadeado, olho, calendário, etc.).   |  Licença MIT (Open Source)  |
| **Fontes Tipográficas**     | Google Fonts (Inter / Plus Jakarta Sans) | Tipografia institucional aplicada no CSS para legibilidade da interface web.    | SIL Open Font License (OFL) |
| **Java Platform SE**        |        `21 LTS` (Oracle OpenJDK)         | Ambiente de execução e compilação do servidor de retaguarda.                    | GPLv2 + Classpath Exception |
| **PostgreSQL Server**       |                   `16`                   | Sistema gerenciador de banco de dados relacional.                               |     PostgreSQL License      |

### 4.1. Trecho de código de terceiros: hash SHA-256 (Baeldung)

- **Componente ou recurso:** Método de cálculo de hash SHA-256 em Java, utilizado como base para o método `hashSenha()` da aplicação.
- **Origem ou link:** Baeldung — [SHA-256 Hashing in Java](https://www.baeldung.com/sha-256-hashing-java). O site foi apresentado pelo professor em sala de aula, após o integrante tirar dúvidas sobre a questão do hashing.
- **Versão e licença:** Artigo online sem versão numerada. Os exemplos de código do Baeldung são publicados sob licença MIT (conforme informado pelo site; a confirmar pela equipe antes da entrega).
- **Função e alterações realizadas:** O método foi copiado do site, verificado em funcionamento e utilizado em `hashSenha()` (`ProfessorService`, que delega a `HashUtil.sha256`). A única alteração foi a forma de conversão do resultado para hexadecimal.

O integrante responsável pela camada DAO declarou não ter utilizado componentes ou recursos de terceiros além dos listados nesta seção.

---

## 5. Termo de Compromisso e Interdisciplinaridade

Os integrantes do grupo declaram formalmente que todo o código, documentação e artefatos apresentados neste projeto refletem a consolidação prática do aprendizado adquirido ao longo do curso de graduação na Universidade Católica do Salvador (UCSal), combinando conhecimentos interdisciplinares de:

1. **Programação Orientada a Objetos Avançada e Laboratório (POOALAB):** Sob a orientação do Prof. Mario Jorge Pereira, aplicando padrões arquiteturais MVC, programação robusta em Java 21, servidores HTTP nativos (`HttpServer`), manipulação funcional com a Java Streams API e testes automatizados com JUnit 5.
2. **Programação Web:** Aplicação dos conceitos fundamentais de desenvolvimento web client-side, incluindo estruturação semântica em HTML5, estilização responsiva com CSS3 moderno (Flexbox, CSS Grid e design tokens), manipulação dinâmica da árvore DOM, controle de eventos, gerenciamento de estado e sessão no navegador (`localStorage` e `sessionStorage`), além da comunicação assíncrona com APIs REST utilizando JavaScript ES6+ (`fetch`, Promises e `async/await`).
3. **Banco de Dados e Engenharia de Software:** Modelagem conceitual e lógica do modelo entidade-relacionamento (MER), integridade referencial, normalização, consultas SQL estruturadas e ciclo de desenvolvimento guiado por histórias de usuário e priorização de escopo.

A equipe compreende com propriedade e está plenamente apta a explicar, justificar e defender cada método, classe, requisição HTTP, script de integração, consulta SQL e regra de negócio desenvolvida no repositório durante a arguição da banca examinadora.

**Salvador - BA, Novembro de 2026.**
