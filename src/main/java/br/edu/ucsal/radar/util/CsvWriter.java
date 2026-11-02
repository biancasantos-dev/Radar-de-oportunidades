package br.edu.ucsal.radar.util;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import br.edu.ucsal.radar.model.Interesse;

public class CsvWriter {

    private static final String CABECALHO = "nome,email,matricula,curso,semestre,justificativa";

    // Monta o CSV inteiro: cabeçalho + uma linha por inscrito
    public static String gerar(List<Interesse> inscritos) {
        return Stream.concat(Stream.of(CABECALHO), inscritos.stream().map(CsvWriter::linha))//TRansforma cada aluno numa linha de texto
                .collect(Collectors.joining("\n")); //Coloca as partes separadas por quebra de linha
    }

    // Uma linha: os campos do inscrito separados por vírgula
    private static String linha(Interesse i) {
        return Stream.of(i.getNome(), i.getEmail(), i.getMatricula(),
                         i.getCurso(), i.getSemestre(), i.getJustificativa())
                .map(CsvWriter::escapar)
                .collect(Collectors.joining(",")); //Coloca as partes separadas por quebra de linha
    }

    // Se o texto tiver vírgula, aspas ou quebra de linha, precisa ir entre aspas
    private static String escapar(String valor) {
        if (valor == null) return "";
        if (valor.contains(",") || valor.contains("\"") || valor.contains("\n")) {
            return "\"" + valor.replace("\"", "\"\"") + "\"";
        }
        return valor;
    }
}