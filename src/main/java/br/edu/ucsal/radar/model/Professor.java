package br.edu.ucsal.radar.model;

public class Professor {
    private Integer id;
    private String nome;
    private String email;
    private String senhaHash;

    public Professor(String nome, String email, String senhaHash) {
        this.nome = nome;
        this.email = email;
        this.senhaHash = senhaHash;
    }
    public Professor(Integer id, String nome, String email, String senhaHash) {
        this(nome, email, senhaHash);
        this.id = id;
    }

    public Integer getId() {
        return this.id;
    }

    public String getNome() {
        return this.nome;
    }

    public String getEmail() {
        return this.email;
    }

    public String getSenhaHash() {
        return this.senhaHash;
    }
}
