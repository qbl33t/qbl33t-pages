import { jsPDF } from "jspdf";
import mailgun from "mailgun-js";
import type { BackgroundHandler, HandlerEvent } from "@netlify/functions";

type Context = {
  content: string;
  destination: string;
};

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

const handler: BackgroundHandler = async (event: HandlerEvent) => {
  if (!event.body) {
    return;
  }

  const { content, destination } = JSON.parse(event.body) as Context;

  console.log(`Sending PDF report to ${destination}`);

  const report = Buffer.from(
    new jsPDF().text(content, 10, 10).output("arraybuffer")
  );

  const info = await mg.messages().send({
    from: process.env.MAILGUN_SENDER,
    to: destination,
    subject: "Your report is ready!",
    text: "Details in attached report PDF",
    attachments: [
      {
        filename: `report-${new Date().toDateString()}.pdf`,
        content: report,
        contentType: "application/pdf",
      },
    ],
  });

  console.log(`PDF report sent: %s`, info.id);
};

export { handler };
