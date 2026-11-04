package br.edu.ucsal.radar.dao;

import br.edu.ucsal.radar.model.Professor;

/**
 * Contrato de repositório para acesso aos dados de professores (DIP / ISP).
 * Os services conhecem apenas esta abstração, desacoplando do banco de dados relacional.
 */
public interface ProfessorRepository {

    Professor buscarPorEmail(String email);

    Professor buscarPorId(int id);

    void salvar(Professor professor);
}

