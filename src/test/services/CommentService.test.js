import { CommentService } from '../../services/commentService.js';
import Kanji from '../../models/Kanji.js';
import Word from '../../models/Word.js';
import User from '../../models/User.js';
import BadRequestError from '../../errors/BadRequestError.js';
import NotFoundError from '../../errors/NotFoundError.js';
import ForbiddenError from '../../errors/ForbiddenError.js';

jest.mock('../../models/Kanji.js');
jest.mock('../../models/Word.js');
jest.mock('../../models/User.js');

describe('CommentService', () => {
    const userId = '123';
    const kanjiId = '1';
    const wordId = '2';
    const commentId = 'c1';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createComment', () => {
        it('should throw BadRequestError if both kanjiId and wordId are provided', async () => {
            const req = { query: { kanjiId, wordId }, body: { content: 'Test comment' }, userId };
            await expect(CommentService.createComment(req)).rejects.toThrow(BadRequestError);
        });

        it('should create a new comment for Kanji', async () => {
            const req = { query: { kanjiId }, body: { content: 'Test comment' }, userId };
            const mockUser = { _id: userId };
            const mockKanji = { _id: kanjiId, comments: [], save: jest.fn() };

            User.findById.mockResolvedValue(mockUser);
            Kanji.findById.mockResolvedValue(mockKanji);

            const result = await CommentService.createComment(req);
            expect(result.content).toBe('Test comment');
            expect(mockKanji.comments.length).toBe(1);
            expect(mockKanji.save).toHaveBeenCalled();
        });

        it('should throw NotFoundError if Kanji not found', async () => {
            const req = { query: { kanjiId }, body: { content: 'Test comment' }, userId };
            User.findById.mockResolvedValue({ _id: userId });
            Kanji.findById.mockResolvedValue(null);

            await expect(CommentService.createComment(req)).rejects.toThrow(NotFoundError);
        });
    });

    describe('likeComment', () => {
        it('should throw BadRequestError if both kanjiId and wordId are provided', async () => {
            const req = { query: { kanjiId, wordId, commentId }, userId };
            await expect(CommentService.likeComment(req)).rejects.toThrow(BadRequestError);
        });

        it('should like a comment', async () => {
            const req = { query: { kanjiId, commentId }, userId };
            const mockKanji = {
                _id: kanjiId,
                comments: [{ _id: commentId, liked_by: [], user: userId }],
                save: jest.fn()
            };
            Kanji.findById.mockResolvedValue(mockKanji);

            const result = await CommentService.likeComment(req);
            expect(result.liked_by).toContain(userId);
            expect(mockKanji.save).toHaveBeenCalled();
        });

        it('should throw NotFoundError if comment not found', async () => {
            const req = { query: { kanjiId, commentId }, userId };
            const mockKanji = {
                _id: kanjiId,
                comments: [],
            };
            Kanji.findById.mockResolvedValue(mockKanji);

            await expect(CommentService.likeComment(req)).rejects.toThrow(NotFoundError);
        });
    });

    describe('updateComment', () => {
        it('should throw BadRequestError if all three IDs are provided', async () => {
            const req = { query: { kanjiId, wordId, commentId }, userId, body: { content: 'Updated comment' } };
            await expect(CommentService.updateComment(req)).rejects.toThrow(BadRequestError);
        });

        it('should update a comment', async () => {
            const req = { query: { kanjiId, commentId }, userId, body: { content: 'Updated comment' } };
            const mockKanji = {
                _id: kanjiId,
                comments: [{ _id: commentId, user: userId, content: 'Old comment' }],
                save: jest.fn()
            };
            Kanji.findById.mockResolvedValue(mockKanji);

            const result = await CommentService.updateComment(req);
            expect(result.content).toBe('Updated comment');
            expect(mockKanji.save).toHaveBeenCalled();
        });

        it('should throw ForbiddenError if user is not the owner of the comment', async () => {
            const req = { query: { kanjiId, commentId }, userId: 'wrongUser', body: { content: 'Updated comment' } };
            const mockKanji = {
                _id: kanjiId,
                comments: [{ _id: commentId, user: 'someOtherUser', content: 'Old comment' }],
                save: jest.fn()
            };
            Kanji.findById.mockResolvedValue(mockKanji);

            await expect(CommentService.updateComment(req)).rejects.toThrow(ForbiddenError);
        });
    });

    describe('deleteComment', () => {
        it('should throw BadRequestError if all three IDs are provided', async () => {
            const req = { query: { kanjiId, wordId, commentId }, userId };
            await expect(CommentService.deleteComment(req)).rejects.toThrow(BadRequestError);
        });

        it('should delete a comment', async () => {
            const req = { query: { kanjiId, commentId }, userId };
            const mockKanji = {
                _id: kanjiId,
                comments: [{ _id: commentId, user: userId }],
                save: jest.fn()
            };
            Kanji.findById.mockResolvedValue(mockKanji);

            const result = await CommentService.deleteComment(req);
            expect(result.message).toBe('Xóa bình luận thành công!');
            expect(mockKanji.comments.length).toBe(0);
            expect(mockKanji.save).toHaveBeenCalled();
        });

        it('should throw ForbiddenError if user is not the owner of the comment', async () => {
            const req = { query: { kanjiId, commentId }, userId: 'wrongUser' };
            const mockKanji = {
                _id: kanjiId,
                comments: [{ _id: commentId, user: 'someOtherUser' }],
                save: jest.fn()
            };
            Kanji.findById.mockResolvedValue(mockKanji);

            await expect(CommentService.deleteComment(req)).rejects.toThrow(ForbiddenError);
        });
    });
});
