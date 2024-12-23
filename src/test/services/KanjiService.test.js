import { kanjiService } from "../../services/kanjiService.js";
import Kanji from '../../models/Kanji.js';
import Word from '../../models/Word.js';
import User from '../../models/User.js';
import BadRequestError from "../../errors/BadRequestError.js";
import NotFoundError from "../../errors/NotFoundError.js";

jest.mock('../../models/Kanji.js');
jest.mock('../../models/Word.js', () => ({
    find: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([])
}));
jest.mock('../../models/User.js');

describe('KanjiService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('getKanjiByJLPTLevel should return kanjis by JLPT level', async () => {
        const mockKanjis = [
            { _id: '1', text: '日', jlpt_level: 1, phonetic: 'にち' },
            { _id: '2', text: '月', jlpt_level: 1, phonetic: 'つき' },
        ];
        const level = 1;
        const page = 1;
        const limit = 10;
    
        Kanji.find.mockReturnValue({
            skip: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue(mockKanjis), // Trả về giá trị mong đợi
            }),
        });
    
        Kanji.countDocuments.mockResolvedValue(mockKanjis.length); // Mô phỏng số lượng kanji
    
        const data = { query: { level, page, limit } };
    
        const result = await kanjiService.getKanjiByJLPTLevel(data);
    
        expect(result.data).toEqual(mockKanjis);
    
        expect(Kanji.find).toHaveBeenCalledWith({ jlpt_level: level }, { text: 1, phonetic: 1 });
        expect(Kanji.find().skip).toHaveBeenCalledWith((page - 1) * limit);
        expect(Kanji.find().skip().limit).toHaveBeenCalledWith(limit);
    });    

    test('getKanjiByJLPTLevel should return kanjis by JLPT level', async () => {
        const mockKanjis = [{ _id: '1', text: '日', phonetic: 'にち', jlpt_level: 1 }];
        
        // Mô phỏng các phương thức Mongoose
        Kanji.countDocuments.mockResolvedValue(1);
        Kanji.find.mockReturnValue({
            skip: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue(mockKanjis) // Trả về mockKanjis sau khi gọi limit
            })
        });
    
        const data = { query: { level: '1', page: '1', limit: '60' } };
        const result = await kanjiService.getKanjiByJLPTLevel(data);
    
        expect(result.data).toEqual(mockKanjis);
        expect(Kanji.countDocuments).toHaveBeenCalledWith({ jlpt_level: parseInt(data.query.level) });
        expect(Kanji.find).toHaveBeenCalledWith({ jlpt_level: parseInt(data.query.level) }, { text: 1, phonetic: 1 });
        expect(Kanji.find().skip).toHaveBeenCalledWith((parseInt(data.query.page) - 1) * parseInt(data.query.limit));
        expect(Kanji.find().skip().limit).toHaveBeenCalledWith(parseInt(data.query.limit));
    });

    test('getKanjiByJLPTLevel should throw NotFoundError if page exceeds total pages', async () => {
        Kanji.countDocuments.mockResolvedValue(0);

        const data = { query: { level: '5', page: '2', limit: '60' } };
        await expect(kanjiService.getKanjiByJLPTLevel(data)).rejects.toThrow(NotFoundError);
    });

    test('getKanjiById should return kanji by id', async () => {
        const mockKanji = { 
            _id: '1', 
            text: '日', 
            phonetic: 'にち', 
            composition: { id: 10 }, 
            comments: [
                {
                    user: {
                        fullname: "Tran Minh Quan", 
                        avatar: "abc"
                    },
                    liked_by: [],
                    created_at: new Date()
                }
            ] 
        };
    
        const mockQuery = {
            populate: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(mockKanji), 
        };
    
        Kanji.findById.mockReturnValue(mockQuery);
        mockQuery.populate.mockReturnValue(mockQuery); 
        mockQuery.populate.mockReturnThis(); 
    
        const data = { params: { id: '1' } }; 
        const kanji = await kanjiService.getKanjiById(data);
    
        expect(kanji).toEqual({...mockKanji, relatedWord: []});
        expect(Kanji.findById).toHaveBeenCalledWith(data.params.id);
        expect(mockQuery.populate).toHaveBeenCalledTimes(2); 
    });
    

    test('getKanjiById should throw BadRequestError if id is invalid', async () => {
        const data = { params: { id: null } };
        await expect(kanjiService.getKanjiById(data)).rejects.toThrow(BadRequestError);
    });

    test('getKanjiByText should return kanji by text', async () => {
        const mockKanji = { _id: '1', text: '日' };
        Kanji.findOne.mockResolvedValue(mockKanji);

        const data = { params: { text: '日' } };
        const kanji = await kanjiService.getKanjiByText(data);
        expect(kanji).toEqual(mockKanji);
        expect(Kanji.findOne).toHaveBeenCalledWith({ text: data.params.text });
    });

    test('getKanjiByText should throw NotFoundError if kanji not found', async () => {
        const data = { params: { text: '不' } };
        Kanji.findOne.mockResolvedValue(null);
        await expect(kanjiService.getKanjiByText(data)).rejects.toThrow(NotFoundError);
    });

    test('searchKanji should return kanji based on search text', async () => {
        const mockKanjis = [{ _id: '1', text: '日', phonetic: 'にち' }];
        const data = { query: { text: '日' } };
    
        // Cập nhật cách mock để trả về đúng giá trị
        Kanji.find.mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockKanjis) // Trả về mockKanjis cho phương thức limit
        });
    
        const result = await kanjiService.searchKanji(data);
        
        expect(result).toEqual(mockKanjis.map(kanji => ({
            _id: kanji._id,
            text: kanji.text,
            phonetic: kanji.phonetic
        })));
    
        expect(Kanji.find).toHaveBeenCalled();
    });

    test('kanjiComment should add a comment to kanji', async () => {
        const mockKanji = { _id: '1', comments: [], save: jest.fn() };
        const mockUser = { _id: '1', fullname: 'User1' };
        Kanji.findById.mockResolvedValue(mockKanji);
        User.findById.mockResolvedValue(mockUser);

        const req = {
            params: { kanjiId: '1' },
            body: { userId: '1', content: 'Nice kanji!' }
        };

        await kanjiService.kanjiComment(req);
        expect(mockKanji.comments.length).toBe(1);
        expect(mockKanji.comments[0].content).toBe('Nice kanji!');
        expect(mockKanji.save).toHaveBeenCalled();
    });

    test('kanjiComment should throw NotFoundError if kanji not found', async () => {
        const req = { params: { kanjiId: '1' }, body: { userId: '1', content: 'Nice kanji!' } };
        Kanji.findById.mockResolvedValue(null); 

        await expect(kanjiService.kanjiComment(req)).rejects.toThrow(NotFoundError);
        expect(Kanji.findById).toHaveBeenCalledWith(req.params.kanjiId);
    });

    test('getKanjiComments should return comments of a kanji', async () => {
        const mockComments = [{ user: '1', content: 'Great!' }];
        const mockKanji = { _id: '1', comments: mockComments };
        Kanji.findById.mockResolvedValue(mockKanji);

        const req = { params: { kanjiId: '1' } };
        const comments = await kanjiService.getKanjiComments(req);
        expect(comments).toEqual(mockComments);
    });

    test('getKanjiComments should throw NotFoundError if kanji not found', async () => {
        const req = { params: { kanjiId: '1' } };
        Kanji.findById.mockResolvedValue(null);
        await expect(kanjiService.getKanjiComments(req)).rejects.toThrow(NotFoundError);
    });
});
