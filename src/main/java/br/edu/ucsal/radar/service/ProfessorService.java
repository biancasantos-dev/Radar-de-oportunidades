package br.edu.ucsal.radar.service;

import br.edu.ucsal.radar.dao.ProfessorDAO;
import br.edu.ucsal.radar.dao.ProfessorRepository;
import br.edu.ucsal.radar.model.Professor;
import br.edu.ucsal.radar.util.HashUtil;
import br.edu.ucsal.radar.util.TokenManager;

public class ProfessorService {

    // O service depende da INTERFACE ProfessorRepository, não da classe concreta DAO (DIP)
    private final ProfessorRepository professorRepository;

    // Gerenciador dedicado para tokens e sessões em memória (SRP)
    private final TokenManager tokenManager;

    public ProfessorService() {
        this(new ProfessorDAO(), new TokenManager());
    }

    public ProfessorService(ProfessorRepository professorRepository) {
        this(professorRepository, new TokenManager());
    }

    public ProfessorService(ProfessorRepository professorRepository, TokenManager tokenManager) {
        this.professorRepository = professorRepository;
        this.tokenManager = tokenManager;
    }

    // Delegação para HashUtil (SRP - Responsabilidade Única de Criptografia)
    public String hashSenha(String senha) {
        return HashUtil.sha256(senha);
    }

    // Confere a senha digitada com o hash salvo no banco via HashUtil
    public boolean senhaConfere(String senhaDigitada, String hashSalvo) {
        return HashUtil.confere(senhaDigitada, hashSalvo);
    }

    // Delegação para TokenManager (SRP - Responsabilidade Única de Gestão de Sessão)
    public String gerarToken(int idProfessor) {
        return tokenManager.gerarToken(idProfessor);
    }

    public boolean tokenValido(String token) {
        return tokenManager.tokenValido(token);
    }

    public Integer getIdProfessor(String token) {
        return tokenManager.getIdProfessor(token);
    }

    public void revogarToken(String token) {
        tokenManager.revogarToken(token);
    }

    public String autenticar(String email, String senha) {
        Professor professor = professorRepository.buscarPorEmail(email);

        if (professor == null || !senhaConfere(senha, professor.getSenhaHash())) {
            return null;
        }

        return gerarToken(professor.getId());
    }

    // Ajuste: método auxiliar para consultar o professor pelo email após login
    public Professor buscarPorEmail(String email) {
        return professorRepository.buscarPorEmail(email);
    }

    // Ajuste: método auxiliar para consultar o professor pelo ID
    public Professor buscarPorId(int id) {
        return professorRepository.buscarPorId(id);
    }
}
