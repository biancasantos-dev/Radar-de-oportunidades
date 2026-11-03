package br.edu.ucsal.radar.service;

import java.text.Normalizer;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import br.edu.ucsal.radar.dao.OportunidadeRepository;
import br.edu.ucsal.radar.model.Oportunidade;
import br.edu.ucsal.radar.model.TipoOportunidade;

public class OportunidadeService {

    private static final Set<String> EIXOS = Set.of("exatas", "humanas", "saude");
    private static final Set<String> STATUS = Set.of("ABERTA", "ENCERRADA");

    // O service depende da INTERFACE, não do DAO (DIP)
    private final OportunidadeRepository repositorio;

    public OportunidadeService(OportunidadeRepository repositorio) {
        this.repositorio = repositorio;
    }

    /**
     * Lista as vagas do mural. Todos os filtros são opcionais (null/vazio = não filtra):
     * tipo  -> "Monitoria", "Extensão"...
     * eixo  -> exatas | humanas | saude
     * curso -> texto que deve aparecer no departamento (ignora maiúsculas e acentos)
     * O resultado vem ordenado pela data de encerramento (mais próxima primeiro).
     */
    public List<Oportunidade> listar(String tipo, String eixo, String curso) {
        TipoOportunidade tipoFiltro = (tipo == null || tipo.isBlank() || tipo.equalsIgnoreCase("TODOS"))
                ? null
                : TipoOportunidade.deRotulo(tipo);
        String eixoFiltro = vazio(eixo) || eixo.equalsIgnoreCase("geral") ? null : eixo.trim().toLowerCase();
        String cursoFiltro = vazio(curso) ? null : normalizar(curso);

        return repositorio.listarTodas().stream()
                .filter(o -> tipoFiltro == null || o.getTipo() == tipoFiltro)
                .filter(o -> eixoFiltro == null || eixoFiltro.equals(o.getEixo()))
                .filter(o -> cursoFiltro == null || normalizar(o.getDepartamento()).contains(cursoFiltro))
                .sorted(Comparator.comparing(Oportunidade::getDataLimite,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.toList());
    }

    public Optional<Oportunidade> buscarPorId(int id) {
        return repositorio.buscarPorId(id);
    }

    /** Valida e grava uma vaga nova criada por um professor. */
    public Oportunidade cadastrar(Oportunidade o, int professorId) {
        if (o == null) {
            throw new IllegalArgumentException("Dados da vaga não enviados.");
        }
        if (vazio(o.getTitulo())) {
            throw new IllegalArgumentException("O título é obrigatório.");
        }
        if (o.getTipo() == null) {
            throw new IllegalArgumentException("O tipo da vaga é obrigatório.");
        }
        if (vazio(o.getEixo()) || !EIXOS.contains(o.getEixo().trim().toLowerCase())) {
            throw new IllegalArgumentException("O eixo deve ser: exatas, humanas ou saude.");
        }
        if (vazio(o.getDepartamento())) {
            throw new IllegalArgumentException("O departamento/curso é obrigatório.");
        }
        if (vazio(o.getDescricao())) {
            throw new IllegalArgumentException("A descrição é obrigatória.");
        }

        o.setTitulo(o.getTitulo().trim());
        o.setEixo(o.getEixo().trim().toLowerCase());
        o.setDepartamento(o.getDepartamento().trim());
        o.setDescricao(o.getDescricao().trim());

        if (vazio(o.getBolsa())) {
            o.setBolsa("Voluntário");
        }

        String status = vazio(o.getStatus()) ? "ABERTA" : o.getStatus().trim().toUpperCase();
        if (!STATUS.contains(status)) {
            throw new IllegalArgumentException("O status deve ser ABERTA ou ENCERRADA.");
        }
        o.setStatus(status);

        LocalDate limite = o.getDataLimite();
        if (limite != null && limite.isBefore(LocalDate.now()) && status.equals("ABERTA")) {
            throw new IllegalArgumentException("A data limite de uma vaga aberta não pode estar no passado.");
        }

        o.setId(null);
        o.setProfessorNome(null);
        o.setProfessorId(professorId);
        return repositorio.salvar(o);
    }

    private static boolean vazio(String s) {
        return s == null || s.isBlank();
    }

    // minúsculas e sem acento: "Extensão" e "extensao" ficam iguais na busca
    private static String normalizar(String s) {
        if (s == null) {
            return "";
        }
        return Normalizer.normalize(s, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase()
                .trim();
    }
}
