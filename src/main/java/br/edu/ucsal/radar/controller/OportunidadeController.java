package br.edu.ucsal.radar.controller;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.google.gson.JsonParseException;
import com.google.gson.JsonSyntaxException;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import br.edu.ucsal.radar.model.Oportunidade;
import br.edu.ucsal.radar.service.OportunidadeService;
import br.edu.ucsal.radar.service.ProfessorService;
import br.edu.ucsal.radar.util.Json;

/**
 * Rotas de vagas:
 *   GET  /api/oportunidades        -> lista (aceita ?tipo=&eixo=&curso=)
 *   GET  /api/oportunidades/{id}   -> detalhes de uma vaga
 *   POST /api/oportunidades        -> cadastra vaga (exige token Bearer de professor)
 */
public class OportunidadeController implements HttpHandler {

    private static final String BASE = "/api/oportunidades";

    private final OportunidadeService service;
    private final ProfessorService autenticacao;

    public OportunidadeController(OportunidadeService service, ProfessorService autenticacao) {
        this.service = service;
        this.autenticacao = autenticacao;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        try {
            String metodo = exchange.getRequestMethod();
            String caminho = exchange.getRequestURI().getPath();

            // sobra = o que vem depois de /api/oportunidades ("" ou "/5")
            String sobra = caminho.substring(BASE.length());
            if (sobra.endsWith("/")) {
                sobra = sobra.substring(0, sobra.length() - 1);
            }

            if (sobra.isEmpty()) {
                if (metodo.equals("GET")) {
                    listar(exchange);
                } else if (metodo.equals("POST")) {
                    cadastrar(exchange);
                } else {
                    responder(exchange, 405, Map.of("erro", "Método HTTP não permitido"));
                }
                return;
            }

            if (sobra.matches("/\\d+")) {
                if (metodo.equals("GET")) {
                    detalhar(exchange, Integer.parseInt(sobra.substring(1)));
                } else {
                    responder(exchange, 405, Map.of("erro", "Método HTTP não permitido"));
                }
                return;
            }

            responder(exchange, 404, Map.of("erro", "Rota não encontrada."));

        } catch (JsonSyntaxException e) {
            responder(exchange, 400, Map.of("erro", "JSON inválido."));
        } catch (IllegalArgumentException | JsonParseException e) {
            responder(exchange, 400, Map.of("erro", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            responder(exchange, 500, Map.of("erro", "Erro interno no servidor"));
        } finally {
            exchange.close();
        }
    }

    // GET /api/oportunidades
    private void listar(HttpExchange exchange) throws IOException {
        Map<String, String> filtros = lerQuery(exchange.getRequestURI().getRawQuery());
        List<Oportunidade> vagas = service.listar(
                filtros.get("tipo"), filtros.get("eixo"), filtros.get("curso"));
        responder(exchange, 200, vagas);
    }

    // GET /api/oportunidades/{id}
    private void detalhar(HttpExchange exchange, int id) throws IOException {
        Optional<Oportunidade> vaga = service.buscarPorId(id);
        if (vaga.isPresent()) {
            responder(exchange, 200, vaga.get());
        } else {
            responder(exchange, 404, Map.of("erro", "Vaga não encontrada."));
        }
    }

    // POST /api/oportunidades  (protegida)
    private void cadastrar(HttpExchange exchange) throws IOException {
        Integer professorId = professorLogado(exchange);
        if (professorId == null) {
            responder(exchange, 401, Map.of("erro", "Faça login como professor para cadastrar vagas."));
            return;
        }

        Oportunidade nova = Json.GSON.fromJson(
                new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8), Oportunidade.class);

        Oportunidade salva = service.cadastrar(nova, professorId);
        exchange.getResponseHeaders().set("Location", BASE + "/" + salva.getId());
        responder(exchange, 201, salva);
    }

    // Lê o cabeçalho "Authorization: Bearer <token>" e devolve o id do professor (ou null)
    private Integer professorLogado(HttpExchange exchange) {
        String cabecalho = exchange.getRequestHeaders().getFirst("Authorization");
        if (cabecalho == null || !cabecalho.startsWith("Bearer ")) {
            return null;
        }
        String token = cabecalho.substring("Bearer ".length()).trim();
        return autenticacao.tokenValido(token) ? autenticacao.getIdProfessor(token) : null;
    }

    // "?tipo=Monitoria&curso=ADS" -> {tipo=Monitoria, curso=ADS}
    private Map<String, String> lerQuery(String query) {
        Map<String, String> mapa = new java.util.HashMap<>();
        if (query == null || query.isBlank()) {
            return mapa;
        }
        for (String par : query.split("&")) {
            String[] kv = par.split("=", 2);
            String chave = java.net.URLDecoder.decode(kv[0], StandardCharsets.UTF_8);
            String valor = kv.length > 1 ? java.net.URLDecoder.decode(kv[1], StandardCharsets.UTF_8) : "";
            mapa.put(chave, valor);
        }
        return mapa;
    }

    private void responder(HttpExchange exchange, int status, Object corpo) throws IOException {
        byte[] bytes = Json.GSON.toJson(corpo).getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(status, bytes.length);
        exchange.getResponseBody().write(bytes);
    }
}
