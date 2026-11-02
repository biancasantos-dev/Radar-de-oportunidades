package br.edu.ucsal.radar.util;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonParseException;
import com.google.gson.TypeAdapter;
import com.google.gson.stream.JsonReader;
import com.google.gson.stream.JsonToken;
import com.google.gson.stream.JsonWriter;

import br.edu.ucsal.radar.model.TipoOportunidade;

/**
 * Gson configurado para falar a mesma "língua" do front:
 * - datas como "15/11/2026" (dd/MM/yyyy); na entrada aceita também "2026-11-15"
 * - tipo da vaga como texto ("Iniciação Científica"), e não como nome do enum
 */
public class Json {

    private static final DateTimeFormatter BR = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public static final Gson GSON = new GsonBuilder()
            .registerTypeAdapter(LocalDate.class, new DataAdapter())
            .registerTypeAdapter(TipoOportunidade.class, new TipoAdapter())
            .create();

    private static class DataAdapter extends TypeAdapter<LocalDate> {
        @Override
        public void write(JsonWriter out, LocalDate data) throws IOException {
            if (data == null) {
                out.nullValue();
            } else {
                out.value(data.format(BR));
            }
        }

        @Override
        public LocalDate read(JsonReader in) throws IOException {
            if (in.peek() == JsonToken.NULL) {
                in.nextNull();
                return null;
            }
            String texto = in.nextString().trim();
            if (texto.isEmpty()) {
                return null;
            }
            try {
                return texto.contains("/") ? LocalDate.parse(texto, BR) : LocalDate.parse(texto);
            } catch (DateTimeParseException e) {
                throw new JsonParseException("Data inválida: " + texto + " (use dd/MM/aaaa)");
            }
        }
    }

    private static class TipoAdapter extends TypeAdapter<TipoOportunidade> {
        @Override
        public void write(JsonWriter out, TipoOportunidade tipo) throws IOException {
            if (tipo == null) {
                out.nullValue();
            } else {
                out.value(tipo.getRotulo());
            }
        }

        @Override
        public TipoOportunidade read(JsonReader in) throws IOException {
            if (in.peek() == JsonToken.NULL) {
                in.nextNull();
                return null;
            }
            try {
                return TipoOportunidade.deRotulo(in.nextString());
            } catch (IllegalArgumentException e) {
                throw new JsonParseException(e.getMessage());
            }
        }
    }
}
