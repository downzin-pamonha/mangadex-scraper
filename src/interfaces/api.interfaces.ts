export interface MangaData {
    id: string;
    attributes: {
        title: {
            [key: string]: string;
        };
        originalLanguage?: string;
        description: {
            [key: string]: string;
        };
        status: string;
        year?: number;
        contentRating: string;
        availableTranslatedLanguages?: string[];
        tags: {
            attributes: {
                group: string;
                name: {
                    en: string;
                };
            };
        }[];
    };
    relationships: {
        type: string;
        id: string;
    }[];
}

export interface MangaDetails {
    mangaId: string;
    title: string;
    originalTitle: string;
    description: string;
    coverUrl: string;
    status: string;
    publicationDate: string;
    rating: string;
    genres: string[];
    languages: string[];
    authors: Author[];
    artists: Author[];
}

export interface Author {
    id: string;
    name: string;
    bio: string;
    photo: string;
}

export interface Chapter {
    id: string;
    attributes: {
        chapter: string;
        title: string;
        volume: string | null;
        publishAt?: string;
        translatedLanguage: string;
    };
    pages?: {
        baseUrl: string;
        hash: string;
        files: string[];
    };
}
