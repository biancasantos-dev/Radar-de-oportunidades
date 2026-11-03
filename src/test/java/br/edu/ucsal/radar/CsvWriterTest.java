package br.edu.ucsal.radar;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;

import br.edu.ucsal.radar.model.Interesse;
import br.edu.ucsal.radar.util.CsvWriter;

/**
 * Testes unitários para o gerador de planilhas CSV com Java Streams.
 */
public class CsvWriterTest {

    @Test
    void gerarCsvComCabecalhoELinhas() {
        Interesse i1 = new Interesse("Lucas Silveira", "lucas@ucsal.edu.br", "2023101",
                "Direito", "5", "Interesse em pesquisa", 1);
        Interesse i2 = new Interesse("Mariana Alencar", "mariana@ucsal.edu.br", "2023102",
                "ADS", "4", "Quero atuar no laboratório, com dedicação.", 1);

        String csv = CsvWriter.gerar(List.of(i1, i2));

        assertTrue(csv.startsWith("nome,email,matricula,curso,semestre,justificativa"));
        assertTrue(csv.contains("Lucas Silveira"));
        assertTrue(csv.contains("lucas@ucsal.edu.br"));
        assertTrue(csv.contains("Mariana Alencar"));
        // Valida escape de vírgula no campo justificativa
        assertTrue(csv.contains("\"Quero atuar no laboratório, com dedicação.\""));
    }

    @Test
    void gerarCsvComListaVaziaRetornaApenasCabecalho() {
        String csv = CsvWriter.gerar(List.of());
        assertEquals("nome,email,matricula,curso,semestre,justificativa", csv.trim());
    }
}
