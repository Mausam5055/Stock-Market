import nodemailer from "nodemailer";
import { NEWS_SUMMARY_EMAIL_TEMPLATE, STOCK_ALERT_LOWER_EMAIL_TEMPLATE, STOCK_ALERT_UPPER_EMAIL_TEMPLATE, WELCOME_EMAIL_TEMPLATE } from "./templates";


// Create a Nodemailer transporter 
export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL!,
    pass: process.env.NODEMAILER_PASSWORD!,
  },
});

export const sendWelcomeEmail = async ({email, name, intro}: WelcomeEmailData) => {
  const htmlTemplate = WELCOME_EMAIL_TEMPLATE.replace('{{name}}', name).replace('{{intro}}', intro);

  const mailOptions = {
      from: '"Signalist" <signalist@jsmastery.pro>',
      to: email,
      subject: `Welcome to Signalist — your stock market toolkit is ready 📈`,
      text: 'Thanks for joining Signalist',
      html: htmlTemplate,
    };

   await transporter.sendMail(mailOptions);
}

export const sendNewsSummaryEmail = async ({
  email,
  date,
  newsContent
}: {
  email: string;
  date: string;
  newsContent: string;
}) => {
  const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE
    .replace('{{date}}', date)
    .replace('{{newsContent}}', newsContent);

  const mailOptions = {
    from: '"Signalist News" <signalist@jsmastery.pro>',
    to: email,
    subject: `📈 Market News Summary Today - ${date}`,
    text: 'Today\'s market news summary from Signalist',
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
}

export const sendPriceAlertEmail = async ({
  email,
  symbol,
  company,
  alertType,
  alertName,
  currentPrice,
  thresholdPrice,
}: {
  email: string;
  symbol: string;
  company: string;
  alertType: 'upper' | 'lower';
  alertName?: string;
  currentPrice: string;
  thresholdPrice: string;
}) => {
  let template = '';
  let subject = '';

  if (alertType === 'upper') {
    template = STOCK_ALERT_UPPER_EMAIL_TEMPLATE;
    subject = `📈 ${alertName || `${symbol} Alert`}: Price Above ${thresholdPrice}`;
  } else if (alertType === 'lower') {
    template = STOCK_ALERT_LOWER_EMAIL_TEMPLATE;
    subject = `📉 ${alertName || `${symbol} Alert`}: Price Below ${thresholdPrice}`;
  }

  const htmlTemplate = template
    .replace(/{{symbol}}/g, symbol)
    .replace(/{{company}}/g, company)
    .replace(/{{alertName}}/g, alertName || `${symbol} Alert`)
    .replace(/{{currentPrice}}/g, currentPrice)
    .replace(/{{thresholdPrice}}/g, thresholdPrice)
    .replace(/{{targetPrice}}/g, thresholdPrice)
    .replace(/{{alertType}}/g, alertType)
    .replace(/{{timestamp}}/g, new Date().toLocaleString())
    .replace(/{{volumeInfo}}/g, 'Normal trading volume')
    .replace(/{{currentVolume}}/g, '0')
    .replace(/{{change}}/g, '0.00')
    .replace(
      /{{priceColor}}/g,
      alertType === 'upper' ? '#10b981' : '#ef4444'
    )
    .replace(
      /{{alertMessage}}/g,
      alertType === 'upper'
        ? `Your "${alertName || `${symbol} Alert`}" was triggered - price exceeded your upper threshold of ${thresholdPrice}`
        : `Your "${alertName || `${symbol} Alert`}" was triggered - price dropped below your lower threshold of ${thresholdPrice}`
    );

  const mailOptions = {
    from: '"Signalist Price Alert" <signalist@jsmastery.pro>',
    to: email,
    subject,
    text: `Your ${symbol} price alert has been triggered`,
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
}