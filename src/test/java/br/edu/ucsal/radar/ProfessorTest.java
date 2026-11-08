package br.edu.ucsal.radar;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import br.edu.ucsal.radar.service.ProfessorService;

/**
 * Testes unitários para o serviço de autenticação e criptografia dos docentes.
 */
public class ProfessorTest {

    private ProfessorService service;

    @BeforeEach
    void setUp() {
        service = new ProfessorService();
    }

    @Test
    void hashSenhaGeraSha256Consistente() {
        String hash1 = service.hashSenha("ucsal123");
        String hash2 = service.hashSenha("ucsal123");

        assertNotNull(hash1);
        assertEquals(64, hash1.length()); // SHA-256 em hex possui 64 caracteres
        assertEquals(hash1, hash2);
    }

    @Test
    void senhaConfereValidaSenhaCorretaEIncorreta() {
        String hashCorreto = service.hashSenha("admin123");

        assertTrue(service.senhaConfere("admin123", hashCorreto));
        assertFalse(service.senhaConfere("senhaErrada", hashCorreto));
    }

    @Test
    void gerenciamentoDeTokensDeSessao() {
        String token = service.gerarToken(42);

        assertNotNull(token);
        assertTrue(service.tokenValido(token));
        assertEquals(42, service.getIdProfessor(token));
        assertFalse(service.tokenValido("token-inexistente-123"));
    }
}
