package br.edu.ucsal.radar.controller;

import br.edu.ucsal.radar.service.ProfessorService;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Map;

public class LoginController implements HttpHandler {

    // Validar credenciais, confere senha e retorna o token de acesso Bearer

    private final ProfessorService service = new ProfessorService();

    private final Gson gson = new Gson();

    private static class DadosLogin {
        String email;
        String senha;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
            try {

                String metodo = exchange.getRequestMethod();
                String caminho = exchange.getRequestURI().getPath();

                if (!caminho.equals("/login")) { //TODO:verificar depois se no front ta assim
                    responder(exchange, 404, Map.of("erro", "Rota não encontrada."));
                    return;
                };

                if (metodo.equals("POST")) {

                    String login;
                    String senha;
                    Integer token;

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

                    token = service.autenticar(email.trim(), senha); //TODO: metodo "autenticar()" precisa ser implementado no ProfessorService

                    // Se não houver token, as credenciais são inválidas.
                    if (token == null) {
                        responder(exchange, 401, Map.of("erro", "E-mail ou senha inválidos."));
                        return;
                    }

                    // Retorna o token de acesso.
                    responder(exchange, 200, Map.of("mensagem", "Login realizado com sucesso.", "token", token, "tipo", "Bearer"));


                }

                responder(exchange, 405, Map.of("erro", "Método HTTP não permitido"));

            } catch (Exception e) {
                e.printStackTrace();

                if (exchange.getResponseCode() == -1) {
                    responder(exchange, 500, Map.of("erro", "Erro interno no servidor"));
                }

            } finally {
                exchange.close();
            }
    }

    private void responder(HttpExchange exchange, int status, Object corpo) throws IOException {

        String json = gson.toJson(corpo); 

        byte[] bytes = json.getBytes(StandardCharsets.UTF_8); 

        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8"); 

        exchange.sendResponseHeaders(status, bytes.length); 

        exchange.getResponseBody().write(bytes); 

    }

}
