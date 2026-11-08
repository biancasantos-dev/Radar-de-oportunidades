package br.edu.ucsal.radar.dao;

import java.util.List;
import java.util.Optional;

import br.edu.ucsal.radar.model.Oportunidade;

/**
 * Contrato de acesso às vagas (DIP). O service só conhece esta interface;
 * quem fala com o PostgreSQL é o OportunidadeDAO.
 */
public interface OportunidadeRepository {

    List<Oportunidade> listarTodas();

    Optional<Oportunidade> buscarPorId(int id);

    // Grava a vaga e devolve ela já com o id gerado pelo banco.
    Oportunidade salvar(Oportunidade oportunidade);

    // Ajuste: métodos de atualização e exclusão para suportar PUT e DELETE na API REST
    void atualizar(Oportunidade oportunidade);

    void excluir(int id);
}
