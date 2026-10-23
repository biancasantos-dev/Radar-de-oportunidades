package br.edu.ucsal.radar.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;

public class ProfessorService {

    // Tokens em memória: token -> id do professor
    private final Map<String, Integer> tokens = new HashMap<>();

    // Gera o hash SHA-256 da senha (em hexadecimal)
    public String hashSenha(String senha) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(senha.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    // Confere a senha digitada com o hash salvo no banco
    public boolean senhaConfere(String senhaDigitada, String hashSalvo) {
        return hashSenha(senhaDigitada).equals(hashSalvo);
    }

    // gerarToken(): Gera um token UUID e associa ao id do professor
    // tokenValido(): Verifica se o token existe
    // getIdProfessor(): Retorna o id do professor dono do token
    public String gerarToken(int idProfessor) {
        String token = UUID.randomUUID().toString();
        tokens.put(token, idProfessor);
        return token;
    }

    public boolean tokenValido(String token) {
        return tokens.containsKey(token);
    }

    public Integer getIdProfessor(String token) {
        return tokens.get(token);
    }
}