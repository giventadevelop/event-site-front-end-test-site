/**
 * Lectionary data for Kyomtho (Easter) to Koodosh Edtho.
 * Source: https://mosc.in/lectionary/kyomtho-easter-to-koodosh-edtho/
 */

export type EasterSection = { time: string; verses: string[] };
export type EasterPeriod = {
  title: string;
  description?: string;
  sections: EasterSection[];
};

export const easterPeriod: EasterPeriod[] = [
  {
    title: 'Easter Sunday',
    sections: [
      { time: 'Evening', verses: ['St. Mark 16:1-8'] },
      { time: 'Midnight', verses: ['St. Luke 24:1-12'] },
      { time: 'Morning', verses: ['St. John 20:1-18'] },
      { time: 'Celebration of the Holy Cross', verses: ['Isaiah 60:17-22', 'I Peter 5:5-14', 'Romans 16:1-16', 'St. John 14:27, 15:11-15, 17-19'] },
      { time: 'Before Holy Qurbana', verses: ['Leviticus 23:26-32', 'Isaiah 60:1-7, 11-16, 61:10-62:5', 'Joel 2:21-3'] },
      { time: 'Holy Qurbana', verses: ['Acts 2:22-36', 'I Corinthians 15:1-19', 'St. Matthew 28:1-20'] },
    ],
  },
  {
    title: 'Hevorae Monday (Monday after Easter)',
    sections: [
      { time: 'Evening', verses: ['St. Luke 24:13-35'] },
      { time: 'Morning', verses: ['St. Matthew 28:11-20'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 41:41-46', 'Jeremiah 1:4-12', 'Isaiah 40:9-15'] },
      { time: 'Holy Qurbana', verses: ['I Peter 5:1-8', 'Romans 6:12-23', 'St. John 2:18-25'] },
    ],
  },
  {
    title: 'Hevorae Tuesday',
    sections: [
      { time: 'Evening', verses: ['St. Mark 15:37-47, 16:1-8'] },
      { time: 'Morning', verses: ['St. Mark 16:9-18'] },
      { time: 'Before Holy Qurbana', verses: ['Exodus 14:26-31', 'Joshua 6:6-21', 'Great Wisdom 1:1-18'] },
      { time: 'Holy Qurbana', verses: ['Acts 13:26-39', 'Ephesians 6:10-20', 'St. Mark 8:11-21'] },
    ],
  },
  {
    title: 'Hevorae Wednesday',
    sections: [
      { time: 'Evening', verses: ['St. Luke 23:46-56, 24:1-12'] },
      { time: 'Morning', verses: ['St. Luke 24:13-35'] },
      { time: 'Before Holy Qurbana', verses: ['Exodus 40:1-16', 'Joshua 2:1-6', 'Isaiah 49:13-21'] },
      { time: 'Holy Qurbana', verses: ['Acts 4:8-21', 'Hebrews 3:1-13', 'St. Mark 8:27-33'] },
    ],
  },
  {
    title: 'Hevorae Thursday',
    sections: [
      { time: 'Evening', verses: ['St. John 19:30-20:2'] },
      { time: 'Morning', verses: ['St. John 20:3-18'] },
      { time: 'Before Holy Qurbana', verses: ['Exodus 34:4-12', 'Micah 4:1-7', 'Zechariah 8:4-9', 'Isaiah 37:8-17'] },
      { time: 'Holy Qurbana', verses: ['I John 5:13-21', 'Hebrews 11:3-6', 'St. Matthew 16:20-27'] },
    ],
  },
  {
    title: 'Hevorae Friday',
    sections: [
      { time: 'Evening', verses: ['St. John 20:18-23'] },
      { time: 'Morning', verses: ['St. Matthew 28:1-11'] },
      { time: 'Before Holy Qurbana', verses: ['Deuteronomy 16:1-8', 'Joshua 8:30-33', 'Isaiah 54:1-8'] },
      { time: 'Holy Qurbana', verses: ['I Peter 3:17-22', 'Hebrews 11:32-40', 'St. Mark 9:9-13'] },
    ],
  },
  {
    title: 'Hevorae Saturday',
    sections: [
      { time: 'Evening', verses: ['St. Luke 24:36-45'] },
      { time: 'Morning', verses: ['St. Matthew 28:1-20'] },
      { time: 'Before Holy Qurbana', verses: ['Joshua 1:5-9', 'Leviticus 25:1-7', 'Isaiah 44:23-28'] },
      { time: 'Holy Qurbana', verses: ['Acts 26:19-25', 'Philippians 2:1-11', 'St. Matthew 22:23-33'] },
    ],
  },
  {
    title: 'New Sunday (Sunday after Easter – The Sunday of the Youth)',
    sections: [
      { time: 'Evening', verses: ['St. John 20:19-31'] },
      { time: 'Morning', verses: ['St. John 4:31-38'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 41:41-46', 'Ecclesiastes 12:1-8', 'Jeremiah 1:4-12', 'Isaiah 40:9-15'] },
      { time: 'Holy Qurbana', verses: ['I Peter 2:19-25', 'II Timothy 2:1-13', 'St. John 20:19-31'] },
    ],
  },
  {
    title: 'First Sunday after New Sunday',
    sections: [
      { time: 'Evening', verses: ['St. John 21:15-25'] },
      { time: 'Morning', verses: ['St. John 21:1-14'] },
      { time: 'Before Holy Qurbana', verses: ['Exodus 14:26-31', 'Joshua 6:9-21', 'Great Wisdom 1:1-8'] },
      { time: 'Holy Qurbana', verses: ['Acts 13:26-39', 'Ephesians 6:10-20', 'St. John 21:1-14'] },
    ],
  },
  {
    title: 'Second Sunday after New Sunday',
    sections: [
      { time: 'Evening', verses: ['St. John 6:16-29'] },
      { time: 'Morning', verses: ['St. Matthew 14:22-33'] },
      { time: 'Before Holy Qurbana', verses: ['Exodus 40:1-16', 'Joshua 2:1-6', 'Isaiah 49:13-21'] },
      { time: 'Holy Qurbana', verses: ['Acts 4:8-21', 'Hebrews 3:1-13', 'St. John 21:15-19'] },
    ],
  },
  {
    title: 'Third Sunday after New Sunday',
    sections: [
      { time: 'Evening', verses: ['St. Luke 5:27-39'] },
      { time: 'Morning', verses: ['St. John 6:47-58'] },
      { time: 'Before Holy Qurbana', verses: ['Exodus 34:4-12', 'Micah 4:1-7', 'Zechariah 8:4-9', 'Isaiah 37:8-17'] },
      { time: 'Holy Qurbana', verses: ['I John 5:13-21', 'Hebrews 11:3-6', 'St. Luke 24:13-35'] },
    ],
  },
  {
    title: 'Fourth Sunday after New Sunday',
    sections: [
      { time: 'Evening', verses: ['St. John 14:1-16'] },
      { time: 'Morning', verses: ['St. John 16:16-30'] },
      { time: 'Before Holy Qurbana', verses: ['Deuteronomy 16:1-8', 'Joshua 8:30-35', 'Isaiah 54:1-8'] },
      { time: 'Holy Qurbana', verses: ['I Peter 3:17-22', 'Hebrews 11:32-40', 'St. Luke 9:51-62'] },
    ],
  },
  {
    title: 'Ascension of our Lord (Thursday after the fourth Sunday following New Sunday)',
    sections: [
      { time: 'Evening', verses: ['St. Mark 16:14-20'] },
      { time: 'Morning', verses: ['St. Luke 24:36-53'] },
      { time: 'Before Holy Qurbana', verses: ['Deuteronomy 9:26-10:5', 'Jeremiah 31:31-34', 'II Kings 2:9-15', 'Isaiah 48:20-49:4'] },
      { time: 'Holy Qurbana', verses: ['Acts 1:4-11', 'Ephesians 4:1-16', 'St. Luke 24:36-53'] },
    ],
  },
  {
    title: 'Sunday before Pentecost (Sunday of the Monks)',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 19:16-30'] },
      { time: 'Morning', verses: ['St. Mark 10:17-22'] },
      { time: 'Before Holy Qurbana', verses: ['Leviticus 25:1-13', 'Joshua 1:5-9', 'Isaiah 44:23-25'] },
      { time: 'Holy Qurbana', verses: ['Acts 21:7-9', 'I Corinthians 7:1-2, 25-34, 9:1-10', 'St. John 17:13-26'] },
    ],
  },
  {
    title: 'Pentecost (Fiftieth day after Easter) Sunday School day',
    sections: [
      { time: 'Evening', verses: ['St. John 14:15-31'] },
      { time: 'Morning', verses: ['St. John 15:20-25'] },
      { time: 'Before Holy Qurbana', verses: ['Numbers 11:16-35', 'I Samuel 10:9-15', 'II Kings 2:14-17, 12:1-27', 'Ezekiel 11:17-20, 36:25-27', 'Isaiah 42:1-27'] },
      { time: 'Holy Qurbana', verses: ['Acts 2:1-13', 'Galatians 5:16-26', 'St. John 15:1-14'] },
      { time: 'Service of the First Kneeling', verses: ['Genesis 11:1-9', 'II Kings 2:14-17', 'Acts 19:1-7', 'I Corinthians 14:20-25', 'St. John 14:1-17'] },
      { time: 'Service of the Second Kneeling', verses: ['Ezekiel 37:1-14', 'Joel 2:25-32', 'Acts 10:34-48', 'I Corinthians 12:12-27', 'St. John 14:25-31'] },
      { time: 'Service of the Third Kneeling', verses: ['Judges 13:24-14:7', 'Ezekiel 47:1-12', 'Isaiah 47:1-15', 'Acts 2:1-21', 'I Corinthians 14:20-33', 'St. John 16:1-15'] },
    ],
  },
  {
    title: 'Golden Friday (Friday after Pentecost)',
    sections: [
      { time: 'Evening', verses: ['St. Luke 22:24-30'] },
      { time: 'Morning', verses: ['St. Matthew 9:36-10:15'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 12:1-9', 'Psalms 1', 'Isaiah 43:1-7'] },
      { time: 'Holy Qurbana', verses: ['Acts 3:1-20', 'I Corinthians 12:28-13:10', 'St. Matthew 19:23-30'] },
    ],
  },
  {
    title: 'First Sunday after Pentecost',
    sections: [
      { time: 'Evening', verses: ['St. Luke 8:4-15'] },
      { time: 'Morning', verses: ['St. Matthew 11:20-24'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 41:38-40', 'Exodus 12:31-40', 'Joshua 5:9-12', 'Jeremiah 29:10-16'] },
      { time: 'Holy Qurbana', verses: ['Acts 17:10-15', 'II Corinthians 5:14-6:10', 'St. John 6:26-35'] },
    ],
  },
  {
    title: 'Second Sunday after Pentecost',
    sections: [
      { time: 'Evening', verses: ['St. Luke 6:12-23'] },
      { time: 'Morning', verses: ['St. Mark 3:7-19'] },
      { time: 'Before Holy Qurbana', verses: ['Leviticus 19:1-8', 'II Samuel 5:1-10', 'Daniel 6:25-28'] },
      { time: 'Holy Qurbana', verses: ['Acts 4:23-31', 'Ephesians 2:11-22', 'St. Matthew 10:5-16'] },
    ],
  },
  {
    title: 'Third Sunday after Pentecost',
    sections: [
      { time: 'Evening', verses: ['St. Mark 6:4-13'] },
      { time: 'Morning', verses: ['St. Luke 9:1-11'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 42:18-25', 'Jeremiah 3:1-5', 'Daniel 3:21-30'] },
      { time: 'Holy Qurbana', verses: ['Acts 13:26-39', 'Galatians 6:10-18', 'St. John 6:35-46'] },
    ],
  },
  {
    title: 'Fourth Sunday after Pentecost',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 14:14-23'] },
      { time: 'Morning', verses: ['St. Luke 10:17-24'] },
      { time: 'Before Holy Qurbana', verses: ['Deuteronomy 33:23-29', 'Psalms 15', 'Isaiah 65:8-12'] },
      { time: 'Holy Qurbana', verses: ['Acts 6:1-7', 'I Corinthians 16:14-22', 'St. Luke 10:1-16'] },
    ],
  },
  {
    title: 'Fifth Sunday after Pentecost',
    sections: [
      { time: 'Evening', verses: ['St. Luke 9:10-17'] },
      { time: 'Morning', verses: ['St. Matthew 17:20-28'] },
      { time: 'Before Holy Qurbana', verses: ['Exodus 23:14-19', 'Psalms 16', 'Isaiah 40:27-31'] },
      { time: 'Holy Qurbana', verses: ['Acts 9:10-18', 'II Corinthians 5:14-20', 'St. Luke 9:10-17'] },
    ],
  },
  {
    title: 'Sixth Sunday after Pentecost',
    sections: [
      { time: 'Evening', verses: ['St. Luke 17:1-10'] },
      { time: 'Morning', verses: ['St. Mark 6:30-52'] },
      { time: 'Before Holy Qurbana', verses: ['Exodus 3:34-38', 'Psalms 20', 'Isaiah 14:22-27'] },
      { time: 'Holy Qurbana', verses: ['Acts 1:15-20', 'I Corinthians 8:1-6', 'St. Matthew 15:32-39'] },
    ],
  },
  {
    title: 'Seventh Sunday after Pentecost',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 12:30-37'] },
      { time: 'Morning', verses: ['St. Matthew 12:38-50'] },
      { time: 'Before Holy Qurbana', verses: ['Leviticus 16:29-34', 'Hosea 5:1-5', 'Isaiah 57:15-19'] },
      { time: 'Holy Qurbana', verses: ['Acts 4:32-37', 'Ephesians 2:11-22', 'St. Mark 3:20-30'] },
    ],
  },
  {
    title: 'Eighth Sunday after Pentecost',
    sections: [
      { time: 'Evening', verses: ['St. Mark 4:1-23'] },
      { time: 'Morning', verses: ['St. Matthew 13:10-23'] },
      { time: 'Before Holy Qurbana', verses: ['Exodus 3:9-15', 'Jeremiah 7:21-25', 'Isaiah 52:1-6'] },
      { time: 'Holy Qurbana', verses: ['I Peter 2:4-10', 'Hebrews 4:14-5:5', 'St. John 6:47-59'] },
    ],
  },
  {
    title: 'Ninth Sunday after Pentecost',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 13:24-35'] },
      { time: 'Morning', verses: ['St. Matthew 13:36-43'] },
      { time: 'Before Holy Qurbana', verses: ['Psalms 22:1-21', 'Deuteronomy 4:1-6', 'Proverbs 13:1-7', 'Isaiah 24:1-5'] },
      { time: 'Holy Qurbana', verses: ['Acts 28:11-22', 'I Corinthians 6:1-11', 'St. Luke 14:7-11'] },
    ],
  },
  {
    title: 'Tenth Sunday after Pentecost',
    sections: [
      { time: 'Evening', verses: ['St. Luke 9:12-17'] },
      { time: 'Morning', verses: ['St. Matthew 16:13-20'] },
      { time: 'Before Holy Qurbana', verses: ['Exodus 15:23-27', 'Job 42:7-17', 'Psalms 112:1-10'] },
      { time: 'Holy Qurbana', verses: ['Acts 28:23-30', 'Romans 10:5-21', 'St. Matthew 18:1-11'] },
    ],
  },
  {
    title: 'Eleventh Sunday after Pentecost',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 18:15-35'] },
      { time: 'Morning', verses: ['St. Mark 9:33-50'] },
      { time: 'Before Holy Qurbana', verses: ['Leviticus 19:13-18', 'Joshua 23:7-14', 'Malachi 4:1-6'] },
      { time: 'Holy Qurbana', verses: ['St. James 2:14-26', 'I Corinthians 14:34-39', 'St. Mark 6:7-13'] },
    ],
  },
  {
    title: 'Twelfth Sunday after Pentecost',
    sections: [
      { time: 'Evening', verses: ['St. Mark 9:33-50'] },
      { time: 'Morning', verses: ['St. Luke 21:29-38'] },
      { time: 'Before Holy Qurbana', verses: ['Leviticus 17:1-7', 'Isaiah 65:1-7', 'Psalms 139'] },
      { time: 'Holy Qurbana', verses: ['St. James 2:14-26', 'I Corinthians 14:34-39', 'St. John 17:13-26'] },
    ],
  },
  {
    title: 'Feast of St. Peter and St. Paul (June 29)',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 16:13-20'] },
      { time: 'Morning', verses: ['St. John 21:15-25'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 12:1-9', 'Daniel 1:8-21', 'Isaiah 43:1-7'] },
      { time: 'Holy Qurbana', verses: ['Acts 1:12-14', 'I Corinthians 12:28-13:10', 'St. Matthew 20:1-16'] },
    ],
  },
  {
    title: 'Feast of the Twelve Apostles (June 30)',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 9:36-10:5'] },
      { time: 'Morning', verses: ['St. Matthew 10:11-15, 19:27-30'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 12:1-9', 'Daniel 1:8-21', 'Isaiah 43:1-7'] },
      { time: 'Holy Qurbana', verses: ['Acts 1:12-14', 'I Corinthians 12:28-13:10', 'St. Luke 6:12-26'] },
    ],
  },
  {
    title: 'Dukharono of St. Thomas (July 3rd)',
    sections: [
      { time: 'Evening', verses: ['St. Luke 12:13-21'] },
      { time: 'Morning', verses: ['St. Luke 12:48-59'] },
      { time: 'Before Holy Qurbana', verses: ['Exodus 12:43-51', 'Job 23:1-7', 'Isaiah 52:1-15', 'I Peter 2:15-17', 'I Corinthians 6:9-11', 'St. Matthew 5:21-26'] },
      { time: 'Holy Qurbana', verses: ['St. Matthew 5:21-26'] },
    ],
  },
  {
    title: 'The Festival of Transfiguration / Koodaara Perunnal (6th August)',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 16:27-17:13'] },
      { time: 'Morning', verses: ['St. Mark 8:38-9:13'] },
      { time: 'Before Holy Qurbana', verses: ['Deuteronomy 16:13-17', 'Psalms 24', 'Isaiah 61:1-3'] },
      { time: 'Holy Qurbana', verses: ['I John 2:23-3:1', 'Romans 11:25-36', 'St. Luke 9:27-36'] },
    ],
  },
  {
    title: 'First Sunday after the Festival of Transfiguration',
    sections: [
      { time: 'Evening', verses: ['St. Mark 4:21-34'] },
      { time: 'Morning', verses: ['St. Matthew 13:44-52'] },
      { time: 'Before Holy Qurbana', verses: ['Deuteronomy 25:13-16', 'Psalms 27', 'Ezekiel 7:1-4'] },
      { time: 'Holy Qurbana', verses: ['St. James 4:7-5:6', 'Philippians 4:8-20', 'St. Matthew 21:28-32'] },
    ],
  },
  {
    title: 'Second Sunday after the Festival of Transfiguration',
    sections: [
      { time: 'Evening', verses: ['St. Luke 14:15-24'] },
      { time: 'Morning', verses: ['St. Mark 10:28-34'] },
      { time: 'Before Holy Qurbana', verses: ['Exodus 23:20-27', 'Psalms 29', 'Hosea 11:1-9'] },
      { time: 'Holy Qurbana', verses: ['I Peter 5:1-11', 'I Corinthians 10:1-13', 'St. Luke 12:13-21, 35-44'] },
    ],
  },
  {
    title: 'The Festival of the Ascension of St. Mary (August 15) Martha Mariam Samajam Day',
    sections: [
      { time: 'Evening', verses: ['St. Luke 1:39-56, 2:22-35'] },
      { time: 'Morning', verses: ['St. Luke 2:42-51'] },
      { time: 'Before Holy Qurbana', verses: ['Exodus 3:1-6, 19:16-23', 'Ezekiel 44:1-3', 'Isaiah 45:11-19'] },
      { time: 'Holy Qurbana', verses: ['Acts 1:12-14, 7:44-53', 'Hebrews 9:3-12, 2:14-18', 'St. Luke 11:22-28', 'St. Matthew 12:46-50', 'St. John 19:25-27'] },
    ],
  },
  {
    title: 'First Sunday after the Festival of the Ascension of St. Mary',
    sections: [
      { time: 'Evening', verses: ['St. Luke 14:25-35'] },
      { time: 'Morning', verses: ['St. Luke 15:1-10'] },
      { time: 'Before Holy Qurbana', verses: ['Exodus 14:21-31', 'I Samuel 8:4-9', 'Isaiah 43:1-5'] },
      { time: 'Holy Qurbana', verses: ['I John 2:22-29', 'Ephesians 6:10-17', 'St. Luke 6:39-45'] },
    ],
  },
  {
    title: 'Second Sunday after the Festival of the Ascension of St. Mary',
    sections: [
      { time: 'Evening', verses: ['St. Luke 18:1-8'] },
      { time: 'Morning', verses: ['St. Luke 18:9-17'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 6:3-12', 'Ecclesiastes 7:1-7', 'Psalms 12:1-7'] },
      { time: 'Holy Qurbana', verses: ['II Peter 3:8-14', 'I Thessalonians 5:1-11', 'St. Luke 11:9-20'] },
    ],
  },
  {
    title: 'Third Sunday after the Festival of the Ascension of St. Mary',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 19:1-12'] },
      { time: 'Morning', verses: ['St. Luke 19:11-27'] },
      { time: 'Before Holy Qurbana', verses: ['Exodus 24:12-18', 'I Samuel 3:16-21', 'Ezekiel 18:21-24'] },
      { time: 'Holy Qurbana', verses: ['St. James 5:1-6', 'II Corinthians 10:1-7', 'St. Matthew 17:22-27'] },
    ],
  },
  {
    title: 'Fourth Sunday after the Festival of the Ascension of St. Mary',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 18:1-11'] },
      { time: 'Morning', verses: ['St. Matthew 18:12-22'] },
      { time: 'Before Holy Qurbana', verses: ['Exodus 3:1-6, 11-14', 'Job 1:1-5', 'Isaiah 1:15-20'] },
      { time: 'Holy Qurbana', verses: ['I Peter 2:1-5', 'I Corinthians 3:16-23', 'St. Matthew 5:38-48'] },
    ],
  },
  {
    title: 'Fifth Sunday after the Festival of the Ascension of St. Mary',
    sections: [
      { time: 'Evening', verses: ['St. Mark 7:1-13'] },
      { time: 'Morning', verses: ['St. Mark 7:14-23'] },
      { time: 'Before Holy Qurbana', verses: ['Leviticus 18:1-5', 'Joshua 22:1-6', 'Ezekiel 34:1-6'] },
      { time: 'Holy Qurbana', verses: ['Acts 11:2-10', 'Romans 2:28-3:8', 'St. Luke 11:33-41'] },
    ],
  },
  {
    title: 'The Feast of Holy Cross (September 14)',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 24:1-35'] },
      { time: 'Morning', verses: ['St. Mark 13:1-33'] },
      { time: 'Before Holy Qurbana', verses: ['Numbers 21:4-9', 'I Samuel 17:37-53', 'Jeremiah 32:36-41'] },
      { time: 'Holy Qurbana', verses: ['Acts 13:26-39', 'Galatians 2:17-3:14', 'St. Luke 21:5-28'] },
    ],
  },
  {
    title: 'First Sunday after the Feast of Holy Cross',
    sections: [
      { time: 'Evening', verses: ['St. Luke 17:20-37'] },
      { time: 'Morning', verses: ['St. Matthew 24:36-51'] },
      { time: 'Before Holy Qurbana', verses: ['Psalms 34', 'Genesis 42:1-28', 'Isaiah 1:10-20'] },
      { time: 'Holy Qurbana', verses: ['Acts 3:21-26', 'I Corinthians 2:10-16', 'St. Mark 13:28-37'] },
    ],
  },
  {
    title: 'Second Sunday after the Feast of Holy Cross',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 14:34-36, 15:1-11'] },
      { time: 'Morning', verses: ['St. Matthew 15:12-20'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 42:9-17', 'I Kings 3:5-9', 'Wisdom 6:1-9', 'Isaiah 48:12-16'] },
      { time: 'Holy Qurbana', verses: ['Acts 5:17-32', 'I Corinthians 2:14-3:9', 'St. Matthew 16:5-12'] },
    ],
  },
  {
    title: 'Third Sunday after the Feast of Holy Cross',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 18:23-35'] },
      { time: 'Morning', verses: ['St. Luke 16:1-13'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 42:18-35', 'Proverbs 1:2-9', 'Isaiah 48:12-16'] },
      { time: 'Holy Qurbana', verses: ['Acts 7:2-5', 'Romans 8:1-11', 'St. Mark 2:23-28'] },
    ],
  },
  {
    title: 'Fourth Sunday after the Feast of Holy Cross',
    sections: [
      { time: 'Evening', verses: ['St. Mark 10:1-16'] },
      { time: 'Morning', verses: ['St. Luke 9:37-45'] },
      { time: 'Before Holy Qurbana', verses: ['Numbers 29:35-40', 'I Kings 8:22-30', 'Psalms 42'] },
      { time: 'Holy Qurbana', verses: ['Acts 21:17-26', 'I Corinthians 1:21-29', 'St. Luke 16:9-18'] },
    ],
  },
  {
    title: 'Fifth Sunday after the Feast of Holy Cross',
    sections: [
      { time: 'Evening', verses: ['St. Luke 20:27-40'] },
      { time: 'Morning', verses: ['St. Matthew 22:34-44'] },
      { time: 'Before Holy Qurbana', verses: ['Leviticus 2:1-3', 'Psalms 46', 'Isaiah 40:27-31'] },
      { time: 'Holy Qurbana', verses: ['Acts 22:22-29', 'I Timothy 6:13-21', 'St. Matthew 23:1-12'] },
    ],
  },
  {
    title: 'Sixth Sunday after the Feast of Holy Cross',
    sections: [
      { time: 'Evening', verses: ['St. Matthew 19:13-26'] },
      { time: 'Morning', verses: ['St. Mark 10:17-27'] },
      { time: 'Before Holy Qurbana', verses: ['Genesis 42:29-36', 'Psalms 84', 'Isaiah 43:16-25'] },
      { time: 'Holy Qurbana', verses: ['Acts 21:27-40', 'I Corinthians 5:6-13', 'St. Luke 18:18-27'] },
    ],
  },
  {
    title: 'Seventh Sunday after the Feast of Holy Cross',
    sections: [
      { time: 'Evening', verses: ['St. Luke 12:13-21'] },
      { time: 'Morning', verses: ['St. Luke 12:48-59'] },
      { time: 'Before Holy Qurbana', verses: ['Exodus 12:43-51', 'Job 23:1-7', 'Isaiah 52:1-15'] },
      { time: 'Holy Qurbana', verses: ['I Peter 2:15-17', 'I Corinthians 6:9-11', 'St. Matthew 5:21-26'] },
    ],
  },
];
