import { buildPaginationObject } from '../utils';

describe('Utils', () => {
  describe('buildPaginationObject', () => {
    it('Should set cursor based on key if there is sufficient entries', () => {
      const objects = [
        {
          key: '1',
          value: '2',
        },
        {
          key: '3',
          value: '4',
        },
      ];

      const paginationObject = buildPaginationObject(objects, 'key');
      expect(paginationObject.cursor).toEqual(objects[1].key);
      expect(paginationObject.entries).toEqual(objects);
    });

    it('Should not set cursor if the re are no entries', () => {
      const objects: Record<string, any>[] = [];

      const paginationObject = buildPaginationObject(objects, 'key');
      expect(paginationObject.cursor).toEqual(null);
      expect(paginationObject.entries).toEqual(objects);
    });
  });
});
