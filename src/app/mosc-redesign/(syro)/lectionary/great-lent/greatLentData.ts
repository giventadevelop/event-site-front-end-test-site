/**
 * Lectionary data for Great Lent.
 * Source: https://mosc.in/lectionary/great-lent/
 */

export type LentSection = { time: string; verses: string[] };
export type LentPeriod = {
  title: string;
  description?: string;
  sections: LentSection[];
};

export const lentPeriods: LentPeriod[] = [
  {
    title: 'First Monday of Great Lent',
    sections: [
      { time: 'Morning', verses: ['Genesis 1:1-12', 'Great Wisdom 7:7-24', 'Isaiah 29:15-24', 'St. James 1:2-12', 'Romans 1:18-25', 'St. Matthew 4:1-11'] },
      { time: 'Shub-khono', verses: ['I John 4:11-20', 'I Corinthians 13:1-13', 'St. Matthew 18:18-35'] },
    ],
  },
  {
    title: 'First Tuesday of Great Lent',
    sections: [
      { time: 'Evening', verses: ['St. Luke 4:1-15'] },
      { time: 'Morning', verses: ['Exodus 32:30-35', 'Hosea 14:1-9', 'Isaiah 30:1-4', 'St. James 1:12-27', 'Ephesians 4:32-5:21', 'St. Matthew 6:1-6'] },
    ],
  },
  {
    title: 'First Wednesday of Great Lent',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 6:19-24', 'St. Luke 16:14-18'] },
      { time: 'Morning', verses: ['Genesis 1:14-18', 'Isaiah 13:6-13', 'St. James 2:1-13', 'Romans 2:7-24', 'St. Matthew 6:25-34'] },
    ],
  },
  {
    title: 'First Thursday of Great Lent',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 7:1-12'] },
      { time: 'Morning', verses: ['Exodus 22:5-6', 'I Kings 18:16-24', 'II Kings 17:7-23', 'Isaiah 36:1-7, 37:1-7', 'St. James 2:14-26', 'Romans 2:28-3:8', 'St. Matthew 7:13-27'] },
    ],
  },
  {
    title: 'First Friday of Great Lent',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 5:17-26'] },
      { time: 'Morning', verses: ['Ezekiel 18:20-32', 'Hosea 4:1-11', 'Deuteronomy 6:1-13', 'Isaiah 1:1-9', 'St. James 3:13-4:5', 'Romans 3:9-26', 'St. Matthew 5:27-37'] },
    ],
  },
  {
    title: 'First Saturday of Great Lent',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 10:24-38'] },
      { time: 'Morning', verses: ['St. John 15:17-16:3'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 2:4-17', 'Zechariah 7:8-14', 'Isaiah 1:24-31'] },
      { time: 'Holy Qurbana', verses: ['Acts 12:1-24', 'Romans 12:10-21', 'St. John 4:46-54'] },
    ],
  },
  {
    title: 'Second Sunday of Great Lent (Lepers\' Sunday)',
    sections: [
      { time: 'Evening', verses: ['St. Mark 1:32-45'] },
      { time: 'Morning', verses: ['St. Mark 9:14-29'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 7:6-24', 'II Kings 5:1-14', 'Isaiah 33:2-9', 'Jeremiah 50:4-7, 15:15-21'] },
      { time: 'Holy Qurbana', verses: ['Acts 5:12-16, 19:8-12', 'Acts 9:22-31', 'Romans 3:27-4:5', 'St. Luke 5:12-16, 4:40-41'] },
    ],
  },
  {
    title: 'Second Monday of Great Lent',
    sections: [
      { time: 'Morning', verses: ['Genesis 35:1-5', 'II Samuel 16:5-12', 'Hosea 2:21-3:5', 'St. James 4:7-5:6', 'I Timothy 2:1-15', 'St. Luke 6:27-36'] },
    ],
  },
  {
    title: 'Second Tuesday of Great Lent',
    sections: [
      { time: 'Evening', verses: ['St. Luke 6:37-49'] },
      { time: 'Morning', verses: ['Exodus 16:15-27', 'Acts 10:25-33', 'II Corinthians 6:1-11', 'St. Mark 4:21-34'] },
    ],
  },
  {
    title: 'Second Wednesday of Great Lent',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 18:1-11'] },
      { time: 'Morning', verses: ['Exodus 34:1-17', 'Proverbs 7:1-11', 'Zechariah 8:1-8', 'I John 1:1-15', 'I Corinthians 8:1-13', 'St. Luke 11:1-13'] },
    ],
  },
  {
    title: 'Second Thursday of Great Lent',
    sections: [
      { time: 'Evening', verses: ['St. Luke 16:1-13'] },
      { time: 'Morning', verses: ['Numbers 16:1-10', 'Isaiah 20:20-25', 'Acts 10:34-48', 'I Corinthians 9:1-12', 'St. Luke 18:1-8', 'St. Matthew 18:18-22'] },
    ],
  },
  {
    title: 'Second Friday of Great Lent',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 16:21-28'] },
      { time: 'Morning', verses: ['Exodus 21:20-27', 'Job 25:1-6', 'Acts 11:1-18', 'Romans 1:16-25', 'St. Matthew 5:38-48'] },
    ],
  },
  {
    title: 'Second Saturday of Great Lent',
    sections: [
      { time: 'Before Holy Qurbana', verses: ['Deuteronomy 30:1-7', 'Isaiah 35:1-10'] },
      { time: 'Holy Qurbana', verses: ['Acts 13:37-52', 'II Corinthians 8:1-9', 'St. Mark 1:21-31'] },
    ],
  },
  {
    title: 'Third Sunday of Great Lent (Palsy Sunday)',
    sections: [
      { time: 'Evening', verses: ['St. Luke 5:17-26'] },
      { time: 'Morning', verses: ['St. John 5:1-18'] },
      { time: 'Before Holy Qurbana', verses: ['Ezekiel 34:1-16', 'Exodus 4:10-17', 'II Kings 2:1-11', 'Isaiah 5:20-25'] },
      { time: 'Holy Qurbana', verses: ['Acts 5:12-16, 19:8-12', 'Romans 5:1-11', 'II Corinthians 12:7-10', 'St. Mark 2:1-12'] },
    ],
  },
  {
    title: 'Third Monday of Great Lent',
    sections: [
      { time: 'Morning', verses: ['Genesis 18:20-33', 'Judges 6:11-21', 'Acts 28:1-10', 'OR Revelations 2:1-7', 'I Timothy 6:1-12', 'St. Mark 2:13-22'] },
    ],
  },
  {
    title: 'Third Tuesday of Great Lent',
    sections: [
      { time: 'Evening', verses: ['St. Mark 10:17-27'] },
      { time: 'Morning', verses: ['Exodus 20:1-19', 'Job 31:1-15', 'Proverbs 3:1-12', 'St. James 1:27-2:13', 'Ephesians 2:1-18', 'St. Mark 4:1-20'] },
    ],
  },
  {
    title: 'Third Wednesday of Great Lent',
    sections: [
      { time: 'Evening', verses: ['St. Luke 9:44-50, 57-62'] },
      { time: 'Morning', verses: ['Leviticus 25:35-46', 'I Samuel 9:18-27', 'Isaiah 65:16-25', 'Acts 13:1-3', 'Ephesians 6:1-9', 'St. Luke 12:32-40'] },
    ],
  },
  {
    title: 'Third Thursday of Great Lent',
    sections: [
      { time: 'Evening', verses: ['St. Luke 13:18-30'] },
      { time: 'Morning', verses: ['Numbers 12:1-10', 'II Chronicles 26:16-21', 'Micah 6:1-8', 'St. James 4:1-17', 'Philippians 1:1-11', 'St. Mark 9:30-42'] },
    ],
  },
  {
    title: 'Third Friday of Great Lent',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 6:5-15'] },
      { time: 'Morning', verses: ['Deuteronomy 8:1-20', 'Isaiah 1:10-20', 'I Peter 3:7-15', 'Romans 2:2-13', 'St. Luke 18:9-17'] },
    ],
  },
  {
    title: 'Third Saturday of Great Lent',
    sections: [
      { time: 'Before Holy Qurbana', verses: ['Exodus 16:1-10', 'II Kings 4:38-44', 'Hosea 2:18-23'] },
      { time: 'Holy Qurbana', verses: ['I Peter 2:1-10', 'Philippians 2:12-30', 'St. Mark 8:1-10'] },
    ],
  },
  {
    title: 'Fourth Sunday of Great Lent (Canaanite Woman)',
    sections: [
      { time: 'Evening', verses: ['St. Mark 7:24-37'] },
      { time: 'Morning', verses: ['St. Luke 7:1-10'] },
      { time: 'Before Holy Qurbana', verses: ['I Samuel 7:10-17', 'Numbers 17:1-8', 'Isaiah 56:1-7'] },
      { time: 'Holy Qurbana', verses: ['Acts 4:1-12', 'Romans 7:14-25', 'St. Matthew 15:21-31'] },
    ],
  },
  {
    title: 'Fourth Monday of Great Lent',
    sections: [
      { time: 'Morning', verses: ['Leviticus 16:1-17', 'Amos 6:1-9', 'Acts 14:19-15:3', 'II Corinthians 11:1-15', 'St. Mark 12:35-44'] },
    ],
  },
  {
    title: 'Fourth Tuesday of Great Lent',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 20:1-16'] },
      { time: 'Morning', verses: ['Numbers 28:1-8', 'I Samuel 21:1-9', 'Acts 14:8-22', 'I Corinthians 16:13-24', 'St. Matthew 11:25-12:8'] },
    ],
  },
  {
    title: 'Fourth Wednesday of Great Lent (Mid Lent)',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 17:22-27'] },
      { time: 'Morning', verses: ['St. John 3:13-21'] },
      { time: 'Before Holy Qurbana', verses: ['Numbers 21:4-9', 'Psalms 34:1-9', 'Zechariah 12:6-14'] },
      { time: 'Holy Qurbana', verses: ['Acts 15:22-33', 'II Corinthians 9:1-15', 'St. John 3:13-21'] },
    ],
  },
  {
    title: 'Fourth Thursday of Great Lent',
    sections: [
      { time: 'Evening', verses: ['St. Luke 15:11-32'] },
      { time: 'Morning', verses: ['Deuteronomy 5:6-22', 'Psalms 41:1-3', 'Proverbs 22:1-12', 'Acts 15:35-40', 'II Corinthians 1:13-22', 'St. Matthew 19:16-26'] },
    ],
  },
  {
    title: 'Fourth Friday of Great Lent',
    sections: [
      { time: 'Evening', verses: ['St. Luke 16:19-31'] },
      { time: 'Morning', verses: ['Leviticus 19:9-18', 'Daniel 9:1-11', 'Acts 16:1-7', 'II Corinthians 12:19-13:13', 'St. Luke 17:1-10'] },
    ],
  },
  {
    title: 'Fourth Saturday of Great Lent',
    sections: [
      { time: 'Before Holy Qurbana', verses: ['Genesis 18:1-15', 'II Samuel 9:1-8'] },
      { time: 'Holy Qurbana', verses: ['Acts 16:8-15', 'I Corinthians 9:14-27', 'St. Luke 9:10-17'] },
    ],
  },
  {
    title: 'Fifth Sunday of Great Lent (Kpiptho / Crippled Woman)',
    sections: [
      { time: 'Evening', verses: ['St. Luke 10:25-37'] },
      { time: 'Morning', verses: ['St. Luke 7:11-17'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 9:1-7', 'Jeremiah 51:1-9', 'Isaiah 50:1-5', 'Baruch 51:13-30'] },
      { time: 'Holy Qurbana', verses: ['I Peter 3:8-16', 'Romans 12:1-15', 'St. Luke 13:10-17'] },
    ],
  },
  {
    title: 'Fifth Monday of Great Lent',
    sections: [
      { time: 'Morning', verses: ['Genesis 20:8-18', 'II Kings 2:19-25', 'Acts 19:13-22', 'Romans 9:14-21', 'St. Luke 4:31-41'] },
    ],
  },
  {
    title: 'Fifth Tuesday of Great Lent',
    sections: [
      { time: 'Evening', verses: ['St. Mark 3:1-12'] },
      { time: 'Morning', verses: ['Exodus 14:21-31', 'Isaiah 40:12-24', 'Acts 18:18-28', 'Romans 1:26-32', 'St. Mark 5:1-20'] },
    ],
  },
  {
    title: 'Fifth Wednesday of Great Lent',
    sections: [
      { time: 'Evening', verses: ['St. Mark 6:30-46'] },
      { time: 'Morning', verses: ['Deuteronomy 31:16-23', 'Isaiah 41:8-17', 'Acts 5:1-6', 'I Corinthians 10:1-13', 'St. Matthew 14:14-23'] },
    ],
  },
  {
    title: 'Fifth Thursday of Great Lent',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 14:23-36'] },
      { time: 'Morning', verses: ['Genesis 50:14-22', 'Isaiah 42:1-9', 'Acts 19:8-12', 'Colossians 3:1-17', 'St. Mark 6:47-56'] },
    ],
  },
  {
    title: 'Fifth Friday of Great Lent',
    sections: [
      { time: 'Evening', verses: ['St. Mark 5:21-43'] },
      { time: 'Morning', verses: ['Deuteronomy 27:16-28:8', 'II Kings 4:32-37', 'Hosea 6:1-6', 'Acts 16:16-23', 'I Timothy 1:1-20', 'St. Matthew 9:18-31'] },
    ],
  },
  {
    title: 'Fifth Saturday of Great Lent',
    sections: [
      { time: 'Before Holy Qurbana', verses: ['Deuteronomy 27:16-28:8', 'II Kings 4:32-37', 'Hosea 6:1-6'] },
      { time: 'Holy Qurbana', verses: ['Acts 5:33-42', 'I Thessalonians 2:13-20', 'St. Luke 6:1-11'] },
    ],
  },
  {
    title: 'Sixth Sunday of Great Lent (Catholicate Day)',
    sections: [
      { time: 'Evening', verses: ['St. Mark 10:46-52'] },
      { time: 'Morning', verses: ['St. Matthew 9:27-31'] },
      { time: 'Before Holy Qurbana', verses: ['Deuteronomy 25:13-16, 26:1-13', 'Job 42:1-10', 'Malachi 3:7-12'] },
      { time: 'Holy Qurbana', verses: ['I Peter 4:12-19', 'II Corinthians 9:6-15', 'OR Ephesians 5:1-14', 'St. John 9:1-41'] },
    ],
  },
  {
    title: 'Monday before Hosanna',
    sections: [
      { time: 'Morning', verses: ['Genesis 49:8-12', 'I Kings 17:10-16', 'Zechariah 9:9-14', 'Acts 2:37-47', 'I Thessalonians 4:1-12', 'St. Luke 18:31-34, 19:1-10'] },
    ],
  },
  {
    title: 'Tuesday before Hosanna',
    sections: [
      { time: 'Evening', verses: ['St. Luke 9:18-27'] },
      { time: 'Morning', verses: ['Genesis 41:38-52', 'I Samuel 17:34-51', 'Acts 21:1-14', 'Romans 8:12-27', 'St. Mark 10:32-45'] },
    ],
  },
  {
    title: 'Wednesday before Hosanna',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 8:23-9:1'] },
      { time: 'Morning', verses: ['Genesis 46:1-7', 'Isaiah 63:7-19', 'Daniel 7:9-18', 'Acts 14:8-19', 'Galatians 5:13-26', 'St. Mark 4:35-41'] },
    ],
  },
  {
    title: 'Thursday before Hosanna',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 7:1-12'] },
      { time: 'Morning', verses: ['Exodus 15:19-21', 'Joshua 6:1-5', 'Isaiah 51:1-8', 'Acts 16:23-40', 'II Corinthians 6:1-10', 'St. Mark 8:22-26', 'St. Matthew 20:17-19'] },
    ],
  },
  {
    title: 'Friday before Hosanna (40th Friday)',
    sections: [
      { time: 'Evening', verses: ['St. Luke 4:1-13'] },
      { time: 'Morning', verses: ['St. Matthew 4:1-11'] },
      { time: 'Before Holy Qurbana', verses: ['Deuteronomy 1:3-14', 'II Samuel 24:18-25', 'Isaiah 58:1-8'] },
      { time: 'Holy Qurbana', verses: ['I Peter 1:13-22', 'Romans 13:11-14:9', 'St. Matthew 4:1-11'] },
    ],
  },
  {
    title: 'Saturday before Hosanna (Lazarus\' Saturday)',
    sections: [
      { time: 'Evening', verses: ['St. Luke 10:38-42'] },
      { time: 'Morning', verses: ['St. John 11:1-8, 11-27'] },
      { time: 'Before Holy Qurbana', verses: ['Leviticus 27:30-33', 'Great Wisdom 11:22-12:5', 'Isaiah 61:1-9'] },
      { time: 'Holy Qurbana', verses: ['I Peter 2:6-10', 'Ephesians 1:15-2:7', 'St. John 11:28-46'] },
    ],
  },
  {
    title: 'Memory of Forty Martyrs (9th March, or Saturday after 9th if not on weekend)',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 10:16-33'] },
      { time: 'Morning', verses: ['St. Luke 12:1-12'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 4:3-12', 'Isaiah 30:1-4', 'Daniel 3:14-25'] },
      { time: 'Holy Qurbana', verses: ['Acts 4:19-33', 'Romans 8:31-39', 'St. Mark 8:34-38, 13:9-13'] },
    ],
  },
  {
    title: 'Annunciation to St. Mary (25th March)',
    description: 'We celebrate the Feast of Annunciation to St. Mary twice a year: on the 3rd Sunday after Koodhosh Eetho and on March 25th. Holy Eucharist must be celebrated on this day even if it comes during the Great Lent, during the Passion Week or on Good Friday. (The Holy Eucharist is not celebrated during the Great Lent days except all Saturdays and Sundays, Wednesday of Mid Lent, 40th Friday, and Maundy Thursday during the Passion week.)',
    sections: [
      { time: 'Evening', verses: ['St. Luke 8:16-21'] },
      { time: 'Morning', verses: ['St. Mark 3:31-35'] },
      { time: 'Before Holy Qurbana', verses: ['Deuteronomy 26:16-27:10', 'Judges 13:2-14', 'Zechariah 2:10-13, 4:1-7, 8:3', 'Isaiah 63:15-64:5'] },
      { time: 'Holy Qurbana', verses: ['I John 3:2-17', 'Hebrews 6:13-7:10', 'St. Luke 1:26-38'] },
    ],
  },
  {
    title: 'Hosanna / Palm Sunday (Boys\' and Girls\' Day)',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 21:1-17'] },
      { time: 'Midnight', verses: ['St. Mark 11:1-11'] },
      { time: 'Morning', verses: ['St. Luke 19:28-44'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 49:8-15', 'I Samuel 2:18-26, 16:1', 'Daniel 1:16-20', 'Micah 4:1-5', 'I Kings 3:4-14', 'Zephaniah 3:11-20', 'Jeremiah 30:18-22'] },
      { time: 'Holy Qurbana', verses: ['I John 5:1-12', 'Romans 8:18-25', 'Ephesians 6:1-24', 'St. John 12:12-19'] },
      { time: 'For Procession (at the Western Entrance)', verses: ['St. Luke 19:28-40'] },
      { time: 'For the Blessing of the Palm leaves', verses: ['Zechariah 9:9-12', 'Isaiah 51:9-11', 'I John 2:7-14', 'Romans 11:13-24', 'St. Mark 11:1-11'] },
    ],
  },
  {
    title: 'Monday of the Passion Week',
    sections: [
      { time: 'Evening', verses: ['St. Luke 19:41-20:8'] },
      { time: 'First Qaumo', verses: ['St. Matthew 21:33-46'] },
      { time: 'Second Qaumo', verses: ['St. Luke 14:12-24'] },
      { time: 'Vadhe Dhalmeeno', verses: ['St. Matthew 25:1-13'] },
      { time: 'Third Qaumo', verses: ['St. Matthew 22:1-14'] },
      { time: 'Morning', verses: ['Genesis 3:1-21', 'Judges 11:30-40', 'Isaiah 28:5-13', 'Acts 25:6-12', 'Hebrews 1:6-2:4', 'St. Matthew 21:23-32, 17:10-13'] },
      { time: 'Third Hour (9 a.m.)', verses: ['St. Matthew 19:1-12', 'St. Luke 9:43-45'] },
      { time: 'Noon', verses: ['St. Matthew 22:41-23:12'] },
    ],
  },
  {
    title: 'Tuesday of the Passion Week',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 22:15-33'] },
      { time: 'First Qaumo', verses: ['St. Matthew 12:38-45', 'St. Luke 11:53-55'] },
      { time: 'Second Qaumo', verses: ['St. John 2:12-25, 3:13-21'] },
      { time: 'Third Qaumo', verses: ['St. John 5:30-6:4'] },
      { time: 'Morning', verses: ['Deuteronomy 31:14-21', 'Zephaniah 1:11-18', 'I John 1:1-9', 'Hebrews 2:5-18', 'St. John 8:28-59'] },
      { time: 'Third Hour (9 a.m.)', verses: ['St. John 7:45-52, 8:12-20'] },
      { time: 'Noon (12 p.m.)', verses: ['St. Luke 11:37-54'] },
      { time: 'Ninth Hour (3 p.m.)', verses: ['St. John 6:30, 8:21-30', 'St. Matthew 23:13-39'] },
    ],
  },
  {
    title: 'Wednesday of the Passion Week',
    sections: [
      { time: 'Evening', verses: ['St. John 11:47-12:2, 9-11'] },
      { time: 'First Qaumo', verses: ['St. John 10:15-38'] },
      { time: 'Second Qaumo', verses: ['St. John 12:19-33'] },
      { time: 'Third Qaumo', verses: ['St. John 12:34-50'] },
      { time: 'Morning', verses: ['Leviticus 6:24-7:7', 'I Samuel 16:1-13', 'Isaiah 5:1-7', 'Acts 19:21-41', 'Colossians 1:9-23', 'St. John 6:63-7:13'] },
      { time: 'Third Hour (9 a.m.)', verses: ['St. John 7:14-27'] },
      { time: 'Noon', verses: ['St. John 7:28-44'] },
      { time: 'Ninth Hour (3 p.m.)', verses: ['St. Luke 13:31-35'] },
    ],
  },
  {
    title: 'Passover (Maundy Thursday)',
    sections: [
      { time: 'Evening', verses: ['St. John 7:45-52, 8:12-20'] },
      { time: 'First Qaumo', verses: ['St. Matthew 26:1-30'] },
      { time: 'Second Qaumo', verses: ['St. John 6:24-40'] },
      { time: 'Third Qaumo', verses: ['St. John 6:41-63'] },
      { time: 'Morning', verses: ['St. Luke 22:1-13'] },
      { time: 'Third Hour (9 a.m.)', verses: ['St. John 12:20-36'] },
      { time: 'Noon (12 p.m.)', verses: ['St. Luke 7:36-50', 'St. Mark 14:1-2'] },
      { time: 'Before Holy Qurbana', verses: ['Exodus 12:1-11', 'Leviticus 16:3-10', 'Ezekiel 45:18-25'] },
      { time: 'Holy Qurbana', verses: ['Acts 1:15-20', 'I Corinthians 5:1-8, 11:23-34', 'St. Luke 22:14-30'] },
      { time: 'Ninth Hour (3 p.m.)', verses: ['St. Matthew 26:31-35'] },
      { time: 'For Feet Washing Service', verses: ['Exodus 34:18-26', 'II Kings 23:21-25', 'Isaiah 50:4-10', 'I Peter 3:17-22', 'Hebrews 10:19-29', 'St. John 13:1-20'] },
    ],
  },
  {
    title: 'Good Friday',
    sections: [
      { time: 'Evening', verses: ['St. Luke 22:1-30'] },
      { time: 'First Qauma', verses: ['St. Matthew 26:31-46'] },
      { time: 'Second Qauma', verses: ['St. Mark 14:27-52'] },
      { time: 'Third Qauma', verses: ['St. Luke 22:31-62'] },
      { time: 'Morning', verses: ['Leviticus 4:1-7, 16:3-34', 'Numbers 19:1-11', 'Acts 22:30-23:16', 'I Corinthians 1:18-31', 'Hebrews 9:11-14', 'St. Matthew 27:3-10', 'St. Mark 15:1-10', 'St. Luke 22:63-71'] },
      { time: 'Third Hour (9 a.m.)', verses: ['St. Matthew 27:26-31', 'St. Luke 23:2-3, 4-16, 23-25', 'St. John 18:28-40', 'St. Mark 15:12-18'] },
      { time: 'Noon (12 p.m.)', verses: ['St. Luke 23:26-34', 'St. Matthew 27:34', 'St. John 19:23-24', 'St. Matthew 27:36-37, 39-43', 'St. Luke 23:39-45', 'St. John 19:25-27'] },
      { time: 'Ninth Hour (3 p.m.)', verses: ['St. Matthew 27:55-56, 49', 'St. Mark 15:33-41', 'St. Luke 23:44-49', 'St. John 19:23-30'] },
      { time: 'Veneration of the Holy Cross', verses: ['Genesis 22:1-14', 'Exodus 17:8-14', 'Isaiah 52:13-53:12', 'I Peter 2:19-25', 'Galatians 2:20-3:14, 6:11-18', 'St. Luke 23:55-56', 'St. John 19:31-42'] },
    ],
  },
  {
    title: 'Gospel Saturday (Saturday of Good Tidings)',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 27:6', 'St. Luke 23:55-56', 'St. John 19:31-42'] },
      { time: 'Morning', verses: ['St. Matthew 27:62-66'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 8:1-12', 'Zechariah 12:11-13:7', 'Jeremiah 38:2-13', 'Micah 7:8-13'] },
      { time: 'Holy Qurbana', verses: ['I Peter 3:13-22', 'Romans 6:1-14', 'St. Matthew 27:62-66'] },
      { time: 'Shub-khono', verses: ['I John 4:11-21', 'I Corinthians 13:4-10', 'St. Matthew 18:12-35'] },
    ],
  },
];
