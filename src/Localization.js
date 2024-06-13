const FormatNumberDigitisToEn = (date) => {
  const options = { year: "numeric", month: "numeric", day: "numeric" };
  return new Date(date).toLocaleDateString("en-US", options);
};

export { FormatNumberDigitisToEn };

const FormatNumberDigitsToEnglish = (date) => {
  const numbers = {
    "٠": "0",
    "١": "1",
    "٢": "2",
    "٣": "3",
    "٤": "4",
    "٥": "5",
    "٦": "6",
    "٧": "7",
    "٨": "8",
    "٩": "9",
  };
  return date.replace(/[٠-٩]/g, (w) => numbers[w]);
};

export { FormatNumberDigitsToEnglish };
