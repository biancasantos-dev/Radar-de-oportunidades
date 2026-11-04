package br.edu.ucsal.radar.controller;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import com.sun.net.httpserver.HttpExchange; // facilita o acesso as informações das requisições
import com.sun.net.httpserver.HttpHandler;  // comportamento do servidor

import br.edu.ucsal.radar.model.Interesse;
import br.edu.ucsal.radar.service.InteresseService;
import br.edu.ucsal.radar.service.ProfessorService;

public class InteresseController implements HttpHandler {

    // POST /api/interesses: Recebe os dados da candidatura do aluno e grava no banco.
    // GET  /api/interesses: Lista apenas as candidaturas do professor autenticado.

    private final InteresseService service;
    // Ajuste (Segurança / LGPD): Injetado ProfessorService para validar o token Bearer e isolar inscritos por docente
    private final ProfessorService autenticacao;

    private final Gson gson = new Gson();

    public InteresseController() {
        this(new InteresseService(), new ProfessorService());
    }

    public InteresseController(InteresseService service) {
        this(service, new ProfessorService());
    }

    // Ajuste (DIP / Injeção de Dependências): Construtor permitindo injetar autenticação e service gerenciados no Main
    public InteresseController(InteresseService service, ProfessorService autenticacao) {
        this.service = service;
        this.autenticacao = autenticacao;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        try {
            String metodo = exchange.getRequestMethod();
            String caminho = exchange.getRequestURI().getPath();

            // Ajuste: aceita /api/interesses, /api/interesse ou /interesse para compatibilidade com o front
            if (!caminho.equals("/interesse") && !caminho.equals("/api/interesses") && !caminho.equals("/api/interesse")) {
                responder(exchange, 404, Map.of("erro", "Rota não encontrada."));
                return;
            }

            if (metodo.equals("POST")) {
                Interesse interesse;
                try {
                    // InputStreamReader vai interpretar os bytes do body da requisição como texto UTF-8
                    // O fromJson vai converter esse JSON em um objeto "Interesse"
                    interesse = gson.fromJson(new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8), Interesse.class);
                } catch (JsonSyntaxException e) {
                    responder(exchange, 400, Map.of("erro", "JSON inválido"));
                    return;
                }

                if (interesse == null) {
                    responder(exchange, 400, Map.of("erro", "O corpo da requisição está vazio ou inválido."));
                    return;
                }

                service.registrar(interesse);
                responder(exchange, 201, Map.of("mensagem", "Inscrição registrada com sucesso."));
                return;
            }

            // Ajuste (Segurança / LGPD): GET protegido por token Bearer que retorna exclusivamente
            // os candidatos das vagas do professor autenticado, impedindo vazamento de dados de outros docentes
            if (metodo.equals("GET")) {
                Integer professorId = professorLogado(exchange);
                if (professorId == null) {
                    responder(exchange, 401, Map.of("erro", "Acesso restrito: Faça login como professor para acessar as candidaturas."));
                    return;
                }

                responder(exchange, 200, service.listarPorProfessor(professorId));
                return;
            }

            responder(exchange, 405, Map.of("erro", "Método HTTP não permitido"));

        } catch (IllegalArgumentException e) {
            if (exchange.getResponseCode() == -1) { // vê se foi enviada uma resposta. (-1) significa que não foi
                responder(exchange, 400, Map.of("erro", e.getMessage()));
                // vai responder com a mensagem de exceção do InteresseService
            }
        } catch (Exception e) {
            // Log simplificado de erro
            System.err.println("Erro no InteresseController: " + e.getMessage());

            if (exchange.getResponseCode() == -1) {
                responder(exchange, 500, Map.of("erro", "Erro interno no servidor"));
            }
        } finally {
            exchange.close();
        }
    }

    // Ajuste (Segurança): Lê o token Bearer do cabeçalho Authorization para autenticar o docente
    private Integer professorLogado(HttpExchange exchange) {
        if (autenticacao == null) return null;
        String cabecalho = exchange.getRequestHeaders().getFirst("Authorization");
        if (cabecalho == null || !cabecalho.startsWith("Bearer ")) {
            return null;
        }
        String token = cabecalho.substring("Bearer ".length()).trim();
        return autenticacao.tokenValido(token) ? autenticacao.getIdProfessor(token) : null;
    }

    private void responder(HttpExchange exchange, int status, Object corpo) throws IOException {
        String json = gson.toJson(corpo); // transforma o objeto do Map.of em json
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8); // converte Json para bytes
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8"); // informa que o conteúdo está em UTF-8
        exchange.sendResponseHeaders(status, bytes.length); // coloca no cabeçalho o status e o tamanho do corpo
        exchange.getResponseBody().write(bytes); // envia no OutputStream da resposta
    }
}
