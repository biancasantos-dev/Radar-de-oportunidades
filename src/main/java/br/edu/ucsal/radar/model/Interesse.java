package br.edu.ucsal.radar.model;

import com.google.gson.annotations.SerializedName;

public class Interesse {
    private Integer id;

    // Ajuste: aceita tanto 'nome' quanto 'nome_aluno' vindo do front
    @SerializedName(value = "nome", alternate = {"nome_aluno"})
    private String nome;

    // Ajuste: aceita tanto 'email' quanto 'email_aluno' vindo do front
    @SerializedName(value = "email", alternate = {"email_aluno"})
    private String email;

    private String matricula;
    private String curso;

    // Ajuste: aceita tanto 'semestre' quanto 'periodo' vindo do front
    @SerializedName(value = "semestre", alternate = {"periodo"})
    private String semestre;

    // Ajuste: aceita tanto 'justificativa' quanto 'mensagem' vindo do front
    @SerializedName(value = "justificativa", alternate = {"mensagem"})
    private String justificativa;

    // Ajuste: aceita tanto 'idOportunidade', 'id_oportunidade' ou 'oportunidade_id'
    @SerializedName(value = "idOportunidade", alternate = {"id_oportunidade", "oportunidade_id"})
    private Integer idOportunidade;

    // Ajuste: construtor padrão sem parâmetros para o Gson conseguir instanciar no Java 21
    public Interesse() {
    }

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
    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }

    public String getMatricula() {
        return matricula;
    }
    public void setMatricula(String matricula) {
        this.matricula = matricula;
    }

    public String getCurso() {
        return curso;
    }
    public void setCurso(String curso) {
        this.curso = curso;
    }

    public String getSemestre() {
        return semestre;
    }
    public void setSemestre(String semestre) {
        this.semestre = semestre;
    }

    public String getJustificativa() {
        return justificativa;
    }
    public void setJustificativa(String justificativa) {
        this.justificativa = justificativa;
    }

    public void setIdOportunidade(Integer idOportunidade) {
        this.idOportunidade = idOportunidade;
    }
}
