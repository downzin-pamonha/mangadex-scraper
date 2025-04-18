import { Connection } from '../config/database';
import { MangaDetails, Chapter } from '../interfaces/api.interfaces';
import { getAllMangaList, getChaptersAndPages, getMangaDetails } from '../services/api.service';
import { createConnection } from '../config/database';
import { logger } from './logger.service';
import slugify from 'slugify';
import { setTimeout as sleep } from 'timers/promises';
import config from '../config/env';

export async function getNextId(
    conn: Connection,
    tableName: string,
    idField: string
): Promise<number> {
    const [rows] = await conn.query(`SELECT MAX(${idField}) as maxId FROM ${tableName}`);
    return ((rows as any)[0].maxId || 0) + 1;
}

export async function recordExists(
    conn: Connection,
    tableName: string,
    field: string,
    value: string | number
): Promise<boolean> {
    const [rows] = await conn.query(`SELECT 1 FROM ${tableName} WHERE ${field} = ?`, [value]);
    return (rows as any).length > 0;
}

export async function processSingleManga(conn: Connection, mangaData: any): Promise<boolean> {
    try {
        const mangaDetails = await getMangaDetails(mangaData);
        if (!mangaDetails) {
            throw new Error('Não foi possível obter os dados do mangá');
        }

        logger(`\nProcessando mangá "${mangaDetails.title}"\n`, 'sistema');

        const chapters = await getChaptersAndPages(mangaDetails.mangaId);

        if (!chapters || chapters.length === 0) {
            logger(
                `Mangá "${mangaDetails.title}" não possui capítulos válidos e será ignorado\n`,
                'aviso'
            );
            return false;
        }

        logger(`Mangá possui ${chapters.length} capítulos válidos\n`, 'sucesso');

        const authorIds = [];
        for (const author of mangaDetails.authors) {
            let authorId = await getNextId(conn, 'tb_autores', 'autor_id');

            if (!(await recordExists(conn, 'tb_autores', 'nome', author.name))) {
                await conn.query(
                    `INSERT INTO tb_autores (autor_id, nome, biografia, foto_url) VALUES (?, ?, ?, ?)`,
                    [authorId, author.name, author.bio, author.photo]
                );
                logger(`Autor "${author.name}" inserido com ID: ${authorId}`, 'inserido');
            } else {
                logger(`Autor "${author.name}" já existe`, 'existente');
                const [rows] = await conn.query(`SELECT autor_id FROM tb_autores WHERE nome = ?`, [
                    author.name,
                ]);
                authorId = (rows as any)[0].autor_id;
            }
            authorIds.push(authorId);
        }

        const artistIds = [];
        for (const artist of mangaDetails.artists) {
            let artistId = await getNextId(conn, 'tb_artistas', 'artista_id');

            if (!(await recordExists(conn, 'tb_artistas', 'nome', artist.name))) {
                await conn.query(
                    `INSERT INTO tb_artistas (artista_id, nome, biografia, foto_url) VALUES (?, ?, ?, ?)`,
                    [artistId, artist.name, artist.bio, artist.photo]
                );
                logger(`Artista "${artist.name}" inserido com ID: ${artistId}`, 'inserido');
            } else {
                logger(`Artista "${artist.name}" já existe`, 'existente');
                const [rows] = await conn.query(
                    `SELECT artista_id FROM tb_artistas WHERE nome = ?`,
                    [artist.name]
                );
                artistId = (rows as any)[0].artista_id;
            }
            artistIds.push(artistId);
        }

        const publisherName = 'Shueisha';
        const publisherLogo =
            'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Shueisha_logo.svg/1200px-Shueisha_logo.svg.png';
        const publisherDesc = 'Editora japonesa responsável por vários mangás famosos';

        let editoraId = await getNextId(conn, 'tb_editoras', 'editora_id');

        if (!(await recordExists(conn, 'tb_editoras', 'nome', publisherName))) {
            await conn.query(
                `INSERT INTO tb_editoras (editora_id, nome, logo_url, descricao) VALUES (?, ?, ?, ?)`,
                [editoraId, publisherName, publisherLogo, publisherDesc]
            );
            logger(`Editora "${publisherName}" inserida com ID: ${editoraId}`, 'inserido');
        } else {
            logger(`Editora "${publisherName}" já existe`, 'existente');
            const [rows] = await conn.query(`SELECT editora_id FROM tb_editoras WHERE nome = ?`, [
                publisherName,
            ]);
            editoraId = (rows as any)[0].editora_id;
        }

        const genreIds: Record<string, number> = {};
        for (const genreName of mangaDetails.genres) {
            const genreSlug = slugify(genreName, { lower: true });

            if (!(await recordExists(conn, 'tb_generos', 'slug', genreSlug))) {
                const genreId = await getNextId(conn, 'tb_generos', 'genero_id');
                await conn.query(
                    `INSERT INTO tb_generos (genero_id, nome, slug, descricao) VALUES (?, ?, ?, ?)`,
                    [genreId, genreName, genreSlug, `${genreName} - descrição`]
                );
                genreIds[genreName] = genreId;
                logger(`Gênero "${genreName}" inserido com ID: ${genreId}`, 'inserido');
            } else {
                logger(`Gênero "${genreName}" já existe`, 'existente');
                const [rows] = await conn.query(`SELECT genero_id FROM tb_generos WHERE slug = ?`, [
                    genreSlug,
                ]);
                genreIds[genreName] = (rows as any)[0].genero_id;
            }
        }

        const languageIds: Record<string, number> = {};
        for (const langCode of mangaDetails.languages) {
            const langName =
                langCode === 'pt-br'
                    ? 'Português Brasileiro'
                    : langCode === 'ja'
                      ? 'Japonês'
                      : langCode === 'en'
                        ? 'Inglês'
                        : langCode.charAt(0).toUpperCase() + langCode.slice(1);

            if (!(await recordExists(conn, 'tb_idiomas', 'codigo', langCode))) {
                const langId = await getNextId(conn, 'tb_idiomas', 'idioma_id');
                await conn.query(
                    `INSERT INTO tb_idiomas (idioma_id, codigo, nome) VALUES (?, ?, ?)`,
                    [langId, langCode, langName]
                );
                languageIds[langCode] = langId;
                logger(`Idioma "${langCode}" inserido com ID: ${langId}`, 'inserido');
            } else {
                logger(`Idioma "${langCode}" já existe`, 'existente');
                const [rows] = await conn.query(
                    `SELECT idioma_id FROM tb_idiomas WHERE codigo = ?`,
                    [langCode]
                );
                languageIds[langCode] = (rows as any)[0].idioma_id;
            }
        }

        const mangaSlug = slugify(mangaDetails.title, {
            lower: true,
            strict: true,
        });
        let mangaId = await getNextId(conn, 'tb_mangas', 'manga_id');

        if (!(await recordExists(conn, 'tb_mangas', 'slug', mangaSlug))) {
            await conn.query(
                `INSERT INTO tb_mangas (
          manga_id, titulo, titulo_original, slug, descricao, capa_url, 
          status, data_publicacao, classificacao, autor_id, artista_id, editora_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    mangaId,
                    mangaDetails.title,
                    mangaDetails.originalTitle,
                    mangaSlug,
                    mangaDetails.description,
                    mangaDetails.coverUrl,
                    mangaDetails.status,
                    mangaDetails.publicationDate,
                    mangaDetails.rating,
                    authorIds[0] || null,
                    artistIds[0] || null,
                    editoraId,
                ]
            );
            logger(`Mangá "${mangaDetails.title}" inserido com ID: ${mangaId}`, 'inserido');
        } else {
            logger(`Mangá "${mangaDetails.title}" já existe`, 'existente');
            const [rows] = await conn.query(`SELECT manga_id FROM tb_mangas WHERE slug = ?`, [
                mangaSlug,
            ]);
            mangaId = (rows as any)[0].manga_id;
        }

        for (const genreName of mangaDetails.genres) {
            const genreId = genreIds[genreName];

            const [exists] = await conn.query(
                `SELECT 1 FROM tb_manga_generos WHERE manga_id = ? AND genero_id = ?`,
                [mangaId, genreId]
            );

            if (!(exists as any).length) {
                await conn.query(
                    `INSERT INTO tb_manga_generos (manga_id, genero_id) VALUES (?, ?)`,
                    [mangaId, genreId]
                );
                logger(`Relacionamento mangá-gênero "${genreName}" inserido`, 'inserido');
            } else {
                logger(`Relacionamento mangá-gênero "${genreName}" já existe`, 'existente');
            }
        }

        for (const langCode of mangaDetails.languages) {
            const langId = languageIds[langCode];

            const [exists] = await conn.query(
                `SELECT 1 FROM tb_manga_idiomas WHERE manga_id = ? AND idioma_id = ?`,
                [mangaId, langId]
            );

            if (!(exists as any).length) {
                await conn.query(
                    `INSERT INTO tb_manga_idiomas (manga_id, idioma_id) VALUES (?, ?)`,
                    [mangaId, langId]
                );
                logger(`Relacionamento mangá-idioma "${langCode}" inserido`, 'inserido');
            } else {
                logger(`Relacionamento mangá-idioma "${langCode}" já existe`, 'existente');
            }
        }

        console.log('');

        for (const chapter of chapters) {
            const chapterNum = chapter.attributes.chapter || '0';
            const chapterTitle = chapter.attributes.title || `Capítulo ${chapterNum}`;
            const chapterVolume = chapter.attributes.volume || null;
            const publishDate =
                chapter.attributes.publishAt?.split('T')[0] || mangaDetails.publicationDate;

            const [existing] = await conn.query(
                `SELECT 1 FROM tb_capitulos WHERE manga_id = ? AND numero = ?`,
                [mangaId, chapterNum]
            );

            let chapterId;
            if (!(existing as any).length) {
                chapterId = await getNextId(conn, 'tb_capitulos', 'capitulo_id');

                await conn.query(
                    `INSERT INTO tb_capitulos (
            capitulo_id, manga_id, numero, titulo, volume, data_publicacao
          ) VALUES (?, ?, ?, ?, ?, ?)`,
                    [chapterId, mangaId, chapterNum, chapterTitle, chapterVolume, publishDate]
                );
                logger(`Capítulo ${chapterNum} inserido com ID: ${chapterId}`, 'inserido');
            } else {
                logger(`Capítulo ${chapterNum} já existe`, 'existente');
                const [rows] = await conn.query(
                    `SELECT capitulo_id FROM tb_capitulos WHERE manga_id = ? AND numero = ?`,
                    [mangaId, chapterNum]
                );
                chapterId = (rows as any)[0].capitulo_id;
            }

            if (chapter.pages && chapter.pages.files.length > 0) {
                await conn.query(`DELETE FROM tb_paginas WHERE capitulo_id = ?`, [chapterId]);

                const pageInserts = [];
                for (let i = 0; i < chapter.pages.files.length; i++) {
                    const pageUrl = `${chapter.pages.baseUrl}/data/${chapter.pages.hash}/${chapter.pages.files[i]}`;
                    pageInserts.push([chapterId, i + 1, pageUrl, 800, 1200]);
                }

                await conn.query(
                    `INSERT INTO tb_paginas (
            capitulo_id, ordem, url, largura, altura
          ) VALUES ?`,
                    [pageInserts]
                );

                logger(
                    `  → ${chapter.pages.files.length} Páginas inseridas para o capítulo ${chapterNum}`,
                    'inserido'
                );
            }
        }

        logger(`Processo concluído para "${mangaDetails.title}"!\n`, 'sucesso');
        return true;
    } catch (error: any) {
        logger(`Erro durante o processamento do mangá: ${error.message}\n`, 'erro');
        return false;
    }
}

export async function processAllMangas() {
    let conn;
    try {
        conn = await createConnection();

        const allMangas = await getAllMangaList();

        if (allMangas.length === 0) {
            logger('Nenhum mangá encontrado para processar', 'erro');
            return;
        }

        logger(`\nIniciando processamento de ${allMangas.length} mangás...\n`, 'sistema');

        let successCount = 0;
        let failCount = 0;
        let skippedCount = 0;

        for (const mangaData of allMangas) {
            const result = await processSingleManga(conn, mangaData);

            if (result === true) {
                successCount++;
            } else if (result === false) {
                const title =
                    mangaData.attributes.title.en || Object.values(mangaData.attributes.title)[0];
                const [mangaExists] = await conn.query(`SELECT 1 FROM tb_mangas WHERE titulo = ?`, [
                    title,
                ]);

                if ((mangaExists as any).length > 0) {
                    failCount++;
                } else {
                    skippedCount++;
                }
            }

            if (mangaData !== allMangas[allMangas.length - 1]) {
                logger(
                    `Aguardando ${config.rateLimiting.mangaDelay / 1000} segundos antes do próximo mangá...\n`,
                    'sistema'
                );
                await sleep(config.rateLimiting.mangaDelay);
            }
        }

        logger(`\nProcessamento concluído!`, 'sucesso');
        logger(`- Mangás processados com sucesso: ${successCount}`, 'sucesso');
        logger(
            `- Mangás ignorados (sem capítulos suficientes): ${skippedCount}`,
            skippedCount > 0 ? 'aviso' : 'sucesso'
        );
        logger(`- Mangás com erro: ${failCount}\n`, failCount > 0 ? 'erro' : 'sucesso');
    } catch (error: any) {
        logger(`Erro geral durante o processamento: ${error.message}\n`, 'erro');
    } finally {
        if (conn) await conn.end();
    }
}
