package br.edu.ucsal.radar.service;

import java.util.List;

import br.edu.ucsal.radar.dao.InteresseDAO;
import br.edu.ucsal.radar.model.Interesse;

public class InteresseService {

    private final InteresseDAO interesseDAO;

    public InteresseService() {
        this(new InteresseDAO());
    }

    public InteresseService(InteresseDAO interesseDAO) {
        this.interesseDAO = interesseDAO;
    }

    // Valida os campos obrigatórios e, se estiver tudo certo, grava
    public void registrar(Interesse interesse) {
        if (interesse == null) {
            throw new IllegalArgumentException("Dados de candidatura não enviados.");
        }
        validarCampo(interesse.getNome(), "nome");
        validarCampo(interesse.getEmail(), "e-mail institucional");
        validarCampo(interesse.getMatricula(), "matrícula");
        validarCampo(interesse.getCurso(), "curso");
        validarCampo(interesse.getSemestre(), "semestre");
        validarCampo(interesse.getJustificativa(), "justificativa");

        // Ajuste: validação preventiva para garantir que a inscrição está vinculada a uma vaga
        if (interesse.getIdOportunidade() == null || interesse.getIdOportunidade() <= 0) {
            throw new IllegalArgumentException("O id da oportunidade é obrigatório.");
        }

        interesseDAO.salvar(interesse);
    }

    public List<Interesse> listar() {
        return interesseDAO.listarTodos();
    }

    // Ajuste: método auxiliar para consultar os inscritos de uma vaga específica
    public List<Interesse> listarPorOportunidade(int idOportunidade) {
        return interesseDAO.listarPorOportunidade(idOportunidade);
    }

    // Campo é inválido se for null ou só espaços
    private void validarCampo(String valor, String nomeCampo) {
        if (valor == null || valor.isBlank()) {
            throw new IllegalArgumentException("O campo " + nomeCampo + " é obrigatório");
        }
    }

    // Total de inscritos de uma oportunidade, usando mapToInt e sum.
    // Vai pegar a lista de inscritos (puxando de listarPorOportunidade),
    // transformar cada inscrito em 1 e somar tudo.
    public int totalInscritos(int idOportunidade) {
        return interesseDAO.listarPorOportunidade(idOportunidade)
                .stream()
                .mapToInt(i -> 1) // cada inscrito vale 1
                .sum();           // soma tudo
    }
}
