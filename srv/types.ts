export interface NotesInput {
    note: string;
    embedding: string;
}

export interface SimilaritySearchResult {
    ID: string;
    note: string;
    cosine_similarity: number;
}

export interface Embedding {
    embedding: number[];
}