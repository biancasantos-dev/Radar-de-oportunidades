// ============================================================
// OPORTUNI — OPORTUNIDADE.JS
// Formulário de Cadastro e Edição de Vagas com Prévia em Tempo Real
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('form-oportunidade');
  const btnSubmit = document.getElementById('btn-submit');
  const btnSubmitText = document.getElementById('btn-submit-text');
  const btnLogout = document.getElementById('btn-logout');
  const navBtnText = document.getElementById('nav-btn-text');
  const formTitle = document.getElementById('form-title');
  const formSubtitle = document.getElementById('form-subtitle');
  const docenteBadge = document.getElementById('docente-nome-badge');

  // Campos do formulário
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

  // Elementos da Prévia em Tempo Real
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

  // Toast
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');

  // Dicionário de meses para formatação estilo ticket
  const MESES = {
    '01': 'JAN', '02': 'FEV', '03': 'MAR', '04': 'ABR',
    '05': 'MAI', '06': 'JUN', '07': 'JUL', '08': 'AGO',
    '09': 'SET', '10': 'OUT', '11': 'NOV', '12': 'DEZ'
  };

  let todasVagas = [];
  let docenteAtivo = null;
  let vagaEmEdicao = null;

  // Parâmetro de edição via URL (?id=X)
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('id') ? parseInt(urlParams.get('id'), 10) : null;

  // ── 1. Determinação do Docente Ativo ──
  async function carregarDocente() {
    let listaProfessores = [];
    try {
      const resp = await fetch('assets/data/professores.json');
      if (resp.ok) listaProfessores = await resp.json();
    } catch (e) {
      console.warn('Erro ao carregar lista de professores:', e);
    }

    const salvo = localStorage.getItem('oportuni_docente_ativo') || sessionStorage.getItem('oportuni_docente_ativo');
    if (salvo) {
      try {
        docenteAtivo = JSON.parse(salvo);
      } catch (e) {
        docenteAtivo = null;
      }
    }

    if (!docenteAtivo && listaProfessores.length > 0) {
      const emailSalvo = localStorage.getItem('oportuni_docente_email');
      if (emailSalvo) {
        docenteAtivo = listaProfessores.find(p => p.email.toLowerCase() === emailSalvo.toLowerCase());
      }
      if (!docenteAtivo) docenteAtivo = listaProfessores[0];
    }

    if (docenteBadge && docenteAtivo) {
      docenteBadge.textContent = `${docenteAtivo.nome}`;
    }
  }

  // ── 2. Carregar Base de Oportunidades ──
  async function carregarBaseVagas() {
    try {
      const resp = await fetch('assets/data/oportunidades.json');
      const dadosJson = resp.ok ? await resp.json() : [];

      const dadosLocais = localStorage.getItem('oportunidades_gestao');
      if (dadosLocais) {
        todasVagas = JSON.parse(dadosLocais);
        // Mescla vagas iniciais que ainda não existam no localStorage
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
      console.error('Erro ao carregar dados:', e);
      todasVagas = [];
    }
  }

  // ── 3. Inicialização e Preenchimento dos Campos ──
  async function inicializarFormulario() {
    await carregarDocente();
    await carregarBaseVagas();

    if (editId) {
      // Modo Edição
      vagaEmEdicao = todasVagas.find(v => v.id === editId);

      if (vagaEmEdicao) {
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

        // Preenche campos com dados da vaga existente
        campoTitulo.value = vagaEmEdicao.titulo || '';
        campoTipo.value = vagaEmEdicao.tipo || 'Monitoria';
        campoEixo.value = vagaEmEdicao.eixo || 'exatas';
        campoDepto.value = vagaEmEdicao.departamento || '';
        campoBolsa.value = vagaEmEdicao.bolsa || '';
        campoStatus.value = vagaEmEdicao.status || 'ABERTA';
        campoDescricao.value = vagaEmEdicao.descricao || '';
        campoAtividades.value = vagaEmEdicao.atividades || '';
        campoRequisitos.value = vagaEmEdicao.requisitos || '';

        // Converte DD/MM/AAAA para YYYY-MM-DD para o input type="date"
        if (vagaEmEdicao.data_limite) {
          const partes = vagaEmEdicao.data_limite.split('/');
          if (partes.length === 3) {
            campoPrazo.value = `${partes[2]}-${partes[1]}-${partes[0]}`;
          }
        }
      }
    } else {
      // Modo Criação: Campos iniciam vazios para preenchimento pelo professor
      campoDepto.value = '';
      campoTipo.value = '';
      campoEixo.value = '';
      campoPrazo.value = '';
      campoBolsa.value = '';
      campoDescricao.value = '';
      campoAtividades.value = '';
      campoRequisitos.value = '';
    }

    // Sincroniza selects customizados na identidade
    campoTipo.dispatchEvent(new Event('change'));
    campoEixo.dispatchEvent(new Event('change'));
    campoStatus.dispatchEvent(new Event('change'));

    atualizarPreviewAoVivo();
  }

  // ── 4. Atualização Reativa da Prévia em Tempo Real ──
  function atualizarPreviewAoVivo() {
    const titulo = campoTitulo.value.trim() || 'Título da Oportunidade';
    const tipo = campoTipo.value;
    const eixo = campoEixo.value;
    const depto = campoDepto.value.trim() || 'Curso / Departamento';
    const bolsaInput = campoBolsa.value.trim();
    const status = campoStatus.value;
    const descricao = campoDescricao.value.trim() || 'A descrição informada no formulário aparecerá aqui para os estudantes consultarem os objetivos da vaga.';
    const dataIso = campoPrazo.value;

    // Atualiza atributos do card de prévia para que o CSS de index.css aplique as cores corretas
    if (eixo) {
      previewCard.setAttribute('data-eixo', eixo);
    } else {
      previewCard.setAttribute('data-eixo', 'geral');
    }

    if (tipo) {
      previewCard.setAttribute('data-tipo', tipo);
      prevTipo.textContent = tipo;
    } else {
      previewCard.removeAttribute('data-tipo');
      prevTipo.textContent = 'Modalidade';
    }

    prevTitulo.textContent = titulo;
    prevDepto.textContent = depto;
    prevDescricao.textContent = descricao;

    // Remuneração / Bolsa: inicia com R$ 0,00 e só altera quando o professor preenche
    if (bolsaInput) {
      prevBolsa.textContent = bolsaInput;
      const bolsaLower = bolsaInput.toLowerCase();
      const isBeneficio = bolsaLower.includes('h') || bolsaLower.includes('ac') || bolsaLower.includes('voluntário');
      prevCaptionBolsa.textContent = isBeneficio ? 'Benefício' : 'Remuneração';
    } else {
      prevBolsa.textContent = 'R$ 0,00';
      prevCaptionBolsa.textContent = 'Remuneração';
    }

    // Status da Vaga
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

    // Data Limite / Prazo: inicia com 00/00/00 e só altera quando o professor preenche a data
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

  // Listeners em tempo real para sincronização instantânea
  [campoTitulo, campoDepto, campoBolsa, campoDescricao].forEach(campo => {
    campo.addEventListener('input', atualizarPreviewAoVivo);
  });

  [campoTipo, campoEixo, campoStatus, campoPrazo].forEach(campo => {
    campo.addEventListener('change', atualizarPreviewAoVivo);
  });

  // ── 5. Validação e Envio do Formulário ──
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validação de campos obrigatórios
    let isValido = true;
    const camposObrigatorios = [campoTitulo, campoTipo, campoEixo, campoDepto, campoBolsa, campoPrazo, campoDescricao];

    camposObrigatorios.forEach(campo => {
      campo.classList.remove('is-invalid');
      const wrap = campo.closest('.custom-select-wrap');
      if (wrap) wrap.classList.remove('is-invalid');

      if (!campo.value.trim()) {
        campo.classList.add('is-invalid');
        if (wrap) wrap.classList.add('is-invalid');
        isValido = false;
      }
    });

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

    // Formata data de YYYY-MM-DD para DD/MM/AAAA
    let dataFormatada = '15/11/2026';
    if (campoPrazo.value) {
      const partes = campoPrazo.value.split('-');
      if (partes.length === 3) {
        dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
      }
    }

    btnSubmit.disabled = true;
    btnSubmit.style.opacity = '0.7';

    try {
      if (editId && vagaEmEdicao) {
        // Atualiza vaga existente
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

        localStorage.setItem('oportunidades_gestao', JSON.stringify(todasVagas));
        mostrarToast('Alterações salvas com sucesso!');
      } else {
        // Cria nova vaga com próximo ID disponível
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
          professor_id: docenteAtivo ? docenteAtivo.id : 1,
          professor_nome: docenteAtivo ? docenteAtivo.nome : 'Prof. Dr. Marcelo Ribeiro'
        };

        todasVagas.unshift(novaVaga);
        localStorage.setItem('oportunidades_gestao', JSON.stringify(todasVagas));
        mostrarToast('Oportunidade publicada com sucesso no Mural!');
      }

      // Redireciona de volta ao painel após breve intervalo para visualização do toast
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

  // ── 6. Utilitário de Toast ──
  function mostrarToast(mensagem) {
    if (!toast) return;
    if (toastMsg) toastMsg.textContent = mensagem;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  // ── 7. Logout ──
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      if (typeof removeToken === 'function') removeToken();
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('oportuni_docente_ativo');
      window.location.href = 'login.html';
    });
  }

  // Inicia carregamento
  inicializarFormulario();
});
