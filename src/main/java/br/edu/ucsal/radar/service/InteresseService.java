package br.edu.ucsal.radar.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import br.edu.ucsal.radar.dao.InteresseDAO;
import br.edu.ucsal.radar.dao.InteresseRepository;
import br.edu.ucsal.radar.dao.OportunidadeDAO;
import br.edu.ucsal.radar.dao.OportunidadeRepository;
import br.edu.ucsal.radar.model.Interesse;
import br.edu.ucsal.radar.model.Oportunidade;

public class InteresseService {

    // Ajuste (SOLID - DIP): O service agora depende de INTERFACES (InteresseRepository e OportunidadeRepository),
    // facilitando testes em memória e desacoplando da implementação concreta de persistência.
    private final InteresseRepository interesseRepository;
    private final OportunidadeRepository oportunidadeRepository;

    public InteresseService() {
        this(new InteresseDAO(), new OportunidadeDAO());
    }

    public InteresseService(InteresseRepository interesseRepository) {
        this(interesseRepository, new OportunidadeDAO());
    }

    public InteresseService(InteresseRepository interesseRepository, OportunidadeRepository oportunidadeRepository) {
        this.interesseRepository = interesseRepository;
        this.oportunidadeRepository = oportunidadeRepository;
    }

    // Valida os campos obrigatórios e, se a vaga existir e estiver aberta, grava a inscrição
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

        // Ajuste: validação de formato de e-mail institucional
        if (!interesse.getEmail().contains("@") || !interesse.getEmail().contains(".")) {
            throw new IllegalArgumentException("Por favor, informe um e-mail institucional válido.");
        }

        // Ajuste: validação preventiva para garantir que a inscrição está vinculada a uma vaga
        if (interesse.getIdOportunidade() == null || interesse.getIdOportunidade() <= 0) {
            throw new IllegalArgumentException("O id da oportunidade é obrigatório.");
        }

        // Ajuste (Regra de Negócio / Segurança): Valida se a oportunidade existe e se ainda está ABERTA,
        // bloqueando inscrições manuais diretas via API em processos seletivos já finalizados.
        if (oportunidadeRepository != null) {
            Optional<Oportunidade> vaga = oportunidadeRepository.buscarPorId(interesse.getIdOportunidade());
            if (vaga.isEmpty()) {
                throw new IllegalArgumentException("A oportunidade informada não foi encontrada.");
            }
            if (!"ABERTA".equalsIgnoreCase(vaga.get().getStatus())) {
                throw new IllegalArgumentException("As inscrições para esta oportunidade já foram encerradas.");
            }
        }

        interesseRepository.salvar(interesse);
    }

    public List<Interesse> listar() {
        return interesseRepository.listarTodos();
    }

    // Ajuste (Segurança / LGPD): Retorna apenas as inscrições das vagas que pertencem
    // ao professor autenticado, garantindo isolamento total entre docentes.
    public List<Interesse> listarPorProfessor(int professorId) {
        if (oportunidadeRepository == null) {
            return interesseRepository.listarTodos();
        }

        Set<Integer> idsVagasDocente = oportunidadeRepository.listarTodas().stream()
                .filter(o -> o.getProfessorId() != null && o.getProfessorId().equals(professorId))
                .map(Oportunidade::getId)
                .collect(Collectors.toSet());

        return interesseRepository.listarTodos().stream()
                .filter(i -> i.getIdOportunidade() != null && idsVagasDocente.contains(i.getIdOportunidade()))
                .collect(Collectors.toList());
    }

    // Consulta os inscritos de uma vaga específica
    public List<Interesse> listarPorOportunidade(int idOportunidade) {
        return interesseRepository.listarPorOportunidade(idOportunidade);
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
        return interesseRepository.listarPorOportunidade(idOportunidade)
                .stream()
                .mapToInt(i -> 1) // cada inscrito vale 1
                .sum();           // soma tudo
    }
}
