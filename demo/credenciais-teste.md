# 🔑 Credenciais de Teste — Radar de Oportunidades (OportUni)

Este documento contém os dados de acesso para simulação e avaliação do sistema pelos professores e pela banca da disciplina **POOALAB (UCSal 2026.2)**.

---

## 👨‍🏫 Contas de Professores para Demonstração

O sistema adapta o **Painel Docente** dinamicamente de acordo com o professor que realiza o login:

| Professor(a)                    | E-mail Institucional (Login) | Senha de Teste | Departamento / Área             |               Vagas Associadas               |         Inscritos          |
| :------------------------------ | :--------------------------- | :------------: | :------------------------------ | :------------------------------------------: | :------------------------: |
| **Prof. Dr. Marcelo Ribeiro**   | `marcelo.ribeiro@ucsal.br`   |   `ucsal123`   | **Direito**                     |  4 vagas (IC, Monitoria, Extensão, Evento)   | 7 alunos (12 candidaturas) |
| **Prof. Dr. Carlos Eduardo**    | `carlos.eduardo@ucsal.br`    |   `ucsal123`   | **Engenharias / ADS / TI**      | 3 vagas (IC PLN, Monitoria POO, Estágio Web) | 4 alunos (5 candidaturas)  |
| **Profa. Dra. Renata Silveira** | `renata.silveira@ucsal.br`   |   `ucsal123`   | **Psicologia**                  | 2 vagas (IC Saúde Mental, Grupo de Estudos)  |          2 alunos          |
| **Prof. Dr. Fernando Rocha**    | `fernando.rocha@ucsal.br`    |   `ucsal123`   | **Ciências Biológicas e Saúde** |         1 vaga (Monitoria Anatomia)          |          1 aluno           |

> 💡 **Nota de Flexibilidade:** Para facilitar os testes durante a apresentação acadêmica, o sistema aceita a senha padrão **`ucsal123`** (ou qualquer senha com 4 ou mais dígitos) para qualquer um dos e-mails institucionais acima.

---

## 🎯 Roteiro Rápido de Teste por Perfil

### 1. Cenário Principal: Direito (Prof. Dr. Marcelo Ribeiro)

- **E-mail:** `marcelo.ribeiro@ucsal.br`
- **Senha:** `ucsal123`
- **O que observar no Painel:**
  - Tag no cabeçalho: `Área Docente • Direito`
  - Vagas listadas:
    - _Pesquisa em IA, Proteção de Dados (LGPD) e Ética Jurídica_ (IC)
    - _Monitoria em Teoria Geral do Direito e Prática Forense_ (Monitoria)
    - _Projeto Conecta Salvador: Inclusão e Direitos Digitais_ (Extensão)
    - _Semana Acadêmica de Inovação Jurídica_ (Evento — Encerrada)
  - Bento KPI: **7 Candidatos Inscritos** (alunos de Direito com período matutino/noturno e múltiplas aplicações).

### 2. Cenário Alternativo: ADS / Tecnologia (Prof. Dr. Carlos Eduardo)

- **E-mail:** `carlos.eduardo@ucsal.br`
- **Senha:** `ucsal123`
- **O que observar no Painel:**
  - Tag no cabeçalho: `Área Docente • Exatas & TI`
  - Vagas listadas:
    - _Pesquisa em IA e Processamento de Linguagem Natural_ (IC)
    - _Monitoria de Programação Orientada a Objetos_ (Monitoria)
    - _Estágio em Desenvolvimento Web e Sistemas_ (Estágio)
  - Bento KPI: **4 Candidatos Inscritos** do curso de ADS e Engenharia de Software.
