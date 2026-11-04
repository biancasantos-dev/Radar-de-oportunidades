package br.edu.ucsal.radar.dao;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import br.edu.ucsal.radar.model.Oportunidade;
import br.edu.ucsal.radar.model.TipoOportunidade;
import br.edu.ucsal.radar.util.ConexaoBD;

public class OportunidadeDAO implements OportunidadeRepository {

    // SELECT base: junta oportunidade com professor para trazer o nome do docente
    private static final String SELECT_BASE =
            "SELECT o.id, o.titulo, o.tipo, o.eixo, o.departamento, o.descricao, "
            + "       o.atividades, o.requisitos, o.bolsa, o.data_limite, o.status, "
            + "       o.professor_id, p.nome AS professor_nome "
            + "  FROM oportunidade o "
            + "  LEFT JOIN professor p ON p.id = o.professor_id ";

    @Override
    public List<Oportunidade> listarTodas() {
        List<Oportunidade> lista = new ArrayList<>();
        String sql = SELECT_BASE + "ORDER BY o.data_limite ASC";

        try (Connection conn = ConexaoBD.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                lista.add(mapear(rs));
            }

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao listar oportunidades", e);
        }
        return lista;
    }

    @Override
    public Optional<Oportunidade> buscarPorId(int id) {
        String sql = SELECT_BASE + "WHERE o.id = ?";

        try (Connection conn = ConexaoBD.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapear(rs));
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar oportunidade " + id, e);
        }
        return Optional.empty();
    }

    @Override
    public Oportunidade salvar(Oportunidade o) {
        String sql = "INSERT INTO oportunidade "
                + "(titulo, tipo, eixo, departamento, descricao, atividades, requisitos, bolsa, data_limite, status, professor_id) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = ConexaoBD.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, o.getTitulo());
            ps.setString(2, o.getTipo().getRotulo());
            ps.setString(3, o.getEixo());
            ps.setString(4, o.getDepartamento());
            ps.setString(5, o.getDescricao());
            ps.setString(6, o.getAtividades());
            ps.setString(7, o.getRequisitos());
            ps.setString(8, o.getBolsa());

            if (o.getDataLimite() != null) {
                ps.setDate(9, Date.valueOf(o.getDataLimite()));
            } else {
                ps.setNull(9, Types.DATE);
            }

            ps.setString(10, o.getStatus());

            if (o.getProfessorId() != null) {
                ps.setInt(11, o.getProfessorId());
            } else {
                ps.setNull(11, Types.INTEGER);
            }

            ps.executeUpdate();

            try (ResultSet chaves = ps.getGeneratedKeys()) {
                if (chaves.next()) {
                    o.setId(chaves.getInt(1));
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao salvar oportunidade", e);
        }

        // Relê do banco para devolver também o professor_nome
        return buscarPorId(o.getId()).orElse(o);
    }

    // Ajuste: persistência da atualização de oportunidade no banco PostgreSQL (PUT)
    @Override
    public void atualizar(Oportunidade o) {
        String sql = "UPDATE oportunidade SET titulo = ?, tipo = ?, eixo = ?, departamento = ?, "
                + "descricao = ?, atividades = ?, requisitos = ?, bolsa = ?, data_limite = ?, status = ? "
                + "WHERE id = ?";

        try (Connection conn = ConexaoBD.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, o.getTitulo());
            ps.setString(2, o.getTipo().getRotulo());
            ps.setString(3, o.getEixo());
            ps.setString(4, o.getDepartamento());
            ps.setString(5, o.getDescricao());
            ps.setString(6, o.getAtividades());
            ps.setString(7, o.getRequisitos());
            ps.setString(8, o.getBolsa());

            if (o.getDataLimite() != null) {
                ps.setDate(9, Date.valueOf(o.getDataLimite()));
            } else {
                ps.setNull(9, Types.DATE);
            }

            ps.setString(10, o.getStatus());
            ps.setInt(11, o.getId());

            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar oportunidade " + o.getId(), e);
        }
    }

    // Ajuste: exclusão da oportunidade no banco PostgreSQL (DELETE)
    @Override
    public void excluir(int id) {
        String sql = "DELETE FROM oportunidade WHERE id = ?";

        try (Connection conn = ConexaoBD.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao excluir oportunidade " + id, e);
        }
    }

    // Converte uma linha do ResultSet em objeto Oportunidade
    private Oportunidade mapear(ResultSet rs) throws SQLException {
        Oportunidade o = new Oportunidade();
        o.setId(rs.getInt("id"));
        o.setTitulo(rs.getString("titulo"));
        o.setTipo(TipoOportunidade.deRotulo(rs.getString("tipo")));
        o.setEixo(rs.getString("eixo"));
        o.setDepartamento(rs.getString("departamento"));
        o.setDescricao(rs.getString("descricao"));
        o.setAtividades(rs.getString("atividades"));
        o.setRequisitos(rs.getString("requisitos"));
        o.setBolsa(rs.getString("bolsa"));

        Date data = rs.getDate("data_limite");
        o.setDataLimite(data != null ? data.toLocalDate() : null);

        o.setStatus(rs.getString("status"));

        int profId = rs.getInt("professor_id");
        o.setProfessorId(rs.wasNull() ? null : profId);
        o.setProfessorNome(rs.getString("professor_nome"));
        return o;
    }
}
