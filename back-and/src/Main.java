package com.exemplo.crudprodutos; // Use o nome do pacote do seu projeto

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Main {

    public static void main(String[] args) {
        // Esta linha inicializa o Spring Boot e liga o servidor web
        SpringApplication.run(Main.class, args);

        System.out.println("Servidor do Controle de Produtos rodando com sucesso na porta 8080!");
    }
}