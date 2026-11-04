package br.edu.ucsal.radar.service;

import java.text.Normalizer;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import br.edu.ucsal.radar.dao.OportunidadeRepository;
import br.edu.ucsal.radar.model.EixoAcademico;
import br.edu.ucsal.radar.model.Oportunidade;
import br.edu.ucsal.radar.model.StatusOportunidade;
import br.edu.ucsal.radar.model.TipoOportunidade;

public class OportunidadeService {

    // O service depende da INTERFACE OportunidadeRepository, não da classe concreta DAO (DIP)
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

        // Validação via Enum extensível EixoAcademico (OCP)
        if (vazio(o.getEixo()) || !EixoAcademico.isValido(o.getEixo())) {
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

        // Validação via Enum extensível StatusOportunidade (OCP)
        String status = vazio(o.getStatus()) ? "ABERTA" : o.getStatus().trim().toUpperCase();
        if (!StatusOportunidade.isValido(status)) {
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

    /** Atualiza os dados de uma oportunidade existente garantindo validação de autoria (Bug 2). */
    public Oportunidade atualizar(int id, Oportunidade dados, int professorId) {
        if (dados == null) {
            throw new IllegalArgumentException("Dados da vaga não enviados.");
        }

        Optional<Oportunidade> existenteOpt = repositorio.buscarPorId(id);
        if (existenteOpt.isEmpty()) {
            throw new IllegalArgumentException("Oportunidade #" + id + " não encontrada.");
        }

        Oportunidade existente = existenteOpt.get();

        // Validação estrita de autoria: nenhum docente altera vaga de outro
        if (existente.getProfessorId() != null && !existente.getProfessorId().equals(professorId)) {
            throw new SecurityException("Acesso negado: Você não tem autorização para editar esta oportunidade.");
        }

        if (vazio(dados.getTitulo())) {
            throw new IllegalArgumentException("O título é obrigatório.");
        }
        if (dados.getTipo() == null) {
            throw new IllegalArgumentException("O tipo da vaga é obrigatório.");
        }
        if (vazio(dados.getEixo()) || !EixoAcademico.isValido(dados.getEixo())) {
            throw new IllegalArgumentException("O eixo deve ser: exatas, humanas ou saude.");
        }
        if (vazio(dados.getDepartamento())) {
            throw new IllegalArgumentException("O departamento/curso é obrigatório.");
        }
        if (vazio(dados.getDescricao())) {
            throw new IllegalArgumentException("A descrição é obrigatória.");
        }

        existente.setTitulo(dados.getTitulo().trim());
        existente.setTipo(dados.getTipo());
        existente.setEixo(dados.getEixo().trim().toLowerCase());
        existente.setDepartamento(dados.getDepartamento().trim());
        existente.setDescricao(dados.getDescricao().trim());
        existente.setAtividades(dados.getAtividades());
        existente.setRequisitos(dados.getRequisitos());
        existente.setBolsa(vazio(dados.getBolsa()) ? "Voluntário" : dados.getBolsa().trim());

        String status = vazio(dados.getStatus()) ? existente.getStatus() : dados.getStatus().trim().toUpperCase();
        if (!StatusOportunidade.isValido(status)) {
            throw new IllegalArgumentException("O status deve ser ABERTA ou ENCERRADA.");
        }
        existente.setStatus(status);

        if (dados.getDataLimite() != null) {
            existente.setDataLimite(dados.getDataLimite());
        }

        repositorio.atualizar(existente);
        return existente;
    }

    /** Exclui uma oportunidade garantindo validação de autoria do professor (Bug 2). */
    public void excluir(int id, int professorId) {
        Optional<Oportunidade> existenteOpt = repositorio.buscarPorId(id);
        if (existenteOpt.isEmpty()) {
            throw new IllegalArgumentException("Oportunidade #" + id + " não encontrada.");
        }

        Oportunidade existente = existenteOpt.get();
        if (existente.getProfessorId() != null && !existente.getProfessorId().equals(professorId)) {
            throw new SecurityException("Acesso negado: Você não tem autorização para excluir esta oportunidade.");
        }

        repositorio.excluir(id);
    }

    /** Alterna o status entre ABERTA e ENCERRADA (Bug 2). */
    public Oportunidade alternarStatus(int id, int professorId) {
        Optional<Oportunidade> existenteOpt = repositorio.buscarPorId(id);
        if (existenteOpt.isEmpty()) {
            throw new IllegalArgumentException("Oportunidade #" + id + " não encontrada.");
        }

        Oportunidade existente = existenteOpt.get();
        if (existente.getProfessorId() != null && !existente.getProfessorId().equals(professorId)) {
            throw new SecurityException("Acesso negado: Você não tem autorização para alterar o status desta oportunidade.");
        }

        String novoStatus = "ABERTA".equalsIgnoreCase(existente.getStatus()) ? "ENCERRADA" : "ABERTA";
        existente.setStatus(novoStatus);
        repositorio.atualizar(existente);
        return existente;
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
