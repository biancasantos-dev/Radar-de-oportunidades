package br.edu.ucsal.radar.dao;
// Classe com métodos de acesso ao Banco de Dados

// Não valida nem gera nada. Apenas vai receber um email e retornar o professor do Banco de Dados

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import br.edu.ucsal.radar.model.Professor;
import br.edu.ucsal.radar.util.ConexaoBD;

public class ProfessorDAO {

    // Busca o professor pelo email; retorna null se não existir
    public Professor buscarPorEmail(String email) {
        /* QUERY */ String sql = "SELECT id, nome, email, senha_hash FROM professor WHERE email = ?";// Solicita esses
                                                                                                     // dados da tabela do banco
        // Usa SELECT, então precisa de ResultSet para receber o resultado da query

        try (Connection conn = ConexaoBD.getConnection(); // Acessa o banco
                PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, email); // Substitui o primeiro "?" da query pelo email recebido

            try (ResultSet resultado = ps.executeQuery()) { // Roda a query e retorna o resultado
                if (resultado.next()) {// true ou false, se encontrou ou não o professor com o email
                    return new Professor( // Aí cria um objeto Professor com os dados que deram get do Banco de dados
                            resultado.getInt("id"),
                            resultado.getString("nome"),
                            resultado.getString("email"),
                            resultado.getString("senha_hash"));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar professor", e);
        }
        return null;
    }

    public void salvar(Professor professor) {
    String sql = "INSERT INTO professor (nome, email, senha_hash) VALUES (?, ?, ?)";

    try (Connection conn = ConexaoBD.getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setString(1, professor.getNome());
        ps.setString(2, professor.getEmail());
        ps.setString(3, professor.getSenhaHash());

        ps.executeUpdate();

    } catch (SQLException e) {
        throw new RuntimeException("Erro ao salvar professor", e);
    }
    }
}
