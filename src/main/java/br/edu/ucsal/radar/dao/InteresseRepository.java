package br.edu.ucsal.radar.dao;

import java.util.List;
import br.edu.ucsal.radar.model.Interesse;

/**
 * Contrato de repositório para acesso aos dados de candidaturas/interesses (DIP / ISP).
 * Desacopla o service de regras de negócio das operações de banco de dados JDBC.
 */
public interface InteresseRepository {

    void salvar(Interesse interesse);

    List<Interesse> listarTodos();

    List<Interesse> listarPorOportunidade(int idOportunidade);
}

