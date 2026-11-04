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

import br.edu.ucsal.radar.model.Interesse;
import br.edu.ucsal.radar.model.Oportunidade;
import br.edu.ucsal.radar.service.InteresseService;
import br.edu.ucsal.radar.service.OportunidadeService;
import br.edu.ucsal.radar.service.ProfessorService;
import br.edu.ucsal.radar.util.CsvWriter;
import br.edu.ucsal.radar.util.Json;

/**
 * Rotas de vagas:
 *   GET    /api/oportunidades        -> lista (aceita ?tipo=&eixo=&curso=)
 *   GET    /api/oportunidades/{id}   -> detalhes de uma vaga
 *   POST   /api/oportunidades        -> cadastra vaga (exige token Bearer de professor)
 *   PUT    /api/oportunidades/{id}   -> atualiza vaga existente (exige token Bearer do docente criador)
 *   DELETE /api/oportunidades/{id}   -> exclui vaga (exige token Bearer do docente criador)
 *   PATCH  /api/oportunidades/{id}   -> alterna status ABERTA/ENCERRADA (exige token Bearer do criador)
 */
public class OportunidadeController implements HttpHandler {

    private static final String BASE = "/api/oportunidades";

    private final OportunidadeService service;
    private final ProfessorService autenticacao;
    private final InteresseService interesseService;

    public OportunidadeController(OportunidadeService service, ProfessorService autenticacao) {
        this(service, autenticacao, new InteresseService());
    }

    // Ajuste: permite injetar InteresseService para atender aos inscritos e exportação CSV da vaga
    public OportunidadeController(OportunidadeService service, ProfessorService autenticacao,
                                 InteresseService interesseService) {
        this.service = service;
        this.autenticacao = autenticacao;
        this.interesseService = interesseService;
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
                switch (metodo) {
                    case "GET" -> listar(exchange);
                    case "POST" -> cadastrar(exchange);
                    default -> responder(exchange, 405, Map.of("erro", "Método HTTP não permitido"));
                }
                return;
            }

            if (sobra.matches("/\\d+")) {
                int id = Integer.parseInt(sobra.substring(1));
                switch (metodo) {
                    case "GET" -> detalhar(exchange, id);
                    case "PUT" -> atualizar(exchange, id);
                    case "DELETE" -> excluir(exchange, id);
                    case "PATCH" -> alternarStatus(exchange, id);
                    default -> responder(exchange, 405, Map.of("erro", "Método HTTP não permitido"));
                }
                return;
            }

            // Ajuste: PATCH ou POST /api/oportunidades/{id}/status para alternar status
            if (sobra.matches("/\\d+/status")) {
                int id = Integer.parseInt(sobra.substring(1).split("/")[0]);
                if (metodo.equals("PATCH") || metodo.equals("POST")) {
                    alternarStatus(exchange, id);
                } else {
                    responder(exchange, 405, Map.of("erro", "Método HTTP não permitido"));
                }
                return;
            }

            // Ajuste: GET /api/oportunidades/{id}/inscritos para consultar alunos inscritos da vaga
            if (sobra.matches("/\\d+/inscritos")) {
                if (metodo.equals("GET")) {
                    String[] partes = sobra.substring(1).split("/");
                    listarInscritos(exchange, Integer.parseInt(partes[0]));
                } else {
                    responder(exchange, 405, Map.of("erro", "Método HTTP não permitido"));
                }
                return;
            }

