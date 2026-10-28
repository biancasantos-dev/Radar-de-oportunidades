package br.edu.ucsal.radar;

import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.io.IOException;
import br.edu.ucsal.radar.util.StaticFileHandler;

public class Main {
    public static void main(String[] args) {
        
        try{
            // to criando a porta que vai ser escutada pelo servidor


            int porta = 8080;
            HttpServer servidor = HttpServer.create(new InetSocketAddress(porta), 0);
            // aqui vou criar um contexto para o servidor que no caso vai ser a raiz do servidor e vou passar o StaticFileHandler que é a classe que vai tratar as requisições
            servidor.createContext("/" , new StaticFileHandler());
            servidor.setExecutor(null);
            servidor.start();
            System.out.println("Servidor iniciado na porta " + porta);



        }
        catch(IOException e){
            //se der merda
            System.out.println("Erro ao iniciar o servidor: " + e.getMessage());
            e.printStackTrace();

        }
    }
}