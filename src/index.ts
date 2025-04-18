import { processAllMangas } from './services/database.service';

async function main() {
    try {
        await processAllMangas();
    } catch (error) {
        console.error('Erro na execução do script:', error);
    }
}

main();