            // Ajuste: GET /api/oportunidades/{id}/exportar-csv usando CsvWriter com Java Streams API (bônus POOA)
            if (sobra.matches("/\\d+/exportar-csv")) {
                if (metodo.equals("GET")) {
                    String[] partes = sobra.substring(1).split("/");
                    exportarCsv(exchange, Integer.parseInt(partes[0]));
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
        } catch (SecurityException e) {
            responder(exchange, 403, Map.of("erro", e.getMessage()));
        } catch (Exception e) {
            // Log simplificado de erro
            System.err.println("Erro no OportunidadeController: " + e.getMessage());
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

    // GET /api/oportunidades/{id}/inscritos (Protegida: apenas o docente criador da vaga pode ver os inscritos)
    private void listarInscritos(HttpExchange exchange, int id) throws IOException {
        Integer professorId = professorLogado(exchange);
        if (professorId == null) {
            responder(exchange, 401, Map.of("erro", "Faça login como professor para acessar os inscritos."));
            return;
        }

        Optional<Oportunidade> vaga = service.buscarPorId(id);
        if (vaga.isEmpty()) {
            responder(exchange, 404, Map.of("erro", "Vaga não encontrada."));
            return;
        }

        // Validação estrita de autoria: nenhum docente pode visualizar os inscritos de outro
        if (vaga.get().getProfessorId() != null && !vaga.get().getProfessorId().equals(professorId)) {
            responder(exchange, 403, Map.of("erro", "Acesso restrito: Você não possui autorização para visualizar inscritos de uma oportunidade cadastrada por outro professor."));
            return;
        }

        List<Interesse> inscritos = interesseService.listarPorOportunidade(id);
        responder(exchange, 200, inscritos);
    }

    // Ajuste (Segurança / LGPD): GET /api/oportunidades/{id}/exportar-csv exige token Bearer e autoria da vaga
    // Processa a lista com CsvWriter (Java Streams) e devolve para download
    private void exportarCsv(HttpExchange exchange, int id) throws IOException {
        Integer professorId = professorLogado(exchange);
        if (professorId == null) {
            responder(exchange, 401, Map.of("erro", "Acesso restrito: Faça login como professor para exportar o relatório de candidatos."));
            return;
        }

        Optional<Oportunidade> vaga = service.buscarPorId(id);
        if (vaga.isEmpty()) {
            responder(exchange, 404, Map.of("erro", "Vaga não encontrada."));
            return;
        }

        if (vaga.get().getProfessorId() != null && !vaga.get().getProfessorId().equals(professorId)) {
            responder(exchange, 403, Map.of("erro", "Acesso restrito: Você não tem autorização para exportar candidaturas de outro professor."));
            return;
        }

        List<Interesse> inscritos = interesseService.listarPorOportunidade(id);
        String csv = CsvWriter.gerar(inscritos);

        // Prefixo BOM \uFEFF para correta exibição de acentos no Microsoft Excel
        byte[] bytes = ("\uFEFF" + csv).getBytes(StandardCharsets.UTF_8);

        exchange.getResponseHeaders().set("Content-Type", "text/csv; charset=UTF-8");
        exchange.getResponseHeaders().set("Content-Disposition",
                "attachment; filename=\"inscritos_vaga_" + id + ".csv\"");
        exchange.sendResponseHeaders(200, bytes.length);
        exchange.getResponseBody().write(bytes);
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

    // Ajuste (Gestão de Vagas): PUT /api/oportunidades/{id} para atualizar dados da vaga com validação estrita de autoria
    private void atualizar(HttpExchange exchange, int id) throws IOException {
        Integer professorId = professorLogado(exchange);
        if (professorId == null) {
            responder(exchange, 401, Map.of("erro", "Faça login como professor para atualizar vagas."));
            return;
        }

        Oportunidade dados = Json.GSON.fromJson(
                new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8), Oportunidade.class);

        Oportunidade atualizada = service.atualizar(id, dados, professorId);
        responder(exchange, 200, atualizada);
    }

    // Ajuste (Gestão de Vagas): DELETE /api/oportunidades/{id} para excluir vaga e candidaturas associadas
    private void excluir(HttpExchange exchange, int id) throws IOException {
        Integer professorId = professorLogado(exchange);
        if (professorId == null) {
            responder(exchange, 401, Map.of("erro", "Faça login como professor para excluir vagas."));
            return;
        }

        service.excluir(id, professorId);
        responder(exchange, 200, Map.of("mensagem", "Oportunidade #" + id + " excluída com sucesso."));
    }

    // Ajuste (Gestão de Vagas): PATCH /api/oportunidades/{id} ou /status para alternar entre ABERTA e ENCERRADA
    private void alternarStatus(HttpExchange exchange, int id) throws IOException {
        Integer professorId = professorLogado(exchange);
        if (professorId == null) {
            responder(exchange, 401, Map.of("erro", "Faça login como professor para alterar o status da vaga."));
            return;
        }

        Oportunidade atualizada = service.alternarStatus(id, professorId);
        responder(exchange, 200, atualizada);
    }

    // Ajuste (Segurança): Lê o token do cabeçalho "Authorization: Bearer <token>" ou query string "?token=<token>"
    private Integer professorLogado(HttpExchange exchange) {
        String cabecalho = exchange.getRequestHeaders().getFirst("Authorization");
        String token = null;
        if (cabecalho != null && cabecalho.startsWith("Bearer ")) {
            token = cabecalho.substring("Bearer ".length()).trim();
        } else {
            Map<String, String> query = lerQuery(exchange.getRequestURI().getRawQuery());
            if (query.containsKey("token")) {
                token = query.get("token");
            }
        }
        return (token != null && autenticacao.tokenValido(token)) ? autenticacao.getIdProfessor(token) : null;
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
