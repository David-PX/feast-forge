import * as winston from 'winston';
// import WinstonCloudWatch from 'winston-cloudwatch';

// const {
//   AWS_ACCESS_KEY_ID,
//   AWS_SECRET_ACCESS_KEY,
//   AWS_REGION,
//   LOG_GROUP_NAME,
//   LOG_STREAM_NAME,
// } = process.env;

// Configuración de Winston para enviar los logs a CloudWatch
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console(), // Para ver los logs en la consola local
    // new WinstonCloudWatch({
    //   logGroupName: LOG_GROUP_NAME,
    //   logStreamName: LOG_STREAM_NAME,
    //   awsRegion: AWS_REGION,
    //   awsAccessKeyId: AWS_ACCESS_KEY_ID,
    //   awsSecretKey: AWS_SECRET_ACCESS_KEY,
    // }),
  ],
});

export default logger;
