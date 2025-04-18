import { setTimeout as sleep } from 'timers/promises';
import { MangaData, MangaDetails, Author, Chapter } from '../interfaces/api.interfaces';
import { logger } from './logger.service';
import config from '../config/env';

export async function fetchWithRetry(
    url: string,
    options: any = {},
    retries: number = 3,
    delay: number = config.rateLimiting.apiDelay
): Promise<any> {
    try {
        await sleep(delay);
        const response = await fetch(url, options);

        if (response.status === 429) {
            if (retries > 0) {
                const retryAfter = parseInt(response.headers.get('Retry-After') || '5');
                logger(
                    `Rate limit atingido. Tentando novamente em ${retryAfter} segundos...`,
                    'erro'
                );
                await sleep(retryAfter * 1000);
                return fetchWithRetry(url, options, retries - 1, delay);
            }
            throw new Error('Número máximo de tentativas excedido para erro 429');
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error: any) {
        logger(`Erro na requisição para ${url}: ${error.message}`, 'erro');
        if (retries > 0) {
            await sleep(2000);
            return fetchWithRetry(url, options, retries - 1, delay);
        }
        throw error;
    }
}

export async function getAllMangaList(): Promise<MangaData[]> {
    let allMangas: MangaData[] = [];
    let offset = 0;
    let totalMangas = 0;

    logger('Buscando lista de todos os mangás da API...', 'sistema');

    try {
        const initialData = await fetchWithRetry(
            `https://api.mangadex.org/manga?limit=1&availableTranslatedLanguage[]=pt-br`
        );
        totalMangas = initialData.total;

        logger(`Total de mangás disponíveis: ${totalMangas}`, 'sistema');
        logger(
            `Limitando a ${config.mangaParams.maxMangas} mangás para processamento\n`,
            'sistema'
        );

        while (offset < Math.min(totalMangas, config.mangaParams.maxMangas)) {
            const data = await fetchWithRetry(
                `https://api.mangadex.org/manga?` +
                    `availableTranslatedLanguage[]=pt-br&` +
                    `limit=${config.mangaParams.mangaLimit}&offset=${offset}&` +
                    `order[createdAt]=asc`
            );

            allMangas = allMangas.concat(data.data);
            offset += config.mangaParams.mangaLimit;

            logger(`Mangás coletados: ${allMangas.length}`, 'sistema');

            if (offset < Math.min(totalMangas, config.mangaParams.maxMangas)) {
                await sleep(config.rateLimiting.batchDelay);
            }
        }

        return allMangas;
    } catch (error: any) {
        logger(`Erro ao buscar lista de mangás: ${error.message}`, 'erro');
        return allMangas;
    }
}

export async function getMangaDetails(mangaData: MangaData): Promise<MangaDetails | null> {
    try {
        const mangaId = mangaData.id;
        const title = mangaData.attributes.title.en || Object.values(mangaData.attributes.title)[0];

        logger(`Buscando detalhes do mangá "${title}"...`, 'sistema');

        const [coverData, authorData] = await Promise.all([
            fetchWithRetry(`https://api.mangadex.org/cover?manga[]=${mangaId}&limit=1`),
            fetchWithRetry(`https://api.mangadex.org/author?limit=5`),
            sleep(config.rateLimiting.apiDelay),
        ]);

        const coverUrl =
            coverData.data.length > 0
                ? `https://uploads.mangadex.org/covers/${mangaId}/${coverData.data[0].attributes.fileName}`
                : 'https://via.placeholder.com/300x400?text=Sem+Capa';

        const authors = authorData.data.filter((author: any) =>
            mangaData.relationships.some((rel) => rel.type === 'author' && rel.id === author.id)
        );

        const artists = authorData.data.filter((artist: any) =>
            mangaData.relationships.some((rel) => rel.type === 'artist' && rel.id === artist.id)
        );

        const statusMap: Record<string, string> = {
            ongoing: 'em_andamento',
            completed: 'completo',
            hiatus: 'hiatus',
            cancelled: 'cancelado',
        };

        const ratingMap: Record<string, string> = {
            safe: 'Livre',
            suggestive: '12+',
            erotica: '16+',
            pornographic: '18+',
        };

        const genreTranslation: Record<string, string> = {
            Action: 'Ação',
            Comedy: 'Comédia',
            Shounen: 'Shounen',
            Drama: 'Drama',
            Fantasy: 'Fantasia',
            Romance: 'Romance',
            Slice_of_Life: 'Slice of Life',
            Supernatural: 'Supernatural',
            Mystery: 'Mistério',
            Historical: 'Histórico',
            Historical_Mystery: 'Mistério Histórico',
            Historical_Romance: 'Romance Histórico',
            Historical_Slice_of_Life: 'Slice of Life Histórico',
            Historical_Supernatural: 'Supernatural Histórico',
            Historical_Drama: 'Drama Histórico',
            Historical_Comedy: 'Comédia Histórica',
            Historical_Action: 'Ação Histórica',
            Historical_Fantasy: 'Fantasia Histórica',
            Adveture: 'Aventura',
            Sci_Fi: 'Sci-Fi',
            Historical_Sci_Fi: 'Sci-Fi Histórico',
            Historical_Adveture: 'Aventura Histórica',
            Tragedy: 'Tragedia',
            Crime: 'Crime',
            Horror: 'Terror',
            Thriller: 'Suspense',
            Pyshocology: 'Psicologia',
        };

        const allowedLanguages = ['pt-br', 'en', 'jp'];
        const languages = mangaData.attributes.availableTranslatedLanguages
            ? mangaData.attributes.availableTranslatedLanguages.filter((lang) =>
                  allowedLanguages.includes(lang)
              )
            : ['pt-br'];

        return {
            mangaId: mangaId,
            title: title,
            originalTitle: mangaData.attributes.originalLanguage
                ? mangaData.attributes.title[mangaData.attributes.originalLanguage] || ''
                : '',
            description:
                mangaData.attributes.description['pt-br'] ||
                mangaData.attributes.description.en ||
                'Descrição não disponível',
            coverUrl: coverUrl,
            status: statusMap[mangaData.attributes.status] || 'em_andamento',
            publicationDate: mangaData.attributes.year
                ? `${mangaData.attributes.year}-01-01`
                : '2019-01-01',
            rating: ratingMap[mangaData.attributes.contentRating] || '12+',
            genres: mangaData.attributes.tags
                .filter((tag) => tag.attributes.group === 'genre')
                .map((tag) => genreTranslation[tag.attributes.name.en] || tag.attributes.name.en),
            languages: languages,
            authors: authors.map((author: any) => ({
                id: author.id,
                name: author.attributes.name,
                bio: 'Biografia não disponível',
                photo:
                    author.attributes.imageUrl || 'https://via.placeholder.com/150?text=Sem+Foto',
            })),
            artists: artists.map((artist: any) => ({
                id: artist.id,
                name: artist.attributes.name,
                bio: 'Biografia não disponível',
                photo:
                    artist.attributes.imageUrl || 'https://via.placeholder.com/150?text=Sem+Foto',
            })),
        };
    } catch (error: any) {
        logger(`Erro ao buscar detalhes do mangá: ${error}\n`, 'erro');
        return null;
    }
}

export async function getChaptersAndPages(mangaId: string): Promise<Chapter[] | null> {
    let chapters: Chapter[] = [];
    let offset = 0;
    const limit = 100;

    logger('Iniciando coleta de capítulos...', 'sistema');

    while (true) {
        try {
            const data = await fetchWithRetry(
                `https://api.mangadex.org/chapter?manga=${mangaId}` +
                    `&translatedLanguage[]=pt-br` +
                    `&limit=${limit}&offset=${offset}` +
                    `&order[chapter]=asc`,
                {},
                3,
                config.rateLimiting.chapterDelay
            );

            chapters = chapters.concat(data.data);
            logger(`Capítulos coletados: ${chapters.length}`, 'sistema');

            if (data.data.length < limit) break;
            offset += limit;
        } catch (error: any) {
            logger(`Erro ao buscar capítulos: ${error}`, 'erro');
            break;
        }
    }

    if (chapters.length === 0) {
        logger('Nenhum capítulo encontrado para este mangá', 'aviso');
        return null;
    }

    const uniqueChapters = chapters.filter(
        (c, i, a) =>
            i ===
            a.findIndex(
                (ch) =>
                    ch.attributes.chapter === c.attributes.chapter &&
                    ch.attributes.translatedLanguage === c.attributes.translatedLanguage
            )
    );

    if (uniqueChapters.length < config.mangaParams.minChapters) {
        logger(
            `Mangá possui apenas ${uniqueChapters.length} capítulos (mínimo requerido: ${config.mangaParams.minChapters})`,
            'aviso'
        );
        return null;
    }

    logger(`Capítulos únicos encontrados: ${uniqueChapters.length}\n`, 'sistema');

    const chaptersWithPages: Chapter[] = [];

    for (const chapter of uniqueChapters) {
        try {
            logger(`Buscando páginas para capítulo ${chapter.attributes.chapter}...`, 'sistema');
            const pagesData = await fetchWithRetry(
                `https://api.mangadex.org/at-home/server/${chapter.id}`,
                {},
                3,
                config.rateLimiting.pageDelay
            );

            if (
                !pagesData.chapter ||
                !pagesData.chapter.data ||
                pagesData.chapter.data.length === 0
            ) {
                logger('Capítulo sem páginas válidas, pulando...', 'aviso');
                continue;
            }

            chaptersWithPages.push({
                ...chapter,
                pages: {
                    baseUrl: pagesData.baseUrl,
                    hash: pagesData.chapter.hash,
                    files: pagesData.chapter.data,
                },
            });

            logger(` → ${pagesData.chapter.data.length} páginas encontradas\n`, 'sucesso');
        } catch (error: any) {
            logger(
                `Erro ao buscar páginas do capítulo ${chapter.attributes.chapter}: ${error}\n`,
                'erro'
            );
        }
    }

    return chaptersWithPages.length > 0 ? chaptersWithPages : null;
}
