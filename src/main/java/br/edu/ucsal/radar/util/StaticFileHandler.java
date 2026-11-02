package br.edu.ucsal.radar.util;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

/**
 * Entrega os arquivos da pasta web/ (que o Maven copia para dentro do classpath/.jar).
 * Lê com getResourceAsStream, então funciona tanto no editor quanto no Fat JAR.
 */
public class StaticFileHandler implements HttpHandler {

    // URLs "bonitas" -> arquivo real dentro de web/
    private static final Map<String, String> ATALHOS = Map.of(
            "/", "/index.html",
            "/sobre", "/sobre.html",
            "/login", "/login.html",
            "/cadastro", "/cadastro-professor.html",
            "/painel", "/painel.html",
            "/inscritos", "/inscritos.html",
            "/oportunidade", "/oportunidade.html",
            "/detalhe", "/detalhe.html");

    private static final Map<String, String> TIPOS = Map.of(
            ".html", "text/html; charset=UTF-8",
            ".css", "text/css; charset=UTF-8",
            ".js", "application/javascript; charset=UTF-8",
            ".json", "application/json; charset=UTF-8",
            ".svg", "image/svg+xml",
            ".png", "image/png",
            ".jpg", "image/jpeg",
            ".webp", "image/webp",
            ".ico", "image/x-icon",
            ".woff2", "font/woff2");

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        try {
            String metodo = exchange.getRequestMethod();
            if (!metodo.equals("GET") && !metodo.equals("HEAD")) {
                responderTexto(exchange, 405, "405 (Method Not Allowed)");
                return;
            }

            String caminho = exchange.getRequestURI().getPath();

            // Segurança: não deixa sair da pasta web/
            if (caminho.contains("..") || caminho.contains("\\")) {
                responderTexto(exchange, 400, "400 (Bad Request)");
                return;
            }

            caminho = ATALHOS.getOrDefault(caminho, caminho);

            byte[] bytes;
            try (InputStream is = getClass().getResourceAsStream("/web" + caminho)) {
                if (is == null) {
                    responderTexto(exchange, 404, "404 (Not Found)");
                    return;
                }
                bytes = is.readAllBytes();
            }

            exchange.getResponseHeaders().set("Content-Type", tipoDe(caminho));

            if (metodo.equals("HEAD")) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }

            exchange.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        } finally {
            exchange.close();
        }
    }

    private String tipoDe(String caminho) {
        for (Map.Entry<String, String> e : TIPOS.entrySet()) {
            if (caminho.endsWith(e.getKey())) {
                return e.getValue();
            }
        }
        return "application/octet-stream";
    }

    private void responderTexto(HttpExchange exchange, int status, String texto) throws IOException {
        byte[] bytes = texto.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "text/plain; charset=UTF-8");
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }
}
