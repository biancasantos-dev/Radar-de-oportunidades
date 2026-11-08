package br.edu.ucsal.radar;

import java.io.IOException;
import java.net.InetSocketAddress;

import com.sun.net.httpserver.HttpServer;

import br.edu.ucsal.radar.controller.InteresseController;
import br.edu.ucsal.radar.controller.LoginController;
import br.edu.ucsal.radar.controller.OportunidadeController;
import br.edu.ucsal.radar.dao.OportunidadeDAO;
import br.edu.ucsal.radar.service.InteresseService;
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
            InteresseService interesseService = new InteresseService();

            // Ajuste: repassando interesseService para OportunidadeController atender às rotas de inscritos e CSV da vaga
            servidor.createContext("/api/oportunidades",
                    new OportunidadeController(oportunidadeService, autenticacao, interesseService));

            // ---- API: Login, Interesses e CSV (Allan Maia) -> registrar aqui ----
            // Ajuste: controllers registrados para permitir autenticação e inscrição reais
            // Ajuste (Segurança): repassando autenticacao para InteresseController proteger a consulta de candidaturas
            servidor.createContext("/api/login", new LoginController(autenticacao));
            servidor.createContext("/api/interesses", new InteresseController(interesseService, autenticacao));
            // GET /api/oportunidades/{id}/inscritos e /exportar-csv: implementados no OportunidadeController

            servidor.setExecutor(null);
            servidor.start();
            System.out.println("Servidor iniciado em http://localhost:" + porta);

        } catch (IOException e) {
            System.err.println("Erro ao iniciar o servidor: " + e.getMessage());
        }
    }
}