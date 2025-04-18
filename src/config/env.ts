import dotenv from 'dotenv';

dotenv.config();

interface Config {
    database: {
        host: string;
        user: string;
        password: string;
        database: string;
    };
    rateLimiting: {
        apiDelay: number;
        chapterDelay: number;
        pageDelay: number;
        mangaDelay: number;
        batchDelay: number;
    };
    mangaParams: {
        mangaLimit: number;
        maxMangas: number;
        minChapters: number;
    };
}

const config: Config = {
    database: {
        host: process.env.DB_HOST || '',
        user: process.env.DB_USER || '',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || '',
    },
    rateLimiting: {
        apiDelay: parseInt(process.env.API_DELAY || '1000'),
        chapterDelay: parseInt(process.env.CHAPTER_DELAY || '500'),
        pageDelay: parseInt(process.env.PAGE_DELAY || '300'),
        mangaDelay: parseInt(process.env.MANGA_DELAY || '2000'),
        batchDelay: parseInt(process.env.BATCH_DELAY || '5000'),
    },
    mangaParams: {
        mangaLimit: parseInt(process.env.MANGA_LIMIT || '100'),
        maxMangas: parseInt(process.env.MAX_MANGAS || '10000'),
        minChapters: parseInt(process.env.MIN_CHAPTERS || '5'),
    },
};

export default config;
