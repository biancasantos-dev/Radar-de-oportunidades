package br.edu.ucsal.radar.model;

/**
 * Os 7 tipos de vaga. O "rotulo" é o texto exato que o front (index.html e
 * oportunidade.html) usa nos filtros e no formulário.
 */
public enum TipoOportunidade {
    INICIACAO_CIENTIFICA("Iniciação Científica"),
    MONITORIA("Monitoria"),
    EXTENSAO("Extensão"),
    ESTAGIO_EMPREGO("Estágio/Emprego"),
    EVENTO("Evento"),
    GRUPO_ESTUDO("Grupo de Estudo"),
    OUTROS("Outros");

    private final String rotulo;

    TipoOportunidade(String rotulo) {
        this.rotulo = rotulo;
    }

    public String getRotulo() {
        return rotulo;
    }

    // Converte o texto do front (ex.: "Monitoria") para o enum. Aceita também o nome do enum.
    public static TipoOportunidade deRotulo(String texto) {
        if (texto == null || texto.isBlank()) {
            throw new IllegalArgumentException("O tipo da vaga é obrigatório.");
        }
        String t = texto.trim();
        for (TipoOportunidade tipo : values()) {
            if (tipo.rotulo.equalsIgnoreCase(t) || tipo.name().equalsIgnoreCase(t)) {
                return tipo;
            }
        }
        throw new IllegalArgumentException("Tipo de vaga inválido: " + texto);
    }
}
