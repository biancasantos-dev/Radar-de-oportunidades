package br.edu.ucsal.radar;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import br.edu.ucsal.radar.dao.OportunidadeRepository;
import br.edu.ucsal.radar.model.Oportunidade;
import br.edu.ucsal.radar.model.TipoOportunidade;
import br.edu.ucsal.radar.service.OportunidadeService;

/**
 * Testa as regras do OportunidadeService SEM banco de dados: usamos um repositório
 * falso em memória (só é possível porque o service depende da interface — DIP).
 */
public class OportunidadeTest {

    /** Repositório falso que guarda tudo numa lista. */
    private static class RepositorioEmMemoria implements OportunidadeRepository {
        final List<Oportunidade> vagas = new ArrayList<>();

        public List<Oportunidade> listarTodas() {
            return new ArrayList<>(vagas);
        }

        public Optional<Oportunidade> buscarPorId(int id) {
            return vagas.stream().filter(o -> o.getId() == id).findFirst();
        }

        public Oportunidade salvar(Oportunidade o) {
            o.setId(vagas.size() + 1);
            vagas.add(o);
            return o;
        }
    }

    private RepositorioEmMemoria repo;
    private OportunidadeService service;

    @BeforeEach
    void preparar() {
        repo = new RepositorioEmMemoria();
        service = new OportunidadeService(repo);
        repo.vagas.add(vaga(1, "Monitoria de POO", TipoOportunidade.MONITORIA, "exatas", "ADS", LocalDate.of(2026, 11, 20)));
        repo.vagas.add(vaga(2, "Extensão Digital", TipoOportunidade.EXTENSAO, "humanas", "Direito", LocalDate.of(2026, 11, 10)));
        repo.vagas.add(vaga(3, "Grupo sem prazo", TipoOportunidade.GRUPO_ESTUDO, "saude", "Psicologia", null));
        repo.vagas.add(vaga(4, "Monitoria de Anatomia", TipoOportunidade.MONITORIA, "saude", "Enfermagem", LocalDate.of(2026, 11, 15)));
    }

    private Oportunidade vaga(int id, String titulo, TipoOportunidade tipo, String eixo, String depto, LocalDate limite) {
        Oportunidade o = new Oportunidade();
        o.setId(id);
        o.setTitulo(titulo);
        o.setTipo(tipo);
        o.setEixo(eixo);
        o.setDepartamento(depto);
        o.setDescricao("descrição");
        o.setDataLimite(limite);
        o.setStatus("ABERTA");
        return o;
    }

    private Oportunidade vagaValida() {
        Oportunidade o = new Oportunidade();
        o.setTitulo("Nova vaga");
        o.setTipo(TipoOportunidade.EVENTO);
        o.setEixo("exatas");
        o.setDepartamento("ADS");
        o.setDescricao("Descrição da vaga");
        return o;
    }

    @Test
    void ordenaPorDataDeEncerramentoComSemPrazoNoFinal() {
        List<Integer> ids = service.listar(null, null, null).stream().map(Oportunidade::getId).toList();
        assertEquals(List.of(2, 4, 1, 3), ids);
    }

    @Test
    void filtraPorTipo() {
        List<Oportunidade> r = service.listar("Monitoria", null, null);
        assertEquals(2, r.size());
        assertTrue(r.stream().allMatch(o -> o.getTipo() == TipoOportunidade.MONITORIA));
    }

    @Test
    void tipoTodosNaoFiltra() {
        assertEquals(4, service.listar("TODOS", null, null).size());
    }

    @Test
    void filtraPorCursoIgnorandoAcentoEMaiuscula() {
        repo.vagas.add(vaga(5, "Pesquisa", TipoOportunidade.INICIACAO_CIENTIFICA, "exatas", "Ciência da Computação", null));
        List<Oportunidade> r = service.listar(null, null, "CIENCIA");
        assertEquals(1, r.size());
        assertEquals(5, r.get(0).getId());
    }

    @Test
    void combinaFiltros() {
        List<Oportunidade> r = service.listar("Monitoria", "saude", null);
        assertEquals(1, r.size());
        assertEquals(4, r.get(0).getId());
    }

    @Test
    void tipoInvalidoLancaErro() {
        assertThrows(IllegalArgumentException.class, () -> service.listar("Churrasco", null, null));
    }

    @Test
    void cadastrarAplicaPadroesEAssociaProfessor() {
        Oportunidade salva = service.cadastrar(vagaValida(), 7);
        assertEquals("Voluntário", salva.getBolsa());
        assertEquals("ABERTA", salva.getStatus());
        assertEquals(7, salva.getProfessorId());
        assertEquals(5, salva.getId());
    }

    @Test
    void cadastrarExigeCamposObrigatorios() {
        Oportunidade semTitulo = vagaValida();
        semTitulo.setTitulo("  ");
        assertThrows(IllegalArgumentException.class, () -> service.cadastrar(semTitulo, 1));

        Oportunidade semTipo = vagaValida();
        semTipo.setTipo(null);
        assertThrows(IllegalArgumentException.class, () -> service.cadastrar(semTipo, 1));

        Oportunidade eixoInvalido = vagaValida();
        eixoInvalido.setEixo("outro");
        assertThrows(IllegalArgumentException.class, () -> service.cadastrar(eixoInvalido, 1));
    }

    @Test
    void naoPermiteVagaAbertaComPrazoNoPassado() {
        Oportunidade o = vagaValida();
        o.setDataLimite(LocalDate.of(2020, 1, 1));
        assertThrows(IllegalArgumentException.class, () -> service.cadastrar(o, 1));
    }

    @Test
    void tipoVemDoRotuloDoFront() {
        assertEquals(TipoOportunidade.ESTAGIO_EMPREGO, TipoOportunidade.deRotulo("Estágio/Emprego"));
        assertEquals(TipoOportunidade.INICIACAO_CIENTIFICA, TipoOportunidade.deRotulo("iniciação científica"));
        assertEquals(7, TipoOportunidade.values().length);
    }
}
