package br.edu.ucsal.radar.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

/**
 * Conexão JDBC com o PostgreSQL. URL, usuário e senha NÃO ficam no código:
 * vêm do arquivo application.properties (copie o application.properties.example).
 * Lê pelo classpath, então funciona no editor e dentro do .jar.
 */
public class ConexaoBD {

    private static final Properties CONFIG = carregar();

    private static Properties carregar() {
        Properties p = new Properties();

        // Ajuste: valores padrão de contingência caso o arquivo ainda não tenha sido configurado (evita que o servidor caia na inicialização)
        p.setProperty("server.port", "8080");
        p.setProperty("db.url", "jdbc:postgresql://localhost:5432/radar_oportunidades");
        p.setProperty("db.user", "postgres");
        p.setProperty("db.password", "postgres");

        // Ajuste: tenta ler application.properties externo primeiro (na pasta em que o JAR foi executado)
        File externo = new File("application.properties");
        if (externo.exists()) {
            try (InputStream is = new FileInputStream(externo)) {
                p.load(is);
                System.out.println("Configurações carregadas do application.properties externo.");
                return p;
            } catch (IOException e) {
                System.err.println("Aviso: falha ao ler application.properties externo: " + e.getMessage());
            }
        }

        // Lê pelo classpath (quando o arquivo for colocado dentro de src/main/resources)
        try (InputStream is = ConexaoBD.class.getResourceAsStream("/application.properties")) {
            if (is != null) {
                p.load(is);
                System.out.println("Configurações carregadas do classpath (/application.properties).");
                return p;
            }
        } catch (IOException e) {
            throw new IllegalStateException("Erro ao ler application.properties", e);
        }

        // Se não achou arquivo nem externo nem interno, prossegue com os valores padrão acima sem travar o sistema
        System.out.println("Aviso: application.properties não encontrado. Usando porta 8080 e banco local padrão.");
        return p;
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(
                CONFIG.getProperty("db.url"),
                CONFIG.getProperty("db.user"),
                CONFIG.getProperty("db.password"));
    }

    // Porta do servidor (server.port); usa 8080 se não estiver configurada
    public static int getPorta() {
        return Integer.parseInt(CONFIG.getProperty("server.port", "8080").trim());
    }
}
