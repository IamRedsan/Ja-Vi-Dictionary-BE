import { wordService } from "../../services/wordService.js";
import Word from "../../models/Word.js";
import BadRequestError from "../../errors/BadRequestError.js";
import NotFoundError from "../../errors/NotFoundError.js";

jest.mock('../../models/Word.js');

describe('WordService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getAllWords should return all words', async () => {
    const mockWords = [
      { _id: '1', text: 'こんにちは', hiragana: ['こんにちは'], meaning: [{ content: 'Xin chào' }] },
      { _id: '2', text: 'さようなら', hiragana: ['さようなら'], meaning: [{ content: 'Tạm biệt' }] }
    ];
    Word.find.mockResolvedValue(mockWords);

    const words = await wordService.getAllWords();
    expect(words).toEqual(mockWords);
    expect(Word.find).toHaveBeenCalledTimes(1);
  });

  test('getWordById should return word by id', async () => {
    const mockWordData = {
        _id: '1',
        text: 'こんにちは',
        hiragana: ['こんにちは'],
        meaning: [{ content: 'Xin chào' }],
        kanji: [], 
    };

    const mockWord = {
        ...mockWordData,
        populate: jest.fn().mockReturnThis(), 
        lean: jest.fn().mockResolvedValue(mockWordData), 
    };

    const data = { params: { id: '1' } };

    // Giả lập kết quả findById trả về mockWord
    Word.findById.mockReturnValue(mockWord);

    // Gọi hàm kiểm tra
    const word = await wordService.getWordById(data);

    // So sánh chỉ dữ liệu thực tế
    expect(word).toEqual(mockWordData);

    // Kiểm tra các phương thức mock được gọi
    expect(Word.findById).toHaveBeenCalledWith(data.params.id);
    expect(mockWord.populate).toHaveBeenCalled();
    expect(mockWord.lean).toHaveBeenCalled();
   });

  test('getWordById should throw BadRequestError if id is invalid', async () => {
    const data = { params: { id: null } };
    
    await expect(wordService.getWordById(data)).rejects.toThrow(BadRequestError);
  });

  test('getWordById should throw NotFoundError if word not found', async () => {
    const data = { params: { id: '1' } };

    // Mock `findById` để trả về một đối tượng với phương thức `populate`
    Word.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null), // `lean` trả về `null` để giả lập không tìm thấy dữ liệu
    });

    await expect(wordService.getWordById(data)).rejects.toThrow(NotFoundError);
    expect(Word.findById).toHaveBeenCalledWith(data.params.id);
  });


  test('searchWord should return words matching the search text', async () => {
    const mockWords = [
        { _id: '1', text: 'こんにちは', hiragana: ['こんにちは'], meaning: [{ content: 'Xin chào' }] },
    ];

    Word.find
        .mockImplementationOnce(() => ({
            limit: jest.fn().mockResolvedValue(mockWords),
        }))
        .mockImplementationOnce(() => ({
            limit: jest.fn().mockResolvedValue([]),
        }));

    const results = await wordService.searchWord({ query: { text: 'こん' } });

    expect(results).toHaveLength(1);
    expect(results[0].text).toBe('こんにちは');
    expect(Word.find).toHaveBeenCalledTimes(2);

    expect(Word.find).toHaveBeenNthCalledWith(1, {
        $or: [
            { text: { $regex: '^こん', $options: 'i' } },
            { hiragana: { $regex: '^こん', $options: 'i' } },
            { romanji: { $regex: '^こん', $options: 'i' } },
            { 'meaning.content': { $regex: '^こん', $options: 'i' } },
        ],
    });

    expect(Word.find).toHaveBeenNthCalledWith(2, {
        $or: [
            { text: { $regex: 'こん', $options: 'i' } },
            { hiragana: { $regex: 'こん', $options: 'i' } },
            { romanji: { $regex: 'こん', $options: 'i' } },
            { 'meaning.content': { $regex: 'こん', $options: 'i' } },
        ],
    });
});

  test('searchWord should throw BadRequestError for empty search text', async () => {
    await expect(wordService.searchWord({ query: { text: '' } })).rejects.toThrow(BadRequestError);
  });

 test('searchWord should return empty array if no words match', async () => {
    // Giả lập phương thức `find` trả về một đối tượng có phương thức `limit`
    Word.find.mockReturnValue({
        limit: jest.fn().mockResolvedValue([]), // Trả về mảng trống khi gọi `limit`
    });

    // Gọi hàm searchWord với một truy vấn không tồn tại
    const results = await wordService.searchWord({ query: { text: 'nonexistent' } });

    // Kiểm tra rằng kết quả trả về là một mảng trống
    expect(results).toHaveLength(0);
    
    // Cập nhật để kiểm tra số lần gọi
    expect(Word.find).toHaveBeenCalledTimes(2); // Thay đổi thành 2 nếu hàm gọi `find` 2 lần
});
});
