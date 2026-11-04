package br.edu.ucsal.radar.model;

/**
 * Eixos acadêmicos da universidade (OCP).
 * Permite estender novas áreas de conhecimento adicionando constantes no Enum
 * sem a necessidade de modificar algoritmos internos de validação.
 */
public enum EixoAcademico {
    EXATAS("exatas", "Ciências Exatas e Tecnologia"),
    HUMANAS("humanas", "Ciências Humanas e Sociais"),
    SAUDE("saude", "Ciências Biológicas e da Saúde");

    private final String codigo;
    private final String descricao;

    EixoAcademico(String codigo, String descricao) {
        this.codigo = codigo;
        this.descricao = descricao;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getDescricao() {
        return descricao;
    }

    /**
     * Valida se uma string enviada pelo front-end corresponde a um eixo acadêmico suportado.
     */
    public static boolean isValido(String codigo) {
        if (codigo == null || codigo.isBlank()) {
            return false;
        }
        String limpo = codigo.trim().toLowerCase();
        for (EixoAcademico eixo : values()) {
            if (eixo.codigo.equals(limpo)) {
                return true;
            }
        }
        return false;
    }
}

