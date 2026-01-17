import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role for cron (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function sendEmail(to: string, subject: string, body: string) {
  // Using Gmail API requires user token, so we'll use a simple email service
  // For production, use SendGrid, Resend, or similar
  
  // For now, we'll use the user's connected Gmail if available
  // Or you can integrate SendGrid/Resend here
  
  console.log(`Sending reminder email to ${to}: ${subject}`)
  
  // If you have SendGrid:
  // await fetch('https://api.sendgrid.com/v3/mail/send', { ... })
  
  // If you have Resend:
  // await fetch('https://api.resend.com/emails', { ... })
  
  return true
}

async function sendPushNotification(userId: string, title: string, body: string) {
  // Get user's push subscription from database
  const { data: subscription } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!subscription) return false

  try {
    const webpush = require('web-push')
    
    webpush.setVapidDetails(
      'mailto:' + process.env.VAPID_EMAIL,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    )

    await webpush.sendNotification(
      JSON.parse(subscription.subscription),
      JSON.stringify({ title, body, url: '/reminders' })
    )
    return true
  } catch (error) {
    console.error('Push notification failed:', error)
    return false
  }
}

export async function GET(request: NextRequest) {
  // Verify cron secret (prevents unauthorized access)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000)

    // Find reminders due in the next 15 minutes that haven't been sent
    const { data: reminders, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('sent', false)
      .lte('remind_at', fifteenMinutesFromNow.toISOString())
      .gte('remind_at', now.toISOString())

    if (error) {
      console.error('Error fetching reminders:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`Found ${reminders?.length || 0} reminders to send`)

    const results = []

    for (const reminder of reminders || []) {
      // Send email
      const emailSent = await sendEmail(
        reminder.email,
        `Reminder: ${reminder.title}`,
        `Hi! This is your reminder:\n\n${reminder.title}\n\n${reminder.description || ''}\n\nScheduled for: ${new Date(reminder.remind_at).toLocaleString()}\n\n- MyCore`
      )

      // Send push notification
      const pushSent = await sendPushNotification(
        reminder.user_id,
        `Reminder: ${reminder.title}`,
        reminder.description || 'You have a reminder!'
      )

      // Mark as sent
      await supabase
        .from('reminders')
        .update({ sent: true })
        .eq('id', reminder.id)

      results.push({
        id: reminder.id,
        title: reminder.title,
        emailSent,
        pushSent
      })
    }

    return NextResponse.json({ 
      success: true, 
      processed: results.length,
      results 
    })
  } catch (error: any) {
    console.error('Cron error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
