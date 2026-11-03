package br.edu.ucsal.radar.util;

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
        try (InputStream is = ConexaoBD.class.getResourceAsStream("/application.properties")) {
            if (is == null) {
                throw new IllegalStateException(
                    "Arquivo application.properties não encontrado. Copie src/main/resources/"
                  + "application.properties.example para application.properties e ajuste a senha do banco.");
            }
            p.load(is);
        } catch (IOException e) {
            throw new IllegalStateException("Erro ao ler application.properties", e);
        }
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
