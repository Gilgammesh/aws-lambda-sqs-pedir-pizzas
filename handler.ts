import { Context, APIGatewayProxyCallback, APIGatewayEvent } from 'aws-lambda';
import { uuid } from 'uuidv4';
import AWS from 'aws-sdk';

const sqs = new AWS.SQS({ region: process.env.REGION });
const QUEUE_URL = process.env.PENDING_ORDER_QUEUE;

// Función para hacer el pedido
export const hacerPedido = (event: APIGatewayEvent, context: Context, callback: APIGatewayProxyCallback) => {
  console.log('HacerPedido fue llamada');

  // Generamos un número de orden aleatorio
  const orderId = uuid();

  // Definimo los parámetros que enviaremos a la cola
  const params = {
    MessageBody: JSON.stringify({ orderId }),
    QueueUrl: QUEUE_URL
  } as AWS.SQS.SendMessageRequest;

  // Enviamos el mensaje a la cola y retornamos
  sqs.sendMessage(params, function (err, data) {
    if (err) {
      callback(null, {
        statusCode: 500,
        body: JSON.stringify(err)
      });
    } else {
      const message = {
        orderId,
        messageId: data.MessageId
      };
      callback(null, {
        statusCode: 200,
        body: JSON.stringify(message)
      });
    }
  });
};

export const prepararPedido = (event: APIGatewayEvent, context: Context, callback: APIGatewayProxyCallback) => {
  console.log('Preparar pedido fue llamada');

  // Obtenemos el orderId del cuerpo (enviado en el mensaje SQS)
  console.log('orderId =>', event.body);
  callback();
};
