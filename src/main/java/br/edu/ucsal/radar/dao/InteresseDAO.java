package br.edu.ucsal.radar.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import br.edu.ucsal.radar.model.Interesse;
import br.edu.ucsal.radar.util.ConexaoBD;

public class InteresseDAO {

    // Grava uma inscrição no banco. Então usa INSERT, que não devolve ResultSet, então usa executeUpdate
    public void salvar(Interesse interesse) {
        String sql = "INSERT INTO interesse (nome, email, matricula, curso, semestre, justificativa, id_oportunidade) "
           + "VALUES (?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = ConexaoBD.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, interesse.getNome());
            ps.setString(2, interesse.getEmail());
            ps.setString(3, interesse.getMatricula());
            ps.setString(4, interesse.getCurso());
            ps.setString(5, interesse.getSemestre());
            ps.setString(6, interesse.getJustificativa());
            ps.setInt(7, interesse.getIdOportunidade());

            ps.executeUpdate(); // INSERT não devolve ResultSet, usa executeUpdate

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao salvar interesse", e);
        }
    }

    // Consulta todas as inscrições
    public List<Interesse> listarTodos() {
        String sql = "SELECT id, nome, email, matricula, curso, semestre, justificativa FROM interesse";
        List<Interesse> lista = new ArrayList<>();

        try (Connection conn = ConexaoBD.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet resultado = ps.executeQuery()) {

            while (resultado.next()) { // while: pode vir várias linhas
                Interesse i = new Interesse(
                    resultado.getString("nome"),
                    resultado.getString("email"),
                    resultado.getString("matricula"),
                    resultado.getString("curso"),
                    resultado.getString("semestre"),
                    resultado.getString("justificativa"),
                    resultado.getInt("id_oportunidade"));
            i.setId(resultado.getInt("id"));
            lista.add(i);
        }

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao listar interesses", e);
        }
        return lista;
    }

    // Consulta as inscrições de uma oportunidade específica e retorna 
    // uma lista de objetos Interesse (dados como nome, email, etc.). Usa SELECT com WHERE, e o PreparedStatement 
    //preenche o "?" com o id da oportunidade.
    public List<Interesse> listarPorOportunidade(int idOportunidade) {
        String sql = "SELECT id, nome, email, matricula, curso, semestre, justificativa, id_oportunidade "
                + "FROM interesse WHERE id_oportunidade = ?";
        List<Interesse> lista = new ArrayList<>();

        try (Connection conn = ConexaoBD.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, idOportunidade); // preenche o "?" com o id da vaga

            try (ResultSet resultado = ps.executeQuery()) {
                while (resultado.next()) {
                    Interesse i = new Interesse(
                            resultado.getString("nome"),
                            resultado.getString("email"),
                            resultado.getString("matricula"),
                            resultado.getString("curso"),
                            resultado.getString("semestre"),
                            resultado.getString("justificativa"),
                            resultado.getInt("id_oportunidade"));
                    i.setId(resultado.getInt("id"));
                    lista.add(i);
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao listar inscritos da oportunidade", e);
        }
        return lista;
    }
}