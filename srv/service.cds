using { cap.embedding.function as db } from '../db/schema';

service EmbeddingStorageService {
    entity Notes as projection on db.Notes excluding {
        embedding
    };

    action addNotes(notes: array of Notes) returns String;
    action deleteNotes() returns String;
    function similaritySearch(searchWord: String) returns array of {
        ID: UUID;
        note: String;
        cosine_similarity: Decimal;
    };
}

