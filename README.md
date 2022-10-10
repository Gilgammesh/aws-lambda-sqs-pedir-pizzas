# AWS Serverless Lambda - Nodejs - Typescript - SQS (Simple Service Queue) - Uuid

Función Lambda del tipo Rest Api. Usando el framework Serverless, con Nodejs, Typescript, uuid y SQS.

## Lógica

- Realizar un pedido de pizzas, con una petición del tipo post.
- Esto invocará el lambda function "hacerPedido", que generará una orden.
- Enviaremos el Id de la orden por parámetros a una Cola (Queue) usando SQS.
- La información se almacenará en la Cola "PendingOrdersQueue" declarada en nuestros recursos en `serverless.yml`
- Creamos un lambda function "prepararPedido" que escuchará la cola "PendingOrdersQueue".
- Obtenemos el Id de la orden y lo mostramos en consola.

## Consideraciones Previas

Necesitaremos tener instaladas en nuestra máquina local:

> **Nodejs**: versión 16.X (de preferencia la versión LTS Gallium 16.17.1)

> **Serverless**: Framework Core versión 3.2 ó superior y SDK versión 4.3 ó superior

## Instalación

Instalar dependencias del proyecto y de desarrollo:

```sh
npm install
```

```sh
npm install -D
```

## Despliegue

Ejecutamos el script

```sh
npm run deploy
```

Que es equivalente al script

```sh
serverless deploy
```

## Plugins

> **serverless-plugin-typescript**: Soporte de typescript para lambdas
