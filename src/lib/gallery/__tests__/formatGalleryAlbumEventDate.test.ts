import { formatGalleryAlbumEventDate } from '../formatGalleryAlbumEventDate';

describe('formatGalleryAlbumEventDate', () => {
  it('formats same-month range with location', () => {
    expect(
      formatGalleryAlbumEventDate({
        eventDateStart: '2015-10-24',
        eventDateEnd: '2015-10-26',
        eventLocation: 'Indore',
      })
    ).toBe('October 24\u201326, 2015, Indore');
  });

  it('formats single day', () => {
    expect(
      formatGalleryAlbumEventDate({
        eventDateStart: '2015-11-25',
      })
    ).toBe('November 25, 2015');
  });

  it('formats single day with location', () => {
    expect(
      formatGalleryAlbumEventDate({
        eventDateStart: '2015-07-19',
        eventLocation: 'Beirut',
      })
    ).toBe('July 19, 2015, Beirut');
  });

  it('falls back to albumYear when no event dates', () => {
    expect(
      formatGalleryAlbumEventDate({
        albumYear: 2019,
      })
    ).toBe('2019');
  });

  it('uses static eventDateDisplay when provided', () => {
    expect(
      formatGalleryAlbumEventDate({
        eventDateDisplay: 'October 24-26, 2015, Indore',
        albumYear: 2015,
      })
    ).toBe('October 24-26, 2015, Indore');
  });

  it('returns null when no date data', () => {
    expect(formatGalleryAlbumEventDate({})).toBeNull();
  });
});
