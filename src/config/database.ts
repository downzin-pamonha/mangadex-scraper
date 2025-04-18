import mysql from 'mysql2/promise';
import { logger } from '../services/logger.service';
import config from './env';

const dbConfig = {
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database,
    port: 3306,
    connectTimeout: 15000, // Aumente para 15 segundos
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false, // Pode ser necessário para conexões externas
    },
};

const pool = mysql.createPool(dbConfig);

export async function createConnection() {
    try {
        const connection = await pool.getConnection();
        logger(`Conectado ao banco de dados em ${dbConfig.host}`, 'sucesso');

        await connection.query('SELECT 1');
        logger('Teste de conexão bem-sucedido', 'sucesso');

        return connection;
    } catch (error: any) {
        logger(`Falha ao conectar no MySQL: ${error.code || error.message}`, 'erro');
        logger(`Detalhes: Host=${dbConfig.host}, User=${dbConfig.user}`, 'erro');
        logger(`Verifique:`, 'erro');
        logger('- Se o servidor MySQL está acessível remotamente', 'erro');
        logger('- Se as credenciais estão corretas', 'erro');
        logger('- Se seu IP está autorizado', 'erro');

        throw error;
    }
}

export type Connection = mysql.PoolConnection;
