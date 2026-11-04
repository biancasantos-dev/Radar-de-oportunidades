package br.edu.ucsal.radar;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import br.edu.ucsal.radar.dao.InteresseRepository;
import br.edu.ucsal.radar.dao.OportunidadeRepository;
import br.edu.ucsal.radar.model.Interesse;
import br.edu.ucsal.radar.model.Oportunidade;
import br.edu.ucsal.radar.model.TipoOportunidade;
import br.edu.ucsal.radar.service.InteresseService;

/**
 * Testes unitários para o InteresseService e regras de negócio de candidaturas (SOLID / DIP).
 */
public class InteresseTest {

    private static class RepositorioInteresseEmMemoria implements InteresseRepository {
        final List<Interesse> lista = new ArrayList<>();

        @Override
        public void salvar(Interesse i) {
            i.setId(lista.size() + 1);
            lista.add(i);
        }

        @Override
        public List<Interesse> listarTodos() {
            return new ArrayList<>(lista);
        }

        @Override
        public List<Interesse> listarPorOportunidade(int idOportunidade) {
            return lista.stream()
                    .filter(i -> i.getIdOportunidade() != null && i.getIdOportunidade() == idOportunidade)
                    .toList();
        }
    }

    private static class RepositorioOportunidadeEmMemoria implements OportunidadeRepository {
        final List<Oportunidade> lista = new ArrayList<>();

        @Override
        public List<Oportunidade> listarTodas() {
            return new ArrayList<>(lista);
        }

        @Override
        public Optional<Oportunidade> buscarPorId(int id) {
            return lista.stream().filter(o -> o.getId() != null && o.getId() == id).findFirst();
        }

        @Override
        public Oportunidade salvar(Oportunidade o) {
            o.setId(lista.size() + 1);
            lista.add(o);
            return o;
        }

        @Override
        public void atualizar(Oportunidade o) {
            for (int i = 0; i < lista.size(); i++) {
                if (lista.get(i).getId() != null && lista.get(i).getId().equals(o.getId())) {
                    lista.set(i, o);
                    return;
                }
            }
        }

        @Override
        public void excluir(int id) {
            lista.removeIf(o -> o.getId() != null && o.getId() == id);
        }
    }

    private RepositorioInteresseEmMemoria repoInteresse;
    private RepositorioOportunidadeEmMemoria repoOportunidade;
    private InteresseService service;

    @BeforeEach
    void setUp() {
        repoInteresse = new RepositorioInteresseEmMemoria();
        repoOportunidade = new RepositorioOportunidadeEmMemoria();
        service = new InteresseService(repoInteresse, repoOportunidade);

        // Vaga 1: Aberta, pertencente ao Professor 1
        Oportunidade vagaAberta = new Oportunidade();
        vagaAberta.setId(1);
        vagaAberta.setTitulo("Monitoria de POO");
        vagaAberta.setTipo(TipoOportunidade.MONITORIA);
        vagaAberta.setStatus("ABERTA");
        vagaAberta.setProfessorId(1);
        repoOportunidade.lista.add(vagaAberta);

        // Vaga 2: Encerrada, pertencente ao Professor 1
        Oportunidade vagaEncerrada = new Oportunidade();
        vagaEncerrada.setId(2);
        vagaEncerrada.setTitulo("Extensão Web");
        vagaEncerrada.setTipo(TipoOportunidade.EXTENSAO);
        vagaEncerrada.setStatus("ENCERRADA");
        vagaEncerrada.setProfessorId(1);
        repoOportunidade.lista.add(vagaEncerrada);

        // Vaga 3: Aberta, pertencente ao Professor 2
        Oportunidade vagaProf2 = new Oportunidade();
        vagaProf2.setId(3);
        vagaProf2.setTitulo("Pesquisa IA");
        vagaProf2.setTipo(TipoOportunidade.INICIACAO_CIENTIFICA);
        vagaProf2.setStatus("ABERTA");
        vagaProf2.setProfessorId(2);
        repoOportunidade.lista.add(vagaProf2);
    }

    private Interesse interesseValido(int idOportunidade) {
        return new Interesse("Mariana Souza", "mariana@ucsal.edu.br", "2023101",
                "ADS", "4", "Quero participar do projeto", idOportunidade);
    }

    @Test
    void registrarComSucessoEmVagaAberta() {
        Interesse i = interesseValido(1);
        service.registrar(i);

        assertEquals(1, repoInteresse.lista.size());
        assertEquals("Mariana Souza", repoInteresse.lista.get(0).getNome());
        assertEquals(1, repoInteresse.lista.get(0).getId());
    }

    @Test
    void registrarBloqueadoEmVagaInexistente() {
        Interesse i = interesseValido(999);
        IllegalArgumentException e = assertThrows(IllegalArgumentException.class, () -> service.registrar(i));
        assertTrue(e.getMessage().contains("não foi encontrada"));
    }

    @Test
    void registrarBloqueadoEmVagaEncerrada() {
        Interesse i = interesseValido(2);
        IllegalArgumentException e = assertThrows(IllegalArgumentException.class, () -> service.registrar(i));
        assertTrue(e.getMessage().contains("já foram encerradas"));
    }

    @Test
    void listarPorProfessorRetornaApenasCandidatosDasSuasVagas() {
        // Aluno 1 se candidata na vaga 1 (do Professor 1)
        service.registrar(new Interesse("Aluno 1", "aluno1@ucsal.edu.br", "202301", "ADS", "3", "Just 1", 1));
        // Aluno 2 se candidata na vaga 3 (do Professor 2)
        service.registrar(new Interesse("Aluno 2", "aluno2@ucsal.edu.br", "202302", "Direito", "5", "Just 2", 3));

        List<Interesse> inscritosProf1 = service.listarPorProfessor(1);
        assertEquals(1, inscritosProf1.size());
        assertEquals("Aluno 1", inscritosProf1.get(0).getNome());

        List<Interesse> inscritosProf2 = service.listarPorProfessor(2);
        assertEquals(1, inscritosProf2.size());
        assertEquals("Aluno 2", inscritosProf2.get(0).getNome());

        List<Interesse> inscritosProf3 = service.listarPorProfessor(3);
        assertTrue(inscritosProf3.isEmpty());
    }

    @Test
    void registrarExigeCamposObrigatorios() {
        Interesse semEmail = new Interesse("Aluno", "   ", "202301", "ADS", "3", "Just", 1);
        assertThrows(IllegalArgumentException.class, () -> service.registrar(semEmail));

        Interesse emailInvalido = new Interesse("Aluno", "email-invalido", "202301", "ADS", "3", "Just", 1);
        assertThrows(IllegalArgumentException.class, () -> service.registrar(emailInvalido));

        Interesse semJustificativa = new Interesse("Aluno", "aluno@ucsal.br", "202301", "ADS", "3", "", 1);
        assertThrows(IllegalArgumentException.class, () -> service.registrar(semJustificativa));
    }
}

