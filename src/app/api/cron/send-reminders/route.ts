import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const dueReminders = await prisma.reminder.findMany({
    where: { sent: false, remindAt: { lte: new Date() } },
    include: { task: { include: { owner: true } } },
  });

  const resend = new Resend(process.env.RESEND_API_KEY);
  let sentCount = 0;

  for (const reminder of dueReminders) {
    try {
      await resend.emails.send({
        from: process.env.REMINDER_FROM_EMAIL!,
        to: reminder.task.owner.email,
        subject: `Reminder: ${reminder.task.title}`,
        text: `This is a reminder for your task "${reminder.task.title}".`,
      });
      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { sent: true },
      });
      sentCount++;
    } catch (error) {
      console.error(`Failed to send reminder ${reminder.id}:`, error);
    }
  }

  return NextResponse.json({ checked: dueReminders.length, sent: sentCount });
}
