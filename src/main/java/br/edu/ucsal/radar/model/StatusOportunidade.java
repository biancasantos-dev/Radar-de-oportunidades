package br.edu.ucsal.radar.model;

/**
 * Estados do ciclo de vida de uma oportunidade acadêmica (OCP).
 * Permite estender novos estados (ex: EM_ANALISE, CANCELADA) sem alterar a lógica de negócios.
 */
public enum StatusOportunidade {
    ABERTA,
    ENCERRADA;

    public static boolean isValido(String status) {
        if (status == null || status.isBlank()) {
            return false;
        }
        String limpo = status.trim().toUpperCase();
        for (StatusOportunidade s : values()) {
            if (s.name().equals(limpo)) {
                return true;
            }
        }
        return false;
    }
}

