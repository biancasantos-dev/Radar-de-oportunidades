package br.edu.ucsal.radar.util;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import br.edu.ucsal.radar.model.Interesse;

public class CsvWriter {

    private static final String CABECALHO = "nome,email,matricula,curso,semestre,justificativa";

    // Monta o CSV inteiro: cabeçalho + uma linha por inscrito (protegido contra lista nula)
    public static String gerar(List<Interesse> inscritos) {
        Stream<Interesse> streamInscritos = (inscritos == null) ? Stream.empty() : inscritos.stream();
        return Stream.concat(Stream.of(CABECALHO), streamInscritos.map(CsvWriter::linha))
                .collect(Collectors.joining("\n"));
    }

    // Uma linha: os campos do inscrito separados por vírgula
    private static String linha(Interesse i) {
        return Stream.of(i.getNome(), i.getEmail(), i.getMatricula(),
                         i.getCurso(), i.getSemestre(), i.getJustificativa())
                .map(CsvWriter::escapar)
                .collect(Collectors.joining(","));
    }

    // Se o texto tiver vírgula, aspas ou quebra de linha, precisa ir entre aspas.
    // Ajuste (Segurança): Desarma fórmulas do Excel (Formula Injection) iniciadas com =, +, - ou @ prefixando com apóstrofo
    private static String escapar(String valor) {
        if (valor == null) return "";
        if (valor.startsWith("=") || valor.startsWith("+") || valor.startsWith("-") || valor.startsWith("@")) {
            valor = "'" + valor;
        }
        if (valor.contains(",") || valor.contains("\"") || valor.contains("\n") || valor.contains("\r")) {
            return "\"" + valor.replace("\"", "\"\"") + "\"";
        }
        return valor;
    }
}
