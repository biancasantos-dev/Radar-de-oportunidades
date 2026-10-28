package br.edu.ucsal.radar.util;
import com.sun.net.httpserver.HttpExchange;
import java.io.*;

public class StaticFileHandler implements com.sun.net.httpserver.HttpHandler {
    // aqui preciso implementar o método handle que é o método que vai tratar as requisições que chegarem no servidor
   @Override 
   public void handle(HttpExchange exchange) throws IOException {

    String caminho = exchange.getRequestURI().getPath();
    if (caminho.equals("/")){
        caminho = "/index.html";
    }
    else if (caminho.equals("/sobre")){
        caminho = "/sobre.html";
    }

    else if (caminho.equals("/contato")){
        caminho = "/contato.html";
    }
    else if (caminho.equals("/login")){
        caminho = "/login.html";
    }

    else if (caminho.equals("/cadastro")){
        caminho = "/cadastro-professor.html";
    }
    else if (caminho.equals("/painel")){
        caminho = "/painel.html";
    }

    else if (caminho.equals("/inscritos")){
        caminho = "/inscritos.html";
    }

    else if (caminho.equals("/oportunidade")){
        caminho = "/oportunidade.html";
    }
   

    InputStream is = getClass().getResourceAsStream("/web" + caminho);

    if (is == null) {
        String resposta = "404 (Not Found)";
        exchange.sendResponseHeaders(404, resposta.length());
        OutputStream os = exchange.getResponseBody();
        os.write(resposta.getBytes());
        os.close();
        return;
    }

    byte[] bytes = is.readAllBytes();

    if (caminho.endsWith(".html")) {
        exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
    } else if (caminho.endsWith(".css")) {
        exchange.getResponseHeaders().set("Content-Type", "text/css; charset=UTF-8");
    } else if (caminho.endsWith(".js")) {
        exchange.getResponseHeaders().set("Content-Type", "application/javascript; charset=UTF-8");
    } else if (caminho.endsWith(".png")) {
        exchange.getResponseHeaders().set("Content-Type", "image/png");
    } else if (caminho.endsWith(".svg")) {
        exchange.getResponseHeaders().set("Content-Type", "image/svg+xml");
    }

    exchange.sendResponseHeaders(200, bytes.length);
    OutputStream os = exchange.getResponseBody();
    os.write(bytes);
    os.close();
}
}