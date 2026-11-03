// ==============================================================================
// OPORTUNI — OPORTUNIDADE.JS (CADASTRO E EDIÇÃO DE VAGAS)
//
// O que este arquivo faz?
// 1. Capta os dados digitados pelo professor no formulário (título, bolsa, prazo, etc.).
// 2. Atualiza em tempo real um "card de prévia" ao lado, para o professor ver
//    exatamente como a vaga vai aparecer no Mural antes de publicar.
// 3. Valida os campos obrigatórios para garantir que nenhum dado fique faltando.
// 4. Integração com o Back-end Java:
//    - Envia os dados via requisição HTTP POST para '/api/oportunidades'.
//    - Passa o token de segurança para vincular a oportunidade ao professor logado.
//    - Mantém uma cópia no LocalStorage como contingência (caso o servidor esteja offline).
// ==============================================================================

// Aguarda o carregamento completo da árvore de elementos HTML (o DOM)
document.addEventListener('DOMContentLoaded', async () => {

  // --------------------------------------------------------------------------
  // Selecionar os elementos do formulário e da interface
  // Usamos document.getElementById para pegar os controles do HTML pelos seus IDs.
  // --------------------------------------------------------------------------
  const form = document.getElementById('form-oportunidade');
  const btnSubmit = document.getElementById('btn-submit');
  const btnSubmitText = document.getElementById('btn-submit-text');
  const btnLogout = document.getElementById('btn-logout');
  const navBtnText = document.getElementById('nav-btn-text');
  const formTitle = document.getElementById('form-title');
  const formSubtitle = document.getElementById('form-subtitle');
  const docenteBadge = document.getElementById('docente-nome-badge');

  // Campos de texto e seletores onde o usuário digita/escolhe as informações
  const campoTitulo = document.getElementById('campo-titulo');
  const campoTipo = document.getElementById('campo-tipo');
  const campoEixo = document.getElementById('campo-eixo');
  const campoDepto = document.getElementById('campo-departamento');
  const campoBolsa = document.getElementById('campo-bolsa');
  const campoPrazo = document.getElementById('campo-prazo');
  const campoStatus = document.getElementById('campo-status');
  const campoDescricao = document.getElementById('campo-descricao');
  const campoAtividades = document.getElementById('campo-atividades');
  const campoRequisitos = document.getElementById('campo-requisitos');

  // Elementos do Card de Prévia ao Vivo (o ticket à direita da tela)
  const previewCard = document.getElementById('preview-card');
  const prevTitulo = document.getElementById('prev-titulo');
  const prevTipo = document.getElementById('prev-tipo');
  const prevStatus = document.getElementById('prev-status');
  const prevDepto = document.getElementById('prev-departamento');
  const prevDescricao = document.getElementById('prev-descricao');
  const prevBolsa = document.getElementById('prev-bolsa');
  const prevCaptionBolsa = document.getElementById('prev-caption-bolsa');
  const prevPrazo = document.getElementById('prev-prazo');
  const prevCaptionPrazo = document.getElementById('prev-caption-prazo');

  // Toast de Notificação (balãozinho que avisa se a vaga foi salva com sucesso)
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');

  // Dicionário auxiliar para transformar o número do mês ('11') em sigla ('NOV')
  // Isso deixa o ticket da oportunidade visualmente idêntico ao padrão da UCSal
  const MESES = {
    '01': 'JAN', '02': 'FEV', '03': 'MAR', '04': 'ABR',
    '05': 'MAI', '06': 'JUN', '07': 'JUL', '08': 'AGO',
    '09': 'SET', '10': 'OUT', '11': 'NOV', '12': 'DEZ'
  };

  // Variáveis para guardar os dados da memória enquanto o usuário usa a tela
  let todasVagas = [];
  let docenteAtivo = null;
  let vagaEmEdicao = null;

  // Verifica se a URL da página contém um parâmetro de edição, por exemplo:
  // oportunidade.html?id=3 -> significa que o professor quer editar a vaga #3!
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('id') ? parseInt(urlParams.get('id'), 10) : null;

  // --------------------------------------------------------------------------
  // Identificar qual Professor está logado
  // O sistema checa a sessão no navegador para saber quem está publicando a vaga.
  // --------------------------------------------------------------------------
  async function carregarDocente() {
    let listaProfessores = [];

    // Tenta carregar a lista base de professores
    try {
      const resp = await fetch('assets/data/professores.json');
      if (resp.ok) listaProfessores = await resp.json();
    } catch (e) {
      console.warn('Aviso: professores.json não pôde ser lido via fetch:', e);
    }

    // Mescla com professores cadastrados localmente nesta sessão
    try {
      const locais = JSON.parse(localStorage.getItem('professores_cadastrados') || '[]');
      listaProfessores = [...locais, ...listaProfessores];
    } catch (e) {}

    // Verifica se há um professor guardado na sessão ativa
    const salvo = localStorage.getItem('oportuni_docente_ativo') || sessionStorage.getItem('oportuni_docente_ativo');
    if (salvo) {
      try {
        docenteAtivo = JSON.parse(salvo);
      } catch (e) {
        docenteAtivo = null;
      }
    }

    // Se ainda não temos o objeto completo, tentamos recuperar pelo e-mail
    if (!docenteAtivo && listaProfessores.length > 0) {
      const emailSalvo = localStorage.getItem('oportuni_docente_email');
      if (emailSalvo) {
        docenteAtivo = listaProfessores.find(p => p.email.toLowerCase() === emailSalvo.toLowerCase());
      }
    }

    // Se o usuário não possui perfil ativo identificado, redireciona com segurança para o login
    if (!docenteAtivo) {
      alert('Acesso restrito: Por favor, faça login com sua conta docente para gerenciar oportunidades.');
      window.location.href = 'login.html';
      return;
    }

    // Atualiza o crachá do professor no topo da tela com o nome dele
    if (docenteBadge && docenteAtivo) {
      docenteBadge.textContent = `${docenteAtivo.nome}`;
    }
  }

  // --------------------------------------------------------------------------
  // Carregar o repositório de vagas existentes
  // --------------------------------------------------------------------------
  async function carregarBaseVagas() {
    try {
      const resp = await fetch('assets/data/oportunidades.json');
      const dadosJson = resp.ok ? await resp.json() : [];

      // Checa se há vagas salvas no LocalStorage para não perder dados criados
      const dadosLocais = localStorage.getItem('oportunidades_gestao');
      if (dadosLocais) {
        todasVagas = JSON.parse(dadosLocais);
        // Garante que as vagas do arquivo JSON também estejam presentes
        dadosJson.forEach(item => {
          if (!todasVagas.some(tv => tv.id === item.id)) {
            todasVagas.push(item);
          }
        });
      } else {
        todasVagas = dadosJson;
      }
      localStorage.setItem('oportunidades_gestao', JSON.stringify(todasVagas));
    } catch (e) {
      console.error('Erro ao carregar oportunidades:', e);
      todasVagas = [];
    }
  }

  // --------------------------------------------------------------------------
  // Inicialização do Formulário (Novo Cadastro vs. Edição)
  // --------------------------------------------------------------------------
  async function inicializarFormulario() {
    await carregarDocente();
    await carregarBaseVagas();

    // Se temos um 'editId', estamos no MODO EDIÇÃO:
    // Preenchemos todos os campos com os dados já existentes daquela vaga
    if (editId) {
      vagaEmEdicao = todasVagas.find(v => v.id === editId);

      if (vagaEmEdicao) {
        // Validação estrita de autoria: apenas o professor que cadastrou a vaga pode editá-la
        const ehDono = docenteAtivo && (
          vagaEmEdicao.professor_id === docenteAtivo.id ||
          (vagaEmEdicao.professor_nome && docenteAtivo.nome && vagaEmEdicao.professor_nome.toLowerCase().includes(docenteAtivo.nome.toLowerCase()))
        );

        if (!ehDono) {
          alert('Permissão negada: você só tem autorização para editar oportunidades cadastradas por você.');
          window.location.href = 'painel.html';
          return;
        }

        document.title = 'OportUni | Editar Oportunidade';
        if (formTitle) {
          formTitle.innerHTML = 'Editar <mark class="title-highlight">Oportunidade</mark>';
        }
        if (formSubtitle) {
          formSubtitle.textContent = 'Atualize as informações, prazos ou requisitos do edital no sistema.';
        }
        if (btnSubmitText) {
          btnSubmitText.textContent = 'Salvar Alterações';
        }
        if (navBtnText) {
          navBtnText.textContent = 'Editar Vaga';
        }

        // Coloca os valores da vaga nos campos de digitação
        campoTitulo.value = vagaEmEdicao.titulo || '';
        campoTipo.value = vagaEmEdicao.tipo || 'Monitoria';
        campoEixo.value = vagaEmEdicao.eixo || 'exatas';
        campoDepto.value = vagaEmEdicao.departamento || '';
        campoBolsa.value = vagaEmEdicao.bolsa || '';
        campoStatus.value = vagaEmEdicao.status || 'ABERTA';
        campoDescricao.value = vagaEmEdicao.descricao || '';
        campoAtividades.value = vagaEmEdicao.atividades || '';
        campoRequisitos.value = vagaEmEdicao.requisitos || '';

        // O campo input type="date" espera formato AAAA-MM-DD (ISO),
        // enquanto nosso sistema armazena DD/MM/AAAA. Aqui fazemos essa conversão:
        if (vagaEmEdicao.data_limite) {
          const partes = vagaEmEdicao.data_limite.split('/');
          if (partes.length === 3) {
            campoPrazo.value = `${partes[2]}-${partes[1]}-${partes[0]}`;
          }
        }
      }
    } else {
      // MODO CRIAÇÃO: Começa com os campos em branco para o professor preencher do zero
      campoDepto.value = '';
      campoTipo.value = '';
      campoEixo.value = '';
      campoPrazo.value = '';
      campoBolsa.value = '';
      campoDescricao.value = '';
      campoAtividades.value = '';
      campoRequisitos.value = '';
    }

    // Dispara eventos 'change' para atualizar estilos ou selects personalizados
    campoTipo.dispatchEvent(new Event('change'));
    campoEixo.dispatchEvent(new Event('change'));
    campoStatus.dispatchEvent(new Event('change'));

    // Renderiza a prévia visual com os dados atuais
    atualizarPreviewAoVivo();
  }

  // --------------------------------------------------------------------------
  // Atualização Reativa do Card de Prévia em Tempo Real
  // Conforme o professor digita uma letra ou troca uma opção, o card muda na hora!
  // --------------------------------------------------------------------------
  function atualizarPreviewAoVivo() {
    // Lê os valores digitados ou usa um texto padrão caso o campo esteja vazio
    const titulo = campoTitulo.value.trim() || 'Título da Oportunidade';
    const tipo = campoTipo.value;
    const eixo = campoEixo.value;
    const depto = campoDepto.value.trim() || 'Curso / Departamento';
    const bolsaInput = campoBolsa.value.trim();
    const status = campoStatus.value;
    const descricao = campoDescricao.value.trim() || 'A descrição informada no formulário aparecerá aqui para os estudantes consultarem os objetivos da vaga.';
    const dataIso = campoPrazo.value;

    // Ajusta os atributos 'data-*' para que o CSS pinte o card com a cor do eixo
    if (eixo) {
      previewCard.setAttribute('data-eixo', eixo);
    } else {
      previewCard.setAttribute('data-eixo', 'geral');
    }

    // Modalidade (Monitoria, Iniciação Científica, etc.)
    if (tipo) {
      previewCard.setAttribute('data-tipo', tipo);
      prevTipo.textContent = tipo;
    } else {
      previewCard.removeAttribute('data-tipo');
      prevTipo.textContent = 'Modalidade';
    }

    // Textos informativos
    prevTitulo.textContent = titulo;
    prevDepto.textContent = depto;
    prevDescricao.textContent = descricao;

    // Bolsa ou Benefício
    if (bolsaInput) {
      prevBolsa.textContent = bolsaInput;
      const bolsaLower = bolsaInput.toLowerCase();
      // Se não for valor monetário, exibimos a etiqueta "Benefício"
      const isBeneficio = bolsaLower.includes('h') || bolsaLower.includes('ac') || bolsaLower.includes('voluntário');
      prevCaptionBolsa.textContent = isBeneficio ? 'Benefício' : 'Remuneração';
    } else {
      prevBolsa.textContent = 'R$ 0,00';
      prevCaptionBolsa.textContent = 'Remuneração';
    }

    // Status (Aberta ou Encerrada)
    prevStatus.textContent = status;
    if (status === 'ENCERRADA') {
      prevStatus.className = 'badge-status status-encerrada';
      previewCard.classList.add('card-encerrada');
      prevCaptionPrazo.textContent = 'Encerrado em';
    } else {
      prevStatus.className = 'badge-status status-aberta';
      previewCard.classList.remove('card-encerrada');
      prevCaptionPrazo.textContent = 'Inscrições até';
    }

    // Formatação do Prazo em formato de Ticket ("15 NOV")
    if (dataIso) {
      const partes = dataIso.split('-');
      if (partes.length === 3) {
        const dia = partes[2];
        const mes = MESES[partes[1]] || 'NOV';
        prevPrazo.textContent = `${dia} ${mes}`;
      }
    } else {
      prevPrazo.textContent = '00/00/00';
    }
  }

  // Ouvintes de digitação: toda vez que o usuário digita nos campos de texto, atualiza o card
  [campoTitulo, campoDepto, campoBolsa, campoDescricao].forEach(campo => {
    campo.addEventListener('input', atualizarPreviewAoVivo);
  });

  // Ouvintes de seleção: toda vez que o usuário troca um select ou a data, atualiza o card
  [campoTipo, campoEixo, campoStatus, campoPrazo].forEach(campo => {
    campo.addEventListener('change', atualizarPreviewAoVivo);
  });

  // --------------------------------------------------------------------------
  // Validação e Envio do Formulário (POST /api/oportunidades)
  // --------------------------------------------------------------------------
  form.addEventListener('submit', async (e) => {
    // Impede o recarregamento padrão da página pelo navegador
    e.preventDefault();

    // Validação de campos obrigatórios
    let isValido = true;
    const camposObrigatorios = [campoTitulo, campoTipo, campoEixo, campoDepto, campoBolsa, campoPrazo, campoDescricao];

    camposObrigatorios.forEach(campo => {
      campo.classList.remove('is-invalid');
      const wrap = campo.closest('.custom-select-wrap');
      if (wrap) wrap.classList.remove('is-invalid');

      // Se o campo estiver vazio, aplica a classe de destaque vermelho 'is-invalid'
      if (!campo.value.trim()) {
        campo.classList.add('is-invalid');
        if (wrap) wrap.classList.add('is-invalid');
        isValido = false;
      }
    });

    // Se faltou preencher algo, exibe um toast de aviso e foca no primeiro campo com erro
    if (!isValido) {
      mostrarToast('Por favor, preencha todos os campos obrigatórios destacados.');
      const primeiroInvalido = document.querySelector('.is-invalid');
      if (primeiroInvalido) {
        if (primeiroInvalido.classList.contains('custom-select-wrap')) {
          const trg = primeiroInvalido.querySelector('.custom-select-trigger');
          if (trg) trg.focus();
        } else if (primeiroInvalido.tagName === 'SELECT') {
          const wrap = primeiroInvalido.closest('.custom-select-wrap');
          const trg = wrap ? wrap.querySelector('.custom-select-trigger') : null;
          if (trg) trg.focus();
          else primeiroInvalido.focus();
        } else {
          primeiroInvalido.focus();
        }
      }
      return;
    }

    // Formata a data de AAAA-MM-DD para DD/MM/AAAA para persistência
    let dataFormatada = '15/11/2026';
    if (campoPrazo.value) {
      const partes = campoPrazo.value.split('-');
      if (partes.length === 3) {
        dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
      }
    }

    // Desativa o botão de envio temporariamente para evitar cliques duplos
    btnSubmit.disabled = true;
    btnSubmit.style.opacity = '0.7';

    try {
      if (editId && vagaEmEdicao) {
        // --- CENÁRIO A: Atualizar uma vaga já existente ---
        const ehDono = docenteAtivo && (
          vagaEmEdicao.professor_id === docenteAtivo.id ||
          (vagaEmEdicao.professor_nome && docenteAtivo.nome && vagaEmEdicao.professor_nome.toLowerCase().includes(docenteAtivo.nome.toLowerCase()))
        );
        if (!ehDono) {
          mostrarToast('Você não tem autorização para editar uma vaga de outro docente.');
          btnSubmit.disabled = false;
          btnSubmit.style.opacity = '1';
          return;
        }

        vagaEmEdicao.titulo = campoTitulo.value.trim();
        vagaEmEdicao.tipo = campoTipo.value;
        vagaEmEdicao.eixo = campoEixo.value;
        vagaEmEdicao.departamento = campoDepto.value.trim();
        vagaEmEdicao.bolsa = campoBolsa.value.trim();
        vagaEmEdicao.data_limite = dataFormatada;
        vagaEmEdicao.status = campoStatus.value;
        vagaEmEdicao.descricao = campoDescricao.value.trim();
        vagaEmEdicao.atividades = campoAtividades.value.trim();
        vagaEmEdicao.requisitos = campoRequisitos.value.trim();

        const index = todasVagas.findIndex(v => v.id === editId);
        if (index !== -1) {
          todasVagas[index] = vagaEmEdicao;
        }

        // Salva as alterações na memória local do navegador
        localStorage.setItem('oportunidades_gestao', JSON.stringify(todasVagas));
        mostrarToast('Alterações salvas com sucesso!');
      } else {
        // --- CENÁRIO B: Cadastrar uma nova vaga ---
        // Calcula o próximo identificador (ID) incremental
        const maiorId = todasVagas.reduce((max, v) => (v.id > max ? v.id : max), 0);
        const novoId = maiorId + 1;

        const novaVaga = {
          id: novoId,
          titulo: campoTitulo.value.trim(),
          tipo: campoTipo.value,
          eixo: campoEixo.value,
          departamento: campoDepto.value.trim(),
          descricao: campoDescricao.value.trim(),
          atividades: campoAtividades.value.trim(),
          requisitos: campoRequisitos.value.trim(),
          bolsa: campoBolsa.value.trim(),
          data_limite: dataFormatada,
          status: campoStatus.value,
          professor_id: docenteAtivo ? docenteAtivo.id : null,
          professor_nome: docenteAtivo ? docenteAtivo.nome : 'Docente Responsável'
        };

        // Integração com a API Java: envia os dados para /api/oportunidades
        if (typeof apiFetch === 'function') {
          try {
            const vagaApi = await apiFetch('/oportunidades', {
              method: 'POST',
              body: JSON.stringify({
                titulo: campoTitulo.value.trim(),
                tipo: campoTipo.value,
                eixo: campoEixo.value,
                departamento: campoDepto.value.trim(),
                descricao: campoDescricao.value.trim(),
                atividades: campoAtividades.value.trim(),
                requisitos: campoRequisitos.value.trim(),
                bolsa: campoBolsa.value.trim(),
                data_limite: dataFormatada,
                status: campoStatus.value
              })
            });
            // Se o servidor backend gerou um ID no banco PostgreSQL, nós o utilizamos
            if (vagaApi && vagaApi.id) {
              novaVaga.id = vagaApi.id;
            }
          } catch (apiErr) {
            console.warn('Servidor Java offline ou erro na rota /api/oportunidades. Salvando localmente:', apiErr);
          }
        }

        // Adiciona a nova vaga no início da lista para aparecer primeiro no mural
        todasVagas.unshift(novaVaga);
        localStorage.setItem('oportunidades_gestao', JSON.stringify(todasVagas));
        mostrarToast('Oportunidade publicada com sucesso no Mural!');
      }

      // Aguarda 1.2 segundos para o professor ler a mensagem de sucesso e redireciona para o Painel
      setTimeout(() => {
        window.location.href = 'painel.html';
      }, 1200);

    } catch (err) {
      console.error('Erro ao salvar oportunidade:', err);
      mostrarToast('Ocorreu um erro ao salvar a oportunidade.');
      btnSubmit.disabled = false;
      btnSubmit.style.opacity = '1';
    }
  });

  // --------------------------------------------------------------------------
  // Utilitário para exibir o balão de Toast
  // --------------------------------------------------------------------------
  function mostrarToast(mensagem) {
    if (!toast) return;
    if (toastMsg) toastMsg.textContent = mensagem;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  // --------------------------------------------------------------------------
  // Logout (Sair da Conta)
  // Limpa as credenciais salvas e retorna à tela de login
  // --------------------------------------------------------------------------
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      if (typeof removeToken === 'function') removeToken();
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('oportuni_docente_ativo');
      window.location.href = 'login.html';
    });
  }

  // Dá a partida inicial carregando os dados e preparando a tela
  inicializarFormulario();
});
