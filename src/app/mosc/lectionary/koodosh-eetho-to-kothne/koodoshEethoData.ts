/**
 * Lectionary data for Koodosh Eetho to Kothne.
 * Source: https://mosc.in/lectionary/421-2/
 */

export type KoodoshSection = { time: string; verses: string[] };
export type KoodoshPeriod = {
  title: string;
  description?: string;
  sections: KoodoshSection[];
};

export const koodoshEethoPeriods: KoodoshPeriod[] = [
  {
    title: 'Koodhosh Eetho (Sanctification) Sunday',
    description: 'The Sunday that comes on or after October 30th is called Koodhosh Eetho (Sanctification of Church) Sunday. It is the beginning of the church calendar.',
    sections: [
      { time: 'Evening', verses: ['St. Mark 8:27-33'] },
      { time: 'Morning', verses: ['St. John 21:15-22'] },
      { time: 'Before Holy Qurbana', verses: ['Exodus 33:7-11', 'Exodus 40:17-38', 'Isaiah 6:1-8'] },
      { time: 'Holy Qurbana', verses: ['I Peter 2:1-12', 'I Corinthians 3:16-17, 6:15-20', 'St. Matthew 16:13-23'] },
    ],
  },
  {
    title: 'Hoodhosh Eetho (Dedication) Sunday',
    description: 'The Sunday after Koodhosh Eetho is called Hoodhosh Eetho (Dedication of Church) Sunday.',
    sections: [
      { time: 'Evening', verses: ['St. Luke 19:47-20:8'] },
      { time: 'Morning', verses: ['St. Mark 12:41-44'] },
      { time: 'Before Holy Qurbana', verses: ['Exodus 33:7-11', 'I Kings 8:22-40', 'Isaiah 55:1-13'] },
      { time: 'Holy Qurbana', verses: ['Acts 7:44-53 or Revelation 3:14-22', 'Hebrews 9:1-14', 'St. John 10:22-38'] },
    ],
  },
  {
    title: 'Annunciation to Zachariah (Parents\' day)',
    description: 'This Sunday is commemorated as the day when John the Baptist\'s birth was announced to Zachariah by Angel Gabriel.',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 19:3-12'] },
      { time: 'Morning', verses: ['St. Luke 10:38-42'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 2:18-25', 'Genesis 17:15-22', 'Numbers 8:13-20', 'Ruth 1:11-18', 'I Samuel 1:9-17', 'Psalms 133:1-3', 'Isaiah 41:8-15'] },
      { time: 'Holy Qurbana', verses: ['II Peter 1:1-15', 'Ephesians 5:21-6:4', 'St. Luke 1:5-25'] },
    ],
  },
  {
    title: 'Annunciation to St. Mary, Mother of God',
    sections: [
      { time: 'Evening', verses: ['St. Luke 8:16-21'] },
      { time: 'Morning', verses: ['St. Mark 3:31-35'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 28:10-22', 'Judges 13:2-14', 'Zechariah 2:10-13, 4:1-7, 8:3', 'Isaiah 63:15-64:5'] },
      { time: 'Holy Qurbana', verses: ['I John 3:2-17', 'Galatians 4:1-7', 'Hebrews 2:14-18', 'St. Luke 1:26-38'] },
    ],
  },
  {
    title: 'St. Mary\'s visit to Elizabeth (Womens\' day)',
    sections: [
      { time: 'Evening', verses: ['St. Luke 8:1-3'] },
      { time: 'Morning', verses: ['St. Luke 10:38-42'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 1:24-31, 24:15-38', 'Judges 4:4-16', 'I Samuel 25:1-35', 'II Kings 5:1-5', 'Esther 4:1-17', 'Proverbs 14:1, 19:14, 31:10-31'] },
      { time: 'Holy Qurbana', verses: ['I Peter 3:1-7', 'I Timothy 2:9-15, 3:11-13', 'St. Luke 1:39-56'] },
    ],
  },
  {
    title: 'Birth of John the Baptist (Children\'s day)',
    sections: [
      { time: 'Evening', verses: ['St. Mark 10:13-16'] },
      { time: 'Morning', verses: ['St. Matthew 11:11-19'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 21:1-21', 'Exodus 2:1-10', 'I Samuel 1:20-28, 2:18-26', 'Psalms 127:1-5', 'Isaiah 62:1-12'] },
      { time: 'Holy Qurbana', verses: ['I John 3:1-3', 'Ephesians 6:1-4', 'Colossians 3:20-21', 'St. Luke 1:57-80'] },
    ],
  },
  {
    title: 'Annunciation to St. Joseph',
    sections: [
      { time: 'Evening', verses: ['St. John 6:30-46'] },
      { time: 'Morning', verses: ['St. John 6:30-46'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 13:1-11', 'Isaiah 1:2-9'] },
      { time: 'Holy Qurbana', verses: ['I Peter 2:11-17', 'Galatians 1:11-24', 'St. Matthew 1:18-25'] },
    ],
  },
  {
    title: 'Sunday before Christmas',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 1:1-18'] },
      { time: 'Morning', verses: ['St. John 1:1-18'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 46:8-27', 'I Kings 9:3-7', 'Isaiah 7:14-15, 11:1-9'] },
      { time: 'Holy Qurbana', verses: ['Acts 3:16-26', 'Romans 4:13-25', 'Galatians 4:18-20', 'St. Luke 3:23-38'] },
    ],
  },
  {
    title: 'Yeldho / Incarnation of our Lord (Christmas) (December 25)',
    sections: [
      { time: 'Evening', verses: ['St. John 1:1-18'] },
      { time: 'By the fire-pit', verses: ['Hebrews 1:1-12', 'St. Luke 2:1-14'] },
      { time: 'Morning', verses: ['St. Luke 2:15-20'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 21:1-8', 'Micah 5:1-4', 'Isaiah 9:1-7'] },
      { time: 'Holy Qurbana', verses: ['I John 1:1-10', 'Galatians 3:23-4:7', 'St. Matthew 2:1-12'] },
    ],
  },
  {
    title: 'Feast of the glory of St. Mary, Mother of God',
    sections: [
      { time: 'Evening', verses: ['St. Luke 2:15-20'] },
      { time: 'Morning', verses: ['St. Luke 11:23-32'] },
      { time: 'Before Holy Qurbana', verses: ['Exodus 3:1-10', 'Ezekiel 44:1-12'] },
      { time: 'Holy Qurbana', verses: ['Acts 7:30-43', 'Romans 1:1-10', 'St. Luke 8:16-21'] },
    ],
  },
  {
    title: 'Massacre of the Infants (December 27)',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 2:13-18'] },
      { time: 'Morning', verses: ['St. Mark 6:1-6'] },
      { time: 'Before Holy Qurbana', verses: ['Exodus 1:1-22', 'Jeremiah 31:15-20', 'Isaiah 60:8-14'] },
      { time: 'Holy Qurbana', verses: ['Acts 7:11-29', 'Romans 15:1-7', 'St. Matthew 2:13-18'] },
    ],
  },
  {
    title: 'First Sunday after Christmas (The Holy Family flee to Egypt)',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 10:16-23'] },
      { time: 'Morning', verses: ['St. John 15:18-21'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 37:13-28', 'Zechariah 8:3-8', 'Isaiah 5:20-30'] },
      { time: 'Holy Qurbana', verses: ['Acts 16:6-10', 'I Corinthians 10:1-13', 'St. Matthew 2:9-15, 19-23'] },
    ],
  },
  {
    title: 'New Year (January 1) Circumcision of our Lord, Feast of St. Basil and St. Gregory.',
    sections: [
      { time: 'Evening', verses: ['St. Luke 13:6-9'] },
      { time: 'Morning', verses: ['St. John 9:4-7'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 12:1-9', 'Deuteronomy 10:12-11:1', 'Ezekiel 18:21-24'] },
      { time: 'Holy Qurbana', verses: ['I John 3:13-18', 'Romans 2:28-3:8', 'St. Luke 2:21', 'St. John 15:5-19'] },
    ],
  },
  {
    title: 'Second Sunday after Christmas',
    sections: [
      { time: 'Evening', verses: ['St. John 1:35-42'] },
      { time: 'Morning', verses: ['St. John 1:43-51'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 37:1-11', 'I Samuel 2:18-21', 'Isaiah 26:1-12'] },
      { time: 'Holy Qurbana', verses: ['I John 3:21-24', 'Hebrews 11:23-31', 'St. Luke 2:40-52'] },
    ],
  },
  {
    title: 'Baptism of our Lord Jesus Christ (6th January)',
    description: 'This festival is called Danaha in Syriac meaning \'Dawn\'. Also called Epiphany or Theophany.',
    sections: [
      { time: 'Evening', verses: ['St. Mark 1:1-11'] },
      { time: 'Morning', verses: ['St. Matthew 3:1-17'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 24:10-20', 'II Kings 3:19-25', 'Ezekiel 47:1-12', 'Isaiah 12:1-6'] },
      { time: 'Holy Qurbana', verses: ['Acts 19:1-7', 'Titus 2:11-3:9', 'St. Luke 3:7-22'] },
      { time: 'Blessing of the Water', verses: ['Acts 8:35-40', 'Hebrews 10:15-25', 'St. John 4:1-42'] },
    ],
  },
  {
    title: 'Beheading of St. John the Baptist (7th January)',
    sections: [
      { time: 'Evening', verses: ['St. Luke 3:1-14, 19-20'] },
      { time: 'Morning', verses: ['St. Mark 6:14-29'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 4:1-15', 'Jeremiah 37:11-21', 'Isaiah 40:3-8, 41:8-13'] },
      { time: 'Holy Qurbana', verses: ['I Peter 3:12-17', 'Romans 8:35-39', 'St. Matthew 14:1-12'] },
    ],
  },
  {
    title: 'Feast of St. Stephen (8th January)',
    sections: [
      { time: 'Evening', verses: ['St. Mark 12:1-12'] },
      { time: 'Morning', verses: ['St. John 8:34-59'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 4:1-15', 'Isaiah 37:8-20', 'Baruch 50:1-2'] },
      { time: 'Holy Qurbana', verses: ['Acts 7:51-8:2', 'Romans 8:35-39', 'St. Matthew 23:34-39'] },
    ],
  },
  {
    title: 'First Sunday after Baptism of our Lord',
    sections: [
      { time: 'Evening', verses: ['St. Mark 1:14-34'] },
      { time: 'Morning', verses: ['St. John 1:18-28'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 25:19-34, 30:36-31:2', 'II Kings 5:1-14', 'Isaiah 49:7-13'] },
      { time: 'Holy Qurbana', verses: ['Acts 2:37-47', 'Ephesians 1:3-14', 'St. Matthew 4:12-22'] },
    ],
  },
  {
    title: 'Second Sunday after Baptism of our Lord',
    sections: [
      { time: 'Evening', verses: ['St. John 1:26-34'] },
      { time: 'Morning', verses: ['St. John 1:35-42'] },
      { time: 'Before Holy Qurbana', verses: ['Leviticus 22:26-33', 'Proverbs 9:1-9', 'Isaiah 51:1-8'] },
      { time: 'Holy Qurbana', verses: ['I Peter 3:7-15', 'Hebrews 1:1, 2:4', 'St. John 1:43-51'] },
    ],
  },
  {
    title: 'Third Sunday after Baptism of our Lord',
    sections: [
      { time: 'Evening', verses: ['St. John 3:22-4:3'] },
      { time: 'Morning', verses: ['St. John 5:30-47'] },
      { time: 'Before Holy Qurbana', verses: ['II Kings 2:19-22', 'Joel 2:21-32', 'Jeremiah 31:1-12'] },
      { time: 'Holy Qurbana', verses: ['Acts 17:16-34', 'I Corinthians 3:16-4:5', 'St. John 3:1-12'] },
    ],
  },
  {
    title: 'Fourth Sunday after Baptism (Sunday for Workers)',
    sections: [
      { time: 'Evening', verses: ['St. Luke 7:18-23'] },
      { time: 'Morning', verses: ['St. Mark 12:28-37'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 2:4-17', 'Deuteronomy 18:9-16', 'Isaiah 40:27-31'] },
      { time: 'Holy Qurbana', verses: ['Acts 18:1-4, 20:33-35', 'James 5:1-14', 'I Corinthians 12:12-27', 'I Thessalonians 4:9-12', 'II Thessalonians 3:6-15', 'St. Mark 6:1-6'] },
    ],
  },
  {
    title: 'Fifth Sunday after Baptism of our Lord',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 11:1-15'] },
      { time: 'Morning', verses: ['St. Luke 5:1-11'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 9:12-17', 'Psalms 29:1-11', 'Isaiah 41:8-20'] },
      { time: 'Holy Qurbana', verses: ['Acts 9:10-21', 'II Corinthians 4:1-6', 'St. Mark 1:12-20'] },
    ],
  },
  {
    title: 'Mayaltho (Entry of our Lord into the temple)',
    description: 'February 2nd is celebrated as the day when infant Jesus was presented in the temple. Also called the day of the old aged. Feast of St. Simon and St. Hanna.',
    sections: [
      { time: 'Evening', verses: ['St. Luke 2:22-40'] },
      { time: 'Morning', verses: ['St. Luke 2:22-40'] },
      { time: 'Before Holy Qurbana', verses: ['Leviticus 12:1-8, 19:30-37', 'Proverbs 6:20-24, 23:22-26', 'Isaiah 11:1-10'] },
      { time: 'Holy Qurbana', verses: ['Acts 24:10-23', 'Ephesians 3:13-21, 6:1-4', 'St. Luke 2:22-40'] },
    ],
  },
  {
    title: 'All Departed Holy Fathers (February 3)',
    sections: [
      { time: 'Evening', verses: ['St. Luke 13:22-30'] },
      { time: 'Morning', verses: ['St. Matthew 5:1-20'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 39:11-23', 'Lamentations 3:1-21'] },
      { time: 'Holy Qurbana', verses: ['St. James 1:12-21', 'II Timothy 3:10-15', 'St. Luke 6:20-31'] },
    ],
  },
  {
    title: 'Monday of Three days Lent',
    description: 'The three day lent is a lent of attrition and repentance commemorating the repentance of the people Nineveh at the preaching of Prophet Jonah. This lent starts three weeks before the start of the Great Lent.',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 12:31-41'] },
      { time: 'Morning', verses: ['Numbers 5:5-10', 'Jonah 1:1-17', 'Isaiah 19:17-22', 'Acts 13:6-12', 'Colossians 1:3-13', 'St. Matthew 7:1-12'] },
    ],
  },
  {
    title: 'Tuesday of Three days Lent',
    sections: [
      { time: 'Evening', verses: ['St. Luke 4:24-32'] },
      { time: 'Morning', verses: ['Exodus 22:28-30', 'Micah 1:1-16', 'Jonah 2:1-10', 'Nahum 1:1-14', 'Isaiah 57:13-19', 'Acts 8:9-25', 'Romans 1:18-32', 'St. Matthew 24:36-46'] },
    ],
  },
  {
    title: 'Wednesday of Three days Lent',
    sections: [
      { time: 'Evening', verses: ['St. Luke 11:5-13, 29-32'] },
      { time: 'Morning', verses: ['Exodus 23:1-9', 'Zephaniah 1:11-2:4', 'Jonah 3:1-10', 'Isaiah 41:17-26', 'St. James 1:13-27', 'Romans 15:24-33', 'St. Luke 11:27-36'] },
      { time: 'Holy Qurbana', verses: ['II Peter 2:1-18', 'I Thessalonians 5:12-24', 'St. Matthew 12:38-50'] },
    ],
  },
  {
    title: 'Thursday / The end of Three days Lent',
    sections: [
      { time: 'Before Holy Qurbana', verses: ['Genesis 18:23-33', 'Joshua 7:6-20', 'Jonah 4:1-11'] },
      { time: 'Holy Qurbana', verses: ['St. James 4:7-17', 'Ephesians 5:3-21', 'St. Luke 12:54-13:9'] },
    ],
  },
  {
    title: 'All Departed Priests',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 25:13-30'] },
      { time: 'Morning', verses: ['St. Luke 19:11-28'] },
      { time: 'Before Holy Qurbana', verses: ['Numbers 20:23-29', 'Deuteronomy 34:1-8', 'Isaiah 65:13-20'] },
      { time: 'Holy Qurbana', verses: ['Acts 20:26-38', 'I Thessalonians 4:13-5:11', 'St. Matthew 24:42-51'] },
    ],
  },
  {
    title: 'All the Departed Faithful',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 25:31-46'] },
      { time: 'Morning', verses: ['St. John 5:19-29'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 49:33-50:13', 'Ezekiel 34:1-14', 'Isaiah 38:10-20', 'Maccabees 12:38-45'] },
      { time: 'Holy Qurbana', verses: ['St. James 3:1-12', 'I Corinthians 15:20-28', 'St. Luke 12:32-48'] },
    ],
  },
  {
    title: 'First Sunday of Great Lent (Kothine Sunday) (Pethurtha of the Great Lent)',
    description: 'The Great Lent starts by commemorating the first miracle performed by Jesus i.e. turning water into wine at the wedding feast at Cana of Galilee. The Gospel reading for each Sunday of the Great Lent is about a miracle performed by Jesus.',
    sections: [
      { time: 'Evening', verses: ['St. John 3:1-6'] },
      { time: 'Morning', verses: ['St. Luke 16:1-18'] },
      { time: 'Before Holy Qurbana', verses: ['Exodus 20:1-21', 'Joel 2:12-20', 'Isaiah 58:5-14'] },
      { time: 'Holy Qurbana', verses: ['Acts 11:19-26', 'OR Revelation 2:1-7', 'Colossians 3:1-17', 'St. John 2:1-11'] },
    ],
  },
];
