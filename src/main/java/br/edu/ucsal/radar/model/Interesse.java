package br.edu.ucsal.radar.model;

public class Interesse {
    private Integer id;
    private String nome;
    private String email;
    private String matricula;
    private String curso;
    private String semestre;
    private String justificativa;
    private Integer idOportunidade;

    public Interesse(String nome, String email, String matricula,
                 String curso, String semestre, String justificativa, Integer idOportunidade) {
        this.nome = nome;
        this.email = email;
        this.matricula = matricula;
        this.curso = curso;
        this.semestre = semestre;
        this.justificativa = justificativa;
        this.idOportunidade = idOportunidade;
    }

    public Interesse(Integer id, String nome, String email, String matricula,
                    String curso, String semestre, String justificativa, Integer idOportunidade) {
        this(nome, email, matricula, curso, semestre, justificativa, idOportunidade);
        this.id = id;
    }

    public Integer getIdOportunidade() {
        return idOportunidade;
    }

    public Integer getId() {
        return id;
    }
    public void setId(Integer id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }
    public String getEmail() {
        return email;
    }
    public String getMatricula() {
        return matricula;
    }
    public String getCurso() {
        return curso;
    }
    public String getSemestre() {
        return semestre;
    }
    public String getJustificativa() {
        return justificativa;
    }
}
