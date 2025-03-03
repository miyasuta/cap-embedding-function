import cds from '@sap/cds'
import { NotesInput, SimilaritySearchResult } from './types'
import { Notes as NotesSrv } from '#cds-models/EmbeddingStorageService'

export default class EmbeddingStorageService extends cds.ApplicationService {

    async init(): Promise<void> {
        await super.init()
        this.before(['CREATE', 'UPDATE'], 'Notes', this.onBeforeCreateUpdate)
        this.on('addNotes', this.onAddNotes)
        this.on('deleteNotes', this.onDeleteNotes)
        this.on('similaritySearch', this.onSimilaritySearch)
    }

    async onBeforeCreateUpdate(req: cds.Request): Promise<void> {
        const embedding = await this.getEmbedding(req.data.note)
        req.data.embedding = JSON.stringify(embedding)
    }

    async onAddNotes(req: cds.Request): Promise<string> {
        // set embedding
        await Promise.all(
            req.data.notes.map(async (note: NotesInput) => {
                const embedding = await this.getEmbedding(note.note)
                note.embedding = JSON.stringify(embedding)
            })
        )
        // add notes
        await INSERT.into(NotesSrv).entries(req.data.notes)
        // return success message
        return 'Notes added successfully'
    }

    async onDeleteNotes(req: cds.Request): Promise<string> {
        // delete notes
        await DELETE.from(NotesSrv)
        return 'Notes deleted successfully'
    }

    async onSimilaritySearch(req: cds.Request): Promise<SimilaritySearchResult[]> {
        const searchWord = req.data.searchWord
        const embedding = await this.getEmbedding(searchWord)
        const { Notes } = require('#cds-models/cap/embedding/function')

        // retrieve relevant notes
        const notes = await SELECT.from(Notes)
            .columns
            `ID,
             note,
             cosine_similarity(embedding, to_real_vector(${JSON.stringify(embedding)})) as cosine_similarity`

            .limit(3)
            .orderBy`cosine_similarity desc`

        return notes
    }

    async getEmbedding(text: string): Promise<number[]> {
        const { Dummy } = require('#cds-models/cap/embedding/function')

        // get embedding
        const { embedding } = await SELECT.one.from(Dummy).where({ id: 1 })
            .columns`vector_embedding(${text}, 'DOCUMENT', 'SAP_NEB.20240715') as embedding`
        return embedding
    }
}
