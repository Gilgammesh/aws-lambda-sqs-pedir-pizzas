import { Context, APIGatewayProxyCallback, APIGatewayEvent, SQSEvent, DynamoDBStreamEvent } from 'aws-lambda';
import { uuid } from 'uuidv4';
import AWS from 'aws-sdk';

// Instanciamos el servicio de simple queue
const sqs = new AWS.SQS({ region: process.env.REGION });
const QUEUE_URL = process.env.PENDING_ORDER_QUEUE as string;

// Instanciamos el servicio de dynamo para documentos
const dynamo = new AWS.DynamoDB.DocumentClient();

// Enum de estado de orden
enum Status {
  READY_FOR_DELIVERY = 'ready for delivery',
  DELIVERED = 'delivered'
}
// Interface de Order
interface Order {
  orderId: string;
  nombre: string;
  direccion: string;
  pizzas: string[];
  status: string;
  fecha: Date;
}

// Función para hacer el pedido
export const hacerPedido = (event: APIGatewayEvent, context: Context, callback: APIGatewayProxyCallback) => {
  // Si existe un cuerpo
  if (event.body) {
    // Obtenemos el cuerpo de la petición
    const body = JSON.parse(event.body);

    // Generamos el id de forma aleatoria
    const orderId = uuid();

    // Definimos nuestra orden de pedido
    const order: Order = {
      orderId,
      nombre: body.nombre,
      direccion: body.direccion,
      pizzas: body.pizzas,
      status: Status.READY_FOR_DELIVERY,
      fecha: new Date()
    };

    // Definimos los parámetros que enviaremos a la cola
    const params: AWS.SQS.SendMessageRequest = {
      MessageBody: JSON.stringify(order),
      QueueUrl: QUEUE_URL
    };

    // Enviamos el mensaje a la cola y retornamos
    sqs.sendMessage(params, (err, data) => {
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
  } else {
    callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        message: 'No se ha proporcionado un cuerpo en la petición'
      })
    });
  }
};

export const prepararPedido = (event: SQSEvent, context: Context, callback: APIGatewayProxyCallback) => {
  console.log('Preparar pedido fue llamada');

  // Obtenemos el cuerpo de la petición (enviado en el mensaje SQS), que es la orden
  const body = JSON.parse(event.Records[0].body);

  // Definimos los parámetros del item a insertar
  const params: AWS.DynamoDB.DocumentClient.PutItemInput = {
    TableName: process.env.COMPLETED_ORDER_TABLE as string,
    Item: body
  };

  // Guardamos los parámetros en DynamoDB
  dynamo.put(params, (err, data) => {
    if (err) {
      callback(err);
    } else {
      console.log('Se guardaron los datos =>', data);
      callback();
    }
  });
};

export const enviarPedido = (event: DynamoDBStreamEvent, context: Context, callback: APIGatewayProxyCallback) => {
  console.log('Enviar pedido fue llamado');

  const record = event.Records[0];

  // Si el evento en la tabla es del tipo INSERT
  if (record.eventName === 'INSERT') {
    // Definimos los parámetro del item a actualizar
    const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: process.env.COMPLETED_ORDER_TABLE as string,
      Key: {
        orderId: record.dynamodb?.Keys?.orderId.S
      },
      ConditionExpression: 'attribute_exists(orderId)',
      UpdateExpression: 'set status = :v',
      ExpressionAttributeValues: {
        ':v': Status.DELIVERED
      },
      ReturnValues: 'ALL_NEW'
    };

    // Actualizamos los parámetros en DynamoDB
    dynamo.update(params, (err, data) => {
      if (err) {
        callback(err);
      } else {
        console.log('Order deliver =>', data.Attributes);
        callback();
      }
    });
  } else {
    callback();
  }
};
