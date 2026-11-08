package br.edu.ucsal.radar.util;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Gerenciador responsável exclusivamente pelo ciclo de vida e armazenamento de tokens de sessão (SRP).
 * Isola a manipulação de tokens da lógica de negócios e de persistência de professores.
 */
public class TokenManager {

    // Tokens em memória: token (UUID) -> id do professor autenticado
    private final Map<String, Integer> tokens;

    public TokenManager() {
        this.tokens = new ConcurrentHashMap<>();
    }

    /**
     * Gera um novo token UUID seguro e o associa ao ID do professor.
     */
    public String gerarToken(int idProfessor) {
        String token = UUID.randomUUID().toString();
        tokens.put(token, idProfessor);
        return token;
    }

    /**
     * Verifica se o token informado existe na sessão ativa.
     */
    public boolean tokenValido(String token) {
        return token != null && tokens.containsKey(token);
    }

    /**
     * Retorna o ID do professor associado ao token informado (ou null se inexistente).
     */
    public Integer getIdProfessor(String token) {
        return token != null ? tokens.get(token) : null;
    }

    /**
     * Revoga o token de sessão informado (logout).
     */
    public void revogarToken(String token) {
        if (token != null) {
            tokens.remove(token);
        }
    }
}

