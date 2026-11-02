package br.edu.ucsal.radar;

import java.io.IOException;
import java.net.InetSocketAddress;

import com.sun.net.httpserver.HttpServer;

import br.edu.ucsal.radar.controller.OportunidadeController;
import br.edu.ucsal.radar.dao.OportunidadeDAO;
import br.edu.ucsal.radar.service.OportunidadeService;
import br.edu.ucsal.radar.service.ProfessorService;
import br.edu.ucsal.radar.util.ConexaoBD;
import br.edu.ucsal.radar.util.StaticFileHandler;

/**
 * Ponto de entrada: sobe o HttpServer nativo do Java em localhost:8080.
 * Cada dev registra o(s) seu(s) controller(s) na seção indicada abaixo.
 */
public class Main {
    public static void main(String[] args) {
        try {
            int porta = ConexaoBD.getPorta();
            HttpServer servidor = HttpServer.create(new InetSocketAddress(porta), 0);

            // Páginas e arquivos estáticos (contexto raiz; os /api/... abaixo têm prioridade
            // porque o HttpServer escolhe o contexto de prefixo mais longo)
            servidor.createContext("/", new StaticFileHandler());

            // ---- API: Oportunidades (Allan Gonçalves) ----
            ProfessorService autenticacao = new ProfessorService(); // valida o token Bearer
            OportunidadeService oportunidadeService = new OportunidadeService(new OportunidadeDAO());
            servidor.createContext("/api/oportunidades",
                    new OportunidadeController(oportunidadeService, autenticacao));

            // ---- API: Login, Interesses e CSV (Allan Maia) -> registrar aqui ----
            // servidor.createContext("/api/login", new LoginController());
            // servidor.createContext("/api/interesses", new InteresseController());
            // GET /api/oportunidades/{id}/inscritos e /exportar-csv: ver nota no README/PR

            servidor.setExecutor(null);
            servidor.start();
            System.out.println("Servidor iniciado em http://localhost:" + porta);

        } catch (IOException e) {
            System.out.println("Erro ao iniciar o servidor: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
