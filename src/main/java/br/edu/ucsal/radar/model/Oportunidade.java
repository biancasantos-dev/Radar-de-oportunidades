package br.edu.ucsal.radar.model;

import java.time.LocalDate;

import com.google.gson.annotations.SerializedName;

/**
 * Uma vaga do mural. Os nomes em JSON (@SerializedName) seguem exatamente o
 * que o front já usa em web/assets/data/oportunidades.json.
 */
public class Oportunidade {
    private Integer id;
    private String titulo;
    private TipoOportunidade tipo;
    private String eixo;            // exatas | humanas | saude
    private String departamento;    // é o "curso" que o aluno filtra no mural
    private String descricao;
    private String atividades;
    private String requisitos;
    private String bolsa;

    @SerializedName("data_limite")
    private LocalDate dataLimite;

    private String status;          // ABERTA | ENCERRADA

    @SerializedName("professor_id")
    private Integer professorId;

    @SerializedName("professor_nome")
    private String professorNome;   // só leitura (vem do JOIN com professor)

    public Oportunidade() {
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public TipoOportunidade getTipo() { return tipo; }
    public void setTipo(TipoOportunidade tipo) { this.tipo = tipo; }

    public String getEixo() { return eixo; }
    public void setEixo(String eixo) { this.eixo = eixo; }

    public String getDepartamento() { return departamento; }
    public void setDepartamento(String departamento) { this.departamento = departamento; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public String getAtividades() { return atividades; }
    public void setAtividades(String atividades) { this.atividades = atividades; }

    public String getRequisitos() { return requisitos; }
    public void setRequisitos(String requisitos) { this.requisitos = requisitos; }

    public String getBolsa() { return bolsa; }
    public void setBolsa(String bolsa) { this.bolsa = bolsa; }

    public LocalDate getDataLimite() { return dataLimite; }
    public void setDataLimite(LocalDate dataLimite) { this.dataLimite = dataLimite; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getProfessorId() { return professorId; }
    public void setProfessorId(Integer professorId) { this.professorId = professorId; }

    public String getProfessorNome() { return professorNome; }
    public void setProfessorNome(String professorNome) { this.professorNome = professorNome; }
}
