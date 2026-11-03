package br.edu.ucsal.radar.controller;

import br.edu.ucsal.radar.model.Professor;
import br.edu.ucsal.radar.service.ProfessorService;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class LoginController implements HttpHandler {

    // Validar credenciais, confere senha e retorna o token de acesso Bearer

    private final ProfessorService service;

    private final Gson gson = new Gson();

    public LoginController() {
        this(new ProfessorService());
    }

    // Ajuste: permite reutilizar a mesma instância de ProfessorService gerenciada no Main
    public LoginController(ProfessorService service) {
        this.service = service;
    }

    private static class DadosLogin {
        String email;
        String senha;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
            try {

                String metodo = exchange.getRequestMethod();
                String caminho = exchange.getRequestURI().getPath();

                // Ajuste: aceita /api/login ou /login para funcionar tanto com o prefixo da API quanto sem
                if (!caminho.equals("/login") && !caminho.equals("/api/login")) {
                    responder(exchange, 404, Map.of("erro", "Rota não encontrada."));
                    return;
                }

                if (metodo.equals("POST")) {

                    String login;
                    String senha;
                    String token;

                    DadosLogin dados;

                    try {

                        dados = gson.fromJson(new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8), DadosLogin.class);

                    } catch (JsonSyntaxException e) {
                        responder(exchange, 400, Map.of("erro", "JSON inválido"));

                        return;
                    }

                    if (dados == null) {
                        responder(exchange, 400, Map.of("erro", "O corpo da requisição está vazio ou inválido."));
                        return;
                    }

                    login = dados.email;
                    senha = dados.senha;
                    
                    if (login == null || login.isBlank() || senha == null || senha.isBlank()) {

                        responder(exchange, 400,  Map.of("erro", "E-mail e senha são obrigatórios."));

                        return;
                    }

                    token = service.autenticar(login.trim(), senha);

                    // Se não houver token, as credenciais são inválidas.
                    if (token == null) {
                        responder(exchange, 401, Map.of("erro", "E-mail ou senha inválidos."));
                        return;
                    }

                    // Ajuste: Retorna o token de acesso e os dados de identificação do professor autenticado
                    Professor prof = service.buscarPorEmail(login.trim());
                    responder(exchange, 200, criarRespostaLogin(token, prof));
                    return;

                }

                responder(exchange, 405, Map.of("erro", "Método HTTP não permitido"));

            } catch (Exception e) {
                // Log simplificado de erro
                System.err.println("Erro no LoginController: " + e.getMessage());

                if (exchange.getResponseCode() == -1) {
                    responder(exchange, 500, Map.of("erro", "Erro interno no servidor"));
                }

            } finally {
                exchange.close();
            }
    }

    // Ajuste: método auxiliar para estruturar a resposta do login autenticado
    private Map<String, Object> criarRespostaLogin(String token, Professor prof) {
        Map<String, Object> resposta = new HashMap<>();
        resposta.put("mensagem", "Login realizado com sucesso.");
        resposta.put("token", token);
        resposta.put("tipo", "Bearer");
        if (prof != null) {
            resposta.put("id", prof.getId());
            resposta.put("nome", prof.getNome());
            resposta.put("email", prof.getEmail());
        }
        return resposta;
    }

    private void responder(HttpExchange exchange, int status, Object corpo) throws IOException {

        String json = gson.toJson(corpo); 

        byte[] bytes = json.getBytes(StandardCharsets.UTF_8); 

        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8"); 

        exchange.sendResponseHeaders(status, bytes.length); 

        exchange.getResponseBody().write(bytes); 

    }

}
