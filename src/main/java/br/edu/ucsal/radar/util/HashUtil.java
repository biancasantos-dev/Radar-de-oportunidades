package br.edu.ucsal.radar.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * Utilitário responsável exclusivamente por funções criptográficas de hash (SRP).
 * Isola a manipulação de algoritmos como SHA-256 das regras de negócio dos serviços.
 */
public class HashUtil {

    private HashUtil() {
        // Classe utilitária estática: impede instanciação direta
    }

    /**
     * Calcula o hash SHA-256 de uma sequência de texto e retorna em representação hexadecimal.
     *
     * @param texto Texto puro a ser hasheado
     * @return Hash SHA-256 em minúsculas (64 caracteres)
     */
    public static String sha256(String texto) {
        if (texto == null) {
            return null;
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(texto.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Algoritmo de hash SHA-256 não disponível no ambiente Java.", e);
        }
    }

    /**
     * Valida se uma senha em texto puro confere com o hash salvo previamente.
     *
     * @param textoDigitado Senha enviada pelo usuário
     * @param hashSalvo Hash armazenado no banco de dados
     * @return true se o hash calculado for idêntico ao esperado
     */
    public static boolean confere(String textoDigitado, String hashSalvo) {
        if (textoDigitado == null || hashSalvo == null) {
            return false;
        }
        return sha256(textoDigitado).equals(hashSalvo);
    }
}

