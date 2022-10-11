# AWS Serverless Lambda - Nodejs - Typescript - Uuid - SQS (Simple Service Queue) - DynamoDB

Función Lambda del tipo Rest Api. Usando el framework Serverless, con Nodejs, Typescript, uuid, SQS, DynamoDB y DynamoDB Stream.

## Lógica

- Realizar un pedido de pizzas, con una petición del tipo post.
- Esto invocará el lambda function "hacerPedido", que generará una orden.
- Enviaremos el la orden del pedido por parámetros a una Cola (Queue) usando SQS.
- La información se almacenará en la Cola "PendingOrdersQueue" declarada en nuestros recursos en `serverless.yml`
- Creamos un lambda function "prepararPedido" que escuchará la cola "PendingOrdersQueue".
- Obtenemos los datos de la orden y almacenamos en DynamoDB en la tabla "CompletedOrderTable"
- Al almacenar por eventos de DunamoDB Streams cambiaremos el estado de la orden a delivered.
- Para finalizar crearemos otra Lambda para consultar el estado del pedido con el número de orden.

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

## Peticiones

En la petición POST debemos enviar el cuerpo con la siguiente estructura:

**Body**:

```json
{
  "nombre": "Carlos Santander",
  "direccion": "Av. Silicon Valley 123",
  "pizzas": ["americana", "hawaiana", "carnivora"]
}
```

**Headers**: Content-Type: application/json

## Plugins

> **serverless-plugin-typescript**: Soporte de typescript para lambdas
