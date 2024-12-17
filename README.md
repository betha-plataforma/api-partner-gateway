# Documentação **partner-gateway**

## **Índice**

- [Documentação **partner-gateway**](#documentação-partner-gateway)
  - [**Índice**](#índice)
  - [**Visão Geral**](#visão-geral)
  - [**Funcionamento Geral**](#funcionamento-geral)
  - [**Execução**](#execução)
  - [**Testes**](#testes)

---

## **Visão Geral**

O projeto **partner-gateway** é uma aplicação desenvolvida **Node.js** que atua como um gateway/proxy para integrações com parceiros. Sua principal funcionalidade é:

---

## **Funcionamento Geral**

A aplicação atua como um gateway/proxy para integrações com parceiros, seguindo o fluxo abaixo:

- Receber requisições HTTP do gateway configuradas no [Studio Aplicações](fixme).
- Validar o **JWT** da sessão contendo informações de contexto (`entityId`, `databaseId`, e `systemId`).
- Solicitar credenciais e uma URI para redirecionamento aos serviços de autenticação de parceiro.
- Redirecionar o tráfego para o sistema do parceiro com as informações validadas.
- Cachear as requisições para o parceiro e validação do JWT para garantir performance.

TODO: Adicionar diagrama de sequência.

---

## **Execução**

Siga os passos abaixo para configurar o projeto localmente:

Requisitos:
```bash
node v22
npm v10
```

1. Instale as dependências do projeto:

   ```bash
   npm install
   ```

2. **Build e Execução em Produção**:

   ```bash
   npm run build
   npm start
   ```
---

## **Testes**

**O projeto utiliza o Jest e o Supertest para realização de testes unitários e de integração.**

1. Execute os testes:

   ```bash
   npm test
   ```

---
