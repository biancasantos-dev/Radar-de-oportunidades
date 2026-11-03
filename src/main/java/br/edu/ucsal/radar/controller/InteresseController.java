package br.edu.ucsal.radar.controller;

import br.edu.ucsal.radar.service.InteresseService;
import br.edu.ucsal.radar.model.Interesse;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import com.sun.net.httpserver.HttpExchange; //facilita o acesso as informações das requisições
import com.sun.net.httpserver.HttpHandler; //comportamento do servidor

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Map;

public class InteresseController implements HttpHandler {

    // POST /api/interesses: Recebe os dados da candidatura do aluno e grava no
    // banco.

    private final InteresseService service;

    private final Gson gson = new Gson();

    public InteresseController() {
        this(new InteresseService());
    }

    // Ajuste: permite injetar a instância de InteresseService configurada no Main
    public InteresseController(InteresseService service) {
        this.service = service;
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
                    interesse = gson.fromJson(new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8), Interesse.class);
                    //IbnputStreamReader vai interpretar os bytes do body da requisição como texto UTf_8
                    //O fromJson vai vai converter esse JSON em um objeto "Interesse"

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

            // Ajuste: suporte a GET para listar todas as inscrições caso necessário
            if (metodo.equals("GET")) {
                responder(exchange, 200, service.listar());
                return;
            }

            responder(exchange, 405, Map.of("erro", "Método HTTP não permitido"));
        } catch (IllegalArgumentException e) {
            if (exchange.getResponseCode() == -1) { //ve se foi enviada uma resposta. (-1) significa que não foi
                responder(exchange, 400, Map.of("erro", e.getMessage()));
                //vai responder com a mensagem de excecao do InteresseService
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

    private void responder(HttpExchange exchange, int status, Object corpo) throws IOException {

        String json = gson.toJson(corpo); //transforma o objeto do Map.of em json

        byte[] bytes = json.getBytes(StandardCharsets.UTF_8); // converte Json para bytes

        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8"); //informa que o conteudo da resposta esta em json UTF_8

        exchange.sendResponseHeaders(status, bytes.length); // coloca no cabecalho o status e o tamanho do corpo

        exchange.getResponseBody().write(bytes); // nesse metodo fica o OutputStream(resposta)

    }

}
